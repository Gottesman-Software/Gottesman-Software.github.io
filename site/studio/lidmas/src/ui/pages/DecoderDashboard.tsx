import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, ChevronDown, ChevronUp, Power, ShieldCheck } from "lucide-react";
import { createPortal } from "react-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ApiError } from "../../api/client";
import {
  useCreateIntegrationSession,
  useCreateRun,
  useHealth,
  useIntegrationSessionLogs,
  useIntegrationSessions,
  useJobs,
  useProviders,
  useRunTelemetry,
  useRuns,
  useStopIntegrationSession,
} from "../../api/hooks";
import type {
  GkpOscillatorStateSample,
  IntegrationAdapterId,
  IntegrationSession,
  IntegrationSessionConfig,
  IntegrationSessionStatus,
  Provider,
  Run,
  RunTelemetry,
  SyndromeSample,
} from "../../api/types";
import { useDataMode } from "../../data/dataMode";
import { useSessionControl, type SessionLaunchMode } from "../../data/sessionControl";
import {
  DECODER_PROFILES,
  PUBLIC_DECODERS,
  PUBLIC_DECODER_KEYS,
  decoderMatchesKey,
  decoderLabel,
  parseDecoderKey,
} from "../../data/decoders";
import type { DecoderKey } from "../../data/decoders";
import { gkpHealth, gkpJobs, gkpProviders, gkpRunTelemetry, gkpRuns } from "../../data/gkpFixtures";
import {
  SCIENTIFIC_CARD_CONTRACTS,
  SCIENTIFIC_FIELD_LABELS,
  SCIENTIFIC_PRIMARY_CARD_ORDER,
  SCIENTIFIC_SECONDARY_CARD_ORDER,
  type ScientificCardKey,
  type ScientificField,
} from "../scientific/contracts";
import { ScientificMetricCard } from "../scientific/ScientificMetricCard";
import { SessionLauncherButton } from "../scientific/SessionLauncherButton";
import { StartBenchmarkSessionDialog } from "../scientific/StartBenchmarkSessionDialog";
import {
  StartCircuitDesignDialog,
  type CircuitDesignDraft,
  type CircuitProviderFamily,
} from "../scientific/StartCircuitDesignDialog";
import { StartReplaySessionDialog } from "../scientific/StartReplaySessionDialog";
import {
  decoderRowMatchesActive,
  resolveScientificState,
  scientificStateLabel,
} from "../scientific/stateMachine";

type DashboardChart = "noise" | "success" | "error" | "latency";
type TimeRangeFilter = "1h" | "6h" | "24h" | "7d";
type EncodingMapMode = "surface" | "gkp";
type DashboardCircuitQecCode = "surface" | "gkp" | "repetition" | "css_ldpc";
type OuterCodeDistance = 3 | 5 | 7;

interface MonitoringPoint {
  slot: string;
  noise: number;
  success: number;
  error: number;
  latency: number;
}

interface MonitoringPointWithCompare extends MonitoringPoint {
  compareNoise?: number | null;
  compareSuccess?: number | null;
  compareError?: number | null;
  compareLatency?: number | null;
}

interface MonitoringSeriesResult {
  series: MonitoringPoint[];
  hasDecoderSignal: boolean;
}

interface DecoderStreamRow {
  key: string;
  decoderKey: DecoderKey;
  decoderName: string;
  round: number;
  roundLabel: string;
  flips: number;
  residualWeight: number;
  residualRatePct: number | null;
  residualFormula: string;
}

interface DecoderStreamPoint {
  round: number;
  roundLabel: string;
  [key: string]: number | string;
}

interface PhysicalNoisePoint {
  round: number;
  physicalErrorPct: number;
  photonLossPct: number;
  displacementSigma: number;
}

interface DrilldownState {
  source: "physical" | "realtime";
  title: string;
  summary: string;
  keyValues: Array<{ label: string; value: string }>;
  timeline: string[];
}

interface ChartEventPayload<T> {
  activePayload?: Array<{ payload?: T }>;
}

interface PhysicalLegendSignal {
  id: string;
  label: string;
  color?: string;
  format: (point: PhysicalNoisePoint | null) => string;
}

interface QecLatticeNode {
  key: string;
  label: string;
  x: number;
  y: number;
  triggered: boolean;
  value: number;
}

interface QecLatticeEdge {
  key: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface QecLatticeModel {
  nodes: QecLatticeNode[];
  edges: QecLatticeEdge[];
  columns: number;
  rows: number;
}

interface GkpOscillatorMapPoint {
  key: string;
  mode: string;
  round: number;
  q: number;
  p: number;
  variance: number;
  energy: number;
  flagged: boolean;
  x: number;
  y: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function numericValue(value: unknown): number {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (Array.isArray(value) && value.length > 0) {
    return numericValue(value[0]);
  }
  return 0;
}

function chartLabel(chart: DashboardChart): string {
  if (chart === "noise") {
    return "Noise Level";
  }
  if (chart === "success") {
    return "Success Rate";
  }
  if (chart === "error") {
    return "Error Rate";
  }
  return "Latency Trend";
}

const PHYSICAL_LEGEND_SIGNALS: PhysicalLegendSignal[] = [
  {
    id: "sigma",
    label: "Displacement Sigma",
    color: "#3f89ea",
    format: (point) => (point ? point.displacementSigma.toFixed(4) : "N/A"),
  },
  {
    id: "photon-loss",
    label: "Photon Loss Rate",
    color: "#f0982f",
    format: (point) => (point ? `${point.photonLossPct.toFixed(3)}%` : "N/A"),
  },
  {
    id: "physical-error",
    label: "Physical Error Rate",
    color: "#e25564",
    format: (point) => (point ? `${point.physicalErrorPct.toFixed(3)}%` : "N/A"),
  },
];

const DECODER_STREAM_COLORS: Record<DecoderKey, string> = {
  mwpm: "#3f89ea",
  bp: "#26b36b",
  neural_mwpm: "#9f7aea",
  uf: "#f0982f",
};

const PUBLIC_RUN_LIMITS = {
  shots: 1024,
  qubits: 12,
  gates: 96,
  distance: 5,
  rounds: 4,
  timeoutSeconds: 1200,
  activeSessions: 1,
};

function providerKindLabel(kind: string): string {
  if (kind === "superconducting") {
    return "Superconducting Qubits";
  }
  if (kind === "photonic") {
    return "Photonic";
  }
  if (kind === "trapped_ion") {
    return "Trapped Ion";
  }
  if (kind === "simulated") {
    return "Simulated";
  }
  return "Other";
}

interface QuickLaunchPlan {
  adapterId: IntegrationAdapterId;
  config: IntegrationSessionConfig;
}

interface LaunchSessionInput {
  mode: SessionLaunchMode;
  provider: Provider;
  decoders: DecoderKey[];
  datasetHint: string;
  circuitDesign?: CircuitDesignDraft;
  runSource?: Run | null;
}

interface ReplaySourceOption {
  runId: string;
  datasetLabel: string;
  providerName: string;
  updatedAtLabel: string;
}

type ProviderFamily = "pennylane" | "qiskit" | "cirq" | "schrosim" | "unknown";

function sessionModeFromAdapter(_adapterId: IntegrationAdapterId): SessionLaunchMode {
  return "replay";
}

function resolveProviderFamily(provider: Provider): ProviderFamily {
  const identitySignal = [provider.name, provider.contact_email ?? ""]
    .join(" ")
    .trim()
    .toLowerCase();
  // Resolve software stacks from provider identity only; shared notes may mention multiple stacks.
  if (identitySignal.includes("qiskit")) {
    return "qiskit";
  }
  if (identitySignal.includes("cirq")) {
    return "cirq";
  }
  if (identitySignal.includes("schrosim")) {
    return "schrosim";
  }
  if (identitySignal.includes("pennylane")) {
    return "pennylane";
  }

  const metadataSignal = [provider.readiness_note ?? "", provider.notes ?? ""]
    .join(" ")
    .trim()
    .toLowerCase();
  if (metadataSignal.includes("schrosim")) {
    return "schrosim";
  }
  return "unknown";
}

function workflowForProviderFamily(family: ProviderFamily): string | undefined {
  if (family === "pennylane" || family === "qiskit" || family === "cirq" || family === "schrosim") {
    return "scientific_circuit";
  }
  return undefined;
}

function supportsSoftwareCircuitDesign(provider: Provider): boolean {
  const family = resolveProviderFamily(provider);
  return family === "pennylane" || family === "qiskit" || family === "cirq" || family === "schrosim";
}

function providerReady(provider: Provider | null): boolean {
  return provider != null && provider.status !== "offline";
}

function scientificTransport(provider: Provider): "live" | "replay" | null {
  if (!provider.supports_scientific) {
    return null;
  }
  if (provider.supports_replay) {
    return "replay";
  }
  return null;
}

function buildQuickLaunchPlan(
  provider: Provider,
  mode: SessionLaunchMode,
): QuickLaunchPlan | null {
  const family = resolveProviderFamily(provider);
  const scientificMode = scientificTransport(provider);
  if (mode === "replay" && !provider.supports_replay) {
    return null;
  }
  if ((mode === "scientific" || mode === "benchmark") && scientificMode == null) {
    return null;
  }

  if (family === "pennylane" || family === "qiskit" || family === "cirq" || family === "schrosim") {
    if (mode !== "scientific" && mode !== "benchmark" && !provider.supports_replay) {
      return null;
    }
    if ((mode === "scientific" || mode === "benchmark") && scientificMode !== "replay") {
      return null;
    }
    const adapterId: IntegrationAdapterId =
      family === "pennylane"
        ? "pennylane_surface_replay"
        : family === "qiskit"
          ? "qiskit_surface_replay"
          : family === "cirq"
            ? "cirq_surface_replay"
            : "schrosim_photonic_replay";
    return {
      adapterId,
      config: {
        simulator_code_family: "surface",
        simulator_shots: 240,
        simulator_distance: 5,
        simulator_rounds: 4,
        simulator_error_rate: 0.08,
        simulator_sigma: 0.18,
      },
    };
  }

  return null;
}

function parseTimeRange(value: string | null): TimeRangeFilter {
  if (value === "6h" || value === "24h" || value === "7d") {
    return value;
  }
  return "1h";
}

function parseOuterCodeDistance(value: string | null): OuterCodeDistance {
  if (value === "5") {
    return 5;
  }
  if (value === "7") {
    return 7;
  }
  return 3;
}

function parseBooleanFlag(value: string | null): boolean {
  return value === "1" || value === "true" || value === "yes";
}

function percentDelta(current: number, previous: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) {
    return 0;
  }
  const baseline = Math.max(1e-9, Math.abs(previous));
  return ((current - previous) / baseline) * 100;
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatTrend(deltaPct: number): string {
  const absValue = Math.abs(deltaPct);
  const direction = deltaPct >= 0 ? "▲" : "▼";
  return `${direction} ${absValue.toFixed(1)}%`;
}

function asCount(value: number | null | undefined): number | null {
  if (value == null || !Number.isFinite(value) || value < 0) {
    return null;
  }
  return Math.trunc(value);
}

function formatCount(value: number | null | undefined): string {
  const count = asCount(value);
  return count == null ? "—" : count.toLocaleString();
}

function formatCompactCount(value: number | null | undefined): string {
  const count = asCount(value);
  if (count == null) {
    return "—";
  }
  const units: Array<{ threshold: number; suffix: string }> = [
    { threshold: 1_000_000_000_000, suffix: "T" },
    { threshold: 1_000_000_000, suffix: "B" },
    { threshold: 1_000_000, suffix: "M" },
    { threshold: 1_000, suffix: "K" },
  ];
  for (const unit of units) {
    if (count >= unit.threshold) {
      const scaled = count / unit.threshold;
      const digits = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2;
      return `${scaled.toFixed(digits)}${unit.suffix}`;
    }
  }
  return count.toLocaleString();
}

function formatPercentWithCounts(
  numerator: number | null | undefined,
  denominator: number | null | undefined,
  digits = 2,
): string {
  const n = asCount(numerator);
  const d = asCount(denominator);
  if (n == null || d == null || d <= 0 || n > d) {
    return "—";
  }
  const pct = (n / d) * 100;
  return `${n.toLocaleString()} / ${d.toLocaleString()} = ${pct.toFixed(digits)}%`;
}

function formatPercentOnly(
  numerator: number | null | undefined,
  denominator: number | null | undefined,
  digits = 2,
): string {
  const n = asCount(numerator);
  const d = asCount(denominator);
  if (n == null || d == null || d <= 0 || n > d) {
    return "—";
  }
  return `${((n / d) * 100).toFixed(digits)}%`;
}

function formatPercentFormulaTooltip(
  numeratorLabel: string,
  denominatorLabel: string,
  numerator: number | null | undefined,
  denominator: number | null | undefined,
  digits = 2,
): string {
  const n = asCount(numerator);
  const d = asCount(denominator);
  if (n == null || d == null || d <= 0 || n > d) {
    return `Exact formula: ${numeratorLabel} / ${denominatorLabel}. Awaiting a valid numerator and denominator.`;
  }
  return `Exact formula: ${numeratorLabel} / ${denominatorLabel} = ${n.toLocaleString()} / ${d.toLocaleString()} = ${((n / d) * 100).toFixed(digits)}%`;
}

function formatOverheadMapping(
  rounds: number | null | undefined,
  stabilizerCount: number | null | undefined,
  providerKind: Provider["kind"] | null | undefined,
): string {
  const normalizedRounds = asCount(rounds);
  const normalizedStabilizerCount = asCount(stabilizerCount);
  if (
    normalizedRounds == null ||
    normalizedStabilizerCount == null ||
    normalizedRounds <= 0 ||
    normalizedStabilizerCount <= 0
  ) {
    return "—";
  }
  const mappedOverhead = Math.round(
    normalizedStabilizerCount * normalizedRounds * (providerKind === "photonic" ? 1.4 : 2.1),
  );
  if (providerKind === "photonic") {
    return `${mappedOverhead.toLocaleString()} CV states / logical mode`;
  }
  return `${mappedOverhead.toLocaleString()} physical qubits / logical qubit`;
}

function optionalNumber(value: number | null | undefined): number | null {
  return value == null || !Number.isFinite(value) ? null : value;
}

function percentFromCounts(
  numerator: number | null | undefined,
  denominator: number | null | undefined,
): number | null {
  const n = asCount(numerator);
  const d = asCount(denominator);
  if (n == null || d == null || d <= 0 || n > d) {
    return null;
  }
  return (n / d) * 100;
}

function formatFigurePercent(value: number | null | undefined, digits = 3): string {
  if (value == null || !Number.isFinite(value)) {
    return "Awaiting run";
  }
  return `${value.toFixed(digits)}%`;
}

function formatBudgetValue(value: number | null | undefined, suffix = ""): string {
  if (value == null || !Number.isFinite(value)) {
    return "Pending";
  }
  return `${Math.trunc(value).toLocaleString()}${suffix}`;
}

function budgetFillPercent(value: number | null | undefined, limit: number): number {
  if (value == null || !Number.isFinite(value) || limit <= 0) {
    return 0;
  }
  return clamp((value / limit) * 100, 0, 100);
}

function qecFamilyLabel(value: string | null | undefined): string {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "gkp" || normalized === "digitized_gkp") {
    return "Digitized GKP";
  }
  if (normalized === "css_ldpc" || normalized === "qldpc") {
    return "CSS-LDPC / qLDPC";
  }
  if (normalized === "repetition") {
    return "Repetition";
  }
  if (normalized === "surface") {
    return "Surface";
  }
  return "Selected code";
}

function normalizeCircuitQecCode(value: string | null | undefined): DashboardCircuitQecCode | null {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "gkp" || normalized === "digitized_gkp") {
    return "gkp";
  }
  if (normalized === "surface" || normalized === "surface_gkp") {
    return "surface";
  }
  if (normalized === "repetition") {
    return "repetition";
  }
  if (normalized === "css_ldpc" || normalized === "qldpc") {
    return "css_ldpc";
  }
  return null;
}

function encodingMapModeForQecCode(code: DashboardCircuitQecCode | null): EncodingMapMode {
  return code === "gkp" ? "gkp" : "surface";
}

function circuitArchitectureLabel(value: string | null | undefined): string {
  if (value === "photonic") {
    return "Photonic";
  }
  if (value === "trapped_ion") {
    return "Trapped ion";
  }
  if (value === "superconducting") {
    return "Superconducting";
  }
  return "Architecture pending";
}

