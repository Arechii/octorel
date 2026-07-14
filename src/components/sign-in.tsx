import { LogIn } from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

export const SignIn = ({ error }: { error?: string }) => {
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
        <Button asChild className="w-full">
          <a href="/api/auth">
            <LogIn /> Sign in with GitHub
          </a>
        </Button>
        {error && (
          <p className="text-destructive text-sm">
            {error === "state"
              ? "The sign-in attempt could not be verified — please try again."
              : "GitHub sign-in failed — please try again."}
          </p>
        )}
        <p className="text-muted-foreground text-sm">
          OctoRel only gets read access to your starred repositories.
        </p>
      </CardContent>
    </Card>
  );
};
