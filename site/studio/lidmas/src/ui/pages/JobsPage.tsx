import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useIntegrationSessions, useProviders, useRuns } from "../../api/hooks";
import type { IntegrationSessionStatus, Run, RunStatus } from "../../api/types";
import { useDataMode } from "../../data/dataMode";
import { gkpProviders, gkpRuns } from "../../data/gkpFixtures";

function formatAgo(isoText: string | null | undefined): string {
  if (!isoText) {
    return "unknown";
  }
  const parsed = new Date(isoText).getTime();
  if (!Number.isFinite(parsed)) {
    return "unknown";
  }
  const minutes = Math.max(0, Math.floor((Date.now() - parsed) / 60_000));
  if (minutes < 1) {
    return "just now";
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  return `${Math.floor(hours / 24)}d ago`;
}

function runStatusClass(status: RunStatus): string {
  if (status === "finished") {
    return "status-success";
  }
  if (status === "running" || status === "created") {
    return "status-running";
  }
  if (status === "cancelled") {
    return "status-warning";
  }
  return "status-failed";
}

function runStatusLabel(status: RunStatus): string {
  if (status === "finished") {
    return "Finished";
  }
  if (status === "running") {
    return "Running";
  }
  if (status === "created") {
    return "Created";
  }
  if (status === "cancelled") {
    return "Cancelled";
  }
  return "Failed";
}

function sessionStatusClass(status: IntegrationSessionStatus): string {
  if (status === "finished") {
    return "status-success";
  }
  if (status === "running" || status === "starting") {
    return "status-running";
  }
  if (status === "cancelled") {
    return "status-warning";
  }
  return "status-failed";
}

function sessionStatusLabel(status: IntegrationSessionStatus): string {
  if (status === "finished") {
    return "Finished";
  }
  if (status === "running") {
    return "Running";
  }
  if (status === "starting") {
    return "Starting";
  }
  if (status === "cancelled") {
    return "Cancelled";
  }
  return "Failed";
}

function formatDecoderName(value: string | null | undefined): string {
  if (!value) {
    return "None";
  }
  const normalized = value.trim().toLowerCase();
  if (normalized === "mwpm") {
    return "MWPM";
  }
  if (normalized === "bp" || normalized === "bp_osd") {
    return normalized === "bp_osd" ? "BP-OSD" : "BP";
  }
  if (normalized === "uf" || normalized === "union_find") {
    return "Union-Find";
  }
  if (normalized === "mwpm_gkp") {
    return "MWPM-GKP";
  }
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatPercent(value: number | null | undefined, digits = 3): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "Pending";
  }
  return `${(value * 100).toFixed(digits)}%`;
}

function formatCount(value: number | null | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "Pending";
  }
  return value.toLocaleString();
}

function qecLabelFromEncoderState(value: string | null | undefined): string {
  if (!value) {
    return "Pending";
  }
  const normalized = value.trim().toLowerCase().replace(/[-\s]+/g, "_");
  if (normalized === "gkp" || normalized === "digitized_gkp") {
    return "Digitized GKP";
  }
  if (normalized === "surface" || normalized === "surface_code") {
    return "Surface Code";
  }
  if (normalized === "surface_gkp" || normalized === "surface__gkp") {
    return "Surface-GKP";
  }
  if (normalized === "repetition" || normalized === "repetition_code") {
    return "Repetition Code";
  }
  if (normalized === "css_ldpc" || normalized === "css_ldpc_code") {
    return "CSS-LDPC";
  }
  return value;
}

function scientificEvidenceLabel(run: Run): string {
  if (run.metrics?.scientific_validation_ready) {
    return "Exact counters ready";
  }
  if (run.status === "running" || run.status === "created") {
    return "Awaiting counters";
  }
  return "No exact counters";
}

