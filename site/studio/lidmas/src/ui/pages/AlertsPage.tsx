import { useEffect, useState } from "react";

import { useJobs, useProviders, useRuns } from "../../api/hooks";
import type { Job, Provider, Run } from "../../api/types";
import { useDataMode } from "../../data/dataMode";
import { gkpAlertRules, gkpAlerts } from "../../data/gkpFixtures";

type AlertSeverity = "critical" | "warning" | "info";
type AlertStatus = "open" | "acknowledged" | "resolved" | "suppressed";
type AlertCategory = "backend" | "jobs" | "runs" | "quality" | "capacity" | "system";
type AlertsTab = "active" | "history" | "rules";
type RuleChannel = "dashboard" | "validation" | "logs";

interface AlertRecord {
  id: string;
  title: string;
  severity: AlertSeverity;
  category: AlertCategory;
  summary: string;
  impact: string;
  source: string;
  suggestedAction: string;
  triggeredAtMs: number;
}

interface AlertRule {
  id: number;
  name: string;
  condition: string;
  severity: AlertSeverity;
  channel: RuleChannel;
  enabled: boolean;
}

interface TimelineEvent {
  id: string;
  alertId: string;
  action: "acknowledged" | "resolved" | "suppressed" | "escalated" | "reopened" | "rule_updated";
  atMs: number;
  note: string;
}

const API_RULES: AlertRule[] = [
  {
    id: 1,
    name: "Simulator Registry Coverage",
    condition: "Show when fewer than two simulator backends are available",
    severity: "warning",
    channel: "dashboard",
    enabled: true,
  },
  {
    id: 2,
    name: "Public Job Failure",
    condition: "Show when a public job fails or is cancelled",
    severity: "critical",
    channel: "logs",
    enabled: true,
  },
  {
    id: 3,
    name: "Run Warning Rate",
    condition: "Show when exact warning_rate exceeds 0.15 for public runs",
    severity: "warning",
    channel: "validation",
    enabled: true,
  },
  {
    id: 4,
    name: "Queue Backlog",
    condition: "Show when queued public jobs remain above 3",
    severity: "warning",
    channel: "dashboard",
    enabled: false,
  },
];

const OWNERS = ["Unassigned", "Research software", "Decoder review", "Backend review", "Release review"];

function parseTimestampToMs(value: string | null | undefined): number {
  if (!value) {
    return 0;
  }
  const first = Date.parse(value);
  if (!Number.isNaN(first)) {
    return first;
  }
  if (value.includes(" ")) {
    const normalized = value.replace(" ", "T");
    const second = Date.parse(normalized);
    if (!Number.isNaN(second)) {
      return second;
    }
  }
  return 0;
}

function formatUtcDateTime(ms: number): string {
  if (ms <= 0) {
    return "unknown";
  }
  return new Date(ms).toISOString().replace("T", " ").replace("Z", " UTC");
}

function formatRelativeAge(ms: number): string {
  if (ms <= 0) {
    return "unknown";
  }
  const diff = Math.max(0, Date.now() - ms);
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) {
    return "just now";
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  return `${Math.round(hours / 24)}d ago`;
}

function severityRank(severity: AlertSeverity): number {
  if (severity === "critical") {
    return 3;
  }
  if (severity === "warning") {
    return 2;
  }
  return 1;
}

function statusRank(status: AlertStatus): number {
  if (status === "open") {
    return 4;
  }
  if (status === "acknowledged") {
    return 3;
  }
  if (status === "suppressed") {
    return 2;
  }
  return 1;
}

function newestUpdatedAtMs(items: Array<{ updated_at: string }>): number {
  let newest = 0;
  for (const item of items) {
    const parsed = parseTimestampToMs(item.updated_at);
    if (parsed > newest) {
      newest = parsed;
    }
  }
  return newest;
}

