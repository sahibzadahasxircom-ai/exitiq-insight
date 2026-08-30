import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { publicCreateTestSession } from "@/lib/interview.functions";

// TEMPORARY test route — remove when done.
// Visit /test-interview to spin up a real AI interview session and jump into it.
export const Route = createFileRoute("/test-interview")({
  head: () => ({ meta: [{ title: "Test Interview" }, { name: "robots", content: "noindex" }] }),
  component: TestInterview,
});

function TestInterview() {
  const createFn = useServerFn(publicCreateTestSession);
  const navigate = useNavigate();
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    createFn({ data: undefined as never })
      .then(({ sessionId }) => {
        navigate({ to: "/interview/$sessionId", params: { sessionId }, replace: true });
      })
      .catch((e) => {
        console.error(e);
        setError(e.message || "Failed to create test session. Please check your Supabase configuration.");
      });
  }, [createFn, navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-lg font-medium text-red-900">Error creating test session</p>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <p className="mt-4 text-xs text-red-600">
            Make sure you have run the database migrations in your Supabase dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Creating a test interview session…</p>
    </div>
  );
}

