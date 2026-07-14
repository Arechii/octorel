"use client";

import { Loader2, Play } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";

export const SetToken = ({
  apply,
}: {
  apply: (token: string) => Promise<void>;
}) => {
  const [token, setToken] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>OctoRel</CardTitle>
        <CardDescription>
          See the latest releases of all your starred GitHub repositories, not
          just the 100 most recently starred ones.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = token.trim();
            if (!trimmed) return;
            startTransition(() => apply(trimmed));
          }}
        >
          <Input
            type="password"
            autoComplete="off"
            aria-label="GitHub token"
            placeholder="GitHub token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <Button
            size="icon"
            type="submit"
            aria-label="Save token"
            disabled={pending || !token.trim()}
          >
            {pending ? <Loader2 className="animate-spin" /> : <Play />}
          </Button>
        </form>
        <p className="text-muted-foreground text-sm">
          Create a{" "}
          <a
            className="underline underline-offset-4"
            href="https://github.com/settings/tokens/new?description=OctoRel"
            target="_blank"
            rel="noreferrer"
          >
            personal access token
          </a>{" "}
          first — a classic token without any scopes is enough for public
          repositories.
        </p>
      </CardContent>
    </Card>
  );
};
