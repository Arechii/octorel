import type { Octokit } from "octokit";
import ReactMarkdown from "react-markdown";
import { getRelativeTime } from "~/lib/utils";
import type { Starred } from "./releases";
import { Avatar, AvatarImage } from "./ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

const getLatest = async (octokit: Octokit, owner: string, repo: string) => {
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

type Latest = Awaited<ReturnType<typeof getLatest>>;

export const LatestRelease = async ({
  octokit,
  star,
}: {
  octokit: Octokit;
  star: Starred[number];
}) => {
  let latest: Latest | null = null;

  try {
    latest = await getLatest(octokit, star.owner.login, star.name);
  } catch {}

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-4">
          <Avatar className="size-12">
            <AvatarImage src={star.owner.avatar_url} />
          </Avatar>
          <div className="flex flex-col gap-1">
            <span>{star.name}</span>
            {latest && (
              <span className="text-muted-foreground text-sm">
                {getRelativeTime(new Date(latest.created_at))}
              </span>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <span className="text-2xl font-extrabold">{latest?.name}</span>
        <div className="prose prose-zinc rounded-xl bg-neutral-100 p-4">
          <ReactMarkdown>{latest?.body ?? "*No releases*"}</ReactMarkdown>
        </div>
      </CardContent>
      {latest && <CardFooter></CardFooter>}
    </Card>
  );
};
