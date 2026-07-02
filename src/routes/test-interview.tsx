import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
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

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    createFn({ data: undefined as never })
      .then(({ sessionId }) => {
        navigate({ to: "/interview/$sessionId", params: { sessionId }, replace: true });
      })
      .catch((e) => console.error(e));
  }, [createFn, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Creating a test interview session…</p>
    </div>
  );
}
