"use client";

import { useState } from "react";
import type { Repository } from "./releases";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Input } from "./ui/input";

export const Sidebar = ({ repositories }: { repositories: Repository[] }) => {
  const [filter, setFilter] = useState("");

  const filtered = filter
    ? repositories.filter((r) =>
        r.full_name.toLowerCase().includes(filter.toLowerCase()),
      )
    : repositories;

  return (
    <Card className="sticky top-2 hidden h-[calc(100dvh-1rem)] w-72 gap-0 p-0 lg:flex">
      <CardHeader className="w-full p-2">
        <Input
          aria-label="Search repositories"
          placeholder="search..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </CardHeader>
      <CardContent className="flex flex-col overflow-y-auto px-4 pb-4">
        {filtered.map((r) => (
          <button
            key={r.id}
            type="button"
            title={r.full_name}
            className="truncate text-left font-medium hover:cursor-pointer hover:underline"
            onClick={() => {
              document
                .getElementById(r.id.toString())
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            {r.full_name}
          </button>
        ))}
      </CardContent>
    </Card>
  );
};
