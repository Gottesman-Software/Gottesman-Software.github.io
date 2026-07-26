import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useProviders } from "../../api/hooks";
import type { Provider } from "../../api/types";
import { useDataMode } from "../../data/dataMode";
import { gkpProviderRuntime } from "../../data/gkpFixtures";

type ProviderStatus = "online" | "busy" | "offline";
type ProviderStatusFilter = "all" | ProviderStatus;
type ProviderKindFilter = "all" | Provider["kind"];

interface ProviderRow {
  id: string;
  name: string;
  status: ProviderStatus;
  lastSeen: string;
  lastSeenMinutes: number;
  type: string;
  kind: Provider["kind"];
  simulationTarget: string;
  region: string;
  supportedFormats: string[];
  capabilities: string[];
  publicBoundary: string;
  readinessNote: string;
  supportsScientific: boolean;
  supportsBenchmark: boolean;
  supportsReplay: boolean;
  supportsLive: boolean;
  updatedAt: string | null;
}

interface KpiCardModel {
  key: string;
  label: string;
  value: string;
  detail: string;
}

interface ProviderSignalItem {
  id: string;
  level: "critical" | "warning" | "info";
  title: string;
  detail: string;
  metric: string;
}

interface ProviderDrilldownState {
  provider: ProviderRow;
  timeline: string[];
}

function parseLastSeenMinutes(value: string): number {
  const matched = value.match(/(\d+)\s*(sec|min|hour|hr|day)/i);
  if (!matched) {
    return 0;
  }
  const amount = Number(matched[1]);
  if (!Number.isFinite(amount)) {
    return 0;
  }
  const unit = matched[2].toLowerCase();
  if (unit.startsWith("sec")) {
    return amount / 60;
  }
  if (unit.startsWith("hour") || unit.startsWith("hr")) {
    return amount * 60;
  }
  if (unit.startsWith("day")) {
    return amount * 1_440;
  }
  return amount;
}

function parseStatusFilter(value: string | null): ProviderStatusFilter {
  if (value === "online" || value === "busy" || value === "offline") {
    return value;
  }
  return "all";
}

function parseKindFilter(value: string | null): ProviderKindFilter {
  if (
    value === "photonic" ||
    value === "superconducting" ||
    value === "trapped_ion" ||
    value === "simulated" ||
    value === "other"
  ) {
    return value;
  }
  return "all";
}

