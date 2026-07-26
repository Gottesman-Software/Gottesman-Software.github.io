import { Square } from "lucide-react";
import { type SessionLaunchStatus } from "../../data/sessionControl";

interface SessionLauncherButtonProps {
  launchStatus: SessionLaunchStatus;
  onStartScientific: () => void;
  onOpenBenchmark: () => void;
  onOpenReplay: () => void;
  onStopSession: () => void;
  onViewRun: () => void;
  canViewRun: boolean;
  scientificDisabledReason?: string | null;
  benchmarkDisabledReason?: string | null;
  replayDisabledReason?: string | null;
  showIngestingChip?: boolean;
}

export function SessionLauncherButton({
  launchStatus,
  onStartScientific,
  onOpenBenchmark,
  onOpenReplay,
  onStopSession,
  onViewRun,
  canViewRun,
  scientificDisabledReason,
  benchmarkDisabledReason,
  replayDisabledReason,
  showIngestingChip = false,
}: SessionLauncherButtonProps) {
  const starting = launchStatus === "launching";
  const stopping = launchStatus === "stopping";
  const running = launchStatus === "running";
  const scientificDisabled = Boolean(scientificDisabledReason);

  if (running || stopping) {
    return (
      <div className="session-launcher-inline">
        <button className="btn btn-status-failed decoder-inline-btn" onClick={onStopSession} disabled={stopping}>
          <Square size={13} aria-hidden="true" />
          <span>{stopping ? "Stopping..." : "Stop Session"}</span>
        </button>
        <button className="btn btn-secondary decoder-inline-btn" onClick={onViewRun} disabled={!canViewRun}>
          <span>View Run</span>
        </button>
        {showIngestingChip ? (
          <span className="status-badge status-running session-launcher-chip">
            ● Session running — ingesting telemetry
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="session-launcher-inline">
      <button
        className="btn btn-primary decoder-inline-btn"
        onClick={onStartScientific}
        disabled={starting || scientificDisabled}
        title={scientificDisabledReason ?? undefined}
      >
        <span>{starting ? "Starting..." : "Start Session"}</span>
      </button>
      <button
        className="btn btn-secondary decoder-inline-btn"
        onClick={onOpenBenchmark}
        disabled={starting || Boolean(benchmarkDisabledReason)}
        title={benchmarkDisabledReason ?? undefined}
      >
        <span>Benchmark</span>
      </button>
      <button
        className="btn btn-secondary decoder-inline-btn"
        onClick={onOpenReplay}
        disabled={starting || Boolean(replayDisabledReason)}
        title={replayDisabledReason ?? undefined}
      >
        <span>Replay</span>
      </button>
    </div>
  );
}
