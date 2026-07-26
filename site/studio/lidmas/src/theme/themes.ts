export type ThemeId =
  | "dark-core"
  | "light-core"
  | "system-auto"
  | "gerry-noctis"
  | "gerry-lagoon"
  | "gerry-ember"
  | "gerry-sage"
  | "gerry-parchment";

interface ThemePalette {
  bg: string;
  bgSecondary: string;
  bgTertiary: string;
  surface?: string;
  surfaceElevated?: string;
  surfaceMuted?: string;
  line: string;
  lineSoft?: string;
  lineStrong?: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  blue: string;
  blueHover: string;
  green: string;
  orange: string;
  red: string;
  accentSoft?: string;
  accentSoftStrong?: string;
  successSoft?: string;
  warningSoft?: string;
  dangerSoft?: string;
  shadowPanel?: string;
  shadowSubtle?: string;
  colorScheme: "dark" | "light";
}

interface ThemeDefinition {
  id: Exclude<ThemeId, "system-auto">;
  label: string;
  family: "core" | "research";
  description: string;
  palette: ThemePalette;
}

export interface ThemeOption {
  id: ThemeId;
  label: string;
  family: "core" | "research" | "auto";
  description: string;
}

export interface ThemeSwatch {
  bg: string;
  accent: string;
  text: string;
}

export const THEME_STORAGE_KEY = "lidmas.ui.theme";