function formatAgo(isoText: string | null | undefined): string {
  if (!isoText) {
    return "unknown";
  }
  const parsed = new Date(isoText).getTime();
  if (!Number.isFinite(parsed)) {
    return "unknown";
  }
  const deltaMins = Math.max(0, Math.floor((Date.now() - parsed) / 60_000));
  if (deltaMins < 1) {
    return "just now";
  }
  if (deltaMins < 60) {
    return `${deltaMins}m ago`;
  }
  const hours = Math.floor(deltaMins / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const fallbackRows: ProviderRow[] = gkpProviderRuntime.map((provider) => ({
  id: provider.id,
  name: provider.name,
  status: provider.status,
  lastSeen: provider.lastSeen,
  lastSeenMinutes: parseLastSeenMinutes(provider.lastSeen),
  type: provider.type,
  kind:
    provider.type.toLowerCase().includes("photonic")
      ? "photonic"
      : provider.type.toLowerCase().includes("trapped")
        ? "trapped_ion"
        : provider.type.toLowerCase().includes("superconducting")
          ? "superconducting"
          : "simulated",
  simulationTarget: provider.type,
  region: provider.region,
  supportedFormats: ["mock-fixture"],
  capabilities: ["scientific", "benchmark", "replay"],
  publicBoundary: "Mock fixture; no public hardware control.",
  readinessNote: "Mock fixture used only outside the public API build.",
  supportsScientific: true,
  supportsBenchmark: true,
  supportsReplay: true,
  supportsLive: false,
  updatedAt: null,
}));

function mapProviderKind(kind: Provider["kind"]): string {
  switch (kind) {
    case "photonic":
      return "Photonic";
    case "superconducting":
      return "Superconducting";
    case "trapped_ion":
      return "Trapped Ion";
    case "simulated":
      return "Simulated";
    default:
      return "Other";
  }
}

function mapSimulationTarget(provider: Provider): string {
  const name = provider.name.toLowerCase();
  if (name.includes("pennylane")) {
    return "Photonic circuit construction";
  }
  if (name.includes("qiskit")) {
    return "Qiskit Aer noise simulation";
  }
  if (name.includes("cirq")) {
    return "Stabilizer syndrome simulation";
  }
  if (name.includes("schrosim")) {
    return "Photonic CV / GKP simulation";
  }
  return mapProviderKind(provider.hardware_kind ?? provider.kind);
}

function mapProviderStatus(status: Provider["status"]): ProviderStatus {
  if (status === "ready") {
    return "online";
  }
  if (status === "degraded") {
    return "busy";
  }
  return "offline";
}

function mapStatusTone(status: ProviderStatus): "status-healthy" | "status-warning" | "status-critical" {
  if (status === "online") {
    return "status-healthy";
  }
  if (status === "busy") {
    return "status-warning";
  }
  return "status-critical";
}

export function EnhancedProvidersPage() {
  const { mode, isApi, isMock, systemOff } = useDataMode();
  const apiEnabled = isApi && !systemOff;
  const providersQuery = useProviders({ enabled: apiEnabled });
  const [searchParams, setSearchParams] = useSearchParams();
  const [drilldown, setDrilldown] = useState<ProviderDrilldownState | null>(null);

  const searchQuery = searchParams.get("q") ?? "";
  const statusFilter = parseStatusFilter(searchParams.get("status"));
  const kindFilter = parseKindFilter(searchParams.get("kind"));

  const setFilterParam = (key: string, value: string, defaultValue: string) => {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);
      if (!value || value === defaultValue) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }
      return nextParams;
    });
  };

  const apiRows: ProviderRow[] = useMemo(
    () =>
      (providersQuery.data ?? []).map((provider) => {
        const status = mapProviderStatus(provider.status);
        const lastSeenStamp = provider.last_seen ?? provider.updated_at;
        const lastSeen = formatAgo(lastSeenStamp);
        const lastSeenMinutes = parseLastSeenMinutes(lastSeen);
        const capabilities = [
          provider.supports_scientific ? "scientific" : null,
          provider.supports_benchmark ? "benchmark" : null,
          provider.supports_replay ? "replay" : null,
          provider.supports_live ? "live" : null,
        ].filter((capability): capability is string => Boolean(capability));
        return {
          id: provider.id,
          name: provider.name,
          status,
          lastSeen,
          lastSeenMinutes,
          type: mapProviderKind(provider.hardware_kind ?? provider.kind),
          kind: provider.kind,
          simulationTarget: mapSimulationTarget(provider),
          region: provider.contact_email ? provider.contact_email.split("@")[1] : "global",
          supportedFormats: provider.supported_formats,
          capabilities,
          publicBoundary: provider.supports_live
            ? "Live control flag is private; public Studio uses simulator mode only."
            : "Simulator-only public API; no credentials or lab hardware control.",
          readinessNote: provider.readiness_note ?? provider.notes ?? "No readiness note provided.",
          supportsScientific: provider.supports_scientific,
          supportsBenchmark: provider.supports_benchmark,
          supportsReplay: provider.supports_replay,
          supportsLive: provider.supports_live,
          updatedAt: provider.updated_at,
        };
      }),
    [providersQuery.data],
  );

  const providerRows = systemOff ? [] : isMock ? fallbackRows : apiRows;
  const filteredRows = useMemo(() => {
    return providerRows.filter((provider) => {
      if (searchQuery && !provider.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (statusFilter !== "all" && provider.status !== statusFilter) {
        return false;
      }
      if (kindFilter !== "all" && provider.kind !== kindFilter) {
        return false;
      }
      return true;
    });
  }, [kindFilter, providerRows, searchQuery, statusFilter]);

  const activeProviders = filteredRows.filter((provider) => provider.status === "online").length;
  const offlineProviders = filteredRows.filter((provider) => provider.status === "offline");
  const degradedProviders = filteredRows.filter((provider) => provider.status === "busy");
  const scientificProviders = filteredRows.filter((provider) => provider.supportsScientific).length;
  const benchmarkProviders = filteredRows.filter((provider) => provider.supportsBenchmark).length;
  const replayProviders = filteredRows.filter((provider) => provider.supportsReplay).length;
  const liveProviders = filteredRows.filter((provider) => provider.supportsLive).length;

  const kpiCards: KpiCardModel[] = [
    {
      key: "providers",
      label: "Simulator Backends",
      value: `${filteredRows.length}`,
      detail: `${providerRows.length} total records from the selected source`,
    },
    {
      key: "ready",
      label: "Ready Simulators",
      value: `${activeProviders}`,
      detail: `${degradedProviders.length} degraded, ${offlineProviders.length} offline`,
    },
    {
      key: "scientific",
      label: "Scientific Sessions",
      value: `${scientificProviders}`,
      detail: "Circuit, noise, syndrome, decoder policy",
    },
    {
      key: "benchmark",
      label: "Benchmark Replay",
      value: `${benchmarkProviders}`,
      detail: "Public benchmark inspection",
    },
    {
      key: "replay",
      label: "Replay Sessions",
      value: `${replayProviders}`,
      detail: "Deterministic run replay",
    },
    {
      key: "live",
      label: "Private Live Flags",
      value: `${liveProviders}`,
      detail: "Not exposed as public hardware control",
    },
  ];

  const latestUpdatedAt = useMemo(() => {
    const withUpdates = filteredRows.filter((provider) => provider.updatedAt);
    if (withUpdates.length > 0) {
      return withUpdates.reduce((latest, provider) => {
        if (!provider.updatedAt) {
          return latest;
        }
        const candidate = new Date(provider.updatedAt).getTime();
        const baseline = new Date(latest).getTime();
        return candidate > baseline ? provider.updatedAt : latest;
      }, withUpdates[0].updatedAt ?? new Date().toISOString());
    }

    if (filteredRows.length > 0) {
      const minimumSeen = Math.min(...filteredRows.map((provider) => provider.lastSeenMinutes));
      return new Date(Date.now() - minimumSeen * 60_000).toISOString();
    }

    return null;
  }, [filteredRows]);

  const missingSignals: string[] = [];
  if (filteredRows.length === 0) {
    missingSignals.push("provider-records");
  }
  if (filteredRows.every((provider) => !provider.updatedAt)) {
    missingSignals.push("updated_at");
  }

  const providerSignals = useMemo<ProviderSignalItem[]>(() => {
    const alerts: ProviderSignalItem[] = [];
    if (providersQuery.isError) {
      alerts.push({
        id: "api-error",
        level: "critical",
        title: "Provider API unreachable",
        detail: "Live provider records cannot be refreshed from backend.",
        metric: "API connectivity",
      });
    }
    if (offlineProviders.length > 0) {
      alerts.push({
        id: "offline",
        level: "critical",
        title: "Offline providers detected",
        detail: `${offlineProviders.length} provider(s) are marked offline by the provider registry.`,
        metric: offlineProviders.map((provider) => provider.name).join(", "),
      });
    }
    if (degradedProviders.length > 0) {
      alerts.push({
        id: "degraded",
        level: "warning",
        title: "Degraded providers detected",
        detail: `${degradedProviders.length} provider(s) are marked degraded by the provider registry.`,
        metric: degradedProviders.map((provider) => provider.name).join(", "),
      });
    }
    if (liveProviders > 0) {
      alerts.push({
        id: "private-live",
        level: "info",
        title: "Private live capability held back",
        detail: "One or more providers declare live capability, but public Studio keeps hardware control outside this route.",
        metric: `${liveProviders} live flag(s)`,
      });
    }
    if (filteredRows.length === 0 && !providersQuery.isError) {
      alerts.push({
        id: "empty-registry",
        level: "info",
        title: "No provider registry records",
        detail: "The API returned no provider records for the current filter scope.",
        metric: "0 providers",
      });
    }
    if (alerts.length === 0) {
      alerts.push({
        id: "all-clear",
        level: "info",
        title: "Public simulator registry loaded",
        detail: "Ready simulator records are available without private credentials or lab hardware control.",
        metric: `${filteredRows.length} simulator records`,
      });
    }
    return alerts;
  }, [
    degradedProviders,
    filteredRows.length,
    liveProviders,
    offlineProviders,
    providersQuery.isError,
  ]);

  const showLoadingState = apiEnabled && providersQuery.isLoading && providerRows.length === 0;
  const showErrorState = apiEnabled && providersQuery.isError;
  const showEmptyState = !showLoadingState && !showErrorState && filteredRows.length === 0;

  const openDrilldown = (provider: ProviderRow) => {
    const timeline: string[] = [
      `Provider ${provider.name} status changed to ${provider.status.toUpperCase()}.`,
      `Simulator route recorded as ${provider.simulationTarget}.`,
      `Capabilities: ${provider.capabilities.length > 0 ? provider.capabilities.join(", ") : "none declared"}.`,
      `Public boundary: ${provider.publicBoundary}`,
      `Supported formats: ${provider.supportedFormats.length > 0 ? provider.supportedFormats.join(", ") : "none declared"}.`,
      `Last provider timestamp: ${provider.lastSeen}.`,
    ];
    setDrilldown({ provider, timeline });
  };

  const exportSnapshot = () => {
    const payload = {
      exported_at: new Date().toISOString(),
      filters: {
        query: searchQuery,
        status: statusFilter,
        kind: kindFilter,
      },
      trust: {
        source: systemOff ? "off" : mode === "api" ? "live-api" : "gkp-mock",
        last_refresh: latestUpdatedAt,
        missing_signals: missingSignals,
      },
      registry_cards: kpiCards,
      providers: filteredRows,
      provider_signals: providerSignals,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `lidmas-providers-snapshot-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="header">
        <h1>Providers</h1>
        <p>Simulator backend registry and runtime readiness for public decoder workflows.</p>
      </div>

      <div className="trust-strip">
        <div className="trust-item">
          <span>Data Source</span>
          <strong>{systemOff ? "Off" : isMock ? "GKP Mock" : "Live API"}</strong>
        </div>
        <div className="trust-item">
          <span>Last Refresh</span>
          <strong>{formatAgo(latestUpdatedAt)}</strong>
        </div>
        <div className="trust-item">
          <span>Providers in Scope</span>
          <strong>{filteredRows.length}</strong>
        </div>
        <div className="trust-item">
          <span>Ready Providers</span>
          <strong>{activeProviders}</strong>
        </div>
        <div className="trust-item">
          <span>Registry Gaps</span>
          <strong>{missingSignals.length === 0 ? "None" : missingSignals.join(", ")}</strong>
        </div>
        <div className="trust-item">
          <span>Public Boundary</span>
          <strong>Simulator only</strong>
        </div>
      </div>

      <div className="dashboard-filterbar providers-filterbar">
        <div className="filter-group">
          <label>Search</label>
          <input
            type="text"
            className="search-box research-search"
            placeholder="Provider name..."
            value={searchQuery}
            onChange={(event) => setFilterParam("q", event.target.value, "")}
          />
        </div>
        <div className="filter-group">
          <label>Status</label>
          <select
            className="select-field research-select"
            value={statusFilter}
            onChange={(event) => setFilterParam("status", event.target.value, "all")}
          >
            <option value="all">All</option>
            <option value="online">Ready</option>
            <option value="busy">Degraded</option>
            <option value="offline">Offline</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Simulator Kind</label>
          <select
            className="select-field research-select"
            value={kindFilter}
            onChange={(event) => setFilterParam("kind", event.target.value, "all")}
          >
            <option value="all">All Simulator Backends</option>
            <option value="photonic">Photonic</option>
            <option value="superconducting">Superconducting</option>
            <option value="trapped_ion">Trapped Ion</option>
            <option value="simulated">Simulated</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="scope-meta">
        Scope: {filteredRows.length} providers, {activeProviders} ready, {degradedProviders.length} degraded,{" "}
        {offlineProviders.length} offline.
      </div>

      <div className="section-title">Provider Registry</div>
      <div className="panel-subtitle">Exact fields returned by the API; measured job/runtime metrics remain on run pages.</div>
      <div className="kpi-grid">
        {kpiCards.map((card) => (
          <div key={card.key} className="kpi-card">
            <div className="kpi-label">{card.label}</div>
            <div className="kpi-value">{card.value}</div>
            <div className="kpi-trend">{card.detail}</div>
          </div>
        ))}
      </div>

      <div className="table-container provider-registry-table-container">
        <div className="table-wrapper">
          <table className="provider-registry-table">
            <thead>
              <tr>
                <th>Provider Name</th>
                <th>Status</th>
                <th>Simulator Route</th>
                <th>Public Workflows</th>
                <th>Formats</th>
                <th>Boundary</th>
                <th>Last Seen</th>
                <th>Readiness</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((provider) => (
                <tr key={provider.id}>
                  <td className="provider-name">
                    <button className="provider-link-btn" onClick={() => openDrilldown(provider)}>
                      {provider.name}
                    </button>
                  </td>
                  <td>
                    <span className={`status-badge ${mapStatusTone(provider.status)}`}>
                      ●{" "}
                      {provider.status === "online"
                        ? "Ready"
                        : provider.status === "busy"
                          ? "Degraded"
                          : "Offline"}
                    </span>
                  </td>
                  <td>
                    <strong className="runs-table-strong">{provider.simulationTarget}</strong>
                    <div className="panel-subtitle">{provider.type}</div>
                  </td>
                  <td>
                    <div className="provider-capability-list">
                      {provider.supportsScientific ? <span>Scientific</span> : null}
                      {provider.supportsBenchmark ? <span>Benchmark</span> : null}
                      {provider.supportsReplay ? <span>Replay</span> : null}
                      {provider.supportsLive ? <span className="is-muted">Private live flag</span> : null}
                      {provider.capabilities.length === 0 ? <span className="is-muted">None</span> : null}
                    </div>
                  </td>
                  <td>{provider.supportedFormats.length > 0 ? provider.supportedFormats.join(", ") : "None"}</td>
                  <td>{provider.publicBoundary}</td>
                  <td>{provider.lastSeen}</td>
                  <td>{provider.readinessNote}</td>
                </tr>
              ))}
              {showLoadingState ? (
                <tr>
                  <td colSpan={8}>Loading providers from API...</td>
                </tr>
              ) : null}
              {showErrorState && filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8}>Failed to load providers from API.</td>
                </tr>
              ) : null}
              {showEmptyState ? (
                <tr>
                  <td colSpan={8}>
                    {providerRows.length === 0
                      ? "No providers returned by API."
                      : "No providers match your current filter scope."}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span>
            Showing {filteredRows.length} of {providerRows.length} providers
          </span>
        </div>
      </div>

      <div className="workflow-section">
        <div className="section-title">Provider Signals</div>
        <div className="panel-subtitle">
          Registry status and declared capability signals for the current provider scope.
        </div>
        <div className="workflow-grid">
          {providerSignals.map((alert) => (
            <div key={alert.id} className={`workflow-card ${alert.level}`}>
              <div className="workflow-head">
                <div>
                  <div className="workflow-title">{alert.title}</div>
                  <div className="workflow-detail">{alert.detail}</div>
                </div>
                <span className={`status-badge status-${alert.level === "info" ? "running" : alert.level}`}>
                  {alert.level.toUpperCase()}
                </span>
              </div>
              <div className="workflow-metric">{alert.metric}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="actions">
        <button className="btn btn-secondary" onClick={exportSnapshot}>
          Export Snapshot
        </button>
        <button className="btn btn-secondary" onClick={() => providersQuery.refetch()} disabled={!apiEnabled}>
          Refresh
        </button>
      </div>

      {drilldown ? (
        <div className="drilldown-overlay" onClick={() => setDrilldown(null)}>
          <aside className="drilldown-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="drilldown-header">
              <div>
                <div className="drilldown-title">{drilldown.provider.name}</div>
                <div className="drilldown-summary">
                  {drilldown.provider.simulationTarget} · {drilldown.provider.status.toUpperCase()}
                </div>
              </div>
              <button className="btn-icon" onClick={() => setDrilldown(null)}>
                ×
              </button>
            </div>
            <div className="drilldown-meta">Last seen {drilldown.provider.lastSeen}</div>
            <div className="drilldown-kv">
              <div className="drilldown-kv-row">
                <span>Status</span>
                <strong>{drilldown.provider.status}</strong>
              </div>
              <div className="drilldown-kv-row">
                <span>Capabilities</span>
                <strong>
                  {drilldown.provider.capabilities.length > 0
                    ? drilldown.provider.capabilities.join(", ")
                    : "None declared"}
                </strong>
              </div>
              <div className="drilldown-kv-row">
                <span>Public Boundary</span>
                <strong>{drilldown.provider.publicBoundary}</strong>
              </div>
              <div className="drilldown-kv-row">
                <span>Supported Formats</span>
                <strong>
                  {drilldown.provider.supportedFormats.length > 0
                    ? drilldown.provider.supportedFormats.join(", ")
                    : "None declared"}
                </strong>
              </div>
              <div className="drilldown-kv-row">
                <span>Readiness Note</span>
                <strong>{drilldown.provider.readinessNote}</strong>
              </div>
            </div>
            <div className="drilldown-timeline-title">Event Timeline</div>
            <div className="drilldown-timeline">
              {drilldown.timeline.map((entry, index) => (
                <div key={`${entry}-${index}`} className="drilldown-timeline-item">
                  {entry}
                </div>
              ))}
            </div>
          </aside>
        </div>
      ) : null}

      {showErrorState ? (
        <div className="empty-card section-offset">
          <strong>API Data Unavailable</strong>
          <p>Provider records could not be fetched from the backend.</p>
        </div>
      ) : null}
    </>
  );
}
