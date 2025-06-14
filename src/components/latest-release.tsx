import Link from "next/link";
import type { Octokit } from "octokit";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getRelativeTime } from "~/lib/utils";
import type { Starred } from "./releases";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

const reactionMap = {
  "+1": "👍",
  "-1": "👎",
  laugh: "😄",
  confused: "😕",
  heart: "❤️",
  hooray: "🎉",
  eyes: "👀",
  rocket: "🚀",
} as const;

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
            <Link href={star.html_url} target="_blank">
              {star.name}
            </Link>
            {latest && (
              <span className="text-muted-foreground text-sm">
                {getRelativeTime(new Date(latest.created_at))}
              </span>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Link
          className="text-2xl font-extrabold"
          href={latest?.html_url ?? ""}
          target="_blank"
        >
          {latest?.name}
        </Link>
        <div className="prose prose-zinc rounded-xl bg-neutral-100 p-4">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {latest?.body ?? "*No releases*"}
          </ReactMarkdown>
        </div>
      </CardContent>
      {latest?.reactions && (
        <CardFooter className="gap-1">
          {Object.entries(latest.reactions)
            .filter(
              (e) =>
                e[0] in reactionMap && typeof e[1] === "number" && e[1] > 0,
            )
            .map((r) => (
              <Badge key={r[0]} className="gap-1" variant="outline">
                {reactionMap[r[0] as keyof typeof reactionMap]} {r[1]}
              </Badge>
            ))}
        </CardFooter>
      )}
    </Card>
  );
};
