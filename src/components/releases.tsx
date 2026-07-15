import { cacheLife } from "next/cache";
import { Octokit } from "octokit";
import { clearToken } from "~/app/actions";
import { ReleasesView } from "./releases-view";
import { Button } from "./ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

export type Repository = {
  id: string;
  name: string;
  fullName: string;
  url: string;
  owner: { login: string; avatarUrl: string };
};

export type Release = {
  name: string | null;
  url: string;
  body: string | null;
  createdAt: string;
  publishedAt: string | null;
  isPrerelease: boolean;
  reactions: { content: string; count: number }[];
};

/**
 * Fields that GitHub failed to resolve within its resource limits come back
 * as null alongside per-field errors, so everything below the connection
 * root is typed as potentially missing.
 */
type StarredPage = {
  viewer: {
    starredRepositories: {
      pageInfo: { hasNextPage: boolean; endCursor: string | null } | null;
      nodes:
        | ({
            id: string;
            name: string;
            nameWithOwner: string;
            url: string;
            owner: { login: string; avatarUrl: string };
            latestRelease: {
              name: string | null;
              url: string;
              description: string | null;
              createdAt: string;
              publishedAt: string | null;
              isPrerelease: boolean;
              reactionGroups:
                | {
                    content: string;
                    reactors: { totalCount: number } | null;
                  }[]
                | null;
            } | null;
          } | null)[]
        | null;
    } | null;
  };
};

type StarredRepository = NonNullable<
  NonNullable<
    NonNullable<StarredPage["viewer"]["starredRepositories"]>["nodes"]
  >[number]
>;

/**
 * Collapse an octokit failure into a small typed error. A single GraphQL
 * response can carry hundreds of per-field errors (e.g. one
 * RESOURCE_LIMITS_EXCEEDED per node) and octokit joins them all into the
 * error message — rethrowing that as-is floods server logs.
 */
const toCompactError = (error: unknown): Error => {
  if (typeof error === "object" && error !== null) {
    if ("errors" in error && Array.isArray(error.errors)) {
      const types = [
        ...new Set(
          error.errors.map((e) =>
            typeof e === "object" &&
            e !== null &&
            "type" in e &&
            typeof e.type === "string"
              ? e.type
              : "UNKNOWN",
          ),
        ),
      ];
      return new Error(`github-graphql-error:${types.join(",")}`);
    }

    if ("status" in error && typeof error.status === "number") {
      return new Error(`github-http-error:${error.status}`);
    }
  }

  return new Error("github-request-error");
};

/**
 * One page of starred repositories together with their most recent releases.
 * A single GraphQL request replaces up to 101 REST calls (1 page listing +
 * 1 "latest release" call per repository).
 */
const getStarredPage = async (token: string, cursor: string | null) => {
  "use cache";
  cacheLife("hours");

  const octokit = new Octokit({ auth: token });

  return octokit
    .graphql<StarredPage>(
      `
      query starredWithReleases($cursor: String) {
        viewer {
          starredRepositories(
            first: 50
            after: $cursor
            orderBy: { field: STARRED_AT, direction: DESC }
          ) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              id
              name
              nameWithOwner
              url
              owner {
                login
                avatarUrl
              }
              latestRelease {
                name
                url
                description
                createdAt
                publishedAt
                isPrerelease
                reactionGroups {
                  content
                  reactors(first: 1) {
                    totalCount
                  }
                }
              }
            }
          }
        }
      }
    `,
      { cursor },
    )
    .catch((error: unknown) => {
      const compact = toCompactError(error);

      // GitHub resolves what it can within its resource limits and reports
      // per-field errors for the rest. Keep the partial page (failed fields
      // are null) instead of failing the whole feed.
      if (typeof error === "object" && error !== null && "data" in error) {
        const data = error.data as StarredPage | null | undefined;
        if (data?.viewer?.starredRepositories?.nodes) {
          console.error(
            `Starred releases query partially failed: ${compact.message}`,
          );
          return data;
        }
      }

      console.error(`Starred releases query failed: ${compact.message}`);
      throw compact;
    });
};

const describeError = (error: unknown): string => {
  const message = error instanceof Error ? error.message : "";

  if (message.includes("RATE_LIMITED")) {
    return "The GitHub API rate limit has been exceeded. Wait a bit before trying again.";
  }

  if (message.includes("RESOURCE_LIMITS_EXCEEDED")) {
    return "GitHub refused the query because it was too expensive. Try again — if this keeps happening, please open an issue.";
  }

  if (message.includes("github-http-error:401")) {
    return "GitHub rejected the saved token — it may have expired or been revoked.";
  }

  return "Fetching releases from GitHub failed. Try again in a moment.";
};

const toLatestRelease = (
  node: StarredRepository,
): { repository: Repository; release: Release | null } => {
  const release = node.latestRelease;

  return {
    repository: {
      id: node.id,
      name: node.name,
      fullName: node.nameWithOwner,
      url: node.url,
      owner: node.owner,
    },
    release: release
      ? {
          name: release.name,
          url: release.url,
          body: release.description,
          createdAt: release.createdAt,
          publishedAt: release.publishedAt,
          isPrerelease: release.isPrerelease,
          reactions: (release.reactionGroups ?? []).map((g) => ({
            content: g.content,
            count: g.reactors?.totalCount ?? 0,
          })),
        }
      : null,
  };
};

const FetchError = ({ message }: { message: string }) => (
  <Card className="w-full max-w-md">
    <CardHeader>
      <CardTitle>Couldn't fetch releases</CardTitle>
      <CardDescription>{message}</CardDescription>
    </CardHeader>
    <CardFooter className="gap-2">
      <Button asChild variant="outline">
        <a href="/">Try again</a>
      </Button>
      <form action={clearToken}>
        <Button variant="ghost" type="submit">
          Sign in again
        </Button>
      </form>
    </CardFooter>
  </Card>
);

export const Releases = async ({ token }: { token: string }) => {
  const starred: StarredRepository[] = [];

  try {
    let cursor: string | null = null;

    do {
      const page: StarredPage = await getStarredPage(token, cursor);
      const connection = page.viewer.starredRepositories;
      starred.push(...(connection?.nodes ?? []).filter((n) => n !== null));
      cursor = connection?.pageInfo?.hasNextPage
        ? connection.pageInfo.endCursor
        : null;
    } while (cursor);
  } catch (error) {
    return (
      <div className="flex justify-center py-24">
        <FetchError message={describeError(error)} />
      </div>
    );
  }

  const latestReleases = starred.map(toLatestRelease);

  latestReleases.sort((a, b) => {
    if (!a.release && !b.release) return 0;
    if (!a.release) return 1;
    if (!b.release) return -1;
    return (
      new Date(b.release.publishedAt ?? b.release.createdAt).getTime() -
      new Date(a.release.publishedAt ?? a.release.createdAt).getTime()
    );
  });

  return <ReleasesView items={latestReleases} />;
};
