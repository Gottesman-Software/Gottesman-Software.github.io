export type CalibrationHardwareTarget = "superconducting" | "trapped_ion" | "photonic" | "simulated";
export type CalibrationProviderFamily = "pennylane" | "qiskit" | "cirq" | "schrosim" | "unknown";
export type CalibrationVendor = "pennylane" | "qiskit" | "cirq" | "schrosim" | "gottesman";

export interface VendorCalibrationSnapshot {
  id: string;
  label: string;
  vendor: CalibrationVendor;
  hardwareTarget: CalibrationHardwareTarget;
  backend: string;
  capturedAt: string;
  source: string;
  metrics: Record<string, number>;
}

const SNAPSHOTS: VendorCalibrationSnapshot[] = [
  {
    id: "pennylane_surface_depolarizing_public",
    label: "PennyLane surface-code depolarizing model",
    vendor: "pennylane",
    hardwareTarget: "simulated",
    backend: "pennylane_default_qubit",
    capturedAt: "2026-04-21T10:20:30Z",
    source: "public_simulator_fixture",
    metrics: {
      physical_error_rate: 0.0112,
      displacement_sigma: 0.18,
      syndrome_trigger_rate: 0.21,
      logical_error_rate: 0.0171,
    },
  },
  {
    id: "qiskit_aer_phase_flip_public",
    label: "Qiskit Aer phase-flip noise model",
    vendor: "qiskit",
    hardwareTarget: "simulated",
    backend: "qiskit_aer",
    capturedAt: "2026-02-02T08:13:40Z",
    source: "public_simulator_fixture",
    metrics: {
      phase_flip_rate: 0.014,
      readout_flip_rate: 0.009,
      syndrome_trigger_rate: 0.18,
      logical_error_rate: 0.015,
    },
  },
  {
    id: "cirq_repetition_bitflip_public",
    label: "Cirq repetition-code bit-flip model",
    vendor: "cirq",
    hardwareTarget: "simulated",
    backend: "cirq_simulator",
    capturedAt: "2026-04-08T12:04:00Z",
    source: "public_simulator_fixture",
    metrics: {
      bit_flip_rate: 0.0125,
      measurement_error_rate: 0.007,
      syndrome_trigger_rate: 0.16,
      logical_error_rate: 0.018,
    },
  },
  {
    id: "schrosim_cv_loss_public",
    label: "SchroSIM CV photonic loss model",
    vendor: "schrosim",
    hardwareTarget: "simulated",
    backend: "schrosim_cv",
    capturedAt: "2026-03-18T15:06:00Z",
    source: "public_simulator_fixture",
    metrics: {
      photon_loss_rate: 0.021,
      displacement_sigma: 0.16,
      syndrome_trigger_rate: 0.19,
      logical_error_rate: 0.021,
    },
  },
];

function vendorsForContext(
  providerFamily: CalibrationProviderFamily,
  hardwareTarget: CalibrationHardwareTarget,
): CalibrationVendor[] {
  if (providerFamily === "pennylane") {
    return ["pennylane"];
  }
  if (providerFamily === "qiskit") {
    return ["qiskit"];
  }
  if (providerFamily === "cirq") {
    return ["cirq"];
  }
  if (providerFamily === "schrosim" || hardwareTarget === "photonic") {
    return ["schrosim"];
  }
  return ["pennylane", "qiskit", "cirq", "schrosim"];
}

export function calibrationSnapshotsForContext(
  providerFamily: CalibrationProviderFamily,
  hardwareTarget: CalibrationHardwareTarget,
  sourceSnapshots?: VendorCalibrationSnapshot[],
): VendorCalibrationSnapshot[] {
  const catalog = sourceSnapshots && sourceSnapshots.length > 0 ? sourceSnapshots : SNAPSHOTS;
  const vendors = new Set(vendorsForContext(providerFamily, hardwareTarget));
  return catalog.filter(
    (snapshot) => snapshot.hardwareTarget === hardwareTarget && vendors.has(snapshot.vendor),
  );
}

export function defaultCalibrationSnapshotId(
  providerFamily: CalibrationProviderFamily,
  hardwareTarget: CalibrationHardwareTarget,
  sourceSnapshots?: VendorCalibrationSnapshot[],
): string | null {
  const options = calibrationSnapshotsForContext(providerFamily, hardwareTarget, sourceSnapshots);
  if (options.length === 0) {
    return null;
  }
  if (providerFamily === "pennylane" || providerFamily === "qiskit" || providerFamily === "cirq" || providerFamily === "schrosim") {
    return options.find((option) => option.vendor === providerFamily)?.id ?? options[0].id;
  }
  return options[0].id;
}

export function findCalibrationSnapshotById(id: string): VendorCalibrationSnapshot | null {
  const normalized = id.trim();
  if (!normalized) {
    return null;
  }
  return SNAPSHOTS.find((snapshot) => snapshot.id === normalized) ?? null;
}

function parseVendor(value: unknown): CalibrationVendor | null {
  if (value === "pennylane" || value === "qiskit" || value === "cirq" || value === "schrosim" || value === "gottesman") {
    return value;
  }
  return null;
}

function parseHardwareTarget(value: unknown): CalibrationHardwareTarget | null {
  if (value === "superconducting" || value === "trapped_ion" || value === "photonic" || value === "simulated") {
    return value;
  }
  return null;
}

export function normalizeVendorCalibrationSnapshots(payload: unknown): VendorCalibrationSnapshot[] {
  if (!Array.isArray(payload)) {
    return [];
  }
  const snapshots: VendorCalibrationSnapshot[] = [];
  payload.forEach((entry) => {
    if (!entry || typeof entry !== "object") {
      return;
    }
    const raw = entry as Record<string, unknown>;
    const id = typeof raw.id === "string" ? raw.id.trim() : "";
    const label = typeof raw.label === "string" ? raw.label.trim() : "";
    const vendor = parseVendor(raw.vendor);
    const hardwareTarget = parseHardwareTarget(raw.hardware_target ?? raw.hardwareTarget);
    const backend = typeof raw.backend === "string" ? raw.backend.trim() : "";
    const capturedAt = typeof raw.captured_at === "string"
      ? raw.captured_at
      : typeof raw.capturedAt === "string"
        ? raw.capturedAt
        : "";
    const source = typeof raw.source === "string" ? raw.source.trim() : "";
    const metricsRaw = raw.metrics;
    const metrics: Record<string, number> = {};
    if (metricsRaw && typeof metricsRaw === "object") {
      Object.entries(metricsRaw as Record<string, unknown>).forEach(([key, value]) => {
        const numeric = typeof value === "number" ? value : Number.NaN;
        if (Number.isFinite(numeric)) {
          metrics[key] = numeric;
        }
      });
    }
    if (!id || !label || !vendor || !hardwareTarget || !backend || !capturedAt || !source) {
      return;
    }
    snapshots.push({
      id,
      label,
      vendor,
      hardwareTarget,
      backend,
      capturedAt,
      source,
      metrics,
    });
  });
  return snapshots;
}