const THEMES: Record<Exclude<ThemeId, "system-auto">, ThemeDefinition> = {
  "dark-core": {
    id: "dark-core",
    label: "Core Dark",
    family: "core",
    description: "Default dark operations theme.",
    palette: {
      bg: "#000000",
      bgSecondary: "#080808",
      bgTertiary: "#101010",
      surface: "#0b1017",
      surfaceElevated: "#101722",
      surfaceMuted: "#070a0f",
      line: "#1f1f1f",
      lineSoft: "rgba(141, 155, 174, 0.13)",
      lineStrong: "rgba(141, 155, 174, 0.34)",
      text: "#f3f4f6",
      textSecondary: "#c4cad4",
      textMuted: "#818b99",
      blue: "#3f89ea",
      blueHover: "#2f6fc4",
      green: "#26b36b",
      orange: "#f0982f",
      red: "#e25564",
      accentSoft: "rgba(63, 137, 234, 0.12)",
      accentSoftStrong: "rgba(63, 137, 234, 0.2)",
      successSoft: "rgba(38, 179, 107, 0.16)",
      warningSoft: "rgba(240, 152, 47, 0.16)",
      dangerSoft: "rgba(226, 85, 100, 0.16)",
      shadowPanel: "0 18px 42px rgba(0, 0, 0, 0.28)",
      shadowSubtle: "0 1px 0 rgba(255, 255, 255, 0.035) inset",
      colorScheme: "dark",
    },
  },
  "light-core": {
    id: "light-core",
    label: "Core Light",
    family: "core",
    description: "Neutral light workspace theme.",
    palette: {
      bg: "#f5f7fa",
      bgSecondary: "#ffffff",
      bgTertiary: "#f0f3f8",
      surface: "#ffffff",
      surfaceElevated: "#f9fbfe",
      surfaceMuted: "#eef3f8",
      line: "#d6dce8",
      lineSoft: "rgba(75, 92, 120, 0.14)",
      lineStrong: "rgba(75, 92, 120, 0.36)",
      text: "#1a2334",
      textSecondary: "#33415c",
      textMuted: "#5b6b88",
      blue: "#2f6fcd",
      blueHover: "#2559a6",
      green: "#198f58",
      orange: "#cc7a1f",
      red: "#c43f52",
      accentSoft: "rgba(47, 111, 205, 0.1)",
      accentSoftStrong: "rgba(47, 111, 205, 0.18)",
      successSoft: "rgba(25, 143, 88, 0.12)",
      warningSoft: "rgba(204, 122, 31, 0.12)",
      dangerSoft: "rgba(196, 63, 82, 0.12)",
      shadowPanel: "0 18px 42px rgba(20, 30, 48, 0.1)",
      shadowSubtle: "0 1px 0 rgba(255, 255, 255, 0.82) inset",
      colorScheme: "light",
    },
  },
  "gerry-noctis": {
    id: "gerry-noctis",
    label: "Noctis",
    family: "research",
    description: "Deep navy with high-contrast telemetry accents.",
    palette: {
      bg: "#060914",
      bgSecondary: "#0d1224",
      bgTertiary: "#131b33",
      line: "#263153",
      text: "#ecf1ff",
      textSecondary: "#b7c3e8",
      textMuted: "#7f8ebb",
      blue: "#59a3ff",
      blueHover: "#3f89ea",
      green: "#41d18d",
      orange: "#f4b15e",
      red: "#ff7078",
      colorScheme: "dark",
    },
  },
  "gerry-lagoon": {
    id: "gerry-lagoon",
    label: "Lagoon",
    family: "research",
    description: "Cool teal-operational palette for long monitoring sessions.",
    palette: {
      bg: "#041318",
      bgSecondary: "#0b1e26",
      bgTertiary: "#112a34",
      line: "#1f404e",
      text: "#e9fbff",
      textSecondary: "#b4dce5",
      textMuted: "#75a2ad",
      blue: "#56c5e7",
      blueHover: "#39a7cc",
      green: "#45d88f",
      orange: "#ffb561",
      red: "#ff7f82",
      colorScheme: "dark",
    },
  },
  "gerry-ember": {
    id: "gerry-ember",
    label: "Ember",
    family: "research",
    description: "Graphite background with warm amber interaction tone.",
    palette: {
      bg: "#121111",
      bgSecondary: "#1b1716",
      bgTertiary: "#251f1d",
      line: "#3a2f2b",
      text: "#f8f0eb",
      textSecondary: "#d7c4b7",
      textMuted: "#a79186",
      blue: "#ff9a4c",
      blueHover: "#e47f2d",
      green: "#6bd48f",
      orange: "#ffbf66",
      red: "#f56f6f",
      colorScheme: "dark",
    },
  },
  "gerry-sage": {
    id: "gerry-sage",
    label: "Sage",
    family: "research",
    description: "Muted evergreen theme tuned for reduced eye strain.",
    palette: {
      bg: "#08110d",
      bgSecondary: "#101c17",
      bgTertiary: "#172720",
      line: "#2b4237",
      text: "#e9f5ee",
      textSecondary: "#b8d5c4",
      textMuted: "#87aa97",
      blue: "#7ec49d",
      blueHover: "#5cae84",
      green: "#5ecb80",
      orange: "#e8bb64",
      red: "#ef7d78",
      colorScheme: "dark",
    },
  },
  "gerry-parchment": {
    id: "gerry-parchment",
    label: "Parchment",
    family: "research",
    description: "Soft paper-like light theme for report review workflows.",
    palette: {
      bg: "#f5f1e8",
      bgSecondary: "#fffaf1",
      bgTertiary: "#efe7d8",
      surface: "#fffaf1",
      surfaceElevated: "#fbf4e8",
      surfaceMuted: "#efe7d8",
      line: "#d7c8ad",
      lineSoft: "rgba(113, 96, 68, 0.16)",
      lineStrong: "rgba(113, 96, 68, 0.38)",
      text: "#2d2a22",
      textSecondary: "#5a5243",
      textMuted: "#877a63",
      blue: "#4c6f9f",
      blueHover: "#3a5b8a",
      green: "#3f8a5d",
      orange: "#c1863c",
      red: "#b55555",
      accentSoft: "rgba(76, 111, 159, 0.12)",
      accentSoftStrong: "rgba(76, 111, 159, 0.2)",
      successSoft: "rgba(63, 138, 93, 0.12)",
      warningSoft: "rgba(193, 134, 60, 0.14)",
      dangerSoft: "rgba(181, 85, 85, 0.13)",
      shadowPanel: "0 18px 42px rgba(88, 72, 45, 0.13)",
      shadowSubtle: "0 1px 0 rgba(255, 255, 255, 0.75) inset",
      colorScheme: "light",
    },
  },
};

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "system-auto",
    label: "System Auto",
    family: "auto",
    description: "Follows your OS dark/light preference.",
  },
  ...Object.values(THEMES).map((theme) => ({
    id: theme.id,
    label: theme.label,
    family: theme.family,
    description: theme.description,
  })),
];

export function getThemeSwatch(themeId: ThemeId): ThemeSwatch {
  if (themeId === "system-auto") {
    const resolved = resolveTheme("system-auto");
    return {
      bg: resolved.palette.bgSecondary,
      accent: resolved.palette.blue,
      text: resolved.palette.text,
    };
  }
  const theme = THEMES[themeId];
  return {
    bg: theme.palette.bgSecondary,
    accent: theme.palette.blue,
    text: theme.palette.text,
  };
}

