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
    <div className="flex gap-2">
      <Input
        className="w-96"
        placeholder="github token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
      />
      <Button size="icon" onClick={() => apply(token)}>
        <Play />
      </Button>
    </div>
  );
};
