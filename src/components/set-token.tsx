"use client";

import { Play } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export const SetToken = ({
  apply,
}: {
  apply: (token: string) => Promise<void>;
}) => {
  const [token, setToken] = useState("");

  return (
    <div className="flex gap-4">
      <Input value={token} onChange={(e) => setToken(e.target.value)} />
      <Button size="icon" onClick={() => apply(token)}>
        <Play />
      </Button>
    </div>
  );
};