function systemResolvedTheme(): Exclude<ThemeId, "system-auto"> {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "dark-core";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark-core" : "light-core";
}

function resolveTheme(themeId: ThemeId): ThemeDefinition {
  const resolvedId = themeId === "system-auto" ? systemResolvedTheme() : themeId;
  return THEMES[resolvedId];
}

function writeCssVariables(palette: ThemePalette): void {
  if (typeof document === "undefined") {
    return;
  }
  const root = document.documentElement;
  const shadowPanel =
    palette.shadowPanel ??
    (palette.colorScheme === "light"
      ? "0 18px 42px rgba(20, 30, 48, 0.1)"
      : "0 18px 42px rgba(0, 0, 0, 0.28)");
  const shadowSubtle =
    palette.shadowSubtle ??
    (palette.colorScheme === "light"
      ? "0 1px 0 rgba(255, 255, 255, 0.82) inset"
      : "0 1px 0 rgba(255, 255, 255, 0.035) inset");

  root.style.setProperty("--bg", palette.bg);
  root.style.setProperty("--bg-secondary", palette.bgSecondary);
  root.style.setProperty("--bg-tertiary", palette.bgTertiary);
  root.style.setProperty("--surface", palette.surface ?? palette.bgSecondary);
  root.style.setProperty("--surface-elevated", palette.surfaceElevated ?? palette.bgTertiary);
  root.style.setProperty("--surface-muted", palette.surfaceMuted ?? palette.bg);
  root.style.setProperty("--line", palette.line);
  root.style.setProperty("--line-soft", palette.lineSoft ?? `color-mix(in srgb, ${palette.line} 58%, transparent)`);
  root.style.setProperty("--line-strong", palette.lineStrong ?? `color-mix(in srgb, ${palette.line} 78%, ${palette.textMuted} 22%)`);
  root.style.setProperty("--text", palette.text);
  root.style.setProperty("--text-secondary", palette.textSecondary);
  root.style.setProperty("--text-muted", palette.textMuted);
  root.style.setProperty("--blue", palette.blue);
  root.style.setProperty("--blue-hover", palette.blueHover);
  root.style.setProperty("--green", palette.green);
  root.style.setProperty("--orange", palette.orange);
  root.style.setProperty("--red", palette.red);
  root.style.setProperty("--accent-soft", palette.accentSoft ?? `color-mix(in srgb, ${palette.blue} 18%, transparent)`);
  root.style.setProperty(
    "--accent-soft-strong",
    palette.accentSoftStrong ?? `color-mix(in srgb, ${palette.blue} 26%, transparent)`,
  );
  root.style.setProperty("--success-soft", palette.successSoft ?? `color-mix(in srgb, ${palette.green} 18%, transparent)`);
  root.style.setProperty("--warning-soft", palette.warningSoft ?? `color-mix(in srgb, ${palette.orange} 18%, transparent)`);
  root.style.setProperty("--danger-soft", palette.dangerSoft ?? `color-mix(in srgb, ${palette.red} 18%, transparent)`);
  root.style.setProperty("--shadow-panel", shadowPanel);
  root.style.setProperty("--shadow-subtle", shadowSubtle);
  root.style.setProperty("color-scheme", palette.colorScheme);
  root.dataset.colorScheme = palette.colorScheme;
}

export function getStoredThemeId(): ThemeId | null {
  if (typeof window === "undefined") {
    return null;
  }
  const value = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (!value) {
    return null;
  }
  return THEME_OPTIONS.some((option) => option.id === value) ? (value as ThemeId) : null;
}

export function applyTheme(themeId: ThemeId, options?: { persist?: boolean }): void {
  writeCssVariables(resolveTheme(themeId).palette);
  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = themeId;
  }
  if (options?.persist !== false && typeof window !== "undefined") {
    window.localStorage.setItem(THEME_STORAGE_KEY, themeId);
  }
}

let systemListenerInstalled = false;

function installSystemThemeListener(): void {
  if (systemListenerInstalled || typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return;
  }
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const update = () => {
    if (getStoredThemeId() === "system-auto") {
      applyTheme("system-auto", { persist: false });
    }
  };
  if (typeof media.addEventListener === "function") {
    media.addEventListener("change", update);
  } else if (typeof media.addListener === "function") {
    media.addListener(update);
  }
  systemListenerInstalled = true;
}

export function initializeTheme(): ThemeId {
  const stored = getStoredThemeId() ?? "dark-core";
  applyTheme(stored, { persist: false });
  installSystemThemeListener();
  return stored;
}
