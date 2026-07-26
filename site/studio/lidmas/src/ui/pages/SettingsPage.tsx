import type { ReactNode } from "react";
import { useMemo, useRef, useState } from "react";

import {
  coerceSettings,
  loadSettings,
  resetSettings,
  saveSettings,
  type AppSettings,
  type ExportFormat,
  type UiDensity,
} from "../../settings/settingsStore";
import {
  THEME_OPTIONS,
  applyTheme,
  getThemeSwatch,
  type ThemeId,
  type ThemeOption,
} from "../../theme/themes";

type SectionKey = "profile" | "appearance" | "session" | "data";

interface SectionDefinition {
  key: SectionKey;
  label: string;
  subtitle: string;
}

const SECTIONS: SectionDefinition[] = [
  {
    key: "profile",
    label: "Profile",
    subtitle: "Local workspace identity and regional formatting.",
  },
  {
    key: "appearance",
    label: "Appearance",
    subtitle: "Themes, density, and diagnostic visibility for this browser.",
  },
  {
    key: "session",
    label: "Public Session",
    subtitle: "Bounded defaults for simulator-backed public runs.",
  },
  {
    key: "data",
    label: "Data & Export",
    subtitle: "Local export, masking, and saved-profile behavior.",
  },
];

function downloadJson(filename: string, payload: unknown): void {
  const text = `${JSON.stringify(payload, null, 2)}\n`;
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function timestampForFile(): string {
  return new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
}

function SettingRow({
  name,
  description,
  children,
}: {
  name: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="setting-row">
      <div className="setting-label">
        <div className="setting-name">{name}</div>
        <div className="setting-description">{description}</div>
      </div>
      <div className="setting-control">{children}</div>
    </div>
  );
}

function ToggleControl({
  value,
  label,
  onChange,
}: {
  value: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <button
      className={`toggle ${value ? "active" : ""}`}
      aria-label={label}
      onClick={onChange}
      type="button"
    >
      <span />
    </button>
  );
}

function themeFamilyLabel(theme: ThemeOption): string {
  if (theme.family === "auto") {
    return "Auto";
  }
  return theme.family === "core" ? "Core" : "Research";
}

function ThemeCard({
  theme,
  selected,
  onSelect,
}: {
  theme: ThemeOption;
  selected: boolean;
  onSelect: (themeId: ThemeId) => void;
}) {
  const swatch = getThemeSwatch(theme.id);
  return (
    <button
      className={`theme-card ${selected ? "active" : ""}`}
      onClick={() => onSelect(theme.id)}
      type="button"
    >
      <div className="theme-card-header">
        <strong>{theme.label}</strong>
        <span className="theme-family">{themeFamilyLabel(theme)}</span>
      </div>
      <p>{theme.description}</p>
      <div
        className="theme-card-preview"
        style={{
          background: swatch.bg,
          borderColor: swatch.accent,
          color: swatch.text,
        }}
      >
        <span style={{ color: swatch.accent }}>●</span>
        <span>Scientific view</span>
      </div>
    </button>
  );
}

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SectionKey>("profile");
  const [savedSettings, setSavedSettings] = useState<AppSettings>(() => loadSettings());
  const [draftSettings, setDraftSettings] = useState<AppSettings>(() => loadSettings());
  const [statusMessage, setStatusMessage] = useState("Settings loaded from this browser profile.");
  const [statusTone, setStatusTone] = useState<"neutral" | "good" | "warn">("neutral");
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(savedSettings) !== JSON.stringify(draftSettings),
    [savedSettings, draftSettings],
  );

  const coreThemes = THEME_OPTIONS.filter((theme) => theme.family === "auto" || theme.family === "core");
  const researchThemes = THEME_OPTIONS.filter((theme) => theme.family === "research");

  const setField = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setDraftSettings((previous) => ({ ...previous, [key]: value }));
  };

  const onThemeSelect = (themeId: ThemeId) => {
    setDraftSettings((previous) => ({ ...previous, uiThemeId: themeId }));
    applyTheme(themeId, { persist: false });
    setStatusMessage(`Previewing theme: ${THEME_OPTIONS.find((theme) => theme.id === themeId)?.label ?? themeId}`);
    setStatusTone("neutral");
  };

  const saveChanges = () => {
    const normalized = coerceSettings(draftSettings);
    saveSettings(normalized);
    applyTheme(normalized.uiThemeId);
    setSavedSettings(normalized);
    setDraftSettings(normalized);
    setStatusMessage("Settings saved to this browser profile.");
    setStatusTone("good");
  };

  const discardChanges = () => {
    setDraftSettings(savedSettings);
    applyTheme(savedSettings.uiThemeId, { persist: false });
    setStatusMessage("Unsaved changes were discarded.");
    setStatusTone("warn");
  };

  const resetToDefaults = () => {
    const defaults = resetSettings();
    applyTheme(defaults.uiThemeId);
    setSavedSettings(defaults);
    setDraftSettings(defaults);
    setStatusMessage("Defaults restored and applied.");
    setStatusTone("warn");
  };

  const exportSettings = () => {
    downloadJson(`lidmas_profile_${timestampForFile()}.json`, coerceSettings(draftSettings));
    setStatusMessage("Local profile exported to JSON.");
    setStatusTone("good");
  };

  const importSettingsFromFile = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<AppSettings>;
      const normalized = coerceSettings(parsed);
      setDraftSettings(normalized);
      applyTheme(normalized.uiThemeId, { persist: false });
      setStatusMessage("Profile imported. Review and save to keep it.");
      setStatusTone("good");
    } catch {
      setStatusMessage("Failed to import settings JSON.");
      setStatusTone("warn");
    }
  };

  const sectionMeta = SECTIONS.find((section) => section.key === activeSection);

  return (
    <>
      <div className="header">
        <h1>Settings</h1>
        <p>Local preferences for the public LiDMaS+ workbench. These values stay in this browser unless exported.</p>
      </div>

      <div className="settings-status-row">
        <span className={`settings-status-chip settings-status-${statusTone}`}>{statusMessage}</span>
        <span className={`settings-status-chip ${hasUnsavedChanges ? "settings-status-warn" : "settings-status-good"}`}>
          {hasUnsavedChanges ? "Unsaved changes" : "All changes saved"}
        </span>
      </div>

      <div className="settings-top-actions">
        <button className="btn btn-primary" onClick={saveChanges} disabled={!hasUnsavedChanges}>
          Save Changes
        </button>
        <button className="btn btn-secondary" onClick={discardChanges} disabled={!hasUnsavedChanges}>
          Discard Changes
        </button>
        <button className="btn btn-secondary" onClick={exportSettings}>
          Export Profile
        </button>
        <button className="btn btn-secondary" onClick={() => importInputRef.current?.click()}>
          Import Profile
        </button>
        <button className="btn btn-secondary" onClick={resetToDefaults}>
          Reset Defaults
        </button>
        <input
          ref={importInputRef}
          type="file"
          accept="application/json"
          className="settings-hidden-input"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void importSettingsFromFile(file);
            }
            event.currentTarget.value = "";
          }}
        />
      </div>

      <div className="settings-grid settings-grid-wide">
        <aside className="settings-sidebar">
          <ul className="settings-menu">
            {SECTIONS.map((section) => (
              <li
                key={section.key}
                className={`settings-item ${activeSection === section.key ? "active" : ""}`}
                onClick={() => setActiveSection(section.key)}
              >
                {section.label}
              </li>
            ))}
          </ul>
        </aside>

        <section className="settings-content">
          <div className="section-title">{sectionMeta?.label} Settings</div>
          <p className="settings-section-subtitle">{sectionMeta?.subtitle}</p>

          {activeSection === "profile" ? (
            <div className="settings-block">
              <div className="settings-block-title">Workspace Profile</div>
              <SettingRow
                name="Workspace Label"
                description="Display label for this local LiDMaS+ workbench profile."
              >
                <input
                  type="text"
                  className="input-field"
                  value={draftSettings.systemName}
                  onChange={(event) => setField("systemName", event.target.value)}
                />
              </SettingRow>
              <SettingRow
                name="Timezone"
                description="Timezone used for relative and absolute timestamps."
              >
                <select
                  className="select-field"
                  value={draftSettings.timezone}
                  onChange={(event) => setField("timezone", event.target.value)}
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="Europe/Berlin">Europe/Berlin</option>
                  <option value="Asia/Almaty">Asia/Almaty</option>
                </select>
              </SettingRow>
              <SettingRow
                name="Locale"
                description="Locale used for number and date formatting."
              >
                <select
                  className="select-field"
                  value={draftSettings.locale}
                  onChange={(event) => setField("locale", event.target.value)}
                >
                  <option value="en-US">en-US</option>
                  <option value="en-GB">en-GB</option>
                  <option value="de-DE">de-DE</option>
                  <option value="fr-FR">fr-FR</option>
                </select>
              </SettingRow>
            </div>
          ) : null}

          {activeSection === "appearance" ? (
            <>
              <div className="settings-block">
                <div className="settings-block-title">Interface</div>
                <SettingRow
                  name="UI Density"
                  description="Controls spacing density across cards, tables, and control rows."
                >
                  <select
                    className="select-field"
                    value={draftSettings.uiDensity}
                    onChange={(event) => setField("uiDensity", event.target.value as UiDensity)}
                  >
                    <option value="comfortable">Comfortable</option>
                    <option value="compact">Compact</option>
                  </select>
                </SettingRow>
                <SettingRow
                  name="Show API Diagnostics"
                  description="Show additional API request state when troubleshooting public runs."
                >
                  <ToggleControl
                    value={draftSettings.enableDebugLogs}
                    label="toggle api diagnostics"
                    onChange={() => setField("enableDebugLogs", !draftSettings.enableDebugLogs)}
                  />
                </SettingRow>
              </div>

              <div className="settings-block">
                <div className="settings-block-title">Theme Selection</div>
                <p className="settings-note">Themes preview immediately. Save to keep the choice in this browser.</p>
                <div className="theme-gallery">
                  <div className="theme-gallery-group">
                    <h4>Core</h4>
                    <div className="theme-gallery-grid">
                      {coreThemes.map((theme) => (
                        <ThemeCard
                          key={theme.id}
                          theme={theme}
                          selected={draftSettings.uiThemeId === theme.id}
                          onSelect={onThemeSelect}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="theme-gallery-group">
                    <h4>Research Palettes</h4>
                    <div className="theme-gallery-grid">
                      {researchThemes.map((theme) => (
                        <ThemeCard
                          key={theme.id}
                          theme={theme}
                          selected={draftSettings.uiThemeId === theme.id}
                          onSelect={onThemeSelect}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {activeSection === "session" ? (
            <div className="settings-block">
              <div className="settings-block-title">Public Run Defaults</div>
              <SettingRow
                name="Job Timeout (seconds)"
                description="Maximum duration for a single public simulator-backed job."
              >
                <input
                  type="number"
                  className="input-field settings-input-small"
                  min={60}
                  max={7200}
                  value={draftSettings.jobTimeoutSeconds}
                  onChange={(event) => setField("jobTimeoutSeconds", Number(event.target.value))}
                />
              </SettingRow>
              <SettingRow
                name="Max Parallel Runs"
                description="Browser-side concurrency limit for public run requests."
              >
                <input
                  type="number"
                  className="input-field settings-input-small"
                  min={1}
                  max={32}
                  value={draftSettings.maxParallelRuns}
                  onChange={(event) => setField("maxParallelRuns", Number(event.target.value))}
                />
              </SettingRow>
              <SettingRow
                name="Retry Budget"
                description="Retry attempts before a public run is shown as failed."
              >
                <input
                  type="number"
                  className="input-field settings-input-small"
                  min={0}
                  max={5}
                  value={draftSettings.retryBudget}
                  onChange={(event) => setField("retryBudget", Number(event.target.value))}
                />
              </SettingRow>
            </div>
          ) : null}

          {activeSection === "data" ? (
            <div className="settings-block">
              <div className="settings-block-title">Local Data</div>
              <SettingRow
                name="Default Export Format"
                description="Preferred browser download format for public run summaries."
              >
                <select
                  className="select-field"
                  value={draftSettings.defaultExportFormat}
                  onChange={(event) => setField("defaultExportFormat", event.target.value as ExportFormat)}
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                </select>
              </SettingRow>
              <SettingRow
                name="Artifact Retention (days)"
                description="Advisory display window for browser-side artifacts and downloaded results."
              >
                <input
                  type="number"
                  className="input-field settings-input-small"
                  min={1}
                  max={90}
                  value={draftSettings.artifactRetentionDays}
                  onChange={(event) => setField("artifactRetentionDays", Number(event.target.value))}
                />
              </SettingRow>
              <SettingRow
                name="Auto-save Local Configurations"
                description="Keep circuit/session preferences in this browser between visits."
              >
                <ToggleControl
                  value={draftSettings.autoSaveConfigurations}
                  label="toggle local auto-save"
                  onChange={() => setField("autoSaveConfigurations", !draftSettings.autoSaveConfigurations)}
                />
              </SettingRow>
              <SettingRow
                name="Mask Sensitive Text"
                description="Mask tokens or provider-like strings before showing logs or exported summaries."
              >
                <ToggleControl
                  value={draftSettings.dataMasking}
                  label="toggle sensitive text masking"
                  onChange={() => setField("dataMasking", !draftSettings.dataMasking)}
                />
              </SettingRow>
            </div>
          ) : null}

          <div className="button-group">
            <button className="btn btn-primary" onClick={saveChanges} disabled={!hasUnsavedChanges}>
              Save Changes
            </button>
            <button className="btn btn-secondary" onClick={discardChanges} disabled={!hasUnsavedChanges}>
              Discard
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
