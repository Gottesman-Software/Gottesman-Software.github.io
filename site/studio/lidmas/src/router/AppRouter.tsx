import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "../ui/AppShell";
import { AccessGate } from "../ui/security/AccessGate";

const AlertsPage = lazy(() => import("../ui/pages/AlertsPage").then((module) => ({ default: module.AlertsPage })));
const DecoderDashboard = lazy(() => import("../ui/pages/DecoderDashboard").then((module) => ({ default: module.DecoderDashboard })));
const EnhancedProvidersPage = lazy(() => import("../ui/pages/EnhancedProvidersPage").then((module) => ({ default: module.EnhancedProvidersPage })));
const HelpPage = lazy(() => import("../ui/pages/HelpPage").then((module) => ({ default: module.HelpPage })));
const JobsPage = lazy(() => import("../ui/pages/JobsPage").then((module) => ({ default: module.JobsPage })));
const LogsPage = lazy(() => import("../ui/pages/LogsPage").then((module) => ({ default: module.LogsPage })));
const SettingsPage = lazy(() => import("../ui/pages/SettingsPage").then((module) => ({ default: module.SettingsPage })));
const TelemetryPage = lazy(() => import("../ui/pages/TelemetryPage").then((module) => ({ default: module.TelemetryPage })));
const ValidationPage = lazy(() => import("../ui/pages/ValidationPage").then((module) => ({ default: module.ValidationPage })));

function RouteFallback() {
  return <div className="route-loading" role="status">Loading workspace</div>;
}

export function AppRouter() {
  return (
    <AccessGate>
      <AppShell>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Navigate to="/decoder/scientific" replace />} />
            <Route path="/decoder" element={<Navigate to="/decoder/scientific" replace />} />
            <Route path="/decoder/scientific" element={<DecoderDashboard />} />
            <Route path="/decoder/telemetry" element={<TelemetryPage />} />
            <Route path="/decoder/validation" element={<ValidationPage />} />
            <Route path="/decoder/logs" element={<LogsPage />} />
            <Route path="/runs" element={<JobsPage />} />
            <Route path="/providers" element={<EnhancedProvidersPage />} />
            <Route path="/observability" element={<AlertsPage />} />
            <Route path="/jobs" element={<Navigate to="/runs" replace />} />
            <Route path="/dashboard" element={<Navigate to="/decoder/scientific" replace />} />
            <Route path="/validation" element={<Navigate to="/decoder/validation" replace />} />
            <Route path="/telemetry" element={<Navigate to="/decoder/telemetry" replace />} />
            <Route path="/logs" element={<Navigate to="/decoder/logs" replace />} />
            <Route path="/alerts" element={<Navigate to="/observability" replace />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="*" element={<Navigate to="/decoder/scientific" replace />} />
          </Routes>
        </Suspense>
      </AppShell>
    </AccessGate>
  );
}
