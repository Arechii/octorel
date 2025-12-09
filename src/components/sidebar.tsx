"use client";

import { useState } from "react";
import type { Repository } from "./releases";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Input } from "./ui/input";

export const Sidebar = ({ repositories }: { repositories: Repository[] }) => {
  const [filter, setFilter] = useState("");

  const filtered = filter
    ? repositories.filter((r) => r.name.includes(filter))
    : repositories;

  return (
    <Card className="sticky top-2 flex h-[800px] gap-0 p-0">
      <CardHeader className="w-full p-2">
        <Input
          placeholder="search..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </CardHeader>
      <CardContent className="flex flex-col overflow-y-auto px-4 pb-4">
        {filtered.map((r) => (
          <span
            key={r.id}
            className="font-medium hover:cursor-pointer"
            onClick={() => {
              const el = document.getElementById(r.id.toString());
              if (el) {
                const yOffset = -8;
                const y =
                  el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: "smooth" });
              }
            }}
          >
            {r.name}
          </span>
        ))}
      </CardContent>
    </Card>
  );
};
