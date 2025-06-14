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

export type Starred = Awaited<ReturnType<typeof getStarredPage>>;

export const Releases = async ({ token }: { token: string }) => {
  const octokit = new Octokit({ auth: token });
  const starred = [];
  let page = 1;
  let result: Starred = [];

  do {
    result = await getStarredPage(octokit, page);
    starred.push(...result);
    page++;
  } while (result.length === 100);

  return (
    <div className="flex flex-col gap-4">
      {starred.map((s) => (
        <LatestRelease key={s.id} octokit={octokit} star={s} />
      ))}
    </div>
  );
};
