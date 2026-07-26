import { FlaskConical, Gauge, History } from "lucide-react";
import type { ReactNode } from "react";

interface SessionLauncherMenuProps {
  open: boolean;
  onStartScientific: () => void;
  onStartBenchmark: () => void;
  onStartReplay: () => void;
  scientificDisabledReason?: string | null;
  benchmarkDisabledReason?: string | null;
  replayDisabledReason?: string | null;
}

interface MenuActionProps {
  icon: ReactNode;
  title: string;
  detail: string;
  disabledReason?: string | null;
  onClick: () => void;
}

function MenuAction({ icon, title, detail, disabledReason, onClick }: MenuActionProps) {
  const disabled = Boolean(disabledReason);
  return (
    <button className="session-launcher-menu-item" disabled={disabled} onClick={onClick}>
      <span className="session-launcher-menu-icon">{icon}</span>
      <span className="session-launcher-menu-copy">
        <strong>{title}</strong>
        <span>{disabled ? disabledReason : detail}</span>
      </span>
    </button>
  );
}

export function SessionLauncherMenu({
  open,
  onStartScientific,
  onStartBenchmark,
  onStartReplay,
  scientificDisabledReason,
  benchmarkDisabledReason,
  replayDisabledReason,
}: SessionLauncherMenuProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="session-launcher-menu" role="menu" aria-label="Session launcher menu">
      <MenuAction
        icon={<FlaskConical size={14} aria-hidden="true" />}
        title="Start Scientific Session"
        detail="Run exact decoder telemetry for scientific state updates."
        disabledReason={scientificDisabledReason}
        onClick={onStartScientific}
      />
      <MenuAction
        icon={<Gauge size={14} aria-hidden="true" />}
        title="Start Benchmark Session"
        detail="Configure multi-decoder comparison under one input scope."
        disabledReason={benchmarkDisabledReason}
        onClick={onStartBenchmark}
      />
      <MenuAction
        icon={<History size={14} aria-hidden="true" />}
        title="Start Replay Session"
        detail="Replay a historical run for deterministic rerun workflows."
        disabledReason={replayDisabledReason}
        onClick={onStartReplay}
      />
    </div>
  );
}
