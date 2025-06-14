import { Octokit } from "octokit";
import { LatestRelease } from "./latest-release";

const getStarredPage = async (octokit: Octokit, page: number) => {
  const response = await octokit.request("GET /user/starred", {
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
    per_page: 100,
    page,
    sort: "updated",
  });

  return response.data;
};

const getLatestRelease = async (
  octokit: Octokit,
  owner: string,
  repo: string,
) => {
  const response = await octokit.request(
    "GET /repos/{owner}/{repo}/releases/latest",
    {
      owner,
      repo,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );

  return response.data;
};

export type Repository = Awaited<ReturnType<typeof getStarredPage>>[number];
export type Release = Awaited<ReturnType<typeof getLatestRelease>>;

export const Releases = async ({ token }: { token: string }) => {
  const octokit = new Octokit({ auth: token });
  const starred = [];
  let page = 1;
  let result: Repository[] = [];

  do {
    result = await getStarredPage(octokit, page);
    starred.push(...result);
    page++;
  } while (result.length === 100);

  const latestReleases = await Promise.all(
    starred.map(async (s) => {
      try {
        const release = await getLatestRelease(octokit, s.owner.login, s.name);
        return { repository: s, release };
      } catch {
        return { repository: s, release: null };
      }
    }),
  );

  latestReleases.sort((a, b) => {
    if (!a.release && !b.release) return 0;
    if (!a.release) return 1;
    if (!b.release) return -1;
    return (
      new Date(b.release.created_at).getTime() -
      new Date(a.release.created_at).getTime()
    );
  });

  return (
    <div className="flex flex-col gap-4">
      {latestReleases.map((r) => (
        <LatestRelease
          key={r.repository.id}
          repository={r.repository}
          release={r.release}
        />
      ))}
    </div>
  );
};