function formatAgo(isoText: string | null | undefined): string {
  if (!isoText) {
    return "unknown";
  }
  const parsed = new Date(isoText).getTime();
  if (!Number.isFinite(parsed)) {
    return "unknown";
  }
  const deltaMs = Date.now() - parsed;
  const deltaMins = Math.max(0, Math.floor(deltaMs / 60_000));
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

function formatClock(isoText: string | null | undefined): string {
  if (!isoText) {
    return "--:--:--";
  }
  const date = new Date(isoText);
  if (!Number.isFinite(date.getTime())) {
    return "--:--:--";
  }
  return date.toLocaleTimeString([], { hour12: false });
}

function sessionStatusLabel(status: IntegrationSessionStatus): string {
  if (status === "starting") {
    return "Starting";
  }
  if (status === "running") {
    return "Running";
  }
  if (status === "finished") {
    return "Finished";
  }
  if (status === "cancelled") {
    return "Cancelled";
  }
  return "Failed";
}

function sessionStatusLevel(status: IntegrationSessionStatus): "info" | "warn" | "critical" | "ok" {
  if (status === "finished") {
    return "ok";
  }
  if (status === "failed") {
    return "critical";
  }
  if (status === "cancelled") {
    return "warn";
  }
  return "info";
}

function inferLogLevel(stream: "stdout" | "stderr" | "system", line: string): "info" | "warn" | "critical" | "ok" {
  const normalized = line.trim().toLowerCase();
  if (
    stream === "stderr" ||
    normalized.includes("error") ||
    normalized.includes("failed") ||
    normalized.includes("exception") ||
    normalized.includes("traceback") ||
    normalized.includes("timed out") ||
    normalized.includes("timeout")
  ) {
    return "critical";
  }
  if (normalized.includes("warn")) {
    return "warn";
  }
  if (
    normalized.includes("started") ||
    normalized.includes("running") ||
    normalized.includes("completed") ||
    normalized.includes("finished") ||
    normalized.includes("success")
  ) {
    return "ok";
  }
  return stream === "system" ? "info" : "ok";
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }
  if (bytes < 1024) {
    return `${Math.round(bytes)} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function stabilizerSortKey(label: string): number {
  const match = label.match(/\d+/);
  if (!match) {
    return Number.MAX_SAFE_INTEGER;
  }
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
}

function stabilizerLabel(index: number): string {
  return `S${(index + 1).toString().padStart(2, "0")}`;
}

function timeRangeConfig(range: TimeRangeFilter): { points: number; stepMinutes: number } {
  if (range === "6h") {
    return { points: 72, stepMinutes: 5 };
  }
  if (range === "24h") {
    return { points: 288, stepMinutes: 5 };
  }
  if (range === "7d") {
    return { points: 336, stepMinutes: 30 };
  }
  return { points: 12, stepMinutes: 5 };
}

function formatTimeSlot(totalPoints: number, index: number, stepMinutes: number): string {
  const minutesBack = (totalPoints - index - 1) * stepMinutes;
  if (minutesBack >= 1_440) {
    const days = Math.round((minutesBack / 1_440) * 10) / 10;
    return `T-${days}d`;
  }
  if (minutesBack >= 60) {
    const hours = Math.round((minutesBack / 60) * 10) / 10;
    return `T-${hours}h`;
  }
  return `T-${minutesBack}m`;
}

function downsampleSeries<T>(series: T[], maxPoints: number): T[] {
  if (series.length <= maxPoints) {
    return series;
  }
  const stride = Math.ceil(series.length / maxPoints);
  return series.filter((_, index) => index % stride === 0 || index === series.length - 1);
}

function extractChartPayload<T>(event: unknown): T | null {
  if (!event || typeof event !== "object") {
    return null;
  }
  const payloadContainer = event as ChartEventPayload<T>;
  const firstPayload = payloadContainer.activePayload?.[0];
  if (!firstPayload || !firstPayload.payload) {
    return null;
  }
  return firstPayload.payload;
}

function metricValue(point: MonitoringPointWithCompare, chart: DashboardChart, compare: boolean): number {
  if (chart === "noise") {
    return compare ? point.compareNoise ?? 0 : point.noise;
  }
  if (chart === "success") {
    return compare ? point.compareSuccess ?? 0 : point.success;
  }
  if (chart === "error") {
    return compare ? point.compareError ?? 0 : point.error;
  }
  return compare ? point.compareLatency ?? 0 : point.latency;
}

function buildMonitoringSeries(
  decoder: DecoderKey,
  points: number,
  stepMinutes: number,
  isMock: boolean,
  jobsCount: number,
  runsCount: number,
  providerCount: number,
): MonitoringPoint[] {
  const noiseBase = isMock ? 0.017 : 0.013;
  const successBase = isMock ? 97.8 : 96.6;
  const latencyBase = isMock ? 46 : 41;
  const decoderProfile = DECODER_PROFILES[decoder];
  const providerFactor = clamp(providerCount / 12, 0.1, 1.25);

  return Array.from({ length: points }, (_, index) => {
    const wave = Math.sin(index * 0.66) * decoderProfile.waveScale;
    const pulse = Math.cos(index * 0.37) * decoderProfile.waveScale;
    const loadFactor = jobsCount * 0.06 + runsCount * 0.1;
    const success = clamp(
      successBase + decoderProfile.successBias + pulse * 1.1 - loadFactor * 0.08 + providerFactor * 0.7,
      87,
      99.8,
    );
    const error = clamp(100 - success, 0.2, 12);
    const latency = clamp(
      latencyBase + decoderProfile.latencyBias + wave * 5.5 + loadFactor * 0.95 + providerFactor * 2.1,
      18,
      180,
    );
    const noise = clamp(
      noiseBase + decoderProfile.noiseBias + wave * 0.0019 + jobsCount * 0.00025 + providerFactor * 0.00035,
      0.004,
      0.04,
    );

    return {
      slot: formatTimeSlot(points, index, stepMinutes),
      noise: Number(noise.toFixed(4)),
      success: Number(success.toFixed(2)),
      error: Number(error.toFixed(2)),
      latency: Number(latency.toFixed(1)),
    };
  });
}

function buildMonitoringSeriesFromTelemetry(
  decoder: DecoderKey,
  telemetry: RunTelemetry | null | undefined,
  points: number,
  stepMinutes: number,
): MonitoringSeriesResult {
  const emptySeries = Array.from({ length: points }, (_, index) => ({
    slot: formatTimeSlot(points, index, stepMinutes),
    noise: 0,
    success: 0,
    error: 0,
    latency: 0,
  }));
  if (!telemetry) {
    return { series: emptySeries, hasDecoderSignal: false };
  }

  const inferredRounds = Math.max(
    telemetry.rounds ?? 0,
    telemetry.syndrome_samples.reduce((maxRound, sample) => Math.max(maxRound, sample.round + 1), 0),
    telemetry.decoder_interventions.reduce((maxRound, row) => Math.max(maxRound, row.round + 1), 0),
  );
  const rounds = Math.max(1, inferredRounds);

  const syndromeByRound = new Map<number, { triggered: number; total: number }>();
  telemetry.syndrome_samples.forEach((sample) => {
    const current = syndromeByRound.get(sample.round) ?? { triggered: 0, total: 0 };
    current.total += 1;
    if (sample.is_triggered) {
      current.triggered += 1;
    }
    syndromeByRound.set(sample.round, current);
  });

  const decoderRows = telemetry.decoder_interventions.filter((row) =>
    decoderMatchesKey(row.decoder, decoder),
  );
  const hasDecoderSignal = decoderRows.length > 0;
  const interventionsByRound = new Map<number, { flips: number; residual: number }>();
  decoderRows.forEach((row) => {
    const current = interventionsByRound.get(row.round) ?? { flips: 0, residual: 0 };
    current.flips += row.flips;
    current.residual += row.residual_weight;
    interventionsByRound.set(row.round, current);
  });

  const sortedNoise = [...telemetry.noise_samples].sort((left, right) => left.index - right.index);
  const noiseForRound = (round: number) => {
    if (sortedNoise.length === 0) {
      return telemetry.warning_rate ?? 0.012;
    }
    const safeIndex = Math.min(sortedNoise.length - 1, Math.max(0, round));
    return sortedNoise[safeIndex]?.physical_error_rate ?? telemetry.warning_rate ?? 0.012;
  };

  const series = Array.from({ length: points }, (_, index) => {
    const startRound = Math.floor((index * rounds) / points);
    const endRound = Math.max(startRound + 1, Math.floor(((index + 1) * rounds) / points));
    const boundedEnd = Math.min(rounds, endRound);

    let bucketRounds = 0;
    let totalTriggered = 0;
    let totalChecks = 0;
    let flips = 0;
    let residual = 0;
    let noiseAccum = 0;

    for (let round = startRound; round < boundedEnd; round += 1) {
      bucketRounds += 1;
      const syndromeStats = syndromeByRound.get(round);
      if (syndromeStats) {
        totalTriggered += syndromeStats.triggered;
        totalChecks += syndromeStats.total;
      }
      const intervention = interventionsByRound.get(round);
      if (intervention) {
        flips += intervention.flips;
        residual += intervention.residual;
      }
      noiseAccum += noiseForRound(round);
    }

    const roundsInBucket = Math.max(1, bucketRounds);
    const triggerRatio = totalChecks > 0 ? totalTriggered / totalChecks : 0;
    const flipsMean = flips / roundsInBucket;
    const residualMean = residual / roundsInBucket;
    const noiseBase = noiseAccum / roundsInBucket;
    const noise = clamp(noiseBase + triggerRatio * 0.01, 0.001, 0.08);

    const success = hasDecoderSignal
      ? clamp(99.4 - flipsMean * 2.6 - residualMean * 3.4 - triggerRatio * 19 - noise * 330, 82, 99.9)
      : clamp(88.0 - triggerRatio * 18 - noise * 240, 70, 95);
    const error = clamp(100 - success, 0.05, 30);
    const latency = hasDecoderSignal
      ? clamp(18 + flipsMean * 4.8 + residualMean * 6.4 + triggerRatio * 20 + noise * 620, 8, 320)
      : clamp(9 + triggerRatio * 11 + noise * 380, 4, 180);

    return {
      slot: formatTimeSlot(points, index, stepMinutes),
      noise: Number(noise.toFixed(4)),
      success: Number(success.toFixed(2)),
      error: Number(error.toFixed(2)),
      latency: Number(latency.toFixed(1)),
    };
  });

  return { series, hasDecoderSignal };
}

export function DecoderDashboard() {
  const navigate = useNavigate();
  const [activeChart, setActiveChart] = useState<DashboardChart>("noise");
  const [encodingMapMode, setEncodingMapMode] = useState<EncodingMapMode>("surface");
  const [isPhysicalPanelCollapsed, setPhysicalPanelCollapsed] = useState(false);
  const [drilldown, setDrilldown] = useState<DrilldownState | null>(null);
  const [showLiveConsole, setShowLiveConsole] = useState(true);
  const [opsLogCursor, setOpsLogCursor] = useState(0);
  const [quickLaunchMessage, setQuickLaunchMessage] = useState<string | null>(null);
  const [quickLaunchTone, setQuickLaunchTone] = useState<"info" | "success" | "error">("info");
  const [circuitDesignDialogOpen, setCircuitDesignDialogOpen] = useState(false);
  const [pendingCircuitLaunch, setPendingCircuitLaunch] = useState<LaunchSessionInput | null>(null);
  const [benchmarkDialogOpen, setBenchmarkDialogOpen] = useState(false);
  const [replayDialogOpen, setReplayDialogOpen] = useState(false);
  const [benchmarkDecoders, setBenchmarkDecoders] = useState<DecoderKey[]>(() => [...PUBLIC_DECODER_KEYS]);
  const [replaySourceRunId, setReplaySourceRunId] = useState<string>("");
  const [activeHomeSessionSnapshot, setActiveHomeSessionSnapshot] = useState<IntegrationSession | null>(null);
  const [healthProbeLatencyMs, setHealthProbeLatencyMs] = useState<number | null>(null);
  const healthProbeStartRef = useRef<number | null>(null);
  const homeSessionStatusRef = useRef<IntegrationSessionStatus | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    state: sessionControlState,
    beginLaunch,
    markRunning,
    markStopping,
    markStopped,
    markFailed,
    setActiveContext,
    clearError,
  } = useSessionControl();
  const sessionControlStatusRef = useRef(sessionControlState.status);
  const {
    mode,
    isApi,
    isMock,
    systemOff,
    setSystemOff,
    systemArmed,
    armSystem,
    activeDecoder,
    setActiveDecoder,
  } = useDataMode();
  const apiConnected = isApi && !systemOff;
  const apiEnabled = apiConnected && systemArmed;
  const activeHomeRunId = sessionControlState.activeRunId;
  const activeHomeSessionId = sessionControlState.activeSessionId;

  const timeRangeFilter = parseTimeRange(searchParams.get("range"));
  const providerFilter = searchParams.get("provider") ?? "all";
  const compareMode = parseBooleanFlag(searchParams.get("compare"));
  const outerCodeDistance = parseOuterCodeDistance(searchParams.get("outerDistance"));
  const compareDecoderParam = parseDecoderKey(searchParams.get("compareDecoder"));
  const fallbackCompareDecoder =
    PUBLIC_DECODERS.find((decoder) => decoder.key !== activeDecoder)?.key ?? "mwpm";
  const compareDecoder =
    compareDecoderParam && compareDecoderParam !== activeDecoder && PUBLIC_DECODER_KEYS.includes(compareDecoderParam)
      ? compareDecoderParam
      : fallbackCompareDecoder;
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

  const healthQuery = useHealth({ enabled: apiEnabled });
  const providersQuery = useProviders({ enabled: apiConnected, refetchInterval: 15_000 });
  const jobsQuery = useJobs({ enabled: apiEnabled, refetchInterval: 2_500 });
  const runsQuery = useRuns({ enabled: apiEnabled, refetchInterval: 2_500 });
  const sessionsQuery = useIntegrationSessions({ enabled: apiEnabled, refetchInterval: 2_000 });
  const createRunMutation = useCreateRun();
  const createSessionMutation = useCreateIntegrationSession();
  const stopSessionMutation = useStopIntegrationSession();

  useEffect(() => {
    if (!PUBLIC_DECODER_KEYS.includes(activeDecoder)) {
      setActiveDecoder("mwpm");
    }
  }, [activeDecoder, setActiveDecoder]);

  const healthDataRaw = isMock ? gkpHealth : healthQuery.data;
  const healthData = systemOff ? null : healthDataRaw;
  const providerCatalogData = isMock ? gkpProviders : providersQuery.data ?? [];
  const simulatorCatalogData = useMemo(() => {
    return providerCatalogData.filter((provider) => supportsSoftwareCircuitDesign(provider));
  }, [providerCatalogData]);
  const providersData = systemArmed ? simulatorCatalogData : [];
  const jobsData = systemArmed ? (isMock ? gkpJobs : jobsQuery.data ?? []) : [];
  const runsData = systemArmed ? (isMock ? gkpRuns : runsQuery.data ?? []) : [];
  const integrationSessions = systemArmed ? (isMock ? [] : sessionsQuery.data ?? []) : [];
  const sortedIntegrationSessions = useMemo(() => {
    return [...integrationSessions].sort(
      (left, right) => new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime(),
    );
  }, [integrationSessions]);

  const selectableProviders = useMemo(() => {
    return simulatorCatalogData.filter((provider) => {
      if (providerFilter !== "all" && provider.id !== providerFilter) {
        return false;
      }
      return true;
    });
  }, [providerFilter, simulatorCatalogData]);

  const filteredProviders = useMemo(
    () => (systemArmed ? selectableProviders : []),
    [selectableProviders, systemArmed],
  );

  const scopedProviders = useMemo(() => (systemOff ? [] : filteredProviders), [filteredProviders, systemOff]);

  const launchProvider = useMemo(() => {
    if (providerFilter !== "all") {
      return selectableProviders[0] ?? null;
    }
    return null;
  }, [providerFilter, selectableProviders]);

  const scopedProviderIds = useMemo(
    () => new Set(scopedProviders.map((provider) => provider.id)),
    [scopedProviders],
  );

  const scopedJobs = useMemo(() => {
    return jobsData.filter((job) => scopedProviderIds.has(job.provider_id));
  }, [jobsData, scopedProviderIds]);

  const scopedRuns = useMemo(() => {
    const filtered = runsData.filter((run) => {
      if (!scopedProviderIds.has(run.provider_id)) {
        return false;
      }
      return true;
    });
    return [...filtered].sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime());
  }, [runsData, scopedProviderIds]);

  const providerById = useMemo(
    () => new Map(providerCatalogData.map((provider) => [provider.id, provider])),
    [providerCatalogData],
  );

  const runById = useMemo(() => new Map(runsData.map((run) => [run.id, run])), [runsData]);
  const scopedIntegrationSessions = useMemo(() => {
    return sortedIntegrationSessions.filter((session) => {
      const run = runById.get(session.run_id);
      if (!run) {
        return providerFilter === "all";
      }
      return scopedProviderIds.has(run.provider_id);
    });
  }, [providerFilter, runById, scopedProviderIds, sortedIntegrationSessions]);
  const activeIntegrationSession = useMemo(() => {
    if (!isApi) {
      return null;
    }
    if (activeHomeSessionId) {
      const exactSession =
        scopedIntegrationSessions.find((session) => session.id === activeHomeSessionId) ??
        sortedIntegrationSessions.find((session) => session.id === activeHomeSessionId);
      if (exactSession) {
        return exactSession;
      }
      if (activeHomeSessionSnapshot?.id === activeHomeSessionId) {
        return activeHomeSessionSnapshot;
      }
    }
    if (activeHomeRunId) {
      const byRun =
        scopedIntegrationSessions.find((session) => session.run_id === activeHomeRunId) ??
        sortedIntegrationSessions.find((session) => session.run_id === activeHomeRunId);
      if (byRun) {
        return byRun;
      }
    }
    return null;
  }, [
    activeHomeRunId,
    activeHomeSessionId,
    activeHomeSessionSnapshot,
    isApi,
    scopedIntegrationSessions,
    sortedIntegrationSessions,
  ]);
  const activeSessionStreaming =
    activeIntegrationSession?.status === "running" || activeIntegrationSession?.status === "starting";

  useEffect(() => {
    if (!activeHomeSessionId) {
      homeSessionStatusRef.current = null;
      return;
    }
    const homeSession =
      sortedIntegrationSessions.find((session) => session.id === activeHomeSessionId) ??
      (activeHomeSessionSnapshot?.id === activeHomeSessionId ? activeHomeSessionSnapshot : null);
    if (!homeSession) {
      return;
    }
    if (homeSessionStatusRef.current === homeSession.status) {
      return;
    }
    homeSessionStatusRef.current = homeSession.status;

    const shortId = homeSession.id.slice(0, 8).toUpperCase();
    if (homeSession.status === "finished") {
      markStopped({ preserveRun: true });
      setQuickLaunchTone("success");
      setQuickLaunchMessage(`Session #${shortId} finished.`);
      void runsQuery.refetch();
      void sessionsQuery.refetch();
    } else if (homeSession.status === "failed") {
      markFailed(homeSession.last_error ?? `Session #${shortId} failed.`);
      setQuickLaunchTone("error");
      setQuickLaunchMessage(
        homeSession.last_error
          ? `Session #${shortId} failed: ${homeSession.last_error}`
          : `Session #${shortId} failed.`,
      );
      void runsQuery.refetch();
      void sessionsQuery.refetch();
    } else if (homeSession.status === "cancelled") {
      markStopped({ preserveRun: true });
      setQuickLaunchTone("info");
      setQuickLaunchMessage(`Session #${shortId} cancelled.`);
      void runsQuery.refetch();
      void sessionsQuery.refetch();
    }
  }, [
    activeHomeSessionId,
    activeHomeSessionSnapshot,
    markFailed,
    markStopped,
    runsQuery,
    sessionsQuery,
    sortedIntegrationSessions,
  ]);

  useEffect(() => {
    if (!activeIntegrationSession) {
      return;
    }
    if (activeIntegrationSession.status !== "running" && activeIntegrationSession.status !== "starting") {
      return;
    }
    const resolvedMode = sessionControlState.mode ?? sessionModeFromAdapter(activeIntegrationSession.adapter_id);
    if (
      sessionControlState.activeSessionId === activeIntegrationSession.id &&
      sessionControlState.activeRunId === activeIntegrationSession.run_id &&
      sessionControlState.status === "running"
    ) {
      return;
    }
    setActiveContext({
      runId: activeIntegrationSession.run_id,
      sessionId: activeIntegrationSession.id,
      mode: resolvedMode,
    });
  }, [
    activeIntegrationSession,
    sessionControlState.activeRunId,
    sessionControlState.activeSessionId,
    sessionControlState.mode,
    sessionControlState.status,
    setActiveContext,
  ]);

  const activeRunId = activeHomeRunId ?? activeIntegrationSession?.run_id ?? null;
  const activeRun = activeRunId ? runById.get(activeRunId) ?? null : null;
  const hasActiveScientificContext = Boolean(activeRunId);
  const activeRunStreaming = activeRun?.status === "running" || activeRun?.status === "created";
  const streamWarmupActive = activeSessionStreaming || activeRunStreaming;
  const runTelemetryScientificQuery = useRunTelemetry(activeRunId, {
    enabled: apiEnabled && Boolean(activeRunId),
    scientificMode: true,
    refetchInterval: streamWarmupActive ? 1_000 : 3_000,
  });
  const runTelemetryWarmupQuery = useRunTelemetry(activeRunId, {
    enabled: apiEnabled && Boolean(activeRunId) && streamWarmupActive,
    refetchInterval: streamWarmupActive ? 1_000 : 3_000,
  });
  const sessionLogsQuery = useIntegrationSessionLogs(activeIntegrationSession?.id ?? null, 220, {
    enabled: apiEnabled && Boolean(activeIntegrationSession?.id),
    refetchInterval: activeSessionStreaming ? 1_000 : 4_000,
  });
  const runTelemetryScientific =
    isMock && activeRunId === gkpRunTelemetry.run_id
      ? gkpRunTelemetry
      : isMock || systemOff
        ? null
        : runTelemetryScientificQuery.data ?? null;
  const runTelemetryWarmup = isMock || systemOff ? null : runTelemetryWarmupQuery.data ?? null;
  const usingWarmupTelemetry =
    !isMock && streamWarmupActive && runTelemetryScientific == null && runTelemetryWarmup != null;
  const runTelemetry =
    isMock && activeRunId === gkpRunTelemetry.run_id
      ? gkpRunTelemetry
      : isMock || systemOff
        ? null
        : runTelemetryScientific ?? (usingWarmupTelemetry ? runTelemetryWarmup : null);
  const runTelemetryNotFound =
    !isMock &&
    runTelemetryScientificQuery.error instanceof ApiError &&
    runTelemetryScientificQuery.error.status === 404 &&
    !usingWarmupTelemetry;
  const runTelemetryHardError =
    !systemOff &&
    isApi &&
    Boolean(activeRunId) &&
    (runTelemetryScientificQuery.isError &&
      !(runTelemetryScientificQuery.error instanceof ApiError && runTelemetryScientificQuery.error.status === 404));
  const telemetryInitializing =
    !systemOff && isApi && Boolean(activeRunId) && streamWarmupActive && !runTelemetry && !runTelemetryHardError;
  const telemetryUnavailableForRun =
    !systemOff &&
    isApi &&
    Boolean(activeRunId) &&
    runTelemetryNotFound &&
    !telemetryInitializing;
  const syndromeSamples = runTelemetry?.syndrome_samples ?? [];

  useEffect(() => {
    const previous = sessionControlStatusRef.current;
    const current = sessionControlState.status;
    if (
      isApi &&
      activeRunId &&
      (previous === "running" || previous === "stopping") &&
      current === "idle"
    ) {
      void runsQuery.refetch();
      void sessionsQuery.refetch();
      void runTelemetryScientificQuery.refetch();
      if (streamWarmupActive) {
        void runTelemetryWarmupQuery.refetch();
      }
    }
    sessionControlStatusRef.current = current;
  }, [
    activeRunId,
    isApi,
    runTelemetryScientificQuery,
    runTelemetryWarmupQuery,
    runsQuery,
    sessionControlState.status,
    sessionsQuery,
    streamWarmupActive,
  ]);

  const healthy = healthData?.status.toLowerCase() === "ok";
  const providerCount = hasActiveScientificContext ? scopedProviders.length : 0;
  const jobsCount = hasActiveScientificContext ? scopedJobs.length : 0;
  const runsCount = hasActiveScientificContext ? scopedRuns.length : 0;
  const workspaceProviderRatio = hasActiveScientificContext ? `${providerCount} / 12` : "0 / 0";
  const baseProviderCount = providersData.length;
  const baseJobsCount = jobsData.length;
  const baseRunsCount = runsData.length;
  const uptimeSeconds = healthData ? Math.max(0, Math.floor(healthData.uptime_seconds)) : 0;

  const anyApiLoading =
    !systemOff &&
    isApi &&
    (healthQuery.isLoading ||
      providersQuery.isLoading ||
      jobsQuery.isLoading ||
      runsQuery.isLoading ||
      sessionsQuery.isLoading);
  const anyApiError =
    !systemOff &&
    isApi &&
    (healthQuery.isError ||
      providersQuery.isError ||
      jobsQuery.isError ||
      runsQuery.isError ||
      sessionsQuery.isError);
  const noApiEntities =
    isApi &&
    !anyApiLoading &&
    !anyApiError &&
    baseProviderCount === 0 &&
    baseJobsCount === 0 &&
    baseRunsCount === 0;

  useEffect(() => {
    if (!isApi) {
      healthProbeStartRef.current = null;
      setHealthProbeLatencyMs(45);
      return;
    }

    if (healthQuery.fetchStatus === "fetching") {
      if (healthProbeStartRef.current === null) {
        healthProbeStartRef.current =
          typeof performance !== "undefined" && typeof performance.now === "function"
            ? performance.now()
            : Date.now();
      }
      return;
    }

    if (healthProbeStartRef.current !== null) {
      const now =
        typeof performance !== "undefined" && typeof performance.now === "function"
          ? performance.now()
          : Date.now();
      const elapsed = now - healthProbeStartRef.current;
      healthProbeStartRef.current = null;
      if (Number.isFinite(elapsed) && elapsed >= 0) {
        setHealthProbeLatencyMs(Math.round(elapsed));
      }
    }
  }, [healthQuery.fetchStatus, isApi]);

  const activeRunsCount = useMemo(
    () =>
      hasActiveScientificContext
        ? scopedRuns.filter((run) => run.status === "created" || run.status === "running").length
        : 0,
    [hasActiveScientificContext, scopedRuns],
  );
  const queuedJobsCount = useMemo(
    () => (hasActiveScientificContext ? scopedJobs.filter((job) => job.status === "queued").length : 0),
    [hasActiveScientificContext, scopedJobs],
  );
  const latestProviderUpdate = useMemo(() => {
    if (!hasActiveScientificContext) {
      return null;
    }
    if (scopedProviders.length === 0) {
      return null;
    }
    return scopedProviders
      .map((provider) => provider.updated_at)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
  }, [hasActiveScientificContext, scopedProviders]);
  const latestJobUpdate = useMemo(() => {
    if (!hasActiveScientificContext) {
      return null;
    }
    if (scopedJobs.length === 0) {
      return null;
    }
    return scopedJobs
      .map((job) => job.updated_at)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
  }, [hasActiveScientificContext, scopedJobs]);
  const scopePayloadBytes = useMemo(() => {
    if (!hasActiveScientificContext) {
      return 0;
    }
    const snapshot = {
      providers: scopedProviders,
      jobs: scopedJobs,
      runs: scopedRuns,
      telemetry: runTelemetry,
    };
    const serialized = JSON.stringify(snapshot);
    if (typeof Blob !== "undefined") {
      return new Blob([serialized]).size;
    }
    return serialized.length;
  }, [hasActiveScientificContext, runTelemetry, scopedJobs, scopedProviders, scopedRuns]);

  const hardwareMix = useMemo(() => {
    if (!hasActiveScientificContext) {
      return [];
    }
    const mix = scopedProviders.reduce(
      (acc, provider) => {
        const label = providerKindLabel(provider.kind);
        acc[label] = (acc[label] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    return Object.entries(mix)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }, [hasActiveScientificContext, scopedProviders]);

  const physicalNoiseData = useMemo<PhysicalNoisePoint[]>(() => {
    if (!runTelemetry || !runTelemetry.noise_samples || runTelemetry.noise_samples.length === 0) {
      return [];
    }
    return runTelemetry.noise_samples.map((sample) => ({
      round: sample.index + 1,
      physicalErrorPct: Number((sample.physical_error_rate * 100).toFixed(3)),
      photonLossPct: Number((sample.photon_loss_rate * 100).toFixed(3)),
      displacementSigma: Number(sample.displacement_sigma.toFixed(4)),
    }));
  }, [runTelemetry]);
  const telemetryQueryLoading =
    !isMock &&
    (runTelemetryScientificQuery.isLoading ||
      (streamWarmupActive && runTelemetryWarmupQuery.isLoading));
  const physicalNoiseLoading =
    !systemOff && systemArmed && isApi && Boolean(activeRunId) && telemetryQueryLoading && !runTelemetry;
  const physicalNoiseError = runTelemetryHardError;

  const healthBadgeLabel = systemOff
    ? "Off"
    : !systemArmed
      ? "Standby"
    : isApi
      ? healthQuery.isError
        ? "API Error"
        : healthQuery.isLoading
          ? "Checking"
          : healthy
            ? "Ready"
            : "Degraded"
      : healthy
        ? "Ready"
        : "Checking";

  const healthBadgeClass = systemOff
    ? "badge badge-warning"
    : !systemArmed
      ? "badge"
    : isApi && healthQuery.isError
      ? "badge badge-warning"
      : `badge ${healthy ? "" : "badge-warning"}`;

  const { points: timelinePoints, stepMinutes } = timeRangeConfig(timeRangeFilter);
  const monitorTelemetrySourceAvailable = Boolean(
    runTelemetry &&
      (runTelemetry.noise_samples.length > 0 ||
        runTelemetry.syndrome_samples.length > 0 ||
        runTelemetry.decoder_interventions.length > 0),
  );
  const monitoringSynthetic = useMemo(
    () =>
      buildMonitoringSeries(
        activeDecoder,
        timelinePoints,
        stepMinutes,
        isMock,
        jobsCount,
        runsCount,
        providerCount,
      ),
    [activeDecoder, isMock, jobsCount, providerCount, runsCount, stepMinutes, timelinePoints],
  );

  const comparisonSynthetic = useMemo(
    () =>
      buildMonitoringSeries(
        compareDecoder,
        timelinePoints,
        stepMinutes,
        isMock,
        jobsCount,
        runsCount,
        providerCount,
      ),
    [compareDecoder, isMock, jobsCount, providerCount, runsCount, stepMinutes, timelinePoints],
  );

  const monitoringTelemetry = useMemo(
    () => buildMonitoringSeriesFromTelemetry(activeDecoder, runTelemetry, timelinePoints, stepMinutes),
    [activeDecoder, runTelemetry, stepMinutes, timelinePoints],
  );
  const comparisonTelemetry = useMemo(
    () => buildMonitoringSeriesFromTelemetry(compareDecoder, runTelemetry, timelinePoints, stepMinutes),
    [compareDecoder, runTelemetry, stepMinutes, timelinePoints],
  );

  const monitoringRaw = systemOff
    ? []
    : monitorTelemetrySourceAvailable
      ? monitoringTelemetry.series
      : isApi
        ? []
        : monitoringSynthetic;
  const comparisonRaw = systemOff
    ? []
    : monitorTelemetrySourceAvailable
      ? comparisonTelemetry.series
      : isApi
        ? []
        : comparisonSynthetic;
  const activeDecoderMissingTelemetry = monitorTelemetrySourceAvailable && !monitoringTelemetry.hasDecoderSignal;
  const compareDecoderMissingTelemetry =
    monitorTelemetrySourceAvailable && compareMode && !comparisonTelemetry.hasDecoderSignal;

  const monitoringPrimary = useMemo(() => downsampleSeries(monitoringRaw, 120), [monitoringRaw]);
  const monitoringCompare = useMemo(() => downsampleSeries(comparisonRaw, 120), [comparisonRaw]);
  const monitoringData = useMemo<MonitoringPointWithCompare[]>(() => {
    return monitoringPrimary.map((point, index) => ({
      ...point,
      compareNoise: monitoringCompare[index]?.noise ?? null,
      compareSuccess: monitoringCompare[index]?.success ?? null,
      compareError: monitoringCompare[index]?.error ?? null,
      compareLatency: monitoringCompare[index]?.latency ?? null,
    }));
  }, [monitoringCompare, monitoringPrimary]);
  const monitoringHasRows = monitoringData.length > 0;

  const activityFeed = useMemo(() => {
    const items: Array<{ tone: "green" | "red" | "blue"; text: string; time: string }> = [];

    if (isApi && anyApiError) {
      items.push({ tone: "red", text: "Backend API reported connectivity failures", time: "now" });
    } else if (!hasActiveScientificContext) {
      items.push({ tone: "blue", text: "No circuit session started", time: "standby" });
      return items;
    } else {
      items.push({
        tone: "green",
        text: `${runsCount} runs tracked in current scope`,
        time: activeRun?.updated_at ? formatAgo(activeRun.updated_at) : "live",
      });
    }

    items.push({
      tone: providerCount > 0 ? "blue" : "red",
      text: `${providerCount} simulators active in current session`,
      time: formatAgo(latestProviderUpdate),
    });
    items.push({
      tone: queuedJobsCount > 0 ? "green" : "blue",
      text: `${queuedJobsCount} queued jobs in current scope`,
      time: formatAgo(latestJobUpdate),
    });

    return items;
  }, [
    anyApiError,
    hasActiveScientificContext,
    isApi,
    latestJobUpdate,
    latestProviderUpdate,
    activeRun?.updated_at,
    providerCount,
    queuedJobsCount,
    runsCount,
  ]);

  const perValue = useMemo(() => {
    if (physicalNoiseData.length === 0) {
      return null;
    }
    const avg =
      physicalNoiseData.reduce((sum, point) => sum + point.physicalErrorPct, 0) / physicalNoiseData.length;
    return Number(avg.toFixed(4));
  }, [physicalNoiseData]);

  const latestRunMetrics = activeRun?.metrics ?? null;
  const dataUpdatedAt = hasActiveScientificContext
    ? runTelemetry?.updated_at ?? activeRun?.updated_at ?? healthData?.started_at ?? null
    : null;
  const activeCircuitHardwareTarget = activeIntegrationSession?.config.circuit_hardware_target ?? null;
  const activeCircuitQecCode = hasActiveScientificContext
    ? normalizeCircuitQecCode(
        activeIntegrationSession?.config.circuit_qec_code ?? latestRunMetrics?.best_encoder_state,
      )
    : null;
  const activeEncodingMapMode = hasActiveScientificContext
    ? encodingMapModeForQecCode(activeCircuitQecCode)
    : null;
  const activeEncodingContextLabel = hasActiveScientificContext
    ? `${circuitArchitectureLabel(activeCircuitHardwareTarget)} architecture · ${qecFamilyLabel(activeCircuitQecCode)} encoding`
    : "No architecture or QEC encoding selected yet";

  useEffect(() => {
    if (!activeEncodingMapMode || encodingMapMode === activeEncodingMapMode) {
      return;
    }
    setEncodingMapMode(activeEncodingMapMode);
  }, [activeEncodingMapMode, encodingMapMode]);

  const scientificState = useMemo(
    () =>
      resolveScientificState({
        run: activeRun,
        telemetry: runTelemetryScientific,
        activeDecoder,
        validationPassed: Boolean(activeRun?.metrics?.scientific_validation_ready),
      }),
    [activeDecoder, activeRun, runTelemetryScientific],
  );
  const scientificExactnessLabel = scientificStateLabel(scientificState.state);
  const scientificOverheadProviderKind = activeRun
    ? providerById.get(activeRun.provider_id)?.kind ?? null
    : null;
  const scientificZeroBaseline = scientificState.state === "IDLE";
  const scientificCardValues = useMemo<Record<ScientificCardKey, string>>(() => {
    if (scientificZeroBaseline) {
      return {
        ler: "0.0000%",
        per: "0.0000%",
        rounds: "0",
        stabilizer_count: "0",
        syndrome_opportunities: "0",
        post_correction_overhead:
          scientificOverheadProviderKind === "photonic"
            ? "0 CV states / logical mode"
            : "0 physical qubits / logical qubit",
        residual_syndrome_rate: "0 / 0 = 0.0000%",
        request_line_count: "0",
        response_line_count: "0",
        expanded_shot_count: "0",
      };
    }
    return {
      ler: formatPercentOnly(
        scientificState.signals.logical_failures,
        scientificState.signals.logical_trials,
        4,
      ),
      per: formatPercentOnly(
        scientificState.signals.physical_error_events,
        scientificState.signals.physical_error_opportunities,
        4,
      ),
      rounds: formatCount(scientificState.signals.rounds),
      stabilizer_count: formatCount(scientificState.signals.stabilizer_count),
      syndrome_opportunities: formatCount(scientificState.signals.syndrome_opportunities),
      post_correction_overhead: formatOverheadMapping(
        scientificState.signals.rounds,
        scientificState.signals.stabilizer_count,
        scientificOverheadProviderKind,
      ),
      residual_syndrome_rate: formatPercentWithCounts(
        scientificState.signals.residual_syndrome_events,
        scientificState.signals.syndrome_opportunities,
        4,
      ),
      request_line_count: formatCount(scientificState.signals.request_line_count),
      response_line_count: formatCount(scientificState.signals.response_line_count),
      expanded_shot_count: formatCompactCount(scientificState.signals.expanded_shot_count),
    };
  }, [scientificOverheadProviderKind, scientificState.signals, scientificZeroBaseline]);
  const scientificCardTooltips = useMemo<Partial<Record<ScientificCardKey, string>>>(
    () => ({
      ler: formatPercentFormulaTooltip(
        "logical_failures",
        "logical_trials",
        scientificState.signals.logical_failures,
        scientificState.signals.logical_trials,
        4,
      ),
      per: formatPercentFormulaTooltip(
        "physical_error_events",
        "physical_error_opportunities",
        scientificState.signals.physical_error_events,
        scientificState.signals.physical_error_opportunities,
        4,
      ),
    }),
    [scientificState.signals],
  );
  const scientificPrimaryCards = useMemo(
    () =>
      SCIENTIFIC_PRIMARY_CARD_ORDER.map((key) => ({
        key,
        contract: SCIENTIFIC_CARD_CONTRACTS[key],
        availability: scientificState.metricAvailability[key],
      })),
    [scientificState.metricAvailability],
  );
  const scientificSecondaryCards = useMemo(
    () =>
      SCIENTIFIC_SECONDARY_CARD_ORDER.map((key) => ({
        key,
        contract: SCIENTIFIC_CARD_CONTRACTS[key],
        availability: scientificState.metricAvailability[key],
      })),
    [scientificState.metricAvailability],
  );
  const scientificMissingPrimaryReasons = useMemo(
    () =>
      scientificPrimaryCards
        .filter((entry) => !entry.availability.available)
        .map(
          (entry) =>
            `${entry.contract.label} unavailable — ${entry.availability.availabilityReason}`,
        ),
    [scientificPrimaryCards],
  );
  const scientificMissingSignalsLabel = useMemo(() => {
    if (scientificState.state === "IDLE") {
      return "No active scientific context";
    }
    if (scientificState.completeness.missingSignals.length === 0) {
      return "No missing scientific signals";
    }
    return "Exact Calculation...";
  }, [scientificState.completeness.missingSignals.length, scientificState.state]);
  const scientificExactSourceRows =
    runTelemetryScientific?.decoder_exact_metrics ?? activeRun?.metrics?.decoder_exact_metrics ?? [];
  const scientificActiveDecoderRow = useMemo(
    () =>
      scientificExactSourceRows.find(
        (entry) => decoderRowMatchesActive(entry.decoder, activeDecoder) && entry.trials > 0,
      ) ?? null,
    [activeDecoder, scientificExactSourceRows],
  );
  const decoderRecommendationRows = (latestRunMetrics?.decoder_rankings ?? []).filter((row) => {
    const decoderKey = parseDecoderKey(row.decoder);
    return decoderKey != null && PUBLIC_DECODER_KEYS.includes(decoderKey);
  });
  const topDecoderRecommendation = decoderRecommendationRows[0] ?? null;
  const backendRecommendedDecoderKey = parseDecoderKey(latestRunMetrics?.best_decoder ?? runTelemetry?.decoder_name);
  const topDecoderRecommendationKey = parseDecoderKey(topDecoderRecommendation?.decoder);
  const recommendedDecoderKey =
    backendRecommendedDecoderKey && PUBLIC_DECODER_KEYS.includes(backendRecommendedDecoderKey)
      ? backendRecommendedDecoderKey
      : topDecoderRecommendationKey && PUBLIC_DECODER_KEYS.includes(topDecoderRecommendationKey)
        ? topDecoderRecommendationKey
        : null;
  const recommendedDecoderLabel =
    recommendedDecoderKey != null
      ? decoderLabel(recommendedDecoderKey)
      : topDecoderRecommendation?.decoder ?? "Awaiting run";

  useEffect(() => {
    if (!recommendedDecoderKey || recommendedDecoderKey === activeDecoder || !PUBLIC_DECODER_KEYS.includes(recommendedDecoderKey)) {
      return;
    }
    setActiveDecoder(recommendedDecoderKey);
  }, [activeDecoder, recommendedDecoderKey, setActiveDecoder]);

  useEffect(() => {
    if (!import.meta.env.DEV) {
      return;
    }
    const availableSignals = (Object.keys(SCIENTIFIC_FIELD_LABELS) as ScientificField[]).filter(
      (field) => scientificState.signals[field] != null,
    );
    console.debug("[scientific-summary]", {
      selectedRunId: activeRunId,
      activeDecoder,
      activeDecoderExactRow: scientificActiveDecoderRow
        ? {
            decoder: scientificActiveDecoderRow.decoder,
            trials: scientificActiveDecoderRow.trials,
            logical_failures: scientificActiveDecoderRow.logical_failures,
          }
        : null,
      exactRowsInScope: scientificExactSourceRows.length,
      availableSignals,
      scientificState: scientificState.state,
      completenessPct: scientificState.completeness.percentage,
    });
  }, [
    activeDecoder,
    activeRunId,
    scientificActiveDecoderRow,
    scientificExactSourceRows.length,
    scientificState.completeness.percentage,
    scientificState.signals,
    scientificState.state,
  ]);

  const anomalyThresholds = {
    noiseWarn: 0.022,
    noiseCritical: 0.03,
    successWarn: 95,
    errorWarn: 5,
    latencyWarn: 70,
    perWarn: 1.2,
  };

  const noiseAnomalies = monitoringData.filter((point) => point.noise >= anomalyThresholds.noiseWarn);
  const successAnomalies = monitoringData.filter((point) => point.success <= anomalyThresholds.successWarn);
  const errorAnomalies = monitoringData.filter((point) => point.error >= anomalyThresholds.errorWarn);
  const latencyAnomalies = monitoringData.filter((point) => point.latency >= anomalyThresholds.latencyWarn);
  const physicalAnomalies = physicalNoiseData.filter(
    (point) => point.physicalErrorPct >= anomalyThresholds.perWarn,
  );
  const latestPhysicalPoint =
    physicalNoiseData.length > 0 ? physicalNoiseData[physicalNoiseData.length - 1] : null;
  const physicalPctCeiling = Number(
    Math.max(
      1.4,
      Math.ceil(
        (Math.max(
          anomalyThresholds.perWarn,
          ...physicalNoiseData.map((point) => Math.max(point.physicalErrorPct, point.photonLossPct)),
        ) +
          0.1) *
          10,
      ) / 10,
    ).toFixed(1),
  );
  const physicalSigmaCeiling = Number(
    Math.max(
      0.18,
      Math.ceil((Math.max(0.01, ...physicalNoiseData.map((point) => point.displacementSigma)) + 0.01) * 20) / 20,
    ).toFixed(2),
  );
  const rawGkpOscillatorStates = runTelemetry?.gkp_oscillator_states ?? [];
  const latestSyndromeRound = useMemo(() => {
    if (syndromeSamples.length === 0) {
      return null;
    }
    return syndromeSamples.reduce((roundMax, sample) => Math.max(roundMax, sample.round), 0);
  }, [syndromeSamples]);
  const latestRoundSyndromes = useMemo<SyndromeSample[]>(() => {
    if (latestSyndromeRound === null) {
      return [];
    }
    return syndromeSamples.filter((sample) => sample.round === latestSyndromeRound);
  }, [latestSyndromeRound, syndromeSamples]);
  const syndromeExtractionActive = !systemOff && (activeSessionStreaming || activeRunStreaming);
  const streamingStatusClass = systemOff
    ? "status-failed"
    : syndromeExtractionActive
      ? "status-running"
      : "status-warning";
  const streamingStatusLabel = systemOff
    ? "Off"
    : syndromeExtractionActive
      ? activeIntegrationSession
        ? sessionStatusLabel(activeIntegrationSession.status)
        : "Streaming"
      : "Standby";
  const extractionStatusLabel = systemOff
    ? "Syndrome extraction off"
    : !hasActiveScientificContext
      ? "Syndrome extraction standby"
    : syndromeExtractionActive
      ? activeIntegrationSession
        ? `Syndrome extraction ${sessionStatusLabel(activeIntegrationSession.status).toLowerCase()}`
        : "Syndrome extraction live"
      : "Syndrome extraction ended";

  const qecLattice = useMemo<QecLatticeModel>(() => {
    const stabilizerCount = Math.min(64, outerCodeDistance * outerCodeDistance);
    const labelsFromSamples = Array.from(
      new Set(latestRoundSyndromes.map((sample) => sample.stabilizer)),
    ).sort((left, right) => {
      const rankDelta = stabilizerSortKey(left) - stabilizerSortKey(right);
      return rankDelta !== 0 ? rankDelta : left.localeCompare(right);
    });
    const labels = labelsFromSamples.length > 0 ? [...labelsFromSamples] : [];
    while (labels.length < stabilizerCount) {
      labels.push(stabilizerLabel(labels.length));
    }

    const columns = outerCodeDistance;
    const rows = outerCodeDistance;
    const width = 620;
    const height = 340;
    const padX = 56;
    const padY = 52;
    const stepX = columns > 1 ? (width - padX * 2) / (columns - 1) : 0;
    const stepY = rows > 1 ? (height - padY * 2) / (rows - 1) : 0;
    const sampleByLabel = new Map(
      latestRoundSyndromes.map((sample) => [sample.stabilizer, sample]),
    );

    const nodes: QecLatticeNode[] = labels.slice(0, stabilizerCount).map((label, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;
      const sample = sampleByLabel.get(label);
      return {
        key: label,
        label,
        x: Number((padX + col * stepX).toFixed(2)),
        y: Number((padY + row * stepY).toFixed(2)),
        triggered: sample?.is_triggered ?? false,
        value: sample?.value ?? 0,
      };
    });

    const edges: QecLatticeEdge[] = [];
    nodes.forEach((node, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;
      const rightIndex = index + 1;
      if (col < columns - 1 && rightIndex < nodes.length) {
        const right = nodes[rightIndex];
        edges.push({
          key: `${node.key}-${right.key}`,
          x1: node.x,
          y1: node.y,
          x2: right.x,
          y2: right.y,
        });
      }
      const downIndex = index + columns;
      if (row < rows - 1 && downIndex < nodes.length) {
        const down = nodes[downIndex];
        edges.push({
          key: `${node.key}-${down.key}`,
          x1: node.x,
          y1: node.y,
          x2: down.x,
          y2: down.y,
        });
      }
    });

    return {
      nodes,
      edges,
      columns,
      rows,
    };
  }, [latestRoundSyndromes, outerCodeDistance]);
  const qecTriggeredNodes = hasActiveScientificContext ? qecLattice.nodes.filter((node) => node.triggered) : [];
  const qecPointerNodes = qecTriggeredNodes.slice(0, 8);
  const qecStabilizerTotal = hasActiveScientificContext
    ? Math.max(0, runTelemetry?.stabilizer_count ?? qecLattice.nodes.length)
    : 0;
  const qecTrackedTotal = hasActiveScientificContext ? qecLattice.nodes.length : 0;
  const qecMapTrimmed = qecStabilizerTotal > qecTrackedTotal;
  const qecTriggeredPct =
    qecTrackedTotal > 0 ? (qecTriggeredNodes.length / Math.max(1, qecTrackedTotal)) * 100 : 0;
  const qecSurfaceDistance = outerCodeDistance;
  const qecSurfaceRoundLabel =
    hasActiveScientificContext && latestSyndromeRound !== null ? `Round ${latestSyndromeRound + 1}` : "No round";
  const gkpOscillatorStates = useMemo<GkpOscillatorStateSample[]>(() => {
    if (rawGkpOscillatorStates.length > 0) {
      return rawGkpOscillatorStates;
    }
    if (physicalNoiseData.length === 0) {
      return [];
    }
    const sliced = physicalNoiseData.slice(-Math.min(48, physicalNoiseData.length));
    return sliced.map((point, index) => {
      const angle = index * 0.58 + point.round * 0.12;
      const radius = clamp(point.displacementSigma * 3.2, 0.16, 1.25);
      const q = Number((radius * Math.cos(angle)).toFixed(4));
      const p = Number((radius * Math.sin(angle)).toFixed(4));
      const variance = Number((0.03 + point.displacementSigma * 0.24).toFixed(4));
      const energy = Number((point.photonLossPct / 9).toFixed(4));
      return {
        round: point.round - 1,
        mode: `M${((index % 12) + 1).toString().padStart(2, "0")}`,
        q,
        p,
        variance,
        energy,
        flagged: point.physicalErrorPct >= anomalyThresholds.perWarn || point.photonLossPct >= 1.1,
      };
    });
  }, [anomalyThresholds.perWarn, physicalNoiseData, rawGkpOscillatorStates]);
  const gkpOscillatorFallback = rawGkpOscillatorStates.length === 0 && gkpOscillatorStates.length > 0;
  const gkpAxisLimit = useMemo(() => {
    if (gkpOscillatorStates.length === 0) {
      return 1;
    }
    const maxAbs = gkpOscillatorStates.reduce(
      (currentMax, sample) => Math.max(currentMax, Math.abs(sample.q), Math.abs(sample.p)),
      0,
    );
    return Math.max(0.95, Math.min(1.8, Math.ceil(maxAbs * 10) / 10));
  }, [gkpOscillatorStates]);
  const gkpOscillatorMapPoints = useMemo<GkpOscillatorMapPoint[]>(() => {
    if (gkpOscillatorStates.length === 0) {
      return [];
    }
    const width = 620;
    const height = 340;
    const centerX = width / 2;
    const centerY = height / 2;
    const scaleX = 240;
    const scaleY = 124;
    return gkpOscillatorStates.slice(-180).map((sample, index) => {
      const x = Number((centerX + (sample.q / gkpAxisLimit) * scaleX).toFixed(2));
      const y = Number((centerY - (sample.p / gkpAxisLimit) * scaleY).toFixed(2));
      return {
        key: `${sample.round}-${sample.mode}-${index}`,
        mode: sample.mode,
        round: sample.round,
        q: sample.q,
        p: sample.p,
        variance: sample.variance ?? 0,
        energy: sample.energy ?? 0,
        flagged: sample.flagged ?? false,
        x,
        y,
      };
    });
  }, [gkpAxisLimit, gkpOscillatorStates]);
  const gkpFlaggedPoints = gkpOscillatorMapPoints.filter((point) => point.flagged);
  const gkpPointerPoints = gkpFlaggedPoints.slice(0, 10);
  const gkpModesTracked = new Set(gkpOscillatorMapPoints.map((point) => point.mode)).size;
  const gkpLatestRound = gkpOscillatorStates.reduce((roundMax, sample) => Math.max(roundMax, sample.round), -1);
  const gkpRoundLabel = gkpLatestRound >= 0 ? `Round ${gkpLatestRound + 1}` : "No round";
  const gkpVarianceAvg =
    gkpOscillatorMapPoints.length > 0
      ? average(gkpOscillatorMapPoints.map((point) => point.variance))
      : 0;
  const gkpEnergyAvg =
    gkpOscillatorMapPoints.length > 0 ? average(gkpOscillatorMapPoints.map((point) => point.energy)) : 0;
  const qecMapHeading =
    !hasActiveScientificContext
      ? "Encoding Map Pending"
      : encodingMapMode === "surface"
        ? `${qecFamilyLabel(activeCircuitQecCode)} Syndrome Map`
        : "Digitized GKP Oscillator Map";
  const qecMapSubtitle =
    !hasActiveScientificContext
      ? "Build a circuit and select an architecture/QEC pair before syndrome or oscillator state maps are shown."
      : encodingMapMode === "surface"
        ? activeCircuitQecCode === "repetition"
          ? `Repetition-code syndrome telemetry for ${qecSurfaceRoundLabel}`
          : activeCircuitQecCode === "css_ldpc"
            ? `CSS-LDPC parity-check telemetry for ${qecSurfaceRoundLabel}`
            : `Surface lattice telemetry for ${qecSurfaceRoundLabel} · distance-${qecSurfaceDistance}`
      : gkpOscillatorFallback
        ? `Derived oscillator projection for ${gkpRoundLabel} from physical noise telemetry`
        : `Direct oscillator telemetry for ${gkpRoundLabel} with phase-space state vectors`;
  const publicDecoderInterventions = useMemo(
    () =>
      (runTelemetry?.decoder_interventions ?? []).filter((row) => {
        const decoderKey = parseDecoderKey(row.decoder);
        return decoderKey != null && PUBLIC_DECODER_KEYS.includes(decoderKey);
      }),
    [runTelemetry?.decoder_interventions],
  );
  const hasPublicDecoderInterventions = publicDecoderInterventions.length > 0;
  const decoderStreamRows = useMemo<DecoderStreamRow[]>(() => {
    const stabilizerDenominator = asCount(scientificState.signals.stabilizer_count) ?? 0;
    return publicDecoderInterventions
      .map((row, index) => {
        const decoderKey = parseDecoderKey(row.decoder);
        if (decoderKey == null || !PUBLIC_DECODER_KEYS.includes(decoderKey)) {
          return null;
        }
        const roundLabel = `R${row.round + 1}`;
        const residualRatePct =
          stabilizerDenominator > 0 ? Number(((row.residual_weight / stabilizerDenominator) * 100).toFixed(4)) : null;
        const residualFormula =
          stabilizerDenominator > 0
            ? `residual_weight / stabilizer_count = ${row.residual_weight.toLocaleString()} / ${stabilizerDenominator.toLocaleString()} = ${residualRatePct?.toFixed(4)}%`
            : "residual_weight / stabilizer_count requires a positive stabilizer_count.";
        return {
          key: `${decoderKey}-${row.round}-${index}`,
          decoderKey,
          decoderName: decoderLabel(decoderKey),
          round: row.round,
          roundLabel,
          flips: row.flips,
          residualWeight: row.residual_weight,
          residualRatePct,
          residualFormula,
        };
      })
      .filter((row): row is DecoderStreamRow => row != null)
      .sort((left, right) => left.round - right.round || left.decoderName.localeCompare(right.decoderName));
  }, [publicDecoderInterventions, scientificState.signals.stabilizer_count]);
  const decoderStreamDecoderKeys = PUBLIC_DECODER_KEYS.filter((decoderKey) =>
    decoderStreamRows.some((row) => row.decoderKey === decoderKey),
  );
  const decoderStreamChartData = useMemo<DecoderStreamPoint[]>(() => {
    const byRound = new Map<number, DecoderStreamPoint>();
    decoderStreamRows.forEach((row) => {
      const point = byRound.get(row.round) ?? { round: row.round, roundLabel: row.roundLabel };
      point[`${row.decoderKey}_residual`] = row.residualRatePct ?? 0;
      point[`${row.decoderKey}_flips`] = row.flips;
      byRound.set(row.round, point);
    });
    return [...byRound.values()].sort((left, right) => left.round - right.round);
  }, [decoderStreamRows]);
  const decoderStreamLatestRound = decoderStreamRows.reduce((roundMax, row) => Math.max(roundMax, row.round), -1);
  const decoderStreamTotalFlips = decoderStreamRows.reduce((sum, row) => sum + row.flips, 0);
  const decoderStreamResidualWeight = decoderStreamRows.reduce((sum, row) => sum + row.residualWeight, 0);
  const decoderStreamLatestRows = decoderStreamRows.slice(-12).reverse();
  const opsInterventionSeries = useMemo(() => {
    const rows = publicDecoderInterventions.slice(-32);
    if (rows.length === 0) {
      return Array.from({ length: 12 }, (_, index) => ({
        key: `idle-${index}`,
        roundLabel: `R${index + 1}`,
        totalFlips: 0,
        totalResidual: 0,
        loadIndex: 0,
        round: null as number | null,
      }));
    }
    const byRound = new Map<number, { flips: number; residual: number }>();
    rows.forEach((row) => {
      const current = byRound.get(row.round) ?? { flips: 0, residual: 0 };
      current.flips += row.flips;
      current.residual += row.residual_weight;
      byRound.set(row.round, current);
    });
    const ordered = Array.from(byRound.entries())
      .sort((left, right) => left[0] - right[0])
      .slice(-12);
    const peak = Math.max(1, ...ordered.map(([, value]) => value.flips + value.residual * 1.4));
    return ordered.map(([round, value]) => {
      const combined = value.flips + value.residual * 1.4;
      return {
        key: `round-${round}`,
        roundLabel: `R${round + 1}`,
        totalFlips: Number(value.flips.toFixed(2)),
        totalResidual: Number(value.residual.toFixed(2)),
        loadIndex: Number(((combined / peak) * 100).toFixed(1)),
        round,
      };
    });
  }, [publicDecoderInterventions]);
  const latestInterventionRoundLabel = useMemo(() => {
    const latest = opsInterventionSeries[opsInterventionSeries.length - 1];
    if (!latest || latest.round === null) {
      return "idle";
    }
    return `R${latest.round + 1}`;
  }, [opsInterventionSeries]);
  const opsRawEvents = useMemo(() => {
    if (systemOff) {
      return [
        {
          level: "warn" as const,
          text: "System off: telemetry and decoder stream halted.",
          tag: "off",
          source: "system" as const,
        },
      ];
    }
    const events: Array<{
      level: "info" | "warn" | "critical" | "ok";
      text: string;
      tag: string;
      source: "decoder" | "physical" | "scope" | "system";
    }> = [];

    if (activeIntegrationSession) {
      events.push({
        level: sessionStatusLevel(activeIntegrationSession.status),
        text: `Session #${activeIntegrationSession.id.slice(0, 8).toUpperCase()} ${sessionStatusLabel(
          activeIntegrationSession.status,
        )} (${activeIntegrationSession.adapter_id})`,
        tag: `${activeIntegrationSession.provider.toUpperCase()} · ${formatAgo(
          activeIntegrationSession.updated_at,
        )}`,
        source: "system",
      });
    }

    (sessionLogsQuery.data?.lines ?? []).slice(-30).forEach((entry) => {
      events.push({
        level: inferLogLevel(entry.stream, entry.line),
        text: entry.line.trim() || "(empty line)",
        tag: `${entry.stream.toUpperCase()} · ${formatClock(entry.timestamp)}`,
        source: "system",
      });
    });

    publicDecoderInterventions
      .slice(-28)
      .forEach((row) => {
        const decoder = decoderLabel(parseDecoderKey(row.decoder) ?? activeDecoder);
        const level = row.residual_weight >= 4 ? "warn" : "ok";
        events.push({
          level,
          text: `Round ${row.round + 1}: ${decoder} flips=${row.flips}, residual=${row.residual_weight}`,
          tag: `R${row.round + 1}`,
          source: "decoder",
        });
      });

    physicalAnomalies.slice(-8).forEach((point) => {
      events.push({
        level: "critical",
        text: `Physical anomaly at round ${point.round}: telemetry PER ${point.physicalErrorPct.toFixed(3)}%`,
        tag: "Telemetry PER",
        source: "physical",
      });
    });

    activityFeed.forEach((item) => {
      events.push({
        level: item.tone === "red" ? "critical" : item.tone === "blue" ? "info" : "ok",
        text: item.text,
        tag: item.time,
        source: "scope",
      });
    });

    if (events.length === 0) {
      events.push({
        level: "info",
        text: "Waiting for decoder telemetry stream...",
        tag: "idle",
        source: "system",
      });
    }
    return events.slice(-60);
  }, [
    activeDecoder,
    activeIntegrationSession,
    activityFeed,
    physicalAnomalies,
    publicDecoderInterventions,
    sessionLogsQuery.data?.lines,
    systemOff,
  ]);
  const opsLiveEvents = useMemo(() => {
    const maxRows = Math.min(12, opsRawEvents.length);
    if (maxRows === 0) {
      return [];
    }
    return Array.from({ length: maxRows }, (_, index) => {
      const offset = (opsLogCursor + index) % opsRawEvents.length;
      const event = opsRawEvents[offset];
      return {
        ...event,
        id: `${event.source}-${event.tag}-${offset}-${index}`,
      };
    });
  }, [opsLogCursor, opsRawEvents]);

  useEffect(() => {
    if (opsRawEvents.length <= 1) {
      return;
    }
    const delay = syndromeExtractionActive ? 900 : 1700;
    const timer = window.setInterval(() => {
      setOpsLogCursor((current) => (current + 1) % opsRawEvents.length);
    }, delay);
    return () => window.clearInterval(timer);
  }, [opsRawEvents.length, syndromeExtractionActive]);

  const compareDelta = useMemo(() => {
    if (!compareMode) {
      return 0;
    }
    const primaryValues = monitoringData.map((point) => metricValue(point, activeChart, false));
    const compareValues = monitoringData.map((point) => metricValue(point, activeChart, true));
    return percentDelta(average(primaryValues), average(compareValues));
  }, [activeChart, compareMode, monitoringData]);
  const compareHigherIsBetter = activeChart === "success";
  const compareIsGood = compareHigherIsBetter ? compareDelta >= 0 : compareDelta <= 0;

  const activeProviderName =
    providerFilter !== "all"
      ? providerById.get(providerFilter)?.name ?? "Unknown Simulator"
      : "Choose Simulator";
  const activeRunProvider = activeRun ? providerById.get(activeRun.provider_id) ?? null : null;
  const heroProviderLabel = activeRunProvider?.name ?? activeProviderName;
  const heroHardwareLabel = activeRunProvider
    ? providerKindLabel(activeRunProvider.kind)
    : "Mixed Simulator Scope";
  const heroSimulatorLabel = hasActiveScientificContext
    ? `${heroHardwareLabel} · ${heroProviderLabel}`
    : heroProviderLabel;
  const activeDecoderHeaderLabel = hasActiveScientificContext ? recommendedDecoderLabel : "None";
  const activeRunShortId = activeRunId ? activeRunId.slice(0, 8).toUpperCase() : "None";
  const activeSessionShortId = activeIntegrationSession
    ? activeIntegrationSession.id.slice(0, 8).toUpperCase()
    : "None";
  const quickLaunchBusy = createRunMutation.isPending || createSessionMutation.isPending;
  const sessionStopBusy = stopSessionMutation.isPending;
  const launchProviderFamily = launchProvider ? resolveProviderFamily(launchProvider) : "unknown";
  const replaySourceOptions = useMemo<ReplaySourceOption[]>(() => {
    return [...scopedRuns]
      .filter((run) => run.status === "finished")
      .sort((left, right) => new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime())
      .map((run) => ({
        runId: run.id,
        datasetLabel: run.dataset_label,
        providerName: providerById.get(run.provider_id)?.name ?? run.provider_id,
        updatedAtLabel: formatAgo(run.updated_at),
      }));
  }, [providerById, scopedRuns]);
  useEffect(() => {
    if (replaySourceOptions.length === 0) {
      if (replaySourceRunId !== "") {
        setReplaySourceRunId("");
      }
      return;
    }
    if (!replaySourceRunId || !replaySourceOptions.some((source) => source.runId === replaySourceRunId)) {
      setReplaySourceRunId(replaySourceOptions[0].runId);
    }
  }, [replaySourceOptions, replaySourceRunId]);
  const selectedReplaySourceRun = useMemo(
    () => (replaySourceRunId ? runById.get(replaySourceRunId) ?? null : null),
    [replaySourceRunId, runById],
  );
  const replayLaunchProvider = selectedReplaySourceRun
    ? providerById.get(selectedReplaySourceRun.provider_id) ?? null
    : launchProvider;
  const replayLaunchProviderFamily = replayLaunchProvider ? resolveProviderFamily(replayLaunchProvider) : "unknown";
  const providerOperationalStateText = !launchProvider
    ? "No simulator selected"
    : !providerReady(launchProvider)
      ? "Simulator configured but currently offline"
      : scientificTransport(launchProvider) != null
        ? "Simulator available and scientific-ready"
        : "Simulator configured but scientific mode unsupported";
  const baseSessionUnavailableReason =
    !isApi
      ? "Scientific session unavailable — switch to Live API mode"
      : systemOff
        ? "Scientific session unavailable — system is off"
        : anyApiError
          ? "Scientific session unavailable — backend unreachable"
          : launchProvider == null
            ? "Scientific session unavailable — no simulator selected"
            : !providerReady(launchProvider)
              ? "Scientific session unavailable — simulator configured but offline"
              : !launchProvider.supports_scientific
                ? "Scientific session unavailable — simulator configured but scientific mode unsupported"
                : scientificTransport(launchProvider) == null
                  ? "Scientific session unavailable — simulator configured but public replay mode unsupported"
                  : launchProviderFamily === "unknown"
                    ? "Scientific session unavailable — simulator configured but adapter mapping missing"
                    : null;
  const benchmarkBaseUnavailableReason =
    !isApi
      ? "Benchmark unavailable — switch to Live API mode"
      : systemOff
        ? "Benchmark unavailable — system is off"
        : anyApiError
          ? "Benchmark unavailable — backend unreachable"
          : launchProvider == null
            ? "Benchmark unavailable — no simulator selected"
            : !providerReady(launchProvider)
              ? "Benchmark unavailable — simulator configured but offline"
              : !launchProvider.supports_benchmark
                ? "Benchmark unavailable — simulator configured but benchmark mode unsupported"
                : scientificTransport(launchProvider) == null
                  ? "Benchmark unavailable — simulator configured but public replay mode unsupported"
                  : launchProviderFamily === "unknown"
                    ? "Benchmark unavailable — simulator configured but adapter mapping missing"
                    : null;
  const replayBaseUnavailableReason =
    !isApi
      ? "Replay unavailable — switch to Live API mode"
      : systemOff
        ? "Replay unavailable — system is off"
        : anyApiError
          ? "Replay unavailable — backend unreachable"
          : replayLaunchProvider == null
            ? "Replay unavailable — no simulator selected"
            : !providerReady(replayLaunchProvider)
              ? "Replay unavailable — simulator configured but offline"
              : !replayLaunchProvider.supports_replay
                ? "Replay unavailable — simulator configured but replay mode unsupported"
                : replayLaunchProviderFamily === "unknown"
                  ? "Replay unavailable — simulator configured but adapter mapping missing"
                  : null;
  const scientificSessionUnavailableReason = baseSessionUnavailableReason;
  const activeSessionConfig = activeIntegrationSession?.config ?? null;
  const launchArchitectureLabel =
    launchProviderFamily === "pennylane" || launchProviderFamily === "schrosim"
      ? "Photonic"
      : launchProviderFamily === "qiskit" || launchProviderFamily === "cirq"
        ? "Superconducting"
        : "Pending";
  const publicRunArchitectureLabel = hasActiveScientificContext
    ? circuitArchitectureLabel(activeCircuitHardwareTarget)
    : launchArchitectureLabel;
  const publicRunQecLabel = hasActiveScientificContext ? qecFamilyLabel(activeCircuitQecCode) : "Selected in circuit builder";
  const publicRunBudgetRows = [
    {
      key: "shots",
      label: "Shots",
      value: optionalNumber(activeSessionConfig?.simulator_shots) ?? optionalNumber(scientificState.signals.expanded_shot_count),
      limit: PUBLIC_RUN_LIMITS.shots,
      note: "public replay cap",
    },
    {
      key: "qubits",
      label: "Qubits / Modes",
      value: optionalNumber(activeSessionConfig?.circuit_qubits),
      limit: PUBLIC_RUN_LIMITS.qubits,
      note: publicRunArchitectureLabel,
    },
    {
      key: "gates",
      label: "Gate Count",
      value: optionalNumber(activeSessionConfig?.circuit_gate_count),
      limit: PUBLIC_RUN_LIMITS.gates,
      note: "compiled circuit",
    },
    {
      key: "distance",
      label: "Code Distance",
      value: optionalNumber(activeSessionConfig?.simulator_distance) ?? (activeCircuitQecCode === "surface" ? outerCodeDistance : null),
      limit: PUBLIC_RUN_LIMITS.distance,
      note: publicRunQecLabel,
    },
    {
      key: "rounds",
      label: "Rounds",
      value: optionalNumber(activeSessionConfig?.simulator_rounds) ?? optionalNumber(scientificState.signals.rounds),
      limit: PUBLIC_RUN_LIMITS.rounds,
      note: "bounded stream",
    },
    {
      key: "sessions",
      label: "Active Session",
      value: activeSessionStreaming || hasActiveScientificContext ? 1 : null,
      limit: PUBLIC_RUN_LIMITS.activeSessions,
      note: `${PUBLIC_RUN_LIMITS.timeoutSeconds / 60} min timeout`,
    },
  ];
  const publicRunBudgetViolations = publicRunBudgetRows.filter(
    (row) => row.value != null && row.value > row.limit,
  );
  const publicRunEnvelopeTone =
    systemOff || scientificSessionUnavailableReason
      ? "standby"
      : publicRunBudgetViolations.length > 0
        ? "warning"
        : hasActiveScientificContext
          ? "running"
          : "ready";
  const publicRunEnvelopeLabel =
    publicRunEnvelopeTone === "standby"
      ? "Choose simulator"
      : publicRunEnvelopeTone === "warning"
        ? "Reduce payload"
        : publicRunEnvelopeTone === "running"
          ? "Bounded run"
          : "Ready";
  const publicRunEnvelopeNote =
    publicRunEnvelopeTone === "standby"
      ? "Select a simulator and build a circuit before a public session is dispatched."
      : publicRunEnvelopeTone === "warning"
        ? `Public mode limit exceeded: ${publicRunBudgetViolations.map((row) => row.label).join(", ")}.`
        : hasActiveScientificContext
          ? "This session is held inside the public Render envelope; no private credentials or lab hardware controls are used."
          : "Public mode caps shots, rounds, distance, gate count, and active sessions before dispatch.";
  const lerFigurePct = scientificZeroBaseline
    ? null
    : percentFromCounts(scientificState.signals.logical_failures, scientificState.signals.logical_trials);
  const perFigurePct = scientificZeroBaseline
    ? null
    : percentFromCounts(scientificState.signals.physical_error_events, scientificState.signals.physical_error_opportunities);
  const residualFigurePct = scientificZeroBaseline
    ? null
    : percentFromCounts(scientificState.signals.residual_syndrome_events, scientificState.signals.syndrome_opportunities);
  const exactEvidenceRows = [
    {
      label: "Logical error",
      value: lerFigurePct,
      formula: scientificCardTooltips.ler ?? "Exact formula: logical_failures / logical_trials.",
      tone: "green",
    },
    {
      label: "Physical error",
      value: perFigurePct,
      formula: scientificCardTooltips.per ?? "Exact formula: physical_error_events / physical_error_opportunities.",
      tone: "red",
    },
    {
      label: "Residual syndrome",
      value: residualFigurePct,
      formula: "Exact formula: residual_syndrome_events / syndrome_opportunities.",
      tone: "orange",
    },
  ];
  const maxEvidencePercent = Math.max(
    0.1,
    ...exactEvidenceRows.map((row) => (row.value != null && Number.isFinite(row.value) ? row.value : 0)),
  );
  const decoderFigureRows = decoderRecommendationRows.slice(0, 4).map((row) => {
    const decoderKey = parseDecoderKey(row.decoder);
    return {
      key: row.decoder,
      label: decoderKey ? decoderLabel(decoderKey) : row.decoder,
      lerPct: row.logical_error_rate * 100,
      residualPct: row.residual_nonzero_rate * 100,
      flips: row.avg_flips,
    };
  });
  const resourceFigureRows = [
    {
      label: "Rounds",
      value: asCount(scientificState.signals.rounds),
      limit: PUBLIC_RUN_LIMITS.rounds,
    },
    {
      label: "Stabilizers",
      value: asCount(scientificState.signals.stabilizer_count),
      limit: Math.max(PUBLIC_RUN_LIMITS.distance * PUBLIC_RUN_LIMITS.distance, qecStabilizerTotal),
    },
    {
      label: "Syndrome opportunities",
      value: asCount(scientificState.signals.syndrome_opportunities),
      limit: Math.max(1, PUBLIC_RUN_LIMITS.rounds * PUBLIC_RUN_LIMITS.distance * PUBLIC_RUN_LIMITS.distance),
    },
    {
      label: "Expanded shots",
      value: asCount(scientificState.signals.expanded_shot_count),
      limit: PUBLIC_RUN_LIMITS.shots,
    },
  ];
  const noiseFigureRows = [
    {
      label: "Latest PER",
      value: latestPhysicalPoint?.physicalErrorPct ?? null,
      limit: anomalyThresholds.perWarn,
      unit: "%",
    },
    {
      label: "Photon loss",
      value: latestPhysicalPoint?.photonLossPct ?? null,
      limit: anomalyThresholds.perWarn,
      unit: "%",
    },
    {
      label: "Displacement sigma",
      value: latestPhysicalPoint?.displacementSigma ?? null,
      limit: anomalyThresholds.noiseWarn * 10,
      unit: "",
    },
  ];
  const benchmarkMenuDisabledReason = benchmarkBaseUnavailableReason;
  const benchmarkSessionUnavailableReason =
    benchmarkMenuDisabledReason ??
    (benchmarkDecoders.length === 0 ? "Benchmark unavailable — select at least one decoder" : null);
  const replaySessionUnavailableReason =
    replayBaseUnavailableReason ??
    (replaySourceOptions.length === 0
      ? providersData.length > 0
        ? "Replay unavailable — simulator configured but no replay source available"
        : "Replay unavailable — no historical run in scope"
      : null) ??
    (!selectedReplaySourceRun ? "Replay unavailable — select a replay source" : null);
  const sessionRunning = activeSessionStreaming;
  const launcherStatus = sessionStopBusy
    ? "stopping"
    : quickLaunchBusy || sessionControlState.status === "launching"
      ? "launching"
      : sessionRunning
        ? "running"
        : sessionControlState.status === "failed"
          ? "failed"
          : "idle";
  const drilldownProviderName = activeRun
    ? providerById.get(activeRun.provider_id)?.name ?? activeRun.provider_id
    : activeProviderName;

  const launchSession = async (input: LaunchSessionInput) => {
    if (systemOff) {
      setSystemOff(false);
    }
    armSystem();
    clearError();
    beginLaunch(input.mode);
    setBenchmarkDialogOpen(false);
    setReplayDialogOpen(false);
    setActiveHomeSessionSnapshot(null);
    homeSessionStatusRef.current = null;
    const publicDecoders = input.decoders.filter((decoder) => PUBLIC_DECODER_KEYS.includes(decoder));
    const launchDecoders = publicDecoders.length > 0 ? publicDecoders : [...PUBLIC_DECODER_KEYS];
    const launchPlan = buildQuickLaunchPlan(input.provider, input.mode);
    const launchProviderFamily = resolveProviderFamily(input.provider);
    const launchWorkflowId = workflowForProviderFamily(launchProviderFamily);
    const launchDecoderLabel = launchDecoders.map((decoder) => decoderLabel(decoder)).join(", ");
    if (!launchPlan) {
      const unsupportedMessage =
        input.mode === "replay"
          ? "Replay unavailable — simulator configured but replay mode unsupported"
          : "Session unavailable — simulator configured but public replay mode unsupported";
      markFailed(unsupportedMessage);
      setQuickLaunchTone("error");
      setQuickLaunchMessage(unsupportedMessage);
      return;
    }
    const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);
    const modeLabel =
      input.mode === "scientific"
        ? "scientific"
        : input.mode === "benchmark"
          ? "benchmark"
          : "replay";
    const sourceLabel = input.runSource ? ` from ${input.runSource.id.slice(0, 8).toUpperCase()}` : "";
    const circuitLabel = input.circuitDesign ? ` using ${input.circuitDesign.name}` : "";
    setQuickLaunchTone("info");
    setQuickLaunchMessage(
      `Starting ${input.provider.name} ${modeLabel} session${sourceLabel} with ${launchDecoderLabel}${circuitLabel}...`,
    );
    setActiveContext({ runId: null, sessionId: null, mode: input.mode });
    let createdRunId: string | null = null;

    try {
      const run = await createRunMutation.mutateAsync({
        workflow_id: launchWorkflowId,
        provider_id: input.provider.id,
        dataset_label: `${input.provider.name} ${input.datasetHint} ${modeLabel}${sourceLabel} ${timestamp}`,
        decoders: launchDecoders,
      });
      createdRunId = run.id;
      setActiveContext({ runId: run.id, sessionId: null, mode: input.mode });
      const allowCircuitDesignConfig = input.circuitDesign && supportsSoftwareCircuitDesign(input.provider);
      const circuitDesign = allowCircuitDesignConfig ? input.circuitDesign : null;
      const circuitConfig = circuitDesign
        ? {
            circuit_name: circuitDesign.name,
            circuit_qasm: circuitDesign.qasm,
            circuit_qubits: circuitDesign.qubitCount,
            circuit_depth: circuitDesign.depth,
            circuit_gate_count: circuitDesign.gateCount,
            circuit_hardware_target: circuitDesign.hardwareTarget,
            circuit_qec_code: circuitDesign.qecCode,
            simulator_code_family: circuitDesign.qecCode,
            circuit_detector_model: circuitDesign.compileArtifact.photonic_detector_model,
            circuit_noise_config: JSON.stringify(circuitDesign.noiseConfig),
            circuit_compile_artifact: JSON.stringify(circuitDesign.compileArtifact),
            circuit_calibration_snapshot:
              circuitDesign.calibrationSnapshotId ?? circuitDesign.compileArtifact.calibration_snapshot_id,
            simulator_shots: 1024,
            circuit_gate_plan: JSON.stringify(
              circuitDesign.operations.map((operation) => ({
                gate: operation.gate,
                target: operation.target,
                control: operation.control ?? null,
                parameter: operation.parameter ?? null,
              })),
            ),
          }
        : {};
      const session = await createSessionMutation.mutateAsync({
        run_id: run.id,
        adapter_id: launchPlan.adapterId,
        config: {
          ...launchPlan.config,
          mode: input.mode,
          provider_scope: providerFilter,
          time_range: timeRangeFilter,
          run_source: input.runSource?.id,
          compare_decoders: input.mode === "benchmark" ? launchDecoders : undefined,
          skip_replay: input.mode === "replay" ? false : launchPlan.config.skip_replay,
          ...circuitConfig,
        },
      });
      markRunning({ runId: run.id, sessionId: session.id, mode: input.mode });
      setActiveHomeSessionSnapshot(session);
      setOpsLogCursor(0);
      setQuickLaunchTone("success");
      setQuickLaunchMessage(
        `Session #${session.id.slice(0, 8).toUpperCase()} started for ${input.provider.name} (${launchDecoderLabel})${circuitLabel}.`,
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        markFailed("Integration session endpoint is unavailable.");
        setQuickLaunchTone("error");
        setQuickLaunchMessage(
          "Integration session endpoint is unavailable. Restart backend from the latest source.",
        );
        setActiveHomeSessionSnapshot(null);
        return;
      }
      const message = error instanceof Error ? error.message : "Failed to start session.";
      markFailed(message);
      setQuickLaunchTone("error");
      setQuickLaunchMessage(message);
      setActiveContext({ runId: createdRunId, sessionId: null, mode: input.mode });
      setActiveHomeSessionSnapshot(null);
    }
  };

  const launchSessionWithProviderPrompt = async (input: LaunchSessionInput) => {
    await launchSession(input);
  };

  const openCircuitDesignDialogForLaunch = (input: LaunchSessionInput) => {
    setPendingCircuitLaunch(input);
    setCircuitDesignDialogOpen(true);
    setBenchmarkDialogOpen(false);
    setReplayDialogOpen(false);
  };

  const closeCircuitDesignDialog = () => {
    if (quickLaunchBusy) {
      return;
    }
    setCircuitDesignDialogOpen(false);
    setPendingCircuitLaunch(null);
  };

  const handleStartSessionFromCircuitDesign = async (circuitDesign: CircuitDesignDraft) => {
    if (!pendingCircuitLaunch) {
      return;
    }
    const launchInput: LaunchSessionInput = {
      ...pendingCircuitLaunch,
      circuitDesign,
      datasetHint: `${pendingCircuitLaunch.datasetHint} ${circuitDesign.name}`,
    };
    setCircuitDesignDialogOpen(false);
    setPendingCircuitLaunch(null);
    await launchSessionWithProviderPrompt(launchInput);
  };

  const handleStartScientificSession = async () => {
    if (scientificSessionUnavailableReason) {
      setQuickLaunchTone("error");
      setQuickLaunchMessage(scientificSessionUnavailableReason);
      return;
    }
    if (!launchProvider) {
      return;
    }
    const launchInput: LaunchSessionInput = {
      mode: "scientific",
      provider: launchProvider,
      decoders: [...PUBLIC_DECODER_KEYS],
      datasetHint: `scientific ${timeRangeFilter} all-decoders`,
    };
    if (supportsSoftwareCircuitDesign(launchProvider)) {
      openCircuitDesignDialogForLaunch(launchInput);
      return;
    }
    await launchSessionWithProviderPrompt(launchInput);
  };

  const handleStartBenchmarkSession = async () => {
    if (benchmarkSessionUnavailableReason) {
      setQuickLaunchTone("error");
      setQuickLaunchMessage(benchmarkSessionUnavailableReason);
      return;
    }
    if (!launchProvider || benchmarkDecoders.length === 0) {
      return;
    }
    await launchSessionWithProviderPrompt({
      mode: "benchmark",
      provider: launchProvider,
      decoders: benchmarkDecoders,
      datasetHint: `benchmark ${timeRangeFilter}`,
    });
  };

  const handleStartReplaySession = async () => {
    if (replaySessionUnavailableReason) {
      setQuickLaunchTone("error");
      setQuickLaunchMessage(replaySessionUnavailableReason);
      return;
    }
    if (!selectedReplaySourceRun) {
      return;
    }
    const sourceProvider = providerById.get(selectedReplaySourceRun.provider_id);
    if (!sourceProvider) {
      setQuickLaunchTone("error");
      setQuickLaunchMessage("Replay unavailable — source provider is no longer configured.");
      return;
    }
    if (!providerReady(sourceProvider)) {
      setQuickLaunchTone("error");
      setQuickLaunchMessage("Replay unavailable — source provider is offline.");
      return;
    }
    if (!sourceProvider.supports_replay) {
      setQuickLaunchTone("error");
      setQuickLaunchMessage("Replay unavailable — source provider does not support replay mode.");
      return;
    }
    await launchSession({
      mode: "replay",
      provider: sourceProvider,
      decoders: selectedReplaySourceRun.decoders.length > 0
        ? (selectedReplaySourceRun.decoders
            .map((decoder) => parseDecoderKey(decoder))
            .filter((decoder): decoder is DecoderKey => decoder !== null))
        : [activeDecoder],
      datasetHint: `replay source ${selectedReplaySourceRun.id.slice(0, 8).toUpperCase()}`,
      runSource: selectedReplaySourceRun,
    });
  };

  const handleStopSession = async () => {
    const sessionId = activeIntegrationSession?.id ?? activeHomeSessionId;
    if (!sessionId) {
      setQuickLaunchTone("error");
      setQuickLaunchMessage("No active session to stop.");
      return;
    }
    markStopping();
    setQuickLaunchTone("info");
    setQuickLaunchMessage(`Stopping session #${sessionId.slice(0, 8).toUpperCase()}...`);
    try {
      await stopSessionMutation.mutateAsync(sessionId);
      markStopped({ preserveRun: true });
      setActiveHomeSessionSnapshot(null);
      homeSessionStatusRef.current = null;
      setQuickLaunchTone("info");
      setQuickLaunchMessage(`Session #${sessionId.slice(0, 8).toUpperCase()} stopped.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to stop active session.";
      markFailed(message);
      setQuickLaunchTone("error");
      setQuickLaunchMessage(message);
    }
  };
  const handleToggleBenchmarkDecoder = (decoder: DecoderKey) => {
    setBenchmarkDecoders((current) =>
      current.includes(decoder)
        ? current.filter((value) => value !== decoder)
        : [...current, decoder],
    );
  };
  const handleOpenBenchmarkDialog = () => {
    setBenchmarkDialogOpen(true);
  };
  const handleOpenReplayDialog = () => {
    setReplayDialogOpen(true);
  };
  const handleViewRun = () => {
    if (!activeRunId) {
      return;
    }
    navigate("/runs");
  };
  const handleOpenTelemetryForRun = () => {
    if (!activeRunId) {
      return;
    }
    navigate(`/decoder/telemetry?runA=${encodeURIComponent(activeRunId)}&compare=0`);
  };
  const handleOpenValidationForRun = () => {
    if (!activeRunId) {
      return;
    }
    navigate(`/decoder/validation?run=${encodeURIComponent(activeRunId)}`);
  };

  const handleSystemOff = async () => {
    if (systemOff) {
      setSystemOff(false);
      setQuickLaunchTone("info");
      setQuickLaunchMessage("System turned on in standby. Select a provider and start a run to populate metrics.");
      return;
    }

    setSystemOff(true);
    setDrilldown(null);
    setOpsLogCursor(0);
    setCircuitDesignDialogOpen(false);
    setPendingCircuitLaunch(null);
    setBenchmarkDialogOpen(false);
    setReplayDialogOpen(false);
    markStopped();
    setActiveContext({ runId: null, sessionId: null, mode: null });
    setActiveHomeSessionSnapshot(null);
    homeSessionStatusRef.current = null;
    setQuickLaunchTone("info");
    const sessionId = activeIntegrationSession?.id ?? activeHomeSessionId;
    if (apiEnabled && sessionId) {
      try {
        await stopSessionMutation.mutateAsync(sessionId);
        setQuickLaunchMessage(
          `System switched off. Session #${sessionId.slice(0, 8).toUpperCase()} stopped and metrics reset to zero.`,
        );
        return;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to stop active session while powering off.";
        setQuickLaunchTone("error");
        setQuickLaunchMessage(`System switched off, but session stop failed: ${message}`);
        return;
      }
    }
    setQuickLaunchMessage("System switched off. Metrics reset to zero.");
  };

  const handleRealtimeDrilldown = (event: unknown) => {
    const payload = extractChartPayload<MonitoringPointWithCompare>(event);
    if (!payload) {
      return;
    }

    const primaryValue = metricValue(payload, activeChart, false);
    const compareValue = metricValue(payload, activeChart, true);
    const hasCompare = compareMode && Number.isFinite(compareValue);
    const interventionTimeline =
      publicDecoderInterventions
        .slice(-4)
        .map(
          (row) =>
            `Round ${row.round + 1}: ${decoderLabel(parseDecoderKey(row.decoder) ?? activeDecoder)} flips=${row.flips}, residual=${
              row.residual_weight
            }`,
        );

    setDrilldown({
      source: "realtime",
      title: `${chartLabel(activeChart)} @ ${payload.slot}`,
      summary: `${decoderLabel(activeDecoder)} ${
        activeChart === "latency" ? `${primaryValue.toFixed(1)} ms` : `${primaryValue.toFixed(2)}`
      }`,
      keyValues: [
        { label: "Provider", value: drilldownProviderName },
        { label: "Run", value: activeRunId ?? "N/A" },
        { label: "Decoder", value: decoderLabel(activeDecoder) },
        {
          label: "Primary value",
          value:
            activeChart === "latency"
              ? `${primaryValue.toFixed(1)} ms`
              : activeChart === "noise"
                ? `${(primaryValue * 100).toFixed(2)}%`
                : `${primaryValue.toFixed(2)}%`,
        },
        {
          label: "Compare value",
          value: hasCompare
            ? activeChart === "latency"
              ? `${compareValue.toFixed(1)} ms`
              : activeChart === "noise"
                ? `${(compareValue * 100).toFixed(2)}%`
                : `${compareValue.toFixed(2)}%`
            : "N/A",
        },
      ],
      timeline:
        interventionTimeline.length > 0
          ? interventionTimeline
          : activityFeed.slice(0, 4).map((item) => `${item.time}: ${item.text}`),
    });
  };

  const handleDecoderStreamDrilldown = (event: unknown) => {
    const payload = extractChartPayload<DecoderStreamPoint>(event);
    if (!payload) {
      return;
    }
    const rowsForRound = decoderStreamRows.filter((row) => row.round === payload.round);
    if (rowsForRound.length === 0) {
      return;
    }

    setDrilldown({
      source: "realtime",
      title: `Decoder stream @ ${payload.roundLabel}`,
      summary: `${rowsForRound.length} public decoder policies reported exact intervention rows.`,
      keyValues: [
        { label: "Provider", value: drilldownProviderName },
        { label: "Run", value: activeRunId ?? "N/A" },
        { label: "Round", value: payload.roundLabel },
        { label: "Total flips", value: rowsForRound.reduce((sum, row) => sum + row.flips, 0).toLocaleString() },
        {
          label: "Residual weight",
          value: rowsForRound.reduce((sum, row) => sum + row.residualWeight, 0).toLocaleString(),
        },
      ],
      timeline: rowsForRound.map(
        (row) =>
          `${row.decoderName}: flips=${row.flips.toLocaleString()}, residual=${row.residualWeight.toLocaleString()}, rate=${
            row.residualRatePct == null ? "N/A" : `${row.residualRatePct.toFixed(4)}%`
          }`,
      ),
    });
  };

  const handlePhysicalDrilldown = (event: unknown) => {
    const payload = extractChartPayload<PhysicalNoisePoint>(event);
    if (!payload) {
      return;
    }
    const roundInterventions =
      publicDecoderInterventions
        .filter((row) => row.round === payload.round - 1)
        .map(
          (row) =>
            `${decoderLabel(parseDecoderKey(row.decoder) ?? activeDecoder)} flips=${row.flips}, residual=${
              row.residual_weight
            }`,
        );

    setDrilldown({
      source: "physical",
      title: `Physical Channel Round ${payload.round}`,
      summary: `PER ${payload.physicalErrorPct.toFixed(3)}% | Photon Loss ${payload.photonLossPct.toFixed(3)}%`,
      keyValues: [
        { label: "Provider", value: drilldownProviderName },
        { label: "Run", value: activeRunId ?? "N/A" },
        { label: "Round", value: payload.round.toString() },
        { label: "Physical Error Rate", value: `${payload.physicalErrorPct.toFixed(3)}%` },
        { label: "Photon Loss Rate", value: `${payload.photonLossPct.toFixed(3)}%` },
        { label: "Displacement Sigma", value: payload.displacementSigma.toFixed(4) },
      ],
      timeline:
        roundInterventions.length > 0
          ? roundInterventions
          : ["No decoder interventions recorded for this round."],
    });
  };

  const renderInterpretationPanel = () => (
    <div className="qec-sidepanel ops-console">
      <div className="ops-console-head">
        <div className="panel-title">Decoder Console</div>
        <span className={`status-badge ${streamingStatusClass}`}>
          ● {streamingStatusLabel}
        </span>
      </div>
      <div className="panel-subtitle">
        {hasActiveScientificContext
          ? "Live decoder events for the selected scientific context."
          : "Idle until a circuit session starts."}
      </div>

      <div className="ops-console-kpis">
        <div className="ops-console-kpi">
          <span>Recommended</span>
          <strong>{activeDecoderHeaderLabel}</strong>
        </div>
        <div className="ops-console-kpi">
          <span>Avg telemetry PER</span>
          <strong>{perValue !== null ? `${perValue.toFixed(3)}%` : "N/A"}</strong>
        </div>
        <div className="ops-console-kpi">
          <span>Session</span>
          <strong>
            {activeIntegrationSession
              ? `#${activeIntegrationSession.id.slice(0, 8).toUpperCase()} ${sessionStatusLabel(
                  activeIntegrationSession.status,
                )}`
              : "none"}
          </strong>
        </div>
      </div>

      {hasPublicDecoderInterventions ? (
        <div className="ops-timeline">
          <div className="ops-timeline-head">
            <span>Intervention Load</span>
            <span>{latestInterventionRoundLabel}</span>
          </div>
          <div className="ops-intervention-meta">
            <span>Round Aggregate</span>
            <strong>{`${opsInterventionSeries[opsInterventionSeries.length - 1]?.loadIndex.toFixed(1)}% load`}</strong>
          </div>
          <div className="ops-intervention-chart">
            <ResponsiveContainer width="100%" height={168}>
              <LineChart data={opsInterventionSeries} margin={{ top: 8, right: 10, left: 2, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(143,158,180,0.2)" />
                <XAxis dataKey="roundLabel" tick={{ fill: "#8f9eb4", fontSize: 10 }} tickMargin={8} />
                <YAxis yAxisId="work" width={36} tick={{ fill: "#8f9eb4", fontSize: 10 }} />
                <YAxis
                  yAxisId="load"
                  orientation="right"
                  domain={[0, 100]}
                  unit="%"
                  width={36}
                  tick={{ fill: "#8f9eb4", fontSize: 10 }}
                />
                <Tooltip
                  formatter={(value, name) => {
                    const numeric = numericValue(value);
                    if (name === "Load Index") {
                      return [`${numeric.toFixed(1)}%`, name];
                    }
                    return [numeric.toFixed(1), name];
                  }}
                  contentStyle={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: 8 }}
                  labelStyle={{ color: "#c8d0db" }}
                />
                <Line yAxisId="work" type="monotone" dataKey="totalFlips" name="Flips" stroke="#3f89ea" strokeWidth={2.1} dot={false} />
                <Line
                  yAxisId="work"
                  type="monotone"
                  dataKey="totalResidual"
                  name="Residual Weight"
                  stroke="#f0982f"
                  strokeWidth={2.1}
                  dot={false}
                />
                <Line
                  yAxisId="load"
                  type="monotone"
                  dataKey="loadIndex"
                  name="Load Index"
                  stroke="#e25564"
                  strokeWidth={1.9}
                  strokeDasharray="5 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="ops-context-hint">
          Decoder intervention charts appear after a scientific run returns measured intervention rows.
        </div>
      )}

      <div className="ops-log-head">
        <span>Live Event Stream</span>
        <span>{mode === "api" ? "Live API" : "Mock Feed"}</span>
      </div>
      <div className="ops-log-stream">
        {opsLiveEvents.map((event, index) => (
          <div key={event.id} className={`ops-log-item level-${event.level} ${index === 0 ? "is-current" : ""}`}>
            <span className="ops-log-led" />
            <span className="ops-log-msg">{event.text}</span>
            <span className="ops-log-meta">{event.tag}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const rightRailHost = typeof document !== "undefined" ? document.getElementById("app-right-rail") : null;
  const circuitDesignProviderFamily: CircuitProviderFamily = pendingCircuitLaunch
    ? resolveProviderFamily(pendingCircuitLaunch.provider)
    : launchProvider
      ? resolveProviderFamily(launchProvider)
      : "unknown";
  const backendStatusRail = (
    <div className="workflow-section workflow-section-compact decoder-rail-backend-status">
      <div className="section-title">Backend Status</div>
      <div className="panel-subtitle">API fields and active scope. Scientific evidence remains in the main summary.</div>
      <div className="rail-status-grid">
        <section className="rail-status-card">
          <div className="panel-title">Platform</div>
          <div className="panel-subtitle">Backend health</div>
          <div className="rail-status-row">
            <span>Status</span>
            <strong>
              {systemOff
                ? "Off"
                : isApi && healthQuery.isError
                  ? "API unreachable"
                  : isApi && healthQuery.isLoading
                    ? "Loading"
                    : healthData?.status ?? "Unavailable"}
            </strong>
          </div>
          <div className="rail-status-row">
            <span>Uptime</span>
            <strong>{systemOff ? "0s" : healthData ? `${uptimeSeconds.toLocaleString()}s` : "—"}</strong>
          </div>
          <div className="rail-status-row">
            <span>Probe</span>
            <strong>
              {systemOff
                ? "0ms"
                : healthProbeLatencyMs !== null
                  ? `${healthProbeLatencyMs}ms`
                  : isApi && healthQuery.isLoading
                    ? "Probing..."
                    : "—"}
            </strong>
          </div>
          <div className="rail-status-row">
            <span>Version</span>
            <strong>{systemOff ? "—" : healthData?.version ?? (isApi ? "—" : "v0.1.0")}</strong>
          </div>
        </section>

        <section className="rail-status-card">
          <div className="panel-title">Scope</div>
          <div className="panel-subtitle">Active public run context</div>
          <div className="rail-status-row">
            <span>Providers</span>
            <strong>{workspaceProviderRatio}</strong>
          </div>
          <div className="rail-status-row">
            <span>Queued Jobs</span>
            <strong>{queuedJobsCount}</strong>
          </div>
          <div className="rail-status-row">
            <span>Active Runs</span>
            <strong>{activeRunsCount}</strong>
          </div>
          <div className="rail-status-row">
            <span>Payload</span>
            <strong>{formatBytes(scopePayloadBytes)}</strong>
          </div>
          <div className="rail-status-row">
            <span>Architecture</span>
            <strong>{hardwareMix.length > 0 ? hardwareMix[0].label : "Unknown"}</strong>
          </div>
        </section>

        <section className="rail-status-card">
          <div className="panel-title-row">
            <div>
              <div className="panel-title">Activity</div>
              <div className="panel-subtitle">Runtime events</div>
            </div>
            <span className={`status-badge ${hasActiveScientificContext ? "status-running" : "status-warning"}`}>
              ● {hasActiveScientificContext ? (mode === "api" ? "Live API" : "GKP Mock") : "Standby"}
            </span>
          </div>
          <div className="rail-activity-list">
            {activityFeed.map((item, index) => (
              <div key={`rail-${item.text}-${index}`} className="activity-item">
                <span className={`activity-dot ${item.tone}`} />
                <span className="activity-text">{item.text}</span>
                <span className="activity-time">{item.time}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
  const liveConsoleRail = (
    <div className="decoder-live-rail">
      <div className="workflow-section workflow-section-compact">
        <div className="section-title">Live Console</div>
        <div className="panel-subtitle">Realtime decoder stream for scientific context.</div>
        <button
          className="btn btn-secondary scientific-console-toggle"
          onClick={() => setShowLiveConsole((current) => !current)}
        >
          {showLiveConsole ? <ChevronUp size={13} aria-hidden="true" /> : <ChevronDown size={13} aria-hidden="true" />}
          <span>{showLiveConsole ? "Hide Live Console" : "Show Live Console"}</span>
        </button>
        {showLiveConsole ? (
          renderInterpretationPanel()
        ) : (
            <div className="scientific-muted-note">Live console hidden.</div>
        )}
      </div>
      {backendStatusRail}
    </div>
  );

  return (
    <>
      <div className="dashboard-top-stack">
        <div className="header dashboard-header">
          <div>
            <h1>LiDMaS+ Decoder</h1>
            <p>Scientific decoder instrument for logical correction</p>
          </div>
          <div className={healthBadgeClass}>● {healthBadgeLabel}</div>
        </div>

        <div className="trust-strip">
          <div className="trust-item">
            <span>Simulator / Backend</span>
            <strong>{heroSimulatorLabel}</strong>
          </div>
          <div className="trust-item">
            <span>Run / Session</span>
            <strong>Run {activeRunShortId} · Session {activeSessionShortId}</strong>
          </div>
          <div className="trust-item">
            <span>Mode</span>
            <strong>Scientific</strong>
          </div>
          <div className="trust-item">
            <span>Recommended Decoder</span>
            <strong>{activeDecoderHeaderLabel}</strong>
          </div>
          <div className="trust-item">
            <span>Data Source / Exactness</span>
            <strong>
              {systemOff
                ? "Off"
                : !systemArmed || !hasActiveScientificContext
                  ? "Standby"
                  : mode === "api"
                    ? "Live API"
                    : "GKP Mock"} · {scientificExactnessLabel}
            </strong>
          </div>
          <div className="trust-item">
            <span>Last Refresh</span>
            <strong>{systemOff ? "off" : !systemArmed || !hasActiveScientificContext ? "standby" : formatAgo(dataUpdatedAt)}</strong>
          </div>
          <div className="trust-item">
            <span>Exactness Notes</span>
            <strong>{scientificMissingSignalsLabel}</strong>
          </div>
        </div>

        <div className="dashboard-filterbar decoder-top-controls">
          <div className="filter-group">
            <label>Time Range</label>
            <select
              className="select-field research-select"
              value={timeRangeFilter}
              onChange={(event) => setFilterParam("range", event.target.value, "1h")}
            >
              <option value="1h">Last 1h</option>
              <option value="6h">Last 6h</option>
              <option value="24h">Last 24h</option>
              <option value="7d">Last 7d</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Simulator</label>
            <select
              className="select-field research-select"
              value={providerFilter}
              onChange={(event) => setFilterParam("provider", event.target.value, "all")}
            >
              <option value="all">Choose Simulator</option>
              {simulatorCatalogData.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group decoder-top-actions">
            <label>Actions</label>
            <div className="decoder-inline-actions">
              <SessionLauncherButton
                launchStatus={launcherStatus}
                onStartScientific={handleStartScientificSession}
                onOpenBenchmark={handleOpenBenchmarkDialog}
                onOpenReplay={handleOpenReplayDialog}
                onStopSession={handleStopSession}
                onViewRun={handleViewRun}
                canViewRun={Boolean(activeRunId)}
                scientificDisabledReason={scientificSessionUnavailableReason}
                benchmarkDisabledReason={benchmarkMenuDisabledReason}
                replayDisabledReason={replaySessionUnavailableReason}
                showIngestingChip={sessionRunning && scientificState.state === "INGESTING"}
              />
              <button className="btn btn-secondary decoder-inline-btn" onClick={() => navigate("/decoder/telemetry")}>
                <Activity size={13} aria-hidden="true" />
                <span>Telemetry</span>
              </button>
              <button className="btn btn-secondary decoder-inline-btn" onClick={() => navigate("/decoder/validation")}>
                <ShieldCheck size={13} aria-hidden="true" />
                <span>Validation</span>
              </button>
              <button className="btn btn-secondary decoder-inline-btn" onClick={() => navigate("/decoder/logs")}>
                <Activity size={13} aria-hidden="true" />
                <span>Logs</span>
              </button>
              <button className={`decoder-inline-btn btn ${systemOff ? "btn-status-warning" : "btn-status-failed"}`} onClick={handleSystemOff}>
                <Power size={13} aria-hidden="true" />
                <span>{systemOff ? "On" : "Off"}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="scope-meta">
          Scope: {providerCount} simulator backends, {jobsCount} jobs, {runsCount} runs. Active backend: {activeProviderName}.
          {" "}Launch simulator state: {providerOperationalStateText}.
          {usingWarmupTelemetry ? (
            <span className="decoder-action-feedback decoder-action-feedback-info">
              {" "}
              Session is warming up. Showing provisional telemetry until the first exact replay frames arrive.
            </span>
          ) : null}
          {quickLaunchMessage ? (
            <span className={`decoder-action-feedback decoder-action-feedback-${quickLaunchTone}`}>
              {" "}
              {quickLaunchMessage}
            </span>
          ) : null}
        </div>
        {activeRunId ? (
          <div className="session-link-cta">
            <button className="btn btn-secondary btn-small" onClick={handleViewRun}>
              View Run
            </button>
            <button className="btn btn-secondary btn-small" onClick={handleOpenTelemetryForRun}>
              Open Telemetry
            </button>
            <button className="btn btn-secondary btn-small" onClick={handleOpenValidationForRun}>
              Open Validation
            </button>
            <button className="btn btn-secondary btn-small" onClick={() => navigate("/decoder/logs")}>
              Open Logs
            </button>
          </div>
        ) : null}
      </div>

      <section className="public-run-envelope">
        <div className="public-run-envelope-head">
          <div>
            <div className="section-title">Public Run Envelope</div>
            <div className="panel-subtitle">
              Render-safe public sessions for circuit construction, noise injection, syndrome extraction, and decoder comparison.
            </div>
          </div>
          <span className={`public-run-status public-run-status-${publicRunEnvelopeTone}`}>
            {publicRunEnvelopeLabel}
          </span>
        </div>
        <div className="public-run-budget-grid">
          {publicRunBudgetRows.map((row) => (
            <div key={row.key} className="public-run-budget-card">
              <div className="public-run-budget-meta">
                <span>{row.label}</span>
                <strong>
                  {formatBudgetValue(row.value)} / {formatBudgetValue(row.limit)}
                </strong>
              </div>
              <div className="public-run-budget-track" aria-hidden="true">
                <span
                  className={row.value != null && row.value > row.limit ? "is-over" : ""}
                  style={{ width: `${budgetFillPercent(row.value, row.limit)}%` }}
                />
              </div>
              <div className="public-run-budget-note">{row.note}</div>
            </div>
          ))}
        </div>
        <div className="public-run-envelope-note">{publicRunEnvelopeNote}</div>
      </section>

      <section className="research-summary-surface">
        <div className="section-title">Scientific Summary</div>
        <div className="panel-subtitle">Exact scientific decoder metrics for the selected run and decoder.</div>
        <div className="scientific-metrics-layout">
          <div className="kpi-grid scientific-primary-grid">
            {scientificPrimaryCards.map(({ key, contract }) => (
              <ScientificMetricCard
                key={key}
                contract={contract}
                result={scientificState}
                value={scientificCardValues[key]}
                tooltip={scientificCardTooltips[key]}
                forceVisible={scientificZeroBaseline}
                zeroBaseline={scientificZeroBaseline}
              />
            ))}
          </div>

          <div className="table-container scientific-detail-container">
            <div className="table-wrapper">
              <div className="section-title">Scientific Detail</div>
              <div className="panel-subtitle">Secondary exact counts and state-aware availability reasons.</div>
              <div className="scientific-detail-list">
                {scientificSecondaryCards.map(({ key, contract, availability }) => (
                  <div
                    key={key}
                    className={`scientific-detail-row ${availability.available || scientificZeroBaseline ? "" : "is-unavailable"}`}
                  >
                    <span>{contract.label}</span>
                    <strong>
                      {availability.available || scientificZeroBaseline
                        ? scientificCardValues[key]
                        : `${contract.label} unavailable — ${availability.availabilityReason}`}
                    </strong>
                  </div>
                ))}
                <div className="scientific-detail-row">
                  <span>Decoder policy readout</span>
                  <strong>{hasActiveScientificContext ? `${decoderLabel(activeDecoder)} selected in scientific mode` : "Awaiting run"}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="scientific-figures-section">
          <div className="scientific-figures-head">
            <div>
              <div className="section-title">Scientific Evidence</div>
              <div className="panel-subtitle">
                Plots and exact counters from the selected simulator run. Values stay empty until a circuit session returns data.
              </div>
            </div>
            <span className="scientific-figures-source">
              {hasActiveScientificContext ? "Exact run evidence" : "Awaiting run"}
            </span>
          </div>

          <div className="scientific-figure-grid">
            <article className="scientific-figure-card scientific-figure-card-wide">
              <div className="scientific-figure-card-head">
                <span>Decoder comparison</span>
                <strong>Decoder policy ranking</strong>
              </div>
              <div className="scientific-decoder-plot">
                {decoderFigureRows.length > 0 ? (
                  <>
                    <div className="scientific-decoder-chart">
                      <ResponsiveContainer width="100%" height={218}>
                        <LineChart data={decoderFigureRows} margin={{ top: 10, right: 18, left: 0, bottom: 12 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis
                            dataKey="label"
                            tick={{ fill: "#8f9eb4", fontSize: 10 }}
                            axisLine={{ stroke: "rgba(255,255,255,0.14)" }}
                            tickLine={false}
                          />
                          <YAxis
                            width={42}
                            unit="%"
                            tick={{ fill: "#8f9eb4", fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            formatter={(value, name) => {
                              const numeric = numericValue(value);
                              return [`${numeric.toFixed(3)}%`, name];
                            }}
                            contentStyle={{ background: "#0f0f0f", border: "1px solid #242a31", borderRadius: 8 }}
                            labelStyle={{ color: "#c8d0db" }}
                          />
                          <Line
                            type="monotone"
                            dataKey="lerPct"
                            name="Logical error"
                            stroke="#4a90ff"
                            strokeWidth={2.4}
                            dot={{ r: 3, fill: "#4a90ff", strokeWidth: 0 }}
                            activeDot={{ r: 5 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="residualPct"
                            name="Residual syndrome"
                            stroke="#35c6ac"
                            strokeWidth={2.4}
                            dot={{ r: 3, fill: "#35c6ac", strokeWidth: 0 }}
                            activeDot={{ r: 5 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="scientific-decoder-legend" aria-label="Decoder policy ranking values">
                      {decoderFigureRows.map((row, index) => (
                        <div key={`figure-decoder-${row.key}`} className="scientific-decoder-legend-row">
                          <span>{index + 1}</span>
                          <strong>{row.label}</strong>
                          <small>{row.lerPct.toFixed(3)}% LER</small>
                          <small>{row.residualPct.toFixed(2)}% residual</small>
                          <small>{row.flips.toFixed(2)} flips</small>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="scientific-figure-empty">
                    Run a circuit session to rank MWPM, Union-Find, and BP from exact decoder counters.
                  </div>
                )}
              </div>
            </article>

            <article className="scientific-figure-card">
              <div className="scientific-figure-card-head">
                <span>Error rates</span>
                <strong>Error evidence</strong>
              </div>
              <div className="scientific-evidence-plot">
                {exactEvidenceRows.map((row) => (
                  <div key={`evidence-${row.label}`} className={`scientific-evidence-row tone-${row.tone}`} title={row.formula}>
                    <div className="scientific-evidence-label">
                      <span>{row.label}</span>
                      <strong>{formatFigurePercent(row.value, row.label === "Residual syndrome" ? 2 : 4)}</strong>
                    </div>
                    <div className="scientific-evidence-track" aria-hidden="true">
                      <span style={{ width: `${row.value == null ? 0 : clamp((row.value / maxEvidencePercent) * 100, 3, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="scientific-figure-card">
              <div className="scientific-figure-card-head">
                <span>Resource counts</span>
                <strong>QEC resource envelope</strong>
              </div>
              <div className="scientific-resource-plot">
                {resourceFigureRows.map((row) => (
                  <div key={`resource-${row.label}`} className="scientific-resource-row">
                    <span>{row.label}</span>
                    <strong>{formatBudgetValue(row.value)}</strong>
                    <div className="scientific-resource-track" aria-hidden="true">
                      <span style={{ width: `${budgetFillPercent(row.value, row.limit)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="scientific-figure-card">
              <div className="scientific-figure-card-head">
                <span>Physical telemetry</span>
                <strong>Physical-noise readout</strong>
              </div>
              {physicalNoiseData.length > 0 ? (
                <>
                  <div className="scientific-noise-chart">
                    <ResponsiveContainer width="100%" height={188}>
                      <LineChart data={physicalNoiseData} margin={{ top: 8, right: 14, left: 0, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis
                          dataKey="round"
                          tick={{ fill: "#8f9eb4", fontSize: 10 }}
                          axisLine={{ stroke: "rgba(255,255,255,0.14)" }}
                          tickLine={false}
                        />
                        <YAxis
                          yAxisId="pct"
                          width={40}
                          unit="%"
                          tick={{ fill: "#8f9eb4", fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis yAxisId="sigma" orientation="right" hide />
                        <Tooltip
                          formatter={(value, name) => {
                            const numeric = numericValue(value);
                            if (name === "Displacement sigma") {
                              return [numeric.toFixed(4), name];
                            }
                            return [`${numeric.toFixed(3)}%`, name];
                          }}
                          contentStyle={{ background: "#0f0f0f", border: "1px solid #242a31", borderRadius: 8 }}
                          labelStyle={{ color: "#c8d0db" }}
                        />
                        <Line
                          yAxisId="pct"
                          type="monotone"
                          dataKey="physicalErrorPct"
                          name="Telemetry PER"
                          stroke="#e25564"
                          strokeWidth={2.2}
                          dot={false}
                        />
                        <Line
                          yAxisId="pct"
                          type="monotone"
                          dataKey="photonLossPct"
                          name="Photon loss"
                          stroke="#f0982f"
                          strokeWidth={2.2}
                          dot={false}
                        />
                        <Line
                          yAxisId="sigma"
                          type="monotone"
                          dataKey="displacementSigma"
                          name="Displacement sigma"
                          stroke="#4a90ff"
                          strokeWidth={2.2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="scientific-noise-dials scientific-noise-dials-compact">
                    {noiseFigureRows.map((row) => (
                      <div key={`noise-${row.label}`} className="scientific-noise-dial">
                        <span>{row.label}</span>
                        <strong>
                          {row.value == null
                            ? "Awaiting run"
                            : `${row.value.toFixed(row.unit === "%" ? 3 : 4)}${row.unit}`}
                        </strong>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="scientific-noise-dials">
                  {noiseFigureRows.map((row) => (
                    <div key={`noise-${row.label}`} className="scientific-noise-dial">
                      <span>{row.label}</span>
                      <strong>
                        {row.value == null
                          ? "Awaiting run"
                          : `${row.value.toFixed(row.unit === "%" ? 3 : 4)}${row.unit}`}
                      </strong>
                      <div className="scientific-noise-track" aria-hidden="true">
                        <span style={{ width: `${budgetFillPercent(row.value, row.limit)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="scientific-figure-caption">
                Shown only when the backend returns measured pre-QEC physical-noise samples.
              </p>
            </article>

            <article className="scientific-figure-card">
              <div className="scientific-figure-card-head">
                <span>Run provenance</span>
                <strong>Evidence trail</strong>
              </div>
              <div className="scientific-evidence-trail">
                <div className="scientific-evidence-trail-row">
                  <span>Run</span>
                  <strong>{hasActiveScientificContext && activeRun ? `#${activeRun.id.slice(0, 8).toUpperCase()}` : "Awaiting run"}</strong>
                </div>
                <div className="scientific-evidence-trail-row">
                  <span>Source</span>
                  <strong>{hasActiveScientificContext ? "Live API" : "Awaiting run"}</strong>
                </div>
                <div className="scientific-evidence-trail-row">
                  <span>Recommended decoder</span>
                  <strong>{hasActiveScientificContext ? recommendedDecoderLabel : "Awaiting run"}</strong>
                </div>
                <div className="scientific-evidence-trail-row">
                  <span>Exactness</span>
                  <strong>{hasActiveScientificContext ? scientificMissingSignalsLabel : "Awaiting run"}</strong>
                </div>
                <div className="scientific-evidence-trail-row">
                  <span>Request / response</span>
                  <strong>
                    {hasActiveScientificContext
                      ? `${scientificCardValues.request_line_count} / ${scientificCardValues.response_line_count}`
                      : "Awaiting run"}
                  </strong>
                </div>
              </div>
            </article>
          </div>
        </div>

        {scientificZeroBaseline ? (
          <div className="scientific-muted-note">
            Scientific summary initialized. Values remain zero until a job/run starts and telemetry is ingested.
          </div>
        ) : null}

        {scientificState.state === "PARTIAL" && scientificMissingPrimaryReasons.length > 0 ? (
          <div className="scientific-muted-note">
            {scientificMissingPrimaryReasons.map((reason) => (
              <div key={reason}>{reason}</div>
            ))}
          </div>
        ) : null}

      </section>

      <div className="qec-map-section">
        <div className="qec-map-section-header">
          <div className="qec-map-title-block">
            <div className="section-title">QEC Encoding State Map</div>
            <div className="panel-subtitle">{activeEncodingContextLabel}</div>
          </div>
          <div className="qec-map-controls">
            <div className="qec-map-selector" role="tablist" aria-label="Encoding map selector">
              <button
                className={`qec-map-select-btn ${
                  hasActiveScientificContext && encodingMapMode === "surface" ? "active" : ""
                }`}
                onClick={() => setEncodingMapMode("surface")}
                disabled={!hasActiveScientificContext || activeEncodingMapMode === "gkp"}
                role="tab"
                aria-selected={hasActiveScientificContext && encodingMapMode === "surface"}
              >
                Syndrome
              </button>
              <button
                className={`qec-map-select-btn ${
                  hasActiveScientificContext && encodingMapMode === "gkp" ? "active" : ""
                }`}
                onClick={() => setEncodingMapMode("gkp")}
                disabled={!hasActiveScientificContext || activeEncodingMapMode === "surface"}
                role="tab"
                aria-selected={hasActiveScientificContext && encodingMapMode === "gkp"}
              >
                GKP
              </button>
            </div>
            {encodingMapMode === "surface" && activeCircuitQecCode === "surface" ? (
              <div className="qec-distance-controls" role="group" aria-label="Outer code distance selector">
                <span className="qec-distance-label">Distance</span>
                <div className="qec-distance-selector">
                  {[3, 5, 7].map((distance) => (
                    <button
                      key={`outer-distance-${distance}`}
                      className={`qec-distance-btn ${outerCodeDistance === distance ? "active" : ""}`}
                      onClick={() => setFilterParam("outerDistance", String(distance), "3")}
                      title={`Set outer code distance to d=${distance}`}
                    >
                      d={distance}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <div className="qec-map-layout">
          <section className="qec-map-panel">
            <div className="qec-map-head">
              <div>
                <div className="monitoring-chart-title">{qecMapHeading}</div>
                <div className="panel-subtitle">{qecMapSubtitle}</div>
              </div>
              <span className={`status-badge ${streamingStatusClass}`}>
                ● {extractionStatusLabel}
              </span>
            </div>

            {encodingMapMode === "surface" && latestRoundSyndromes.length > 0 ? (
              <div className="qec-map-board">
                <svg
                  className="qec-map-svg"
                  viewBox="0 0 620 340"
                  role="img"
                  aria-label="QEC lattice map with active syndrome indicators"
                >
                  {qecLattice.edges.map((edge) => (
                    <line
                      key={edge.key}
                      className="qec-map-edge"
                      x1={edge.x1}
                      y1={edge.y1}
                      x2={edge.x2}
                      y2={edge.y2}
                    />
                  ))}
                  {qecPointerNodes.map((node) => {
                    const bubbleX = Math.min(548, node.x + 16);
                    const bubbleY = Math.max(16, node.y - 22);
                    return (
                      <g
                        key={`pointer-${node.key}`}
                        className={`qec-map-pointer ${syndromeExtractionActive ? "is-live" : ""}`}
                      >
                        <line x1={node.x + 7} y1={node.y - 7} x2={bubbleX} y2={bubbleY + 6} />
                        <rect x={bubbleX - 2} y={bubbleY - 4} rx={4} ry={4} width={44} height={16} />
                        <text x={bubbleX + 20} y={bubbleY + 8} textAnchor="middle">
                          {node.label}
                        </text>
                      </g>
                    );
                  })}
                  {qecLattice.nodes.map((node) => (
                    <g key={`node-${node.key}`} transform={`translate(${node.x}, ${node.y})`}>
                      <circle
                        className={`qec-map-node-core ${node.triggered ? "is-triggered" : "is-stable"} ${
                          node.triggered && syndromeExtractionActive ? "is-blinking" : ""
                        }`}
                        r={10}
                      />
                      <circle
                        className={`qec-map-node-ring ${node.triggered ? "is-triggered" : "is-stable"} ${
                          node.triggered && syndromeExtractionActive ? "is-blinking" : ""
                        }`}
                        r={16}
                      />
                      <text className="qec-map-node-label" y={27} textAnchor="middle">
                        {node.label}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            ) : null}

            {encodingMapMode === "surface" && latestRoundSyndromes.length === 0 ? (
              <div className="empty-card">
                {!hasActiveScientificContext
                  ? "No encoding map is active. Choose a simulator, build a circuit, select a QEC code, then start the session."
                  : telemetryInitializing
                  ? "Scientific session started. Waiting for first syndrome telemetry batch from replay."
                  : "No syndrome extraction stream found for the active run. Start a run with telemetry to render the lattice map."}
              </div>
            ) : null}

            {encodingMapMode === "gkp" && gkpOscillatorMapPoints.length > 0 ? (
              <div className="qec-map-board">
                <svg className="qec-map-svg" viewBox="0 0 620 340" role="img" aria-label="GKP oscillator phase map">
                  <line className="gkp-map-axis" x1={74} y1={170} x2={546} y2={170} />
                  <line className="gkp-map-axis" x1={310} y1={44} x2={310} y2={296} />
                  <rect className="gkp-map-boundary" x={74} y={44} width={472} height={252} rx={10} ry={10} />
                  <text className="gkp-map-axis-label" x={548} y={164}>
                    +q
                  </text>
                  <text className="gkp-map-axis-label" x={314} y={52}>
                    +p
                  </text>
                  <text className="gkp-map-axis-label" x={84} y={188}>
                    -q
                  </text>
                  <text className="gkp-map-axis-label" x={314} y={292}>
                    -p
                  </text>

                  {gkpPointerPoints.map((point) => {
                    const bubbleX = Math.min(542, point.x + 14);
                    const bubbleY = Math.max(18, point.y - 18);
                    return (
                      <g key={`gkp-pointer-${point.key}`} className="gkp-map-pointer">
                        <line x1={point.x + 6} y1={point.y - 6} x2={bubbleX} y2={bubbleY + 4} />
                        <rect x={bubbleX - 2} y={bubbleY - 4} rx={4} ry={4} width={56} height={16} />
                        <text x={bubbleX + 26} y={bubbleY + 8} textAnchor="middle">
                          {point.mode}
                        </text>
                      </g>
                    );
                  })}

                  {gkpOscillatorMapPoints.map((point) => (
                    <g key={point.key} transform={`translate(${point.x}, ${point.y})`}>
                      <circle
                        className={`gkp-map-point ${point.flagged ? "is-flagged" : "is-stable"} ${
                          point.flagged && syndromeExtractionActive ? "is-blinking" : ""
                        }`}
                        r={point.flagged ? 4.8 : 3.6}
                      />
                    </g>
                  ))}
                </svg>
              </div>
            ) : null}

            {encodingMapMode === "gkp" && gkpOscillatorMapPoints.length === 0 ? (
              <div className="empty-card">
                No raw GKP oscillator state telemetry was found. Add `gkp_oscillator_states` in run telemetry to
                visualize direct phase-space states.
              </div>
            ) : null}
          </section>

          <aside className="qec-map-metrics">
            <div className="qec-map-rail-header">
              <span>Evidence Rail</span>
              <strong>{encodingMapMode === "surface" ? "Syndrome readout" : "Oscillator readout"}</strong>
            </div>
            {encodingMapMode === "surface" ? (
              <>
                <div className="qec-map-metric-card">
                  <span>Stabilizers Tracked</span>
                  <strong>
                    {qecTrackedTotal} / {qecStabilizerTotal}
                  </strong>
                </div>
                <div className="qec-map-metric-card">
                  <span>Triggered This Round</span>
                  <strong>{qecTriggeredNodes.length}</strong>
                </div>
                <div className="qec-map-metric-card">
                  <span>Triggered Density</span>
                  <strong>{qecTriggeredPct.toFixed(1)}%</strong>
                </div>
                <div className="qec-map-metric-card">
                  <span>Extraction State</span>
                  <strong>{systemOff ? "Off" : syndromeExtractionActive ? "Running" : "Idle"}</strong>
                </div>
                <div className="qec-map-alerts">
                  <div className="qec-map-alerts-title">Active Syndrome Pointers</div>
                  {qecTriggeredNodes.length === 0 ? (
                    <div className="qec-map-alert-empty">No triggered syndrome checks in the latest round.</div>
                  ) : (
                    qecTriggeredNodes.slice(0, 12).map((node) => (
                      <div key={`alert-${node.key}`} className="qec-map-alert-item">
                        <span className="qec-map-alert-key">{node.label}</span>
                        <span className="qec-map-alert-value">value {node.value}</span>
                      </div>
                    ))
                  )}
                </div>
                {qecMapTrimmed ? (
                  <div className="qec-map-trim-note">Map view capped to first 64 stabilizers for readability.</div>
                ) : null}
              </>
            ) : (
              <>
                <div className="qec-map-metric-card">
                  <span>Oscillator Modes</span>
                  <strong>{gkpModesTracked}</strong>
                </div>
                <div className="qec-map-metric-card">
                  <span>Flagged States</span>
                  <strong>{gkpFlaggedPoints.length}</strong>
                </div>
                <div className="qec-map-metric-card">
                  <span>Mean Variance</span>
                  <strong>{gkpVarianceAvg.toFixed(4)}</strong>
                </div>
                <div className="qec-map-metric-card">
                  <span>Mean Energy</span>
                  <strong>{gkpEnergyAvg.toFixed(4)}</strong>
                </div>
                <div className="qec-map-metric-card">
                  <span>Phase Range</span>
                  <strong>±{gkpAxisLimit.toFixed(1)}</strong>
                </div>
                <div className="qec-map-alerts">
                  <div className="qec-map-alerts-title">Flagged Oscillator States</div>
                  {gkpFlaggedPoints.length === 0 ? (
                    <div className="qec-map-alert-empty">No flagged oscillator states in current telemetry.</div>
                  ) : (
                    gkpFlaggedPoints.slice(0, 12).map((point) => (
                      <div key={`gkp-alert-${point.key}`} className="qec-map-alert-item">
                        <span className="qec-map-alert-key">{point.mode}</span>
                        <span className="qec-map-alert-value">
                          q {point.q.toFixed(3)}, p {point.p.toFixed(3)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
                {gkpOscillatorFallback ? (
                  <div className="qec-map-trim-note">
                    Raw oscillator stream unavailable: displaying projection derived from physical telemetry.
                  </div>
                ) : null}
              </>
            )}
          </aside>
        </div>
      </div>

      <div className="monitoring-section">
        <div className="section-title">Physical Noise & Realtime Monitor</div>
        <div className={`monitoring-layout ${isPhysicalPanelCollapsed ? "collapsed" : ""}`}>
          <section className={`monitoring-left-panel ${isPhysicalPanelCollapsed ? "collapsed" : ""}`}>
            <div className="monitoring-panel-head">
              <div className="monitoring-chart-title">Physical Channel Noise (Pre-QEC)</div>
              <button
                className="panel-collapse-btn"
                onClick={() => setPhysicalPanelCollapsed((current) => !current)}
              >
                {isPhysicalPanelCollapsed ? "Expand" : "Collapse"}
              </button>
            </div>

            {isPhysicalPanelCollapsed ? (
              <div className="panel-collapsed-content">
                <span>Avg telemetry PER</span>
                <strong>{perValue !== null ? `${perValue.toFixed(3)}%` : "N/A"}</strong>
              </div>
            ) : (
              <>
                {physicalNoiseLoading ? (
                  <div className="empty-card">Loading physical noise telemetry from backend...</div>
                ) : null}
                {telemetryUnavailableForRun || telemetryInitializing ? (
                  <div className="empty-card">
                    {telemetryInitializing
                      ? "Scientific session started. Waiting for first physical-noise batch from replay."
                      : "No physical telemetry has been ingested for this run yet. Start or resume a scientific session to stream pre-QEC physical noise."}
                  </div>
                ) : null}
                {physicalNoiseError ? (
                  <div className="empty-card">Failed to load physical noise telemetry from backend.</div>
                ) : null}
                {!physicalNoiseLoading && !physicalNoiseError && physicalNoiseData.length > 0 ? (
                  <div className="visualization-area">
                    <div className="physical-chart-meta">
                      <span>Latest sample: QEC round {latestPhysicalPoint ? latestPhysicalPoint.round : "N/A"}</span>
                      <span
                        className={`physical-chart-threshold ${
                          perValue !== null && perValue >= anomalyThresholds.perWarn ? "is-breach" : "is-ok"
                        }`}
                      >
                        PER warning threshold {anomalyThresholds.perWarn.toFixed(1)}%
                      </span>
                    </div>
                    <div className="physical-chart-legend" role="list" aria-label="Physical channel signals">
                      {PHYSICAL_LEGEND_SIGNALS.map((signal) => (
                        <span key={signal.id} className="physical-chart-legend-item" role="listitem">
                          <span className="physical-chart-legend-icon" style={{ backgroundColor: signal.color }}>
                            <span className="physical-chart-legend-dot" style={{ borderColor: signal.color }} />
                          </span>
                          <span>{signal.label}</span>
                          <strong className="physical-chart-legend-value">{signal.format(latestPhysicalPoint)}</strong>
                        </span>
                      ))}
                    </div>
                    <ResponsiveContainer width="100%" height={360}>
                      <LineChart
                        data={physicalNoiseData}
                        margin={{ top: 12, right: 20, left: 12, bottom: 18 }}
                        onClick={handlePhysicalDrilldown}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
                        <XAxis
                          dataKey="round"
                          tick={{ fill: "#8f9eb4", fontSize: 10 }}
                          label={{ value: "QEC Round", position: "insideBottom", offset: -6, fill: "#8f9eb4", fontSize: 10 }}
                        />
                        <YAxis
                          yAxisId="pct"
                          domain={[0, physicalPctCeiling]}
                          width={44}
                          tickCount={6}
                          tick={{ fill: "#8f9eb4", fontSize: 10 }}
                          unit="%"
                          label={{ value: "Error / Loss (%)", angle: -90, position: "insideLeft", fill: "#8f9eb4", fontSize: 10 }}
                        />
                        <YAxis
                          yAxisId="sigma"
                          domain={[0, physicalSigmaCeiling]}
                          orientation="right"
                          width={44}
                          tickCount={6}
                          tick={{ fill: "#8f9eb4", fontSize: 10 }}
                          label={{ value: "Sigma", angle: 90, position: "insideRight", fill: "#8f9eb4", fontSize: 10 }}
                        />
                        <Tooltip
                          formatter={(value, name) => {
                            const numeric = numericValue(value);
                            if (name === "Displacement Sigma") {
                              return [numeric.toFixed(4), "Displacement Sigma"];
                            }
                            return [`${numeric.toFixed(3)}%`, name];
                          }}
                          contentStyle={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: 8 }}
                          labelStyle={{ color: "#c8d0db" }}
                        />
                        <ReferenceArea
                          yAxisId="pct"
                          y1={anomalyThresholds.perWarn}
                          y2={physicalPctCeiling}
                          fill="rgba(226,85,100,0.12)"
                        />
                        <ReferenceLine
                          yAxisId="pct"
                          y={anomalyThresholds.perWarn}
                          stroke="#e25564"
                          strokeDasharray="4 4"
                          strokeOpacity={0.7}
                        />
                        <Line
                          yAxisId="pct"
                          type="monotone"
                          dataKey="physicalErrorPct"
                          name="Telemetry PER (%)"
                          stroke="#e25564"
                          strokeWidth={2.2}
                          dot={false}
                        />
                        <Line
                          yAxisId="pct"
                          type="monotone"
                          dataKey="photonLossPct"
                          name="Photon Loss Rate (%)"
                          stroke="#f0982f"
                          strokeWidth={2.2}
                          dot={false}
                        />
                        <Line
                          yAxisId="sigma"
                          type="monotone"
                          dataKey="displacementSigma"
                          name="Displacement Sigma"
                          stroke="#3f89ea"
                          strokeWidth={2.2}
                          dot={false}
                        />
                        {physicalAnomalies.slice(0, 14).map((point) => (
                          <ReferenceDot
                            key={`physical-anomaly-${point.round}`}
                            yAxisId="pct"
                            x={point.round}
                            y={point.physicalErrorPct}
                            r={3}
                            fill="#e25564"
                            stroke="none"
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : null}
                {!physicalNoiseLoading &&
                !physicalNoiseError &&
                !telemetryUnavailableForRun &&
                !telemetryInitializing &&
                physicalNoiseData.length === 0 ? (
                  <div className="empty-card">
                    Physical noise is captured before QEC and can be visualized directly when telemetry exists.
                  </div>
                ) : null}
              </>
            )}
          </section>

	          <section className="monitoring-right-panel">
	            <div className="monitoring-right-head">
	              <div className="monitoring-chart-title">Real-Time Decoder Monitor</div>
	              {!isApi ? (
	                <div className="monitor-compare-controls">
	                  <div className="filter-group">
	                    <label>Compare Mode</label>
	                    <button
	                      className={`btn btn-secondary monitor-compare-toggle ${compareMode ? "active" : ""}`}
	                      onClick={() => setFilterParam("compare", compareMode ? "0" : "1", "0")}
	                    >
	                      {compareMode ? "Enabled" : "Disabled"}
	                    </button>
	                  </div>
	                  <div className="filter-group">
	                    <label>Compare Decoder</label>
	                    <select
	                      className="select-field research-select"
	                      value={compareDecoder}
	                      onChange={(event) => setFilterParam("compareDecoder", event.target.value, fallbackCompareDecoder)}
	                      disabled={!compareMode}
	                    >
	                      {PUBLIC_DECODERS.filter((decoder) => decoder.key !== activeDecoder).map((decoder) => (
	                        <option key={decoder.key} value={decoder.key}>
	                          {decoder.label}
	                        </option>
	                      ))}
	                    </select>
	                  </div>
	                </div>
	              ) : null}
	            </div>

	            {!isApi ? (
	              <div className="metric-buttons">
	                <button className={`metric-btn ${activeChart === "noise" ? "active" : ""}`} onClick={() => setActiveChart("noise")}>
	                  Noise Level
	                </button>
	                <button className={`metric-btn ${activeChart === "success" ? "active" : ""}`} onClick={() => setActiveChart("success")}>
	                  Success Rate
	                </button>
	                <button className={`metric-btn ${activeChart === "error" ? "active" : ""}`} onClick={() => setActiveChart("error")}>
	                  Error Rate
	                </button>
	                <button className={`metric-btn ${activeChart === "latency" ? "active" : ""}`} onClick={() => setActiveChart("latency")}>
	                  Latency Trend
	                </button>
	              </div>
	            ) : null}

	            {!isApi ? (
	              <div className="monitoring-chart-title">
	                {chartLabel(activeChart)} · {decoderLabel(activeDecoder)}
	              </div>
	            ) : null}
	            {!isApi && activeDecoderMissingTelemetry ? (
	              <div className="monitor-warning-note">Recommended decoder has no intervention stream in this run.</div>
	            ) : null}
	            {!isApi && compareDecoderMissingTelemetry ? (
	              <div className="monitor-warning-note">Compare decoder has no intervention stream in this run.</div>
	            ) : null}
            {telemetryUnavailableForRun || telemetryInitializing ? (
              <div className="monitor-warning-note">
                {telemetryInitializing
                  ? `Session ${activeSessionShortId} is running. Waiting for first replay telemetry batch for run ${activeRunShortId}.`
                  : `No scientific telemetry is attached to run ${activeRunShortId} yet. Start a session or choose a run with telemetry.`}
              </div>
            ) : null}
            {runTelemetryHardError ? (
              <div className="monitor-warning-note">Failed to load realtime monitor telemetry from backend.</div>
            ) : null}
	            {!isApi && compareMode ? (
	              <div className={`compare-delta ${compareIsGood ? "good" : "bad"}`}>
	                Compare vs {decoderLabel(compareDecoder)}: {formatTrend(compareDelta)}
	              </div>
	            ) : null}
	            <div className="visualization-area">
	              {isApi ? (
                  hasPublicDecoderInterventions ? (
                    <div className="decoder-stream-panel">
                      <div className="decoder-stream-summary">
                        <div>
                          <span>Latest Round</span>
                          <strong>{decoderStreamLatestRound >= 0 ? `R${decoderStreamLatestRound + 1}` : "—"}</strong>
                        </div>
                        <div>
                          <span>Decoders</span>
                          <strong>{decoderStreamDecoderKeys.length}</strong>
                        </div>
                        <div>
                          <span>Total Flips</span>
                          <strong>{decoderStreamTotalFlips.toLocaleString()}</strong>
                        </div>
                        <div>
                          <span>Residual Weight</span>
                          <strong>{decoderStreamResidualWeight.toLocaleString()}</strong>
                        </div>
                      </div>

                      <div className="decoder-stream-legend" aria-label="Decoder stream legend">
                        {decoderStreamDecoderKeys.map((decoderKey) => (
                          <span key={`decoder-stream-legend-${decoderKey}`}>
                            <i style={{ background: DECODER_STREAM_COLORS[decoderKey] }} />
                            {decoderLabel(decoderKey)}
                          </span>
                        ))}
                      </div>

                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart
                          data={decoderStreamChartData}
                          margin={{ top: 8, right: 18, left: 8, bottom: 18 }}
                          onClick={handleDecoderStreamDrilldown}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
                          <XAxis
                            dataKey="roundLabel"
                            tick={{ fill: "#8f9eb4", fontSize: 10 }}
                            tickMargin={8}
                            label={{ value: "QEC Round", position: "insideBottom", offset: -6, fill: "#8f9eb4", fontSize: 10 }}
                          />
                          <YAxis
                            width={52}
                            tick={{ fill: "#8f9eb4", fontSize: 10 }}
                            tickFormatter={(value: number) => `${value.toFixed(0)}%`}
                            label={{ value: "Residual Rate", angle: -90, position: "insideLeft", fill: "#8f9eb4", fontSize: 10 }}
                          />
                          <Tooltip
                            formatter={(value, name) => {
                              const key = String(name).replace("_residual", "") as DecoderKey;
                              return [`${numericValue(value).toFixed(4)}%`, `${decoderLabel(key)} residual`];
                            }}
                            contentStyle={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: 8 }}
                            labelStyle={{ color: "#c8d0db" }}
                          />
                          {decoderStreamDecoderKeys.map((decoderKey) => (
                            <Line
                              key={`decoder-stream-${decoderKey}`}
                              type="monotone"
                              dataKey={`${decoderKey}_residual`}
                              name={`${decoderKey}_residual`}
                              stroke={DECODER_STREAM_COLORS[decoderKey]}
                              strokeWidth={2.4}
                              dot={{ r: 3 }}
                              connectNulls
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>

                      <div className="decoder-stream-table" aria-label="Exact decoder intervention stream">
                        <div className="decoder-stream-row decoder-stream-head">
                          <span>Round</span>
                          <span>Decoder</span>
                          <span>Flips</span>
                          <span>Residual</span>
                          <span>Rate</span>
                        </div>
                        {decoderStreamLatestRows.map((row) => (
                          <div key={row.key} className="decoder-stream-row" title={row.residualFormula}>
                            <span>{row.roundLabel}</span>
                            <strong>{row.decoderName}</strong>
                            <span>{row.flips.toLocaleString()}</span>
                            <span>{row.residualWeight.toLocaleString()}</span>
                            <span>{row.residualRatePct == null ? "—" : `${row.residualRatePct.toFixed(4)}%`}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="empty-card">
                      The realtime decoder stream will populate after the backend returns exact decoder intervention rows.
                    </div>
                  )
	              ) : null}
	              {!isApi && activeChart === "noise" && monitoringHasRows ? (
	                <ResponsiveContainer width="100%" height={360}>
                  <AreaChart
                    data={monitoringData}
                    margin={{ top: 8, right: 16, left: 8, bottom: 18 }}
                    onClick={handleRealtimeDrilldown}
                  >
                    <defs>
                      <linearGradient id="dashboardNoise" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3f89ea" stopOpacity={0.36} />
                        <stop offset="100%" stopColor="#3f89ea" stopOpacity={0.04} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
                    <XAxis
                      dataKey="slot"
                      tick={{ fill: "#8f9eb4", fontSize: 10 }}
                      tickMargin={8}
                      label={{ value: "Time Window", position: "insideBottom", offset: -6, fill: "#8f9eb4", fontSize: 10 }}
                    />
                    <YAxis
                      width={52}
                      tick={{ fill: "#8f9eb4", fontSize: 10 }}
                      tickFormatter={(value: number) => `${(value * 100).toFixed(1)}%`}
                      label={{ value: "Noise Rate (%)", angle: -90, position: "insideLeft", fill: "#8f9eb4", fontSize: 10 }}
                    />
                    <Tooltip
                      formatter={(value) => [`${(numericValue(value) * 100).toFixed(2)}%`, "Noise"]}
                      contentStyle={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: 8 }}
                      labelStyle={{ color: "#c8d0db" }}
                    />
                    <ReferenceArea
                      y1={anomalyThresholds.noiseWarn}
                      y2={anomalyThresholds.noiseCritical}
                      fill="rgba(240,152,47,0.12)"
                    />
                    <ReferenceArea y1={anomalyThresholds.noiseCritical} y2={0.05} fill="rgba(226,85,100,0.1)" />
                    <ReferenceLine
                      y={anomalyThresholds.noiseWarn}
                      stroke="#f0982f"
                      strokeDasharray="4 4"
                      strokeOpacity={0.8}
                    />
                    <Area type="monotone" dataKey="noise" stroke="#3f89ea" strokeWidth={2.4} fill="url(#dashboardNoise)" />
                    {compareMode ? (
                      <Line
                        type="monotone"
                        dataKey="compareNoise"
                        stroke="#8fd0ff"
                        strokeDasharray="5 4"
                        strokeWidth={2}
                        dot={false}
                      />
                    ) : null}
                    {noiseAnomalies.slice(0, 20).map((point) => (
                      <ReferenceDot
                        key={`noise-anomaly-${point.slot}`}
                        x={point.slot}
                        y={point.noise}
                        r={3}
                        fill="#f0982f"
                        stroke="none"
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              ) : null}

	              {!isApi && activeChart === "success" && monitoringHasRows ? (
                <ResponsiveContainer width="100%" height={360}>
                  <LineChart
                    data={monitoringData}
                    margin={{ top: 8, right: 16, left: 8, bottom: 18 }}
                    onClick={handleRealtimeDrilldown}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
                    <XAxis
                      dataKey="slot"
                      tick={{ fill: "#8f9eb4", fontSize: 10 }}
                      tickMargin={8}
                      label={{ value: "Time Window", position: "insideBottom", offset: -6, fill: "#8f9eb4", fontSize: 10 }}
                    />
                    <YAxis
                      domain={[85, 100]}
                      width={52}
                      tick={{ fill: "#8f9eb4", fontSize: 10 }}
                      unit="%"
                      label={{ value: "Success Rate (%)", angle: -90, position: "insideLeft", fill: "#8f9eb4", fontSize: 10 }}
                    />
                    <Tooltip
                      formatter={(value) => [`${numericValue(value).toFixed(2)}%`, "Success"]}
                      contentStyle={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: 8 }}
                      labelStyle={{ color: "#c8d0db" }}
                    />
                    <ReferenceArea y1={0} y2={anomalyThresholds.successWarn} fill="rgba(226,85,100,0.1)" />
                    <ReferenceLine
                      y={anomalyThresholds.successWarn}
                      stroke="#e25564"
                      strokeDasharray="4 4"
                      strokeOpacity={0.8}
                    />
                    <Line type="monotone" dataKey="success" stroke="#26b36b" strokeWidth={2.8} dot={false} />
                    {compareMode ? (
                      <Line
                        type="monotone"
                        dataKey="compareSuccess"
                        stroke="#8fd0ff"
                        strokeDasharray="5 4"
                        strokeWidth={2}
                        dot={false}
                      />
                    ) : null}
                    {successAnomalies.slice(0, 20).map((point) => (
                      <ReferenceDot
                        key={`success-anomaly-${point.slot}`}
                        x={point.slot}
                        y={point.success}
                        r={3}
                        fill="#e25564"
                        stroke="none"
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : null}

	              {!isApi && activeChart === "error" && monitoringHasRows ? (
                <ResponsiveContainer width="100%" height={360}>
                  <LineChart
                    data={monitoringData}
                    margin={{ top: 8, right: 16, left: 8, bottom: 18 }}
                    onClick={handleRealtimeDrilldown}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
                    <XAxis
                      dataKey="slot"
                      tick={{ fill: "#8f9eb4", fontSize: 10 }}
                      tickMargin={8}
                      label={{ value: "Time Window", position: "insideBottom", offset: -6, fill: "#8f9eb4", fontSize: 10 }}
                    />
                    <YAxis
                      domain={[0, 15]}
                      width={52}
                      tick={{ fill: "#8f9eb4", fontSize: 10 }}
                      unit="%"
                      label={{ value: "Error Rate (%)", angle: -90, position: "insideLeft", fill: "#8f9eb4", fontSize: 10 }}
                    />
                    <Tooltip
                      formatter={(value) => [`${numericValue(value).toFixed(2)}%`, "Error"]}
                      contentStyle={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: 8 }}
                      labelStyle={{ color: "#c8d0db" }}
                    />
                    <ReferenceArea y1={anomalyThresholds.errorWarn} y2={15} fill="rgba(226,85,100,0.12)" />
                    <ReferenceLine
                      y={anomalyThresholds.errorWarn}
                      stroke="#e25564"
                      strokeDasharray="4 4"
                      strokeOpacity={0.8}
                    />
                    <Line type="monotone" dataKey="error" stroke="#e25564" strokeWidth={2.8} dot={false} />
                    {compareMode ? (
                      <Line
                        type="monotone"
                        dataKey="compareError"
                        stroke="#8fd0ff"
                        strokeDasharray="5 4"
                        strokeWidth={2}
                        dot={false}
                      />
                    ) : null}
                    {errorAnomalies.slice(0, 20).map((point) => (
                      <ReferenceDot
                        key={`error-anomaly-${point.slot}`}
                        x={point.slot}
                        y={point.error}
                        r={3}
                        fill="#e25564"
                        stroke="none"
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : null}

	              {!isApi && activeChart === "latency" && monitoringHasRows ? (
                <ResponsiveContainer width="100%" height={360}>
                  <AreaChart
                    data={monitoringData}
                    margin={{ top: 8, right: 16, left: 8, bottom: 18 }}
                    onClick={handleRealtimeDrilldown}
                  >
                    <defs>
                      <linearGradient id="dashboardLatency" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f0982f" stopOpacity={0.34} />
                        <stop offset="100%" stopColor="#f0982f" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
                    <XAxis
                      dataKey="slot"
                      tick={{ fill: "#8f9eb4", fontSize: 10 }}
                      tickMargin={8}
                      label={{ value: "Time Window", position: "insideBottom", offset: -6, fill: "#8f9eb4", fontSize: 10 }}
                    />
                    <YAxis
                      width={52}
                      tick={{ fill: "#8f9eb4", fontSize: 10 }}
                      unit="ms"
                      label={{ value: "Latency (ms)", angle: -90, position: "insideLeft", fill: "#8f9eb4", fontSize: 10 }}
                    />
                    <Tooltip
                      formatter={(value) => [`${numericValue(value).toFixed(1)} ms`, "Latency"]}
                      contentStyle={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: 8 }}
                      labelStyle={{ color: "#c8d0db" }}
                    />
                    <ReferenceArea y1={anomalyThresholds.latencyWarn} y2={180} fill="rgba(240,152,47,0.12)" />
                    <ReferenceLine
                      y={anomalyThresholds.latencyWarn}
                      stroke="#f0982f"
                      strokeDasharray="4 4"
                      strokeOpacity={0.8}
                    />
                    <Area type="monotone" dataKey="latency" stroke="#f0982f" strokeWidth={2.8} fill="url(#dashboardLatency)" />
                    {compareMode ? (
                      <Line
                        type="monotone"
                        dataKey="compareLatency"
                        stroke="#8fd0ff"
                        strokeDasharray="5 4"
                        strokeWidth={2}
                        dot={false}
                      />
                    ) : null}
                    {latencyAnomalies.slice(0, 20).map((point) => (
                      <ReferenceDot
                        key={`latency-anomaly-${point.slot}`}
                        x={point.slot}
                        y={point.latency}
                        r={3}
                        fill="#f0982f"
                        stroke="none"
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              ) : null}
	              {!isApi && !monitoringHasRows ? (
                <div className="empty-card">
                  {telemetryInitializing
                    ? "Realtime monitor is initializing from replay stream..."
                    : telemetryUnavailableForRun
                    ? `No realtime decoder telemetry is available for run ${activeRunShortId} yet.`
                    : runTelemetryHardError
                      ? "Realtime monitor data is temporarily unavailable due to a backend error."
                      : "Realtime monitor will populate when decoder telemetry is ingested."}
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>

      {rightRailHost ? createPortal(liveConsoleRail, rightRailHost) : null}

      <StartCircuitDesignDialog
        open={circuitDesignDialogOpen}
        pending={quickLaunchBusy}
        providerName={pendingCircuitLaunch?.provider.name ?? launchProvider?.name ?? "Provider"}
        providerFamily={circuitDesignProviderFamily}
        onClose={closeCircuitDesignDialog}
        onStart={handleStartSessionFromCircuitDesign}
      />
      <StartBenchmarkSessionDialog
        open={benchmarkDialogOpen}
        pending={quickLaunchBusy}
        decoderOptions={PUBLIC_DECODERS}
        selectedDecoders={benchmarkDecoders}
        onToggleDecoder={handleToggleBenchmarkDecoder}
        onClose={() => setBenchmarkDialogOpen(false)}
        onStart={handleStartBenchmarkSession}
        disabledReason={benchmarkSessionUnavailableReason}
      />
      <StartReplaySessionDialog
        open={replayDialogOpen}
        pending={quickLaunchBusy}
        sources={replaySourceOptions}
        selectedSourceRunId={replaySourceRunId}
        onSelectSource={setReplaySourceRunId}
        onClose={() => setReplayDialogOpen(false)}
        onStart={handleStartReplaySession}
        disabledReason={replaySessionUnavailableReason}
      />

      {drilldown ? (
        <div className="drilldown-overlay" onClick={() => setDrilldown(null)}>
          <aside className="drilldown-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="drilldown-header">
              <div>
                <div className="drilldown-title">{drilldown.title}</div>
                <div className="drilldown-summary">{drilldown.summary}</div>
              </div>
              <button className="btn-icon" onClick={() => setDrilldown(null)}>
                ×
              </button>
            </div>
            <div className="drilldown-meta">Source: {drilldown.source === "physical" ? "Physical Channel" : "Realtime Monitor"}</div>
            <div className="drilldown-kv">
              {drilldown.keyValues.map((entry) => (
                <div key={entry.label} className="drilldown-kv-row">
                  <span>{entry.label}</span>
                  <strong>{entry.value}</strong>
                </div>
              ))}
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

      {anyApiError ? (
        <div className="empty-card section-offset">
          <strong>API Data Unavailable</strong>
          <p>Live API mode is enabled, but one or more backend endpoints are unreachable.</p>
        </div>
      ) : null}

      {noApiEntities ? (
        <div className="empty-card section-offset">
          <strong>No Live Data Yet</strong>
          <p>The backend is reachable, but there are currently no providers, jobs, or runs.</p>
        </div>
      ) : null}
    </>
  );
}
