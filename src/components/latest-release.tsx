import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getRelativeTime } from "~/lib/utils";
import type { Release, Repository } from "./releases";
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

export const LatestRelease = async ({
  repository,
  release,
}: {
  repository: Repository;
  release: Release | null;
}) => {
  return (
    <Card id={repository.id.toString()} className="scroll-mt-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-4">
          <Avatar className="size-12">
            <AvatarImage
              src={repository.owner.avatar_url}
              alt={`${repository.owner.login} avatar`}
            />
          </Avatar>
          <div className="flex flex-col gap-1">
            <Link href={repository.html_url} target="_blank">
              {repository.full_name}
            </Link>
            {release && (
              <span className="text-muted-foreground text-sm">
                {getRelativeTime(
                  new Date(release.published_at ?? release.created_at),
                )}
              </span>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {release && (
          <Link
            className="font-extrabold text-2xl"
            href={release.html_url}
            target="_blank"
          >
            {release.name}
          </Link>
        )}
        <div className="prose prose-zinc dark:prose-invert overflow-x-auto rounded-xl bg-muted p-4">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {release?.body ?? "*No releases*"}
          </ReactMarkdown>
        </div>
      </CardContent>
      {release?.reactions && (
        <CardFooter className="gap-1">
          {Object.entries(release.reactions)
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