function inferCategoryFromTitle(title: string): AlertCategory {
  const lower = title.toLowerCase();
  if (lower.includes("provider") || lower.includes("backend") || lower.includes("simulator")) {
    return "backend";
  }
  if (lower.includes("job")) {
    return "jobs";
  }
  if (lower.includes("run")) {
    return "runs";
  }
  if (lower.includes("warning")) {
    return "quality";
  }
  if (lower.includes("queue") || lower.includes("backlog")) {
    return "capacity";
  }
  return "system";
}

function inferRuleSeverity(name: string): AlertSeverity {
  const lower = name.toLowerCase();
  if (lower.includes("timeout") || lower.includes("failure")) {
    return "critical";
  }
  if (lower.includes("residual") || lower.includes("rate")) {
    return "warning";
  }
  return "info";
}

function inferRuleChannel(name: string): RuleChannel {
  const lower = name.toLowerCase();
  if (lower.includes("timeout") || lower.includes("failure")) {
    return "logs";
  }
  if (lower.includes("residual") || lower.includes("warning")) {
    return "validation";
  }
  return "dashboard";
}

function deriveMockRules(): AlertRule[] {
  return gkpAlertRules.map((rule) => ({
    id: rule.id,
    name: rule.name,
    condition: rule.condition,
    severity: inferRuleSeverity(rule.name),
    channel: inferRuleChannel(rule.name),
    enabled: rule.enabled,
  }));
}

function cloneRules(source: AlertRule[]): AlertRule[] {
  return source.map((rule) => ({ ...rule }));
}

function timestampFromMockTriggered(triggered: string): number {
  const minutesAgoMatch = triggered.match(/(\d+)\s*min\s*ago/i);
  if (minutesAgoMatch) {
    return Date.now() - Number(minutesAgoMatch[1]) * 60_000;
  }
  const hmMatch = triggered.match(/(\d{2}):(\d{2})/);
  if (hmMatch) {
    const now = new Date();
    const ts = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      Number(hmMatch[1]),
      Number(hmMatch[2]),
      0,
      0,
    );
    return ts;
  }
  return Date.now();
}

function deriveMockAlerts(): AlertRecord[] {
  return gkpAlerts
    .map((alert) => ({
      id: `mock-${alert.id}`,
      title: alert.title,
      severity: alert.level,
      category: inferCategoryFromTitle(alert.title),
      summary: alert.message,
      impact: alert.meta,
      source: "mock/gkp-alert-feed",
      suggestedAction:
        alert.level === "critical"
          ? "Flag this signal before starting another related run."
          : "Review the signal and keep it visible until the run context is understood.",
      triggeredAtMs: timestampFromMockTriggered(alert.triggered),
    }))
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity) || b.triggeredAtMs - a.triggeredAtMs);
}

