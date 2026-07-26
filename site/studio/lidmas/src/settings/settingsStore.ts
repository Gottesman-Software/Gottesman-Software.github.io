import { THEME_OPTIONS, type ThemeId } from "../theme/themes";

export const SETTINGS_STORAGE_KEY = "lidmas.settings.v1";

export type UiDensity = "comfortable" | "compact";
export type ExportFormat = "json" | "csv";

export interface AppSettings {
  systemName: string;
  uiThemeId: ThemeId;
  uiDensity: UiDensity;
  timezone: string;
  locale: string;
  enableDebugLogs: boolean;
  autoSaveConfigurations: boolean;

  jobTimeoutSeconds: number;
  maxParallelRuns: number;
  retryBudget: number;
  dataMasking: boolean;

  defaultExportFormat: ExportFormat;
  artifactRetentionDays: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  systemName: "LiDMaS+ Decoder",
  uiThemeId: "dark-core",
  uiDensity: "comfortable",
  timezone: "UTC",
  locale: "en-US",
  enableDebugLogs: false,
  autoSaveConfigurations: true,

  jobTimeoutSeconds: 1200,
  maxParallelRuns: 8,
  retryBudget: 1,
  dataMasking: true,

  defaultExportFormat: "json",
  artifactRetentionDays: 14,
};

function toFiniteNumber(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, Math.round(parsed)));
}

function toStringValue(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function toBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function toThemeId(value: unknown): ThemeId {
  if (typeof value === "string" && THEME_OPTIONS.some((option) => option.id === value)) {
    return value as ThemeId;
  }
  return DEFAULT_SETTINGS.uiThemeId;
}

function normalizeSettings(input: Partial<AppSettings>): AppSettings {
  const base = { ...DEFAULT_SETTINGS, ...input };
  return {
    systemName: toStringValue(base.systemName, DEFAULT_SETTINGS.systemName).trim() || DEFAULT_SETTINGS.systemName,
    uiThemeId: toThemeId(base.uiThemeId),
    uiDensity: base.uiDensity === "compact" ? "compact" : "comfortable",
    timezone: toStringValue(base.timezone, DEFAULT_SETTINGS.timezone).trim() || DEFAULT_SETTINGS.timezone,
    locale: toStringValue(base.locale, DEFAULT_SETTINGS.locale).trim() || DEFAULT_SETTINGS.locale,
    jobTimeoutSeconds: toFiniteNumber(base.jobTimeoutSeconds, DEFAULT_SETTINGS.jobTimeoutSeconds, 60, 7200),
    maxParallelRuns: toFiniteNumber(base.maxParallelRuns, DEFAULT_SETTINGS.maxParallelRuns, 1, 32),
    retryBudget: toFiniteNumber(base.retryBudget, DEFAULT_SETTINGS.retryBudget, 0, 5),
    defaultExportFormat: base.defaultExportFormat === "csv" ? "csv" : "json",
    artifactRetentionDays: toFiniteNumber(base.artifactRetentionDays, DEFAULT_SETTINGS.artifactRetentionDays, 1, 90),
    autoSaveConfigurations: toBoolean(base.autoSaveConfigurations, DEFAULT_SETTINGS.autoSaveConfigurations),
    enableDebugLogs: toBoolean(base.enableDebugLogs, DEFAULT_SETTINGS.enableDebugLogs),
    dataMasking: toBoolean(base.dataMasking, DEFAULT_SETTINGS.dataMasking),
  };
}

export function coerceSettings(input: Partial<AppSettings>): AppSettings {
  return normalizeSettings(input);
}

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_SETTINGS;
    }
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return coerceSettings(parsed);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(coerceSettings(settings)));
}

export function resetSettings(): AppSettings {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(SETTINGS_STORAGE_KEY);
  }
  return DEFAULT_SETTINGS;
}
