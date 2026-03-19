import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useCallback, useEffect, useRef, useState } from "react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "../hooks/useQueries";

interface DiagnosticResult {
  name: string;
  status: "pending" | "pass" | "fail" | "skip";
  latencyMs?: number;
  error?: string;
  result?: string;
}

interface ErrorLogEntry {
  timestamp: string;
  message: string;
  source: string;
}

const DIAGNOSTIC_TESTS: { name: string; fn: string }[] = [
  { name: "getCallerUserRole()", fn: "getCallerUserRole" },
  { name: "isCallerAdmin()", fn: "isCallerAdmin" },
  { name: "getMyArtistProfiles()", fn: "getMyArtistProfiles" },
  {
    name: "getArtistProfileEditingAccessStatus()",
    fn: "getArtistProfileEditingAccessStatus",
  },
  { name: "getMySubmissions()", fn: "getMySubmissions" },
  { name: "getCallerUserProfile()", fn: "getCallerUserProfile" },
];

export default function AdminDebugPanel() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();

  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>(
    DIAGNOSTIC_TESTS.map((t) => ({ name: t.name, status: "pending" })),
  );
  const [errorLog, setErrorLog] = useState<ErrorLogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [backendLatency, setBackendLatency] = useState<number | null>(null);
  const [backendStatus, setBackendStatus] = useState<
    "pending" | "pass" | "fail"
  >("pending");

  const errorLogRef = useRef<ErrorLogEntry[]>([]);

  // Capture global errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const entry: ErrorLogEntry = {
        timestamp: new Date().toISOString(),
        message: event.message || "Unknown error",
        source: event.filename
          ? `${event.filename}:${event.lineno}`
          : "unknown",
      };
      errorLogRef.current = [entry, ...errorLogRef.current].slice(0, 20);
      setErrorLog([...errorLogRef.current]);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const entry: ErrorLogEntry = {
        timestamp: new Date().toISOString(),
        message: String(event.reason) || "Unhandled promise rejection",
        source: "promise",
      };
      errorLogRef.current = [entry, ...errorLogRef.current].slice(0, 20);
      setErrorLog([...errorLogRef.current]);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
    };
  }, []);

  const runDiagnostics = useCallback(async () => {
    if (!actor) return;
    setIsRunning(true);

    // Reset to pending
    setDiagnostics(
      DIAGNOSTIC_TESTS.map((t) => ({ name: t.name, status: "pending" })),
    );

    // Backend connection test (isCallerAdmin as ping)
    const pingStart = performance.now();
    try {
      await actor.isCallerAdmin();
      const latency = Math.round(performance.now() - pingStart);
      setBackendLatency(latency);
      setBackendStatus("pass");
    } catch {
      setBackendLatency(null);
      setBackendStatus("fail");
    }

    // Run each test
    const results: DiagnosticResult[] = [];
    for (const test of DIAGNOSTIC_TESTS) {
      const start = performance.now();
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fn = (actor as any)[test.fn];
        if (typeof fn !== "function") {
          results.push({
            name: test.name,
            status: "skip",
            error: "Function not found on actor",
          });
          continue;
        }
        const raw = await fn.call(actor);
        const latencyMs = Math.round(performance.now() - start);
        let resultStr = "";
        if (raw === null || raw === undefined) {
          resultStr = "null";
        } else if (typeof raw === "boolean") {
          resultStr = String(raw);
        } else if (typeof raw === "string") {
          resultStr = raw;
        } else if (Array.isArray(raw)) {
          resultStr = `Array(${raw.length})`;
        } else if (typeof raw === "object" && raw !== null) {
          const keys = Object.keys(raw);
          resultStr =
            keys.length > 0 ? `{${keys.slice(0, 3).join(", ")}}` : "{}";
        } else {
          resultStr = String(raw);
        }
        results.push({
          name: test.name,
          status: "pass",
          latencyMs,
          result: resultStr,
        });
      } catch (e) {
        const latencyMs = Math.round(performance.now() - start);
        results.push({
          name: test.name,
          status: "fail",
          latencyMs,
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }

    setDiagnostics(results);
    setIsRunning(false);
  }, [actor]);

  // Auto-run on mount when actor is ready
  useEffect(() => {
    if (actor && !isFetching) {
      runDiagnostics();
    }
  }, [actor, isFetching, runDiagnostics]);

  const principal = identity?.getPrincipal().toString();

  const statusColor = (s: DiagnosticResult["status"]) => {
    if (s === "pass") return "text-emerald-400";
    if (s === "fail") return "text-red-400";
    if (s === "skip") return "text-yellow-400";
    return "text-slate-400";
  };

  const statusIcon = (s: DiagnosticResult["status"]) => {
    if (s === "pass") return "✓";
    if (s === "fail") return "✗";
    if (s === "skip") return "⊘";
    return "…";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-purple-300 font-mono tracking-wide">
            🔧 Admin Debug Panel
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Backend diagnostics and error monitoring
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            data-ocid="debug.run_diagnostics_button"
            onClick={runDiagnostics}
            disabled={isRunning || !actor}
            className="bg-purple-600 hover:bg-purple-500 text-white border border-purple-500/40 font-mono text-sm"
          >
            {isRunning ? "Running…" : "▶ Run Diagnostics"}
          </Button>
          <Button
            data-ocid="debug.clear_logs_button"
            variant="outline"
            onClick={() => {
              errorLogRef.current = [];
              setErrorLog([]);
            }}
            className="border-slate-600 text-slate-300 hover:bg-slate-800 font-mono text-sm"
          >
            🗑 Clear Logs
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backend Connection Status */}
        <div
          data-ocid="debug.panel"
          className="bg-slate-900/90 border border-purple-500/40 rounded-xl p-5 shadow-lg shadow-purple-900/20"
        >
          <h3 className="text-cyan-400 font-mono font-semibold text-sm uppercase tracking-wider mb-4">
            Backend Connection
          </h3>
          <div className="flex items-center gap-3">
            <span
              className={`text-2xl font-bold font-mono ${
                backendStatus === "pass"
                  ? "text-emerald-400"
                  : backendStatus === "fail"
                    ? "text-red-400"
                    : "text-yellow-400"
              }`}
            >
              {backendStatus === "pass"
                ? "●"
                : backendStatus === "fail"
                  ? "●"
                  : "○"}
            </span>
            <div>
              <div className="text-slate-200 font-mono text-sm">
                {isFetching
                  ? "Initializing actor…"
                  : backendStatus === "pass"
                    ? "Connected"
                    : backendStatus === "fail"
                      ? "Connection failed"
                      : "Not tested"}
              </div>
              {backendLatency !== null && (
                <div className="text-slate-400 text-xs mt-0.5">
                  {backendLatency}ms latency
                </div>
              )}
            </div>
          </div>

          <Separator className="my-4 bg-purple-900/40" />

          <h3 className="text-cyan-400 font-mono font-semibold text-sm uppercase tracking-wider mb-3">
            Auth Info
          </h3>
          <div className="space-y-2 font-mono text-xs">
            <div className="flex gap-2">
              <span className="text-slate-500 w-24 shrink-0">Principal:</span>
              <span className="text-purple-300 break-all">
                {principal ?? (
                  <span className="text-slate-500 italic">
                    Not authenticated
                  </span>
                )}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-slate-500 w-24 shrink-0">Actor:</span>
              <span className={actor ? "text-emerald-400" : "text-red-400"}>
                {isFetching ? "Fetching…" : actor ? "Ready" : "Null"}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-slate-500 w-24 shrink-0">Profile:</span>
              <span className="text-purple-300">
                {userProfile ? (
                  `category: ${userProfile.category ?? "unknown"}`
                ) : (
                  <span className="text-slate-500 italic">No profile</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Diagnostic Tests */}
        <div className="bg-slate-900/90 border border-purple-500/40 rounded-xl p-5 shadow-lg shadow-purple-900/20">
          <h3 className="text-cyan-400 font-mono font-semibold text-sm uppercase tracking-wider mb-4">
            Diagnostic Tests
          </h3>
          <div className="space-y-2">
            {diagnostics.map((d) => (
              <div
                key={d.name}
                className="flex items-start gap-3 p-2 rounded-lg bg-slate-800/50 border border-slate-700/40"
              >
                <span
                  className={`font-bold font-mono text-sm mt-0.5 w-4 shrink-0 ${statusColor(d.status)}`}
                >
                  {statusIcon(d.status)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-200 font-mono text-xs">
                      {d.name}
                    </span>
                    {d.latencyMs !== undefined && (
                      <Badge
                        variant="outline"
                        className="text-[10px] border-slate-600 text-slate-400 px-1.5 py-0"
                      >
                        {d.latencyMs}ms
                      </Badge>
                    )}
                    {d.result && (
                      <span className="text-cyan-500 font-mono text-[10px] truncate max-w-[120px]">
                        → {d.result}
                      </span>
                    )}
                  </div>
                  {d.error && (
                    <div className="text-red-400 text-[10px] mt-1 font-mono break-all">
                      {d.error}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Error Log */}
      <div className="bg-slate-900/90 border border-purple-500/40 rounded-xl p-5 shadow-lg shadow-purple-900/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-cyan-400 font-mono font-semibold text-sm uppercase tracking-wider">
            Error Log
          </h3>
          <span className="text-slate-500 font-mono text-xs">
            {errorLog.length} / 20 entries
          </span>
        </div>

        {errorLog.length === 0 ? (
          <div
            data-ocid="debug.empty_state"
            className="text-center py-8 text-slate-500 font-mono text-sm"
          >
            <div className="text-2xl mb-2">✓</div>
            No errors captured yet. Errors will appear here automatically.
          </div>
        ) : (
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {errorLog.map((entry) => (
                <div
                  key={entry.timestamp + entry.source}
                  className="p-3 rounded-lg bg-red-950/30 border border-red-800/30 font-mono text-xs"
                >
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-red-400 font-bold">ERR</span>
                    <span className="text-slate-500">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-slate-600 truncate text-[10px]">
                      {entry.source}
                    </span>
                  </div>
                  <div className="text-red-300 break-all">{entry.message}</div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
