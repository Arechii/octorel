"use client";

import { List, Loader2 } from "lucide-react";
import { Fragment, useEffect, useRef, useState } from "react";
import { LatestRelease } from "./latest-release";
import type { Release, Repository } from "./releases";
import { RepoList } from "./repo-list";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";

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
  const sentinelRef = useRef<HTMLDivElement>(null);

  const hasMore = visibleCount < items.length;

  useEffect(() => {
    if (!scrollTarget) return;
    // Give the drawer's close animation time to release the body scroll
    // lock before scrolling to the selected card.
    const timeout = setTimeout(() => {
      document
        .getElementById(scrollTarget)
        ?.scrollIntoView({ behavior: "smooth" });
      setScrollTarget(null);
    }, 400);
    return () => clearTimeout(timeout);
  }, [scrollTarget]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!hasMore || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisibleCount((count) => count + PAGE_SIZE);
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore]);

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

        {hasMore && (
          <div
            ref={sentinelRef}
            className="flex items-center justify-center gap-2 py-6 text-muted-foreground text-sm"
          >
            <Loader2 className="size-4 animate-spin" />
            Loading more... ({visible.length} of {items.length})
          </div>
        )}
      </div>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerTrigger asChild>
          <Button
            size="icon"
            aria-label="Browse repositories"
            className="fixed right-4 bottom-4 z-20 size-12 rounded-full shadow-lg lg:hidden"
          >
            <List />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="pb-0">
            <DrawerTitle>Repositories</DrawerTitle>
            <DrawerDescription className="sr-only">
              Search and jump to a repository
            </DrawerDescription>
          </DrawerHeader>
          <div className="h-[60vh]">
            <RepoList repositories={repositories} onSelect={select} />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