function deriveApiAlerts(providers: Provider[], jobs: Job[], runs: Run[]): AlertRecord[] {
  const alerts: AlertRecord[] = [];
  const hasRuntimeScope = providers.length > 0 || jobs.length > 0 || runs.length > 0;
  const failedJobs = jobs.filter((job) => job.status === "failed" || job.status === "cancelled");
  const failedRuns = runs.filter((run) => run.status === "failed" || run.status === "cancelled");
  const queuedJobs = jobs.filter((job) => job.status === "queued");
  const highWarningRuns = runs.filter((run) => {
    const warningRate = run.metrics?.warning_rate;
    return typeof warningRate === "number" && warningRate > 0.15;
  });

  if (!hasRuntimeScope) {
    return [];
  }

  if (providers.length > 0 && providers.length < 2) {
    alerts.push({
      id: "backend.limited_coverage",
      title: "Limited Simulator Coverage",
      severity: "warning",
      category: "backend",
      summary: "Only one simulator backend is registered for the current public scope.",
      impact: `Simulator backends: ${providers.length}`,
      source: "api/providers",
      suggestedAction: "Keep the backend boundary visible and avoid cross-simulator claims until another simulator is available.",
      triggeredAtMs: newestUpdatedAtMs(providers),
    });
  }

  if (failedJobs.length > 0) {
    alerts.push({
      id: "jobs.failures",
      title: "Job Failures Detected",
      severity: failedJobs.length > 2 ? "critical" : "warning",
      category: "jobs",
      summary: `${failedJobs.length} jobs are in failed/cancelled state and need review.`,
      impact: `Failed jobs: ${failedJobs.length}/${jobs.length || 1}`,
      source: "api/jobs",
      suggestedAction: "Open Logs for the affected job and replay only after the failure reason is visible.",
      triggeredAtMs: newestUpdatedAtMs(failedJobs),
    });
  }

  if (failedRuns.length > 0) {
    alerts.push({
      id: "runs.failures",
      title: "Run Execution Failures",
      severity: "critical",
      category: "runs",
      summary: `${failedRuns.length} runs failed to complete and may have partial artifacts.`,
      impact: `Failed runs: ${failedRuns.length}/${runs.length || 1}`,
      source: "api/runs",
      suggestedAction: "Open the run telemetry and logs before using this run in a public comparison.",
      triggeredAtMs: newestUpdatedAtMs(failedRuns),
    });
  }

  if (queuedJobs.length >= 3) {
    alerts.push({
      id: "capacity.queue_backlog",
      title: "Queue Backlog Rising",
      severity: "warning",
      category: "capacity",
      summary: `${queuedJobs.length} jobs remain queued in the current runtime scope.`,
      impact: `Queued jobs: ${queuedJobs.length}`,
      source: "api/jobs",
      suggestedAction: "Wait for queued jobs to finish or reduce the run scope before comparing decoder results.",
      triggeredAtMs: newestUpdatedAtMs(queuedJobs),
    });
  }

  if (highWarningRuns.length > 0) {
    alerts.push({
      id: "quality.warning_rate",
      title: "High Warning Rate",
      severity: "warning",
      category: "quality",
      summary: `${highWarningRuns.length} public runs exceed exact warning_rate threshold (0.15).`,
      impact: `Top warning_rate: ${Math.max(...highWarningRuns.map((run) => run.metrics?.warning_rate ?? 0)).toFixed(3)}`,
      source: "api/runs/quality",
      suggestedAction: "Open Validation for the affected run and compare decoder ranking against exact counters.",
      triggeredAtMs: newestUpdatedAtMs(highWarningRuns),
    });
  }

  return alerts
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity) || b.triggeredAtMs - a.triggeredAtMs)
    .slice(0, 24);
}

function statusText(status: AlertStatus): string {
  if (status === "acknowledged") {
    return "Reviewed";
  }
  if (status === "resolved") {
    return "Cleared";
  }
  if (status === "suppressed") {
    return "Hidden";
  }
  return "Open";
}

