import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AiPanel({
  title,
  onRun,
}: {
  title: string;
  onRun: () => Promise<{ ok: true; text: string } | { ok: false; error: string }>;
}) {
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="size-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted">
          Explanations use the catalog on this page. They do not recommend trades.
        </p>
        <Button
          type="button"
          variant="secondary"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            setError(null);
            const res = await onRun();
            setLoading(false);
            if (res.ok) setText(res.text);
            else setError(res.error);
          }}
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : null}
          {text ? "Explain again" : "Explain with AI"}
        </Button>
        {error ? <p className="text-sm text-down">{error}</p> : null}
        {text ? (
          <div className="space-y-3 text-sm leading-relaxed whitespace-pre-wrap">
            {text}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
