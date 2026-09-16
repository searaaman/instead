import type { CodeProblem } from "./tasks";

// Free public Judge0 CE demo instance — no API key needed. Rate-limited,
// but fine for a hackathon demo. If this ever starts failing/timing out,
// the fallback is a RapidAPI-hosted Judge0 instance (needs a key).
const JUDGE0_URL = "https://ce.judge0.com/submissions?base64_encoded=false&wait=true";

export interface RunResult {
  passed: boolean;
  stdout: string;
  stderr: string | null;
  compileOutput: string | null;
  statusDescription: string;
}

export async function runAgainstProblem(problem: CodeProblem, sourceCode: string): Promise<RunResult> {
  const res = await fetch(JUDGE0_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source_code: sourceCode,
      language_id: problem.languageId,
      stdin: problem.stdin,
    }),
  });

  if (!res.ok) {
    throw new Error(`Judge0 request failed (${res.status})`);
  }

  const data = await res.json();
  const stdout = (data.stdout ?? "").trim();
  const statusDescription: string = data.status?.description ?? "Unknown";
  const accepted = data.status?.id === 3; // 3 = "Accepted" in Judge0's status codes
  const passed = accepted && stdout === problem.expectedOutput.trim();

  return {
    passed,
    stdout,
    stderr: data.stderr ?? null,
    compileOutput: data.compile_output ?? null,
    statusDescription,
  };
}
