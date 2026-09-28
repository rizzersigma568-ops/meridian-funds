import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <div className="mx-auto max-w-lg py-16">
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-3xl tracking-tight">
            Your book stays in this browser
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed text-muted">
          <p>
            Meridian on this public site does not use accounts. Portfolio lots,
            watchlists, and alerts are stored locally in your browser so you can
            research without signing in.
          </p>
          <p>
            Clearing site data will reset the sample book. Nothing is sent to a
            brokerage and nothing here is a trade instruction.
          </p>
          <Button asChild>
            <Link to="/">Back to the desk</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
