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

const reactionMap: Record<string, string> = {
  THUMBS_UP: "👍",
  THUMBS_DOWN: "👎",
  LAUGH: "😄",
  CONFUSED: "😕",
  HEART: "❤️",
  HOORAY: "🎉",
  EYES: "👀",
  ROCKET: "🚀",
};

export const LatestRelease = ({
  repository,
  release,
}: {
  repository: Repository;
  release: Release | null;
}) => {
  const reactions =
    release?.reactions.filter((r) => r.content in reactionMap && r.count > 0) ??
    [];

  return (
    <Card id={repository.id} className="scroll-mt-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-4">
          <Avatar className="size-12">
            <AvatarImage
              src={repository.owner.avatarUrl}
              alt={`${repository.owner.login} avatar`}
            />
          </Avatar>
          <div className="flex flex-col gap-1">
            <Link href={repository.url} target="_blank">
              {repository.fullName}
            </Link>
            {release && (
              <span className="text-muted-foreground text-sm">
                {getRelativeTime(
                  new Date(release.publishedAt ?? release.createdAt),
                )}
              </span>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {release && (
          <div className="flex items-center gap-2">
            <Link
              className="font-extrabold text-2xl"
              href={release.url}
              target="_blank"
            >
              {release.name}
            </Link>
            {release.isPrerelease && (
              <Badge variant="outline">Pre-release</Badge>
            )}
          </div>
        )}
        <div className="prose prose-zinc dark:prose-invert overflow-x-auto rounded-xl bg-muted p-4">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {release?.body ?? "*No releases*"}
          </ReactMarkdown>
        </div>
      </CardContent>
      {reactions.length > 0 && (
        <CardFooter className="gap-1">
          {reactions.map((r) => (
            <Badge key={r.content} className="gap-1" variant="outline">
              {reactionMap[r.content]} {r.count}
            </Badge>
          ))}
        </CardFooter>
      )}
    </Card>
  );
};
