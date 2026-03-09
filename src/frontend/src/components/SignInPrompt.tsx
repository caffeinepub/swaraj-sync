import { Button } from "@/components/ui/button";
import { LogIn, type LucideIcon } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface SignInPromptProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
}

export function SignInPrompt({
  icon: Icon,
  title = "Sign In Required",
  description = "Please sign in to access this feature.",
}: SignInPromptProps) {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border border-primary/30 mb-5">
        {Icon ? (
          <Icon className="h-7 w-7 text-primary" />
        ) : (
          <LogIn className="h-7 w-7 text-primary" />
        )}
      </div>
      <h2 className="font-display text-xl font-semibold text-foreground mb-2">
        {title}
      </h2>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">
        {description}
      </p>
      <Button
        data-ocid="signin.primary_button"
        onClick={login}
        disabled={isLoggingIn}
        className="gap-2 px-6"
      >
        <LogIn className="h-4 w-4" />
        {isLoggingIn ? "Connecting..." : "Sign In with Internet Identity"}
      </Button>
    </div>
  );
}
