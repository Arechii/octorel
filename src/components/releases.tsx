import { cacheLife } from "next/cache";
import { Octokit } from "octokit";
import { clearToken } from "~/app/actions";
import { LatestRelease } from "./latest-release";
import { Sidebar } from "./sidebar";
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

type StarredPage = {
  viewer: {
    starredRepositories: {
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      nodes: ({
        id: string;
        name: string;
        nameWithOwner: string;
        url: string;
        owner: { login: string; avatarUrl: string };
        releases: {
          nodes: {
            name: string | null;
            url: string;
            description: string | null;
            createdAt: string;
            publishedAt: string | null;
            isDraft: boolean;
            isPrerelease: boolean;
            reactionGroups: {
              content: string;
              reactors: { totalCount: number };
            }[];
          }[];
        };
      } | null)[];
    };
  };
};

type StarredRepository = NonNullable<
  StarredPage["viewer"]["starredRepositories"]["nodes"][number]
>;

/**
 * One page of starred repositories together with their most recent releases.
 * A single GraphQL request replaces up to 101 REST calls (1 page listing +
 * 1 "latest release" call per repository).
 */
const getStarredPage = async (token: string, cursor: string | null) => {
  "use cache";
  cacheLife("hours");

  const octokit = new Octokit({ auth: token });

  return octokit.graphql<StarredPage>(
    `
      query starredWithReleases($cursor: String) {
        viewer {
          starredRepositories(
            first: 100
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
              releases(first: 3, orderBy: { field: CREATED_AT, direction: DESC }) {
                nodes {
                  name
                  url
                  description
                  createdAt
                  publishedAt
                  isDraft
                  isPrerelease
                  reactionGroups {
                    content
                    reactors {
                      totalCount
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    { cursor },
  );
};

const describeError = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    if (
      "errors" in error &&
      Array.isArray(error.errors) &&
      error.errors.some(
        (e) =>
          typeof e === "object" &&
          e !== null &&
          "type" in e &&
          e.type === "RATE_LIMITED",
      )
    ) {
      return "The GitHub API rate limit has been exceeded. Wait a bit before trying again.";
    }

    if ("status" in error && error.status === 401) {
      return "GitHub rejected the saved token — it may have expired or been revoked.";
    }
  }

  return "Fetching releases from GitHub failed. Try again in a moment.";
};

const toLatestRelease = (
  node: StarredRepository,
): { repository: Repository; release: Release | null } => {
  const release = node.releases.nodes.find((r) => !r.isDraft);

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
          reactions: release.reactionGroups.map((g) => ({
            content: g.content,
            count: g.reactors.totalCount,
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
      const { nodes, pageInfo } = page.viewer.starredRepositories;
      starred.push(...nodes.filter((n) => n !== null));
      cursor = pageInfo.hasNextPage ? pageInfo.endCursor : null;
    } while (cursor);
  } catch (error) {
    return <FetchError message={describeError(error)} />;
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

  return (
    <div className="flex w-full justify-center gap-8">
      <Sidebar repositories={latestReleases.map((l) => l.repository)} />
      <div className="flex w-full min-w-0 max-w-3xl flex-col gap-4">
        {latestReleases.map((r) => (
          <LatestRelease
            key={r.repository.id}
            repository={r.repository}
            release={r.release}
          />
        ))}
      </div>
    </div>
  );
};
