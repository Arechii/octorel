"use client";

import { useState } from "react";
import type { Repository } from "./releases";
import { Input } from "./ui/input";

export const RepoList = ({
  repositories,
  onSelect,
}: {
  repositories: Repository[];
  onSelect: (id: string) => void;
}) => {
  const [filter, setFilter] = useState("");

  const filtered = filter
    ? repositories.filter((r) =>
        r.fullName.toLowerCase().includes(filter.toLowerCase()),
      )
    : repositories;

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 p-2">
      <Input
        aria-label="Search repositories"
        placeholder="search..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-2 pb-2">
        {filtered.map((r) => (
          <button
            key={r.id}
            type="button"
            title={r.fullName}
            // shrink-0 is load-bearing: without it the fixed-height flex
            // column squishes every item to near-zero height once the list
            // outgrows the container (truncate sets overflow:hidden, which
            // drops the automatic minimum size of flex items)
            className="shrink-0 truncate py-0.5 text-left font-medium hover:cursor-pointer hover:underline"
            onClick={() => onSelect(r.id)}
          >
            {r.fullName}
          </button>
        ))}
        {filtered.length === 0 && (
          <span className="py-2 text-muted-foreground text-sm">No matches</span>
        )}
      </div>
    </div>
  );
};