export function AlertsPage() {
  const [activeTab, setActiveTab] = useState<AlertsTab>("active");
  const [severityFilter, setSeverityFilter] = useState<"all" | AlertSeverity>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | AlertStatus>("open");
  const [categoryFilter, setCategoryFilter] = useState<"all" | AlertCategory>("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [rulesSearch, setRulesSearch] = useState("");
  const [rules, setRules] = useState<AlertRule[]>(() => cloneRules(deriveMockRules()));
  const [alertStatusById, setAlertStatusById] = useState<Record<string, AlertStatus>>({});
  const [alertOwnerById, setAlertOwnerById] = useState<Record<string, string>>({});
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);

  const { isApi, isMock, systemOff } = useDataMode();
  const apiEnabled = isApi && !systemOff;

  const providersQuery = useProviders({ enabled: apiEnabled });
  const jobsQuery = useJobs({ enabled: apiEnabled });
  const runsQuery = useRuns({ enabled: apiEnabled });

  const providers = systemOff ? [] : providersQuery.data ?? [];
  const jobs = systemOff ? [] : jobsQuery.data ?? [];
  const runs = systemOff ? [] : runsQuery.data ?? [];
  const hasApiWarning = apiEnabled && (providersQuery.isError || jobsQuery.isError || runsQuery.isError);
  const isApiLoading = apiEnabled && (providersQuery.isLoading || jobsQuery.isLoading || runsQuery.isLoading);
  const hasActiveApiRuntime = apiEnabled && (jobs.length > 0 || runs.length > 0);
  const latestRefreshMs = Math.max(
    newestUpdatedAtMs(providers),
    newestUpdatedAtMs(jobs),
    newestUpdatedAtMs(runs),
  );

  const alertFeed = systemOff ? [] : isMock ? deriveMockAlerts() : hasApiWarning ? [] : deriveApiAlerts(providers, jobs, runs);
  const alertFeedSignature = alertFeed.map((alert) => alert.id).join("|");

  useEffect(() => {
    setRules(cloneRules(isMock ? deriveMockRules() : API_RULES));
  }, [isMock]);

  useEffect(() => {
    setAlertStatusById((previous) => {
      const next: Record<string, AlertStatus> = {};
      for (const alert of alertFeed) {
        next[alert.id] = previous[alert.id] ?? "open";
      }
      return next;
    });
    setAlertOwnerById((previous) => {
      const next: Record<string, string> = {};
      for (const alert of alertFeed) {
        next[alert.id] = previous[alert.id] ?? "Unassigned";
      }
      return next;
    });
  }, [alertFeedSignature]);

  const alertQueue = alertFeed.map((alert) => ({
    ...alert,
    status: alertStatusById[alert.id] ?? "open",
    owner: alertOwnerById[alert.id] ?? "Unassigned",
  }));

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredAlerts = alertQueue
    .filter((alert) => (severityFilter === "all" ? true : alert.severity === severityFilter))
    .filter((alert) => (statusFilter === "all" ? true : alert.status === statusFilter))
    .filter((alert) => (categoryFilter === "all" ? true : alert.category === categoryFilter))
    .filter((alert) => (ownerFilter === "all" ? true : alert.owner === ownerFilter))
    .filter((alert) => {
      if (normalizedSearch.length === 0) {
        return true;
      }
      const haystack = `${alert.title} ${alert.summary} ${alert.impact} ${alert.source}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    })
    .sort(
      (a, b) =>
        severityRank(b.severity) - severityRank(a.severity) ||
        statusRank(b.status) - statusRank(a.status) ||
        b.triggeredAtMs - a.triggeredAtMs,
    );

  const criticalOpenCount = alertQueue.filter((alert) => alert.severity === "critical" && alert.status === "open").length;
  const warningOpenCount = alertQueue.filter((alert) => alert.severity === "warning" && alert.status === "open").length;
  const unresolvedCount = alertQueue.filter((alert) => alert.status === "open" || alert.status === "acknowledged").length;
  const resolvedCount = alertQueue.filter((alert) => alert.status === "resolved").length;
  const suppressedCount = alertQueue.filter((alert) => alert.status === "suppressed").length;
  const meanAgeMinutes =
    unresolvedCount === 0
      ? 0
      : Math.round(
          alertQueue
            .filter((alert) => alert.status === "open" || alert.status === "acknowledged")
            .reduce((sum, alert) => sum + Math.max(0, Date.now() - alert.triggeredAtMs), 0) /
            unresolvedCount /
            60_000,
        );

  const tabs: Array<{ id: AlertsTab; label: string }> = [
    { id: "active", label: `Signals (${filteredAlerts.length})` },
    { id: "history", label: `History (${timeline.length})` },
    { id: "rules", label: `Rules (${rules.length})` },
  ];

  const addTimelineEvent = (alertId: string, action: TimelineEvent["action"], note: string) => {
    const event: TimelineEvent = {
      id: `${alertId}-${action}-${Date.now()}`,
      alertId,
      action,
      atMs: Date.now(),
      note,
    };
    setTimeline((previous) => [event, ...previous].slice(0, 120));
  };

  const updateAlertStatus = (alertId: string, nextStatus: AlertStatus, action: TimelineEvent["action"], note: string) => {
    setAlertStatusById((previous) => ({ ...previous, [alertId]: nextStatus }));
    addTimelineEvent(alertId, action, note);
  };

  const applyBulkStatus = (nextStatus: AlertStatus, action: TimelineEvent["action"], note: string) => {
    const targetAlerts = filteredAlerts.filter((alert) =>
      nextStatus === "acknowledged"
        ? alert.status === "open"
        : alert.status === "open" || alert.status === "acknowledged",
    );
    if (targetAlerts.length === 0) {
      return;
    }
    setAlertStatusById((previous) => {
      const next = { ...previous };
      for (const alert of targetAlerts) {
        next[alert.id] = nextStatus;
      }
      return next;
    });
    for (const alert of targetAlerts) {
      addTimelineEvent(alert.id, action, `${note} (${targetAlerts.length} alerts in scope)`);
    }
  };

  const noRuntimeSignals =
    apiEnabled && !isApiLoading && !hasApiWarning && !hasActiveApiRuntime && alertQueue.length === 0;

  return (
    <>
      <div className="header">
        <h1>Observability</h1>
        <p>Public simulator signals, validation warnings, and backend health without private hardware controls.</p>
      </div>

      <div className="trust-strip">
        <div className="trust-item">
          <span>Data Source</span>
          <strong>{systemOff ? "Off" : isMock ? "GKP Mock" : "Live API"}</strong>
        </div>
        <div className="trust-item">
          <span>Simulator Backends</span>
          <strong>{providers.length}</strong>
        </div>
        <div className="trust-item">
          <span>Runs Observed</span>
          <strong>{runs.length}</strong>
        </div>
        <div className="trust-item">
          <span>Active Signals</span>
          <strong>{alertQueue.filter((alert) => alert.status === "open").length}</strong>
        </div>
        <div className="trust-item">
          <span>Last Refresh</span>
          <strong>{formatRelativeAge(latestRefreshMs)}</strong>
        </div>
        <div className="trust-item">
          <span>Public Boundary</span>
          <strong>Simulator only</strong>
        </div>
      </div>

      <div className="alerts-kpi-grid">
        <article className="alerts-kpi-card">
          <span>Critical Open</span>
          <strong>{criticalOpenCount}</strong>
          <p>highest priority signals</p>
        </article>
        <article className="alerts-kpi-card">
          <span>Warning Open</span>
          <strong>{warningOpenCount}</strong>
          <p>degradation indicators</p>
        </article>
        <article className="alerts-kpi-card">
          <span>Unresolved</span>
          <strong>{unresolvedCount}</strong>
          <p>open + reviewed</p>
        </article>
        <article className="alerts-kpi-card">
          <span>Cleared</span>
          <strong>{resolvedCount}</strong>
          <p>reviewed signals</p>
        </article>
        <article className="alerts-kpi-card">
          <span>Hidden</span>
          <strong>{suppressedCount}</strong>
          <p>low-value signals</p>
        </article>
        <article className="alerts-kpi-card">
          <span>Mean Signal Age</span>
          <strong>{meanAgeMinutes}m</strong>
          <p>open signal age</p>
        </article>
      </div>

      <div className="alerts-controls">
        <div className="alerts-filter-grid">
          <input
            type="text"
            className="search-box alerts-search-box"
            placeholder="Search signals (backend, run, warning_rate...)"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <select
            className="alerts-select"
            value={severityFilter}
            onChange={(event) => setSeverityFilter(event.target.value as "all" | AlertSeverity)}
          >
            <option value="all">All severities</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
          <select
            className="alerts-select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "all" | AlertStatus)}
          >
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="acknowledged">Reviewed</option>
            <option value="resolved">Cleared</option>
            <option value="suppressed">Hidden</option>
          </select>
          <select
            className="alerts-select"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value as "all" | AlertCategory)}
          >
            <option value="all">All categories</option>
            <option value="backend">Backend</option>
            <option value="jobs">Jobs</option>
            <option value="runs">Runs</option>
            <option value="quality">Quality</option>
            <option value="capacity">Capacity</option>
            <option value="system">System</option>
          </select>
          <select
            className="alerts-select"
            value={ownerFilter}
            onChange={(event) => setOwnerFilter(event.target.value)}
          >
            <option value="all">All owners</option>
            {OWNERS.map((owner) => (
              <option key={owner} value={owner}>
                {owner}
              </option>
            ))}
          </select>
        </div>
        <div className="alerts-action-row">
          <button className="btn btn-secondary" onClick={() => applyBulkStatus("acknowledged", "acknowledged", "Bulk review")}>
            Mark Visible Reviewed
          </button>
          <button className="btn btn-secondary" onClick={() => applyBulkStatus("resolved", "resolved", "Bulk clear")}>
            Clear Visible
          </button>
          <button className="btn btn-primary" onClick={() => setActiveTab("rules")}>
            View Rules
          </button>
        </div>
      </div>

      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "active" ? (
        <>
          {filteredAlerts.map((alert) => (
            <div key={alert.id} className={`alert-item ${alert.severity} alerts-status-${alert.status}`}>
              <div className="alert-header">
                <div>
                  <div className="alert-title">{alert.title}</div>
                  <div className="alerts-inline-meta">
                    <span className={`alert-badge ${alert.severity}`}>{alert.severity}</span>
                    <span className="alerts-status-pill">{statusText(alert.status)}</span>
                    <span className="alerts-category-pill">{alert.category}</span>
                  </div>
                </div>
                <div className="alerts-inline-right">
                  <span className="alerts-age">{formatRelativeAge(alert.triggeredAtMs)}</span>
                  <span className="alerts-source">{alert.source}</span>
                </div>
              </div>
              <div className="alert-body">{alert.summary}</div>
              <div className="alert-meta">
                <span>{alert.impact}</span>
                <span>{formatUtcDateTime(alert.triggeredAtMs)}</span>
              </div>
              <div className="alerts-recommendation">{alert.suggestedAction}</div>
              <div className="alert-actions">
                <button
                  className="btn-small"
                  onClick={() => updateAlertStatus(alert.id, "acknowledged", "acknowledged", "Signal reviewed")}
                  disabled={alert.status !== "open"}
                >
                  Review
                </button>
                <button
                  className="btn-small"
                  onClick={() => updateAlertStatus(alert.id, "resolved", "resolved", "Signal cleared")}
                  disabled={alert.status === "resolved"}
                >
                  Clear
                </button>
                <button
                  className="btn-small"
                  onClick={() => updateAlertStatus(alert.id, "suppressed", "suppressed", "Signal hidden")}
                  disabled={alert.status === "suppressed"}
                >
                  Hide
                </button>
                <button
                  className="btn-small"
                  onClick={() => addTimelineEvent(alert.id, "escalated", "Flagged for review")}
                >
                  Flag
                </button>
                <button
                  className="btn-small"
                  onClick={() => updateAlertStatus(alert.id, "open", "reopened", "Alert reopened")}
                  disabled={alert.status === "open"}
                >
                  Reopen
                </button>
                <select
                  className="alerts-owner-select"
                  value={alert.owner}
                  onChange={(event) => {
                    const nextOwner = event.target.value;
                    setAlertOwnerById((previous) => ({ ...previous, [alert.id]: nextOwner }));
                    addTimelineEvent(alert.id, "acknowledged", `Tagged for ${nextOwner}`);
                  }}
                >
                  {OWNERS.map((owner) => (
                    <option key={owner} value={owner}>
                      Track: {owner}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          {hasApiWarning ? (
            <div className="empty-card section-offset">
              <strong>API Warning</strong>
              <p>One or more API resources failed to load. Alert status may be incomplete.</p>
            </div>
          ) : null}

          {!hasApiWarning && filteredAlerts.length === 0 ? (
            <div className="empty-card section-offset">
              <strong>
                {isApiLoading
                  ? "Loading Signal Feed"
                  : noRuntimeSignals
                    ? "No Runtime Signals Yet"
                    : "No Signals for Current Filters"}
              </strong>
              <p>
                {isApiLoading
                  ? "Collecting simulator backend, job, and run signals from the API."
                  : noRuntimeSignals
                    ? "Start a circuit session or replay a run before alert signals are evaluated."
                    : "Try broadening severity/status filters or clear search terms."}
              </p>
            </div>
          ) : null}
        </>
      ) : null}

      {activeTab === "history" ? (
        <>
          <div className="alerts-history-summary">
            <span>Events recorded: {timeline.length}</span>
            <span>Cleared signals: {resolvedCount}</span>
            <span>Hidden signals: {suppressedCount}</span>
          </div>
          <div className="alerts-timeline">
            {timeline.map((event) => (
              <div key={event.id} className="alerts-timeline-item">
                <div className="alerts-timeline-time">{formatUtcDateTime(event.atMs)}</div>
                <div className="alerts-timeline-body">
                  <strong>{event.action}</strong>
                  <p>
                    Alert: {event.alertId} · {event.note}
                  </p>
                </div>
              </div>
            ))}
            {timeline.length === 0 ? (
              <div className="empty-card">
                <strong>No Timeline Events Yet</strong>
                <p>Signal review actions will appear here once signals are reviewed or cleared.</p>
              </div>
            ) : null}
          </div>
        </>
      ) : null}

      {activeTab === "rules" ? (
        <>
          <div className="alerts-rules-toolbar">
            <input
              type="text"
              className="search-box alerts-search-box"
              placeholder="Search rules by name or condition..."
              value={rulesSearch}
              onChange={(event) => setRulesSearch(event.target.value)}
            />
            <span>{rules.filter((rule) => rule.enabled).length} enabled</span>
          </div>
          {rules
            .filter((rule) => {
              const token = rulesSearch.trim().toLowerCase();
              if (token.length === 0) {
                return true;
              }
              return `${rule.name} ${rule.condition}`.toLowerCase().includes(token);
            })
            .map((rule) => (
              <div key={rule.id} className="rule-item">
                <div className="rule-info">
                  <div className="rule-name">{rule.name}</div>
                  <div className="rule-condition">{rule.condition}</div>
                  <div className="alerts-inline-meta">
                    <span className={`alert-badge ${rule.severity}`}>{rule.severity}</span>
                    <span className="alerts-category-pill">surface: {rule.channel}</span>
                  </div>
                </div>
                <div className="rule-actions-row">
                  <button
                    className="btn-small"
                    onClick={() => addTimelineEvent(`rule-${rule.id}`, "rule_updated", `Simulated rule ${rule.id}`)}
                  >
                    Simulate
                  </button>
                  <button
                    className={`toggle ${rule.enabled ? "active" : ""}`}
                    aria-label={`toggle ${rule.name}`}
                    onClick={() => {
                      setRules((existing) =>
                        existing.map((existingRule) =>
                          existingRule.id === rule.id
                            ? { ...existingRule, enabled: !existingRule.enabled }
                            : existingRule,
                        ),
                      );
                      addTimelineEvent(
                        `rule-${rule.id}`,
                        "rule_updated",
                        `${rule.name} ${rule.enabled ? "disabled" : "enabled"}`,
                      );
                    }}
                  >
                    <span />
                  </button>
                </div>
              </div>
            ))}
        </>
      ) : null}
    </>
  );
}
