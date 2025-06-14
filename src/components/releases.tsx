import { Octokit } from "octokit";

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

type Starred = Awaited<ReturnType<typeof getStarredPage>>;

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
    <div className="flex flex-col gap-2">
      {starred.map((d) => {
        return <div key={d.id}>{d.html_url}</div>;
      })}
    </div>
  );
};
