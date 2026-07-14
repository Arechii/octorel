"use client";

import { List, X } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { LatestRelease } from "./latest-release";
import type { Release, Repository } from "./releases";
import { RepoList } from "./repo-list";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

const PAGE_SIZE = 25;

export type ReleaseItem = {
  repository: Repository;
  release: Release | null;
};

const DAY = 24 * 60 * 60 * 1000;

const bucketOf = (item: ReleaseItem): string => {
  const iso = item.release?.publishedAt ?? item.release?.createdAt;
  if (!iso) return "No releases yet";

  const date = new Date(iso);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const days = Math.floor(
    (startOfToday.getTime() + DAY - date.getTime()) / DAY,
  );

  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return "This week";
  if (days < 31) return "This month";
  return date.toLocaleDateString("en", { month: "long", year: "numeric" });
};

export const ReleasesView = ({ items }: { items: ReleaseItem[] }) => {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrollTarget, setScrollTarget] = useState<string | null>(null);

  useEffect(() => {
    if (!scrollTarget) return;
    document
      .getElementById(scrollTarget)
      ?.scrollIntoView({ behavior: "smooth" });
    setScrollTarget(null);
  }, [scrollTarget]);

  const select = (id: string) => {
    const index = items.findIndex((i) => i.repository.id === id);
    if (index >= visibleCount) {
      setVisibleCount(Math.ceil((index + 1) / PAGE_SIZE) * PAGE_SIZE);
    }
    setDrawerOpen(false);
    setScrollTarget(id);
  };

  const repositories = items.map((i) => i.repository);
  const visible = items.slice(0, visibleCount);

  let previousBucket: string | null = null;

  return (
    <div className="flex w-full items-start justify-center gap-8">
      <Card className="sticky top-[4.5rem] hidden h-[calc(100dvh-5.5rem)] w-72 shrink-0 gap-0 p-0 lg:flex">
        <RepoList repositories={repositories} onSelect={select} />
      </Card>

      <div className="flex w-full min-w-0 max-w-4xl flex-col gap-4">
        {visible.map((item) => {
          const bucket = bucketOf(item);
          const heading = bucket !== previousBucket && (
            <h2 className="mt-2 flex items-center gap-3 font-semibold text-muted-foreground text-sm uppercase tracking-wider first:mt-0">
              {bucket}
              <span className="h-px flex-1 bg-border" />
            </h2>
          );
          previousBucket = bucket;

          return (
            <Fragment key={item.repository.id}>
              {heading}
              <LatestRelease
                repository={item.repository}
                release={item.release}
              />
            </Fragment>
          );
        })}

        {visibleCount < items.length && (
          <div className="flex flex-col items-center gap-2 py-4">
            <Button
              variant="outline"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            >
              Load more
            </Button>
            <span className="text-muted-foreground text-sm">
              Showing {visible.length} of {items.length} repositories
            </span>
          </div>
        )}
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <button
            type="button"
            aria-label="Close repository list"
            className="absolute inset-0 bg-black/50"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-80 max-w-[85vw] flex-col border-l bg-background shadow-lg">
            <div className="flex items-center justify-between p-2 pl-4">
              <span className="font-semibold">Repositories</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close repository list"
              >
                <X />
              </Button>
            </div>
            <div className="min-h-0 flex-1">
              <RepoList repositories={repositories} onSelect={select} />
            </div>
          </div>
        </div>
      )}

      <Button
        size="icon"
        aria-label="Browse repositories"
        className="fixed right-4 bottom-4 z-20 size-12 rounded-full shadow-lg lg:hidden"
        onClick={() => setDrawerOpen(true)}
      >
        <List />
      </Button>
    </div>
  );
};