export function JobsPage() {
  const navigate = useNavigate();
  const { isApi, isMock, systemOff } = useDataMode();
  const apiEnabled = isApi && !systemOff;
  const providersQuery = useProviders({ enabled: apiEnabled });
  const runsQuery = useRuns({ enabled: apiEnabled, refetchInterval: 2_500 });
  const sessionsQuery = useIntegrationSessions({ enabled: apiEnabled, refetchInterval: 2_500 });

  const providers = systemOff ? [] : isMock ? gkpProviders : providersQuery.data ?? [];
  const runs = systemOff ? [] : isMock ? gkpRuns : runsQuery.data ?? [];
  const sessions = systemOff ? [] : isMock ? [] : sessionsQuery.data ?? [];
  const providerById = useMemo(() => new Map(providers.map((provider) => [provider.id, provider])), [providers]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | RunStatus>("all");
  const [providerFilter, setProviderFilter] = useState("all");

  const providerScopedRuns = useMemo(() => {
    return runs.filter((run) => {
      if (providerFilter !== "all" && run.provider_id !== providerFilter) {
        return false;
      }
      return true;
    });
  }, [providerFilter, runs]);

  const filteredRuns = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return providerScopedRuns.filter((run) => {
      if (statusFilter !== "all" && run.status !== statusFilter) {
        return false;
      }
      if (!query) {
        return true;
      }
      const providerName = providerById.get(run.provider_id)?.name ?? run.provider_id;
      return (
        run.id.toLowerCase().includes(query) ||
        run.dataset_label.toLowerCase().includes(query) ||
        providerName.toLowerCase().includes(query) ||
        run.decoders.join(",").toLowerCase().includes(query)
      );
    });
  }, [providerById, providerScopedRuns, searchQuery, statusFilter]);

  const filteredSessions = useMemo(() => {
    const runIds = new Set(filteredRuns.map((run) => run.id));
    return sessions.filter((session) => runIds.has(session.run_id));
  }, [filteredRuns, sessions]);

  const latestUpdatedAt = useMemo(() => {
    const stamps = [
      ...filteredRuns.map((run) => run.updated_at),
      ...filteredSessions.map((session) => session.updated_at),
    ];
    if (stamps.length === 0) {
      return null;
    }
    return stamps.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
  }, [filteredRuns, filteredSessions]);

  const latestScientificRun = useMemo(() => {
    return [...filteredRuns]
      .filter((run) => run.metrics?.scientific_validation_ready)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];
  }, [filteredRuns]);

  const exactRunCount = filteredRuns.filter((run) => run.metrics?.scientific_validation_ready).length;

  return (
    <>
      <div className="header">
        <h1>Runs</h1>
        <p>Replay history, execution sessions, and decoder run orchestration.</p>
      </div>

      <div className="trust-strip">
        <div className="trust-item">
          <span>Data Source</span>
          <strong>{systemOff ? "Off" : isMock ? "GKP Mock" : "Live API"}</strong>
        </div>
        <div className="trust-item">
          <span>Runs in Scope</span>
          <strong>{filteredRuns.length}</strong>
        </div>
        <div className="trust-item">
          <span>Exact Runs</span>
          <strong>{exactRunCount}</strong>
        </div>
        <div className="trust-item">
          <span>Active Sessions</span>
          <strong>{filteredSessions.filter((session) => session.status === "running" || session.status === "starting").length}</strong>
        </div>
        <div className="trust-item">
          <span>Last Refresh</span>
          <strong>{formatAgo(latestUpdatedAt)}</strong>
        </div>
      </div>

      <div className="dashboard-filterbar">
        <div className="filter-group">
          <label>Search</label>
          <input
            type="text"
            className="search-box research-search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Run id, dataset, provider, decoder..."
          />
        </div>
        <div className="filter-group">
          <label>Status</label>
          <select
            className="select-field research-select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "all" | RunStatus)}
          >
            <option value="all">All</option>
            <option value="created">Created</option>
            <option value="running">Running</option>
            <option value="finished">Finished</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Provider</label>
          <select
            className="select-field research-select"
            value={providerFilter}
            onChange={(event) => setProviderFilter(event.target.value)}
          >
            <option value="all">All Providers</option>
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="runs-evidence-panel">
        <div className="runs-evidence-heading">
          <div>
            <span>Latest Scientific Evidence</span>
            <strong>
              {latestScientificRun ? `Run ${latestScientificRun.id.slice(0, 8).toUpperCase()}` : "Awaiting exact run"}
            </strong>
          </div>
          <button
            className="provider-link-btn"
            disabled={!latestScientificRun}
            onClick={() => {
              if (latestScientificRun) {
                navigate(`/decoder/telemetry?runA=${encodeURIComponent(latestScientificRun.id)}&compare=0`);
              }
            }}
          >
            Open Telemetry
          </button>
        </div>
        <div className="runs-evidence-grid">
          <div className="runs-evidence-card">
            <span>Recommended Decoder</span>
            <strong>{formatDecoderName(latestScientificRun?.metrics?.best_decoder)}</strong>
          </div>
          <div className="runs-evidence-card">
            <span>QEC Mapping</span>
            <strong>{qecLabelFromEncoderState(latestScientificRun?.metrics?.best_encoder_state)}</strong>
          </div>
          <div className="runs-evidence-card">
            <span>Logical Error Rate</span>
            <strong>{formatPercent(latestScientificRun?.metrics?.logical_error_rate, 3)}</strong>
          </div>
          <div className="runs-evidence-card">
            <span>Exact PER</span>
            <strong>{formatPercent(latestScientificRun?.metrics?.physical_error_rate, 3)}</strong>
          </div>
          <div className="runs-evidence-card">
            <span>Warning Rate</span>
            <strong>{formatPercent(latestScientificRun?.metrics?.warning_rate, 2)}</strong>
          </div>
          <div className="runs-evidence-card">
            <span>Expanded Shots</span>
            <strong>{formatCount(latestScientificRun?.metrics?.expanded_shot_count)}</strong>
          </div>
        </div>
      </div>

      <div className="section-title">Run History</div>
      <div className="panel-subtitle">Primary replay and execution list with direct links to decoder telemetry.</div>
      {filteredRuns.length === 0 ? (
        <div className="empty-card">
          <strong>No Runs In Scope</strong>
          <p>Adjust filters or execute a replay session.</p>
        </div>
      ) : (
        <div className="table-container runs-table-container">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Run</th>
                  <th>Dataset</th>
                  <th>Provider</th>
                  <th>Recommendation</th>
                  <th>QEC</th>
                  <th>LER</th>
                  <th>Exact PER</th>
                  <th>Status</th>
                  <th>Evidence</th>
                  <th>Updated</th>
                  <th>Telemetry</th>
                </tr>
              </thead>
              <tbody>
                {filteredRuns.map((run) => (
                  <tr key={run.id}>
                    <td>{run.id.slice(0, 8).toUpperCase()}</td>
                    <td>{run.dataset_label}</td>
                    <td>{providerById.get(run.provider_id)?.name ?? run.provider_id}</td>
                    <td>
                      <strong className="runs-table-strong">{formatDecoderName(run.metrics?.best_decoder)}</strong>
                      <div className="runs-decoder-list">
                        {run.decoders.map((decoder) => (
                          <span key={`${run.id}-${decoder}`} className="runs-decoder-pill">
                            {formatDecoderName(decoder)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>{qecLabelFromEncoderState(run.metrics?.best_encoder_state)}</td>
                    <td className="runs-table-number">{formatPercent(run.metrics?.logical_error_rate, 3)}</td>
                    <td className="runs-table-number">{formatPercent(run.metrics?.physical_error_rate, 3)}</td>
                    <td>
                      <span className={`status-badge ${runStatusClass(run.status)}`}>● {runStatusLabel(run.status)}</span>
                    </td>
                    <td>
                      <span className="runs-evidence-badge">{scientificEvidenceLabel(run)}</span>
                    </td>
                    <td>{formatAgo(run.updated_at)}</td>
                    <td>
                      <button
                        className="provider-link-btn"
                        onClick={() => navigate(`/decoder/telemetry?runA=${encodeURIComponent(run.id)}&compare=0`)}
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="section-title section-offset">Adapter Sessions</div>
      <div className="panel-subtitle">Runtime session history for simulator and replay adapters.</div>
      {filteredSessions.length === 0 ? (
        <div className="scientific-muted-note">No adapter sessions in the current run scope.</div>
      ) : (
        <div className="table-container">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Session</th>
                  <th>Run</th>
                  <th>Provider</th>
                  <th>Adapter</th>
                  <th>Status</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((session) => (
                  <tr key={session.id}>
                    <td>{session.id.slice(0, 8).toUpperCase()}</td>
                    <td>{session.run_id.slice(0, 8).toUpperCase()}</td>
                    <td>{session.provider.toUpperCase()}</td>
                    <td>{session.adapter_id}</td>
                    <td>
                      <span className={`status-badge ${sessionStatusClass(session.status)}`}>
                        ● {sessionStatusLabel(session.status)}
                      </span>
                    </td>
                    <td>{formatAgo(session.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
