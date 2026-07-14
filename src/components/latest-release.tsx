"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn, getRelativeTime } from "~/lib/utils";
import type { Release, Repository } from "./releases";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
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

const COLLAPSE_THRESHOLD = 600;

export const LatestRelease = ({
  repository,
  release,
}: {
  repository: Repository;
  release: Release | null;
}) => {
  const [expanded, setExpanded] = useState(false);

  const reactions =
    release?.reactions.filter((r) => r.content in reactionMap && r.count > 0) ??
    [];
  const collapsible = (release?.body?.length ?? 0) > COLLAPSE_THRESHOLD;

  return (
    <Card id={repository.id} className="scroll-mt-20">
      <CardHeader>
        <CardTitle className="flex items-center gap-4">
          <Avatar className="size-12 shrink-0">
            <AvatarImage
              src={repository.owner.avatarUrl}
              alt={`${repository.owner.login} avatar`}
            />
          </Avatar>
          <div className="flex min-w-0 flex-col gap-1">
            <Link
              className="truncate"
              href={repository.url}
              target="_blank"
              title={repository.fullName}
            >
              {repository.fullName}
            </Link>
            {release && (
              <span
                className="text-muted-foreground text-sm"
                suppressHydrationWarning
              >
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
          <div className="flex min-w-0 items-center gap-2">
            <Link
              className="truncate font-extrabold text-2xl"
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
        <div className="relative">
          <div
            className={cn(
              "prose prose-zinc dark:prose-invert max-w-none overflow-x-auto rounded-xl bg-muted p-4",
              collapsible && !expanded && "max-h-56 overflow-y-hidden",
            )}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {release?.body ?? "*No releases*"}
            </ReactMarkdown>
          </div>
          {collapsible && !expanded && (
            <div className="absolute inset-x-0 bottom-0 h-20 rounded-b-xl bg-gradient-to-t from-muted to-transparent" />
          )}
        </div>
        {collapsible && (
          <Button
            variant="ghost"
            size="sm"
            className="self-center"
            onClick={() => setExpanded((e) => !e)}
          >
            {expanded ? (
              <>
                <ChevronUp /> Show less
              </>
            ) : (
              <>
                <ChevronDown /> Show more
              </>
            )}
          </Button>
        )}
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
