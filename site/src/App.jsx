import React from "react";
import {
  hasAnalyticsMeasurementId,
  initializeAnalytics,
  setAnalyticsConsent,
  trackEvent,
  trackPageView,
} from "./analytics.js";

const softwareHeroCode = [
  [{ type: "comment", text: "# software_stack.py" }],
  [
    { type: "keyword", text: "from" },
    { text: " " },
    { type: "module", text: "schrosim" },
    { text: " " },
    { type: "keyword", text: "import" },
    { text: " " },
    { type: "class", text: "PhotonicCircuit" },
  ],
  [
    { type: "keyword", text: "from" },
    { text: " " },
    { type: "module", text: "lidmas" },
    { text: " " },
    { type: "keyword", text: "import" },
    { text: " " },
    { type: "class", text: "DecoderStudy" },
  ],
  [
    { type: "keyword", text: "from" },
    { text: " " },
    { type: "module", text: "photon_qdrivers" },
    { text: " " },
    { type: "keyword", text: "import" },
    { text: " " },
    { type: "class", text: "PhotonDriver" },
  ],
  [],
  [
    { type: "variable", text: "circuit" },
    { text: " = " },
    { type: "class", text: "PhotonicCircuit" },
    { text: "(" },
    { type: "property", text: "modes" },
    { text: "=" },
    { type: "number", text: "8" },
    { text: ", " },
    { type: "property", text: "cutoff" },
    { text: "=" },
    { type: "number", text: "12" },
    { text: ")" },
  ],
  [
    { type: "variable", text: "circuit" },
    { text: "." },
    { type: "function", text: "squeeze" },
    { text: "(" },
    { type: "property", text: "mode" },
    { text: "=" },
    { type: "number", text: "0" },
    { text: ", " },
    { type: "property", text: "r" },
    { text: "=" },
    { type: "number", text: "0.82" },
    { text: ")" },
  ],
  [
    { type: "variable", text: "circuit" },
    { text: "." },
    { type: "function", text: "beamsplitter" },
    { text: "(" },
    { type: "number", text: "0" },
    { text: ", " },
    { type: "number", text: "1" },
    { text: ", " },
    { type: "property", text: "theta" },
    { text: "=" },
    { type: "number", text: "0.785" },
    { text: ")" },
  ],
  [
    { type: "variable", text: "circuit" },
    { text: "." },
    { type: "function", text: "measure_homodyne" },
    { text: "(" },
    { type: "property", text: "mode" },
    { text: "=" },
    { type: "number", text: "1" },
    { text: ", " },
    { type: "property", text: "quadrature" },
    { text: "=" },
    { type: "string", text: '"x"' },
    { text: ")" },
  ],
  [],
  [
    { type: "variable", text: "study" },
    { text: " = " },
    { type: "class", text: "DecoderStudy" },
    { text: "(" },
    { type: "property", text: "code" },
    { text: "=" },
    { type: "string", text: '"gkp_surface"' },
    { text: ", " },
    { type: "property", text: "distances" },
    { text: "=[" },
    { type: "number", text: "3" },
    { text: ", " },
    { type: "number", text: "5" },
    { text: ", " },
    { type: "number", text: "7" },
    { text: "])" },
  ],
  [
    { type: "variable", text: "study" },
    { text: "." },
    { type: "function", text: "attach_circuit" },
    { text: "(" },
    { type: "variable", text: "circuit" },
    { text: ")" },
  ],
  [
    { type: "variable", text: "study" },
    { text: "." },
    { type: "function", text: "set_noise" },
    { text: "(" },
    { type: "property", text: "loss" },
    { text: "=" },
    { type: "number", text: "0.015" },
    { text: ", " },
    { type: "property", text: "sigma" },
    { text: "=" },
    { type: "number", text: "0.32" },
    { text: ")" },
  ],
  [],
  [
    { type: "variable", text: "driver" },
    { text: " = " },
    { type: "class", text: "PhotonDriver" },
    { text: "." },
    { type: "function", text: "load_backend" },
    { text: "(" },
    { type: "string", text: '"emulator"' },
    { text: ")" },
  ],
  [
    { type: "variable", text: "job" },
    { text: " = " },
    { type: "variable", text: "driver" },
    { text: "." },
    { type: "function", text: "compile" },
    { text: "(" },
    { type: "variable", text: "circuit" },
    { text: "." },
    { type: "function", text: "to_ir" },
    { text: "())" },
  ],
  [
    { type: "variable", text: "result" },
    { text: " = " },
    { type: "variable", text: "driver" },
    { text: "." },
    { type: "function", text: "run" },
    { text: "(" },
    { type: "variable", text: "job" },
    { text: ", " },
    { type: "property", text: "shots" },
    { text: "=" },
    { type: "number", text: "2048" },
    { text: ")" },
  ],
  [],
  [
    { type: "variable", text: "study" },
    { text: "." },
    { type: "function", text: "replay" },
    { text: "(" },
    { type: "variable", text: "result" },
    { text: "." },
    { type: "property", text: "counts" },
    { text: ", " },
    { type: "property", text: "decoder" },
    { text: "=" },
    { type: "string", text: '"mwpm"' },
    { text: ", " },
    { type: "property", text: "seed" },
    { text: "=" },
    { type: "number", text: "42" },
    { text: ")" },
  ],
];

const studioHeroCode = [
  [{ type: "comment", text: "# gottesman_studio.py" }],
  [
    { type: "keyword", text: "from" },
    { text: " " },
    { type: "module", text: "studio" },
    { text: " " },
    { type: "keyword", text: "import" },
    { text: " " },
    { type: "class", text: "PhotonicStudy" },
    { text: ", " },
    { type: "class", text: "EvidenceBundle" },
  ],
  [],
  [
    { type: "variable", text: "study" },
    { text: " = " },
    { type: "class", text: "PhotonicStudy" },
    { text: "." },
    { type: "function", text: "from_schrosim" },
    { text: "(" },
    { type: "string", text: '"gkp-memory"' },
    { text: ")" },
  ],
  [
    { type: "variable", text: "layout" },
    { text: " = " },
    { type: "variable", text: "study" },
    { text: "." },
    { type: "function", text: "export_layout" },
    { text: "(" },
    { type: "property", text: "target" },
    { text: "=" },
    { type: "string", text: '"partner-foundry"' },
    { text: ")" },
  ],
  [
    { type: "variable", text: "decoder" },
    { text: " = " },
    { type: "variable", text: "study" },
    { text: "." },
    { type: "function", text: "replay_decoder" },
    { text: "(" },
    { type: "property", text: "tool" },
    { text: "=" },
    { type: "string", text: '"lidmas+"' },
    { text: ")" },
  ],
  [
    { type: "variable", text: "bench" },
    { text: " = " },
    { type: "variable", text: "study" },
    { text: "." },
    { type: "function", text: "prepare_fixture" },
    { text: "(" },
    { type: "property", text: "mode" },
    { text: "=" },
    { type: "string", text: '"loopback"' },
    { text: ")" },
  ],
  [],
  [
    { type: "class", text: "EvidenceBundle" },
    { text: "." },
    { type: "function", text: "package" },
    { text: "(" },
    { type: "variable", text: "layout" },
    { text: ", " },
    { type: "variable", text: "decoder" },
    { text: ", " },
    { type: "variable", text: "bench" },
    { text: ")" },
  ],
];

const pageItems = [
  {
    label: "Software",
    path: "/software",
    eyebrow: "Software Stack",
    title: "Design circuits. Compare decoders. Route experiments.",
    copy:
      "One open-source stack connects SchroSIM, LiDMaS+, and Photon-QDrivers—from circuit definition to replayable decoder runs and validated execution paths.",
    heroCode: softwareHeroCode,
    heroPosition: "right center",
  },
  {
    label: "Studio",
    path: "/studio",
    eyebrow: "Gottesman Studio",
    title: "Online access for photonic circuit studies.",
    copy:
      "A public Studio surface for designing SchroSIM studies, replaying LiDMaS+ decoder evidence, and preparing Photon-QDrivers loopback workflows before lab or partner-fabrication work.",
    heroCode: studioHeroCode,
    heroPosition: "right center",
  },
  {
    label: "Lab",
    path: "/lab",
    eyebrow: "Prototype Lab",
    title: "Test control paths before optical hardware.",
    copy:
      "The Lab program connects SchroSIM designs, LiDMaS+ replay, and Photon-QDrivers bench measurements. Equipment shown below is reference hardware for planned validation—not current inventory.",
    heroImage: "/assets/headers/lab-voltera-vone.webp",
    heroVideo: "/assets/headers/VOneAnatomyDispenserOverview.mp4",
    heroPlaybackRate: 0.45,
    heroPosition: "right center",
  },
  {
    label: "Research",
    path: "/research",
    eyebrow: "Quantum Research",
    title: "Research that connects models, decoders, and hardware.",
    copy:
      "Selected publications and active studies behind SchroSIM, LiDMaS+, and Photon-QDrivers—with the evidence path attached.",
    heroImage: "/assets/headers/research-original-quantum.png",
    heroPosition: "center",
  },
  {
    label: "Team",
    path: "/team",
    eyebrow: "Team",
    title: "A focused team for quantum software research.",
    copy:
      "Leadership spans systems architecture, quantum artificial intelligence, and quantum machine learning—connected through reproducible software and research.",
  },
  {
    label: "Support",
    path: "/support",
    eyebrow: "Support",
    title: "Support and Collaboration",
    copy:
      "This page outlines support paths for grant-making programs, strategic collaborators, and institutions that prioritize reproducible technical progress.",
    heroImage: "/assets/headers/funders-original-funding.png",
    heroPosition: "center",
  },
];

const navItems = [{ label: "Home", path: "/" }, ...pageItems];

const siteOrigin = "https://gottesman-software.github.io";
const enableLidmasLiveRoute =
  import.meta.env.VITE_ENABLE_LIDMAS_LIVE_ROUTE === "1" ||
  import.meta.env.VITE_ENABLE_LIDMAS_LIVE_ROUTE === "true";
const lidmasLiveOrigin = import.meta.env.VITE_LIDMAS_LIVE_ORIGIN || "http://127.0.0.1:5173";
const lidmasLiveDefaultRoute =
  import.meta.env.VITE_LIDMAS_LIVE_DEFAULT_ROUTE ||
  "/decoder/scientific?provider=9f9a3630-d32f-4f5a-bf8d-b9f93fe3a002";

const routeMeta = {
  "/": {
    title: "Gottesman Software | Open-source photonic quantum research software",
    description:
      "Gottesman Software builds open-source research software for designing, decoding, and driving fault-tolerant photonic quantum computing experiments.",
  },
  "/software": {
    title: "Software | SchroSIM, LiDMaS+, Photon-QDrivers",
    description:
      "Explore the Gottesman Software stack for photonic circuit simulation, decoder validation, and lab-facing execution boundaries.",
  },
  "/studio": {
    title: "Gottesman Studio | Online photonic circuit and decoder workbenches",
    description:
      "Gottesman Studio brings SchroSIM Designer, LiDMaS+ Decoder Workbench, and Photon-QDrivers Console into one public online hub.",
  },
  "/studio/lidmas": {
    title: "LiDMaS+ Decoder Workbench | Gottesman Studio",
    description:
      "Run the public LiDMaS+ decoder workbench inside Gottesman Studio with Render-backed replay examples and benchmark evidence views.",
  },
  "/studio/lidmas-live": {
    title: "LiDMaS+ Live API Workbench | Gottesman Studio",
    description:
      "Run the local authenticated LiDMaS+ workbench inside Gottesman Studio against a private backend API.",
  },
  "/lab": {
    title: "Prototype Lab | Gottesman Software",
    description:
      "Prototype pathways for photonic circuit studies, lab-ready electronics, Red Pitaya validation, and partner-lab evidence packages.",
  },
  "/research": {
    title: "Research | Gottesman Software",
    description:
      "Research foundations for photonic circuit simulation, quantum error correction, GKP studies, decoder evidence, and reproducible software.",
  },
  "/team": {
    title: "Team | Gottesman Software Research Group",
    description:
      "Leadership, research roles, recruiting tracks, and collaboration standards for the Gottesman Software research group.",
  },
  "/support": {
    title: "Support | Gottesman Software",
    description:
      "Funding, collaboration, proposal, and support pathways for reproducible photonic quantum research software.",
  },
};

const socialLinks = [
  { label: "GitHub", icon: "github", href: "https://github.com/Gottesman-Software" },
  {
    label: "LinkedIn",
    icon: "linkedin",
    href: "https://www.linkedin.com/in/dennis-wayo-765a38b1/",
  },
  {
    label: "Email Gottesman Software",
    icon: "mail",
    href: "mailto:dwayo3@gatech.edu?subject=Gottesman%20Software%20collaboration",
  },
];

const socialIconPaths = {
  x: "M18.901 1.153h3.68l-8.04 9.19L24 22.847h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.153h7.594l5.243 6.932Zm-1.292 19.492h2.039L6.486 3.24H4.298Z",
  linkedin:
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0Z",
  mail: "M2 4.75A2.75 2.75 0 0 1 4.75 2h14.5A2.75 2.75 0 0 1 22 4.75v14.5A2.75 2.75 0 0 1 19.25 22H4.75A2.75 2.75 0 0 1 2 19.25V4.75Zm2.3-.25L12 10.27l7.7-5.77H4.3Zm15.2 2.38-6.6 4.95a1.5 1.5 0 0 1-1.8 0L4.5 6.88V19.5h15V6.88Z",
  github:
    "M12 .297C5.37.297 0 5.67 0 12.297c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.744.083-.729.083-.729 1.205.085 1.838 1.237 1.838 1.237 1.07 1.835 2.807 1.305 3.492.998.108-.775.418-1.305.762-1.605-2.665-.303-5.466-1.332-5.466-5.93 0-1.31.468-2.381 1.235-3.221-.123-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23A11.52 11.52 0 0 1 12 6.097c1.02.005 2.045.138 3.003.404 2.29-1.552 3.296-1.23 3.296-1.23.653 1.653.241 2.873.118 3.176.77.84 1.233 1.911 1.233 3.221 0 4.61-2.805 5.624-5.475 5.921.43.371.823 1.102.823 2.222 0 1.605-.015 2.898-.015 3.293 0 .322.216.697.825.579C20.565 22.092 24 17.597 24 12.297c0-6.627-5.373-12-12-12Z",
  scholar:
    "M12 2 1.8 7.2 12 12.4 22.2 7.2 12 2Zm-6.6 8.7v4.2c0 2 3 4.1 6.6 4.1s6.6-2.1 6.6-4.1v-4.2L12 14.1 5.4 10.7Zm14.4 1.1v4.4h1.8V10.9l-1.8.9Z",
  medium:
    "M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12Zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42ZM24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75S24 8.83 24 12Z",
};

const footerLinkGroups = [
  {
    title: "Research Facilities",
    links: [
      { label: "Gottesman Studio", path: "/studio" },
      { label: "Prototype Lab", path: "/lab" },
      { label: "Publications", path: "/research" },
    ],
  },
  {
    title: "Updates",
    links: [
      { label: "Research Updates", path: "/research" },
      { label: "Open-Source Notes", path: "/software" },
      { label: "Support Updates", path: "/support" },
    ],
  },
  {
    title: "Research Group",
    links: [
      { label: "Contact Us", href: "#contact" },
      { label: "Research Roles", path: "/team" },
      { label: "Collaboration", path: "/support" },
    ],
  },
];

const stack = [
  {
    name: "SchroSIM",
    role: "Design and simulation",
    copy:
      "Continuous-variable photonic circuit design, compile checks, backend routing, tracing, and reproducible simulation paths.",
    proof: "JSON circuits -> IR validation -> Gaussian, Fock, or hybrid execution",
  },
  {
    name: "LiDMaS+",
    role: "Decoding and validation",
    copy:
      "Quantum error-correction simulation, decoder benchmarking, hardware-to-decoder replay, scoped run keys, and paper-ready artifacts.",
    proof: "Surface, CSS-family, LDPC, GKP-aware workflows, MWPM, UF, BP, neural MWPM",
  },
  {
    name: "Photon-QDrivers",
    role: "Lab and hardware control",
    copy:
      "A photonic workload driver layer with Python API, validated IR, capability checks, native runtime boundaries, FPGA paths, and hardware adapters.",
    proof: "Emulators, mock/native backends, HAL, Red Pitaya validation path, vendor adapter foundations",
  },
];

const softwareShowcases = [
  {
    name: "SchroSIM",
    eyebrow: "Design and simulation",
    logo: "/assets/software/schrosim-logo.png",
    media: "/assets/software/schrosim-ui-preview.gif",
    mediaAlt: "SchroSIM public UI preview from the project README",
    mediaCaption: "Actual SchroSIM circuit workspace from the public project interface.",
    role: "Continuous-variable photonic circuit design, compilation, and simulation.",
    summary:
      "Build photonic workloads, check backend policy, and choose model-exact or controlled-approximation simulation paths before hardware access.",
    fit: [
      "Design CV photonic circuits and project-scoped workflows",
      "Compile into backend-aware runtime configuration",
      "Inspect failure modes such as unsupported operations, numerical limits, and policy mismatch",
    ],
    boundary:
      "Open today: public UI, core workflows, documentation, examples, and reproducibility guidance.",
    repo: {
      label: "Gottesman-Software/SchroSIM",
      url: "https://github.com/Gottesman-Software/SchroSIM",
    },
    languages: [{ name: "Swift", color: "#f05138" }],
  },
  {
    name: "LiDMaS+",
    eyebrow: "Fault-tolerance and decoding",
    logo: "/assets/software/lidmas-logo.png",
    media: "/assets/software/lidmas-ui-active-development.png",
    mediaAlt: "LiDMaS+ UI preview from the project README",
    mediaCaption: "Actual LiDMaS+ control-plane preview; the full interface remains in active development.",
    role: "Reproducible quantum error-correction simulation, decoder benchmarking, and hardware-to-decoder replay.",
    summary:
      "Preserve run scope, decoder settings, seeds, input streams, versions, and result artifacts so QEC studies can be replayed and compared consistently.",
    fit: [
      "Run surface, CSS-family, LDPC, and GKP-aware workflows",
      "Compare MWPM, UF, BP, neural MWPM, and reference decoders",
      "Convert simulator or hardware streams into scoped decoder experiments",
    ],
    boundary:
      "Open today: stable CLI workflows and public replay examples. The full control-plane UI is still evolving.",
    repo: {
      label: "Gottesman-Software/lidmas_cpp",
      url: "https://github.com/Gottesman-Software/lidmas_cpp",
    },
    languages: [
      { name: "C++", color: "#f34b7d" },
      { name: "Python", color: "#3572a5" },
    ],
  },
  {
    name: "Photon-QDrivers",
    eyebrow: "Lab and hardware control",
    logo: "/assets/software/photon-qdrivers-logo.png",
    media: "/assets/software/photon-qdrivers-compile-run-flow.png",
    mediaAlt: "Photon-QDrivers compile and run sequence from the public project documentation",
    mediaCaption: "Actual compile-and-run sequence documented in the Photon-QDrivers repository.",
    role: "A universal driver layer for photonic workloads across emulators, native runtime paths, FPGA boundaries, and hardware adapters.",
    summary:
      "Validate a PhotonicCircuit IR, check backend capabilities, route jobs to the selected target, and normalize results for downstream analysis.",
    fit: [
      "Expose one Python API for emulator and hardware-like targets",
      "Attach backend capability metadata before execution",
      "Bridge to native runtime, HAL contracts, FPGA mailboxes, and vendor adapters",
    ],
    boundary:
      "Open today: emulator, native runtime, FPGA mailbox, and Red Pitaya host paths. Complete photonic hardware remains outside this project.",
    repo: {
      label: "Gottesman-Software/photon-qdrivers",
      url: "https://github.com/Gottesman-Software/photon-qdrivers",
    },
    languages: [
      { name: "Python", color: "#3572a5" },
      { name: "C++", color: "#f34b7d" },
    ],
  },
];

const studioSurfaces = [
  {
    name: "SchroSIM Designer",
    eyebrow: "Circuit design and simulation",
    status: "Public preview",
    image: "/assets/software/schrosim-ui-preview.gif",
    imageAlt: "Animated SchroSIM Studio desktop interface preview",
    copy:
      "Explore the SchroSIM design workflow for continuous-variable photonic circuits, including circuit structure, simulation assumptions, validation checks, and export-ready study records.",
    points: [
      "Inspect continuous-variable circuit studies",
      "Review simulation assumptions and validation limits",
      "Export circuit studies into layout, decoder, and lab-prototype packages",
    ],
    primaryHref: "https://gottesman-software.github.io/SchroSIM/14-schrosim-studio/",
    primaryLabel: "Open SchroSIM guide",
    repoHref: "https://github.com/Gottesman-Software/SchroSIM",
  },
  {
    name: "LiDMaS+ Decoder Workbench",
    eyebrow: "Decoder replay and benchmark evidence",
    status: "Online workbench",
    image: "/assets/software/lidmas-ui-active-development.png",
    imageAlt: "LiDMaS+ UI preview",
    copy:
      "Run decoder examples in the browser, inspect the settings behind each result, and compare replayable benchmark evidence without installing the full toolkit.",
    points: [
      "Open example syndrome streams and decoder configurations",
      "Inspect run provenance, seeds, warnings, and logical-error summaries",
      "Compare benchmark artifacts for research claims",
    ],
    primaryPath: "/studio/lidmas",
    primaryLabel: "Open LiDMaS+ Workbench",
    repoHref: "https://github.com/Gottesman-Software/lidmas_cpp",
  },
  {
    name: "Photon-QDrivers Console",
    eyebrow: "Simulator and loopback execution",
    status: "Coming soon",
    image: "/assets/software/photon-qdrivers-execution-animation.svg",
    imageAlt: "Photon-QDrivers execution boundary animation",
    copy:
      "Preview the route from validated photonic workloads to simulator and loopback tests before any partner-lab hardware is involved.",
    points: [
      "Validate PhotonicCircuit IR against backend capabilities",
      "Run emulator or loopback jobs for early control checks",
      "Package timing logs and result frames for partner-lab review",
    ],
    primaryPath: "/lab",
    primaryLabel: "View lab workflow",
    repoHref: "https://github.com/Gottesman-Software/photon-qdrivers",
  },
];

const studioImplementationPlan = [
  {
    step: "01",
    title: "Design the study",
    copy:
      "Begin with a photonic circuit study in SchroSIM and keep the circuit source, assumptions, and validation notes attached.",
  },
  {
    step: "02",
    title: "Replay decoder evidence",
    copy:
      "Move examples and syndrome streams into LiDMaS+ so decoder choices, seeds, warnings, and logical-error summaries can be inspected.",
  },
  {
    step: "03",
    title: "Check control paths",
    copy:
      "Use simulator and loopback workflows to test software-controlled execution before promoting a study to partner-lab hardware.",
  },
  {
    step: "04",
    title: "Package the result",
    copy:
      "Collect circuit files, runtime settings, decoder records, logs, figures, layout notes, and claim labels into a reviewable evidence package.",
  },
];

const studioExportPackages = [
  "SchroSIM circuit source and PhotonicCircuit IR",
  "foundry-oriented layout notes for partner fabrication",
  "LiDMaS+ decoder replay bundle with seeds and warnings",
  "Photon-QDrivers emulator or loopback timing record",
  "prototype board, fixture, and validation notes for lab partners",
];

const studioRailItems = [
  {
    label: "Studio Home",
    icon: "Gs",
    href: "/studio",
  },
  {
    label: "SchroSIM",
    icon: "Sc",
    href: "https://gottesman-software.github.io/SchroSIM/14-schrosim-studio/",
  },
  {
    label: "LiDMaS+",
    icon: "Ld",
    href: "/studio/lidmas",
  },
  ...(enableLidmasLiveRoute
    ? [
        {
          label: "LiDMaS Live",
          icon: "Lv",
          href: "/studio/lidmas-live",
        },
      ]
    : []),
  {
    label: "QDrivers",
    icon: "Qd",
    href: "#qdrivers-coming-soon",
  },
  {
    label: "Docs",
    icon: "Dc",
    href: "#studio-docs",
  },
  {
    label: "Feedback",
    icon: "Fb",
    href: "mailto:dwayo3@gatech.edu?subject=Gottesman%20Studio%20feedback",
  },
];

const lidmasTourSteps = [
  {
    title: "Open the scientific dashboard",
    body: "Start on the main decoder dashboard. This is the overview for logical-error behavior, selected decoder, and current public demo state.",
    route: "/decoder/scientific",
  },
  {
    title: "Confirm public demo mode",
    body: "Use the public API mode for provider-safe replay examples. Credentials, real QPU execution, and lab hardware control are intentionally outside this route.",
    route: "/settings",
  },
  {
    title: "Choose a decoder",
    body: "Select MWPM, union-find, belief propagation, or neural-guided paths depending on the comparison you want to inspect.",
    route: "/decoder/scientific",
  },
  {
    title: "Load an example stream",
    body: "Use the built-in examples to inspect syndrome-like data without uploading private lab records or connecting to hardware.",
    route: "/runs",
  },
  {
    title: "Inspect telemetry",
    body: "Review runtime signals, warning rates, replay identity, and the measurements that explain how the decoder path behaved.",
    route: "/decoder/telemetry",
  },
  {
    title: "Run validation checks",
    body: "Use validation views to compare expected behavior against replayed output before treating a result as evidence.",
    route: "/decoder/validation",
  },
  {
    title: "Read logs",
    body: "Open logs when a run is confusing. Warnings, fallbacks, and rejected assumptions should be visible before results are trusted.",
    route: "/decoder/logs",
  },
  {
    title: "Compare providers",
    body: "Provider views help separate simulated, replayed, and hardware-shaped data sources so the public claim boundary stays clear.",
    route: "/providers",
  },
  {
    title: "Check observability",
    body: "Use observability to catch unhealthy states, stale replay data, or assumptions that should be fixed before sharing results.",
    route: "/observability",
  },
  {
    title: "Package the evidence",
    body: "Finish by collecting decoder choice, run identity, settings, warnings, figures, and notes into a replayable artifact bundle.",
    route: "/help",
  },
];

const lidmasLiveTourSteps = [
  {
    title: "Open the live scientific dashboard",
    body: "Start on the authenticated decoder dashboard. The route should show Live API mode and the selected backend provider.",
    route: lidmasLiveDefaultRoute,
  },
  {
    title: "Confirm backend health",
    body: "The health query should reach the local backend at the configured API base before provider or run data is trusted.",
    route: "/decoder/scientific",
  },
  {
    title: "Verify the provider registry",
    body: "Open Providers and confirm the backend list is rendered from the configured API rather than local fixtures.",
    route: "/providers",
  },
  {
    title: "Arm the system deliberately",
    body: "Live API mode keeps run-facing panels in standby until the system is armed, so real backend calls remain intentional.",
    route: "/settings",
  },
  {
    title: "Inspect runs",
    body: "Use Runs to confirm authenticated run metadata is loading from the backend and not the static public bundle.",
    route: "/runs",
  },
  {
    title: "Inspect telemetry",
    body: "Telemetry should read backend run telemetry when a run is selected, while empty states remain clear when no run is active.",
    route: "/decoder/telemetry",
  },
  {
    title: "Check validation",
    body: "Validation views should separate replay, benchmark, and live-provider evidence before a result is promoted.",
    route: "/decoder/validation",
  },
  {
    title: "Read API logs",
    body: "Logs should summarize backend-derived provider, job, and run signals after the system is armed.",
    route: "/decoder/logs",
  },
  {
    title: "Review the public simulator boundary",
    body: "Providers should remain simulator-only in public mode, with credentials and lab hardware controls outside the hosted Studio.",
    route: "/providers",
  },
  {
    title: "Close the live loop",
    body: "Finish by checking that authentication, provider data, and backend health all remain green before testing session creation.",
    route: "/observability",
  },
];

const softwareResults = [
  {
    label: "result 01",
    name: "SchroSIM",
    title: "Photonic circuit designs can be checked before hardware access.",
    points: [
      "Backend-aware compile checks expose unsupported operations, numerical limits, policy mismatches, and non-physical parameter choices.",
      "The public core includes docs, CLI, SDK, tracing guidance, validation notes, and worked CV examples.",
      "Useful demo paths include runtime-default foundry checks, Fock injection smoke tests, foundry loss maps, seeded homodyne, and GKP QEC memory.",
    ],
  },
  {
    label: "result 02",
    name: "LiDMaS+",
    title: "Decoder studies become replayable research artifacts.",
    points: [
      "Run scope records code family, decoder set, execution mode, hyperparameters, seed controls, input identity, and version identity.",
      "The example suite covers hybrid thresholds, Pauli thresholds, CV/GKP demos, decoder comparison, adaptive stopping, scaling fits, and failure-debug capture.",
      "The public Studio path focuses on bounded simulator circuits, noise injection, syndrome extraction, decoder-policy comparison, and exact counter readout.",
    ],
  },
  {
    label: "result 03",
    name: "Photon-QDrivers",
    title: "The control layer has a real software boundary before lab hardware.",
    points: [
      "The Python API validates PhotonicCircuit IR, checks backend capabilities, compiles jobs, and normalizes execution results.",
      "The C++ runtime defines RuntimeJob, RuntimeResult, DeviceCapabilities, validation errors, and transport failures.",
      "The hardware-facing path includes FPGA mailbox contracts, portable SystemVerilog modules, and a Red Pitaya host/runtime profile.",
    ],
  },
];

const quickStartScripts = [
  {
    language: "Python",
    file: "quickstart.py",
    label: "Photon-QDrivers",
    summary: "Compile and run a small photonic circuit against the documented mock backend.",
    accent: "#60a5fa",
    code: [
      [{ type: "comment", text: "# quickstart.py" }],
      [{ type: "keyword", text: "from" }, { text: " " }, { type: "module", text: "photonic_driver" }, { text: " " }, { type: "keyword", text: "import" }, { text: " " }, { type: "class", text: "Driver" }],
      [],
      [{ type: "variable", text: "circuit" }, { text: " = {" }],
      [{ text: "    " }, { type: "string", text: '"type"' }, { text: ": " }, { type: "string", text: '"photonic_circuit"' }, { text: "," }],
      [{ text: "    " }, { type: "string", text: '"modes"' }, { text: ": " }, { type: "number", text: "4" }, { text: "," }],
      [{ text: "    " }, { type: "string", text: '"operations"' }, { text: ": [" }],
      [{ text: "        {" }, { type: "string", text: '"gate"' }, { text: ": " }, { type: "string", text: '"BS"' }, { text: ", " }, { type: "string", text: '"modes"' }, { text: ": [" }, { type: "number", text: "0" }, { text: ", " }, { type: "number", text: "1" }, { text: "]}," }],
      [{ text: "        {" }, { type: "string", text: '"gate"' }, { text: ": " }, { type: "string", text: '"PS"' }, { text: ", " }, { type: "string", text: '"mode"' }, { text: ": " }, { type: "number", text: "0" }, { text: ", " }, { type: "string", text: '"theta"' }, { text: ": " }, { type: "number", text: "0.5" }, { text: "}," }],
      [{ text: "        {" }, { type: "string", text: '"measure"' }, { text: ": " }, { type: "string", text: '"photon_counting"' }, { text: ", " }, { type: "string", text: '"modes"' }, { text: ": [" }, { type: "number", text: "0" }, { text: ", " }, { type: "number", text: "1" }, { text: ", " }, { type: "number", text: "2" }, { text: ", " }, { type: "number", text: "3" }, { text: "]}," }],
      [{ text: "    ]," }],
      [{ text: "    " }, { type: "string", text: '"shots"' }, { text: ": " }, { type: "number", text: "1000" }, { text: "," }],
      [{ text: "}" }],
      [],
      [{ type: "variable", text: "driver" }, { text: " = " }, { type: "class", text: "Driver" }, { text: "." }, { type: "function", text: "load" }, { text: "(" }, { type: "string", text: '"mock"' }, { text: ")" }],
      [{ type: "variable", text: "job" }, { text: " = " }, { type: "variable", text: "driver" }, { text: "." }, { type: "function", text: "compile" }, { text: "(" }, { type: "variable", text: "circuit" }, { text: ")" }],
      [{ type: "variable", text: "result" }, { text: " = " }, { type: "variable", text: "driver" }, { text: "." }, { type: "function", text: "run" }, { text: "(" }, { type: "variable", text: "job" }, { text: ")" }],
      [{ type: "function", text: "print" }, { text: "(" }, { type: "variable", text: "result" }, { text: ")" }],
    ],
  },
  {
    language: "C++",
    file: "quickstart.cpp",
    label: "Native runtime",
    summary: "Submit a typed RuntimeJob through the Photon-QDrivers C++ runtime boundary.",
    accent: "#f97316",
    code: [
      [{ type: "comment", text: "// quickstart.cpp" }],
      [{ type: "keyword", text: "#include" }, { text: " " }, { type: "string", text: '"photon_qdrivers/runtime.hpp"' }],
      [{ type: "keyword", text: "#include" }, { text: " " }, { type: "string", text: '"photon_qdrivers/types.hpp"' }],
      [{ type: "keyword", text: "#include" }, { text: " " }, { type: "string", text: '<iostream>' }],
      [],
      [{ type: "keyword", text: "using" }, { text: " " }, { type: "keyword", text: "namespace" }, { text: " " }, { type: "module", text: "photon_qdrivers" }, { text: ";" }],
      [],
      [{ type: "keyword", text: "int" }, { text: " " }, { type: "function", text: "main" }, { text: "() {" }],
      [{ text: "    " }, { type: "class", text: "Runtime" }, { text: " " }, { type: "variable", text: "runtime" }, { text: ";" }],
      [{ text: "    " }, { type: "variable", text: "runtime" }, { text: "." }, { type: "function", text: "initialize" }, { text: "();" }],
      [],
      [{ text: "    " }, { type: "class", text: "RuntimeJob" }, { text: " " }, { type: "variable", text: "job" }, { text: ";" }],
      [{ text: "    " }, { type: "variable", text: "job" }, { text: "." }, { type: "property", text: "job_id" }, { text: " = " }, { type: "string", text: '"quickstart-001"' }, { text: ";" }],
      [{ text: "    " }, { type: "variable", text: "job" }, { text: "." }, { type: "property", text: "circuit_ir" }, { text: " = " }, { type: "string", text: 'R"({"type":"photonic_circuit","modes":2})"' }, { text: ";" }],
      [{ text: "    " }, { type: "variable", text: "job" }, { text: "." }, { type: "property", text: "modes" }, { text: " = " }, { type: "number", text: "2" }, { text: ";" }],
      [{ text: "    " }, { type: "variable", text: "job" }, { text: "." }, { type: "property", text: "shots" }, { text: " = " }, { type: "number", text: "1024" }, { text: ";" }],
      [{ text: "    " }, { type: "variable", text: "job" }, { text: "." }, { type: "property", text: "operations" }, { text: " = {" }, { type: "string", text: '"BS"' }, { text: ", " }, { type: "string", text: '"PS"' }, { text: ", " }, { type: "string", text: '"photon_counting"' }, { text: "};" }],
      [],
      [{ text: "    " }, { type: "variable", text: "runtime" }, { text: "." }, { type: "function", text: "submit_job" }, { text: "(" }, { type: "variable", text: "job" }, { text: ");" }],
      [{ text: "    " }, { type: "keyword", text: "auto" }, { text: " " }, { type: "variable", text: "result" }, { text: " = " }, { type: "variable", text: "runtime" }, { text: "." }, { type: "function", text: "read_result" }, { text: "(" }, { type: "variable", text: "job" }, { text: "." }, { type: "property", text: "job_id" }, { text: ");" }],
      [{ text: "    " }, { type: "module", text: "std" }, { text: "::" }, { type: "variable", text: "cout" }, { text: " << " }, { type: "function", text: "to_string" }, { text: "(" }, { type: "variable", text: "result" }, { text: "." }, { type: "property", text: "status" }, { text: ") << " }, { type: "string", text: '"\\n"' }, { text: ";" }],
      [{ text: "    " }, { type: "variable", text: "runtime" }, { text: "." }, { type: "function", text: "shutdown" }, { text: "();" }],
      [{ text: "}" }],
    ],
  },
  {
    language: "Swift",
    file: "QuickStart.swift",
    label: "SchroSIM",
    summary: "Build a small continuous-variable circuit with SchroSIM's Swift circuit API.",
    accent: "#f43f5e",
    code: [
      [{ type: "comment", text: "// QuickStart.swift" }],
      [{ type: "keyword", text: "import" }, { text: " " }, { type: "module", text: "SchroSIM" }],
      [],
      [{ type: "keyword", text: "let" }, { text: " " }, { type: "variable", text: "circuit" }, { text: " = " }, { type: "keyword", text: "try" }, { text: " " }, { type: "class", text: "Circuit" }, { text: "(" }, { type: "property", text: "modes" }, { text: ": " }, { type: "number", text: "2" }, { text: ")" }],
      [{ type: "variable", text: "circuit" }, { text: "." }, { type: "function", text: "squeeze" }, { text: "(" }, { type: "property", text: "r" }, { text: ": " }, { type: "number", text: "0.4" }, { text: ", " }, { type: "property", text: "on" }, { text: ": " }, { type: "number", text: "0" }, { text: ")" }],
      [{ type: "variable", text: "circuit" }, { text: "." }, { type: "function", text: "beamSplitter" }, { text: "(" }, { type: "property", text: "theta" }, { text: ": " }, { type: "number", text: "0.785" }, { text: ", " }, { type: "number", text: "0" }, { text: ", " }, { type: "number", text: "1" }, { text: ")" }],
      [{ type: "variable", text: "circuit" }, { text: "." }, { type: "function", text: "measureHomodyne" }, { text: "(" }, { type: "property", text: "mode" }, { text: ": " }, { type: "number", text: "0" }, { text: ", " }, { type: "property", text: "theta" }, { text: ": " }, { type: "number", text: "0.0" }, { text: ")" }],
      [],
      [{ type: "keyword", text: "let" }, { text: " " }, { type: "variable", text: "result" }, { text: " = " }, { type: "keyword", text: "try" }, { text: " " }, { type: "class", text: "Simulator" }, { text: "." }, { type: "function", text: "runAndMeasure" }, { text: "(" }, { type: "variable", text: "circuit" }, { text: ")" }],
      [{ type: "function", text: "print" }, { text: "(" }, { type: "string", text: '"measurements:"' }, { text: ", " }, { type: "variable", text: "result" }, { text: "." }, { type: "property", text: "measurements" }, { text: "." }, { type: "property", text: "count" }, { text: ")" }],
    ],
  },
];

const softwareMaturityBoundaries = [
  {
    name: "SchroSIM",
    current:
      "Public core workflows expose CLI, SDK, docs, examples, backend-aware execution, tracing, and reproducibility guidance.",
    boundary:
      "The UI is treated as public research software alongside the CLI and SDK, with development tracked openly as the interface matures.",
  },
  {
    name: "LiDMaS+",
    current:
      "Stable work is CLI-first with C++20/Python packaging, docs, examples, hardware replay paths, and manuscript-oriented paper runs.",
    boundary:
      "The UI remains active development, and hardware integrations should be described by live or replay mode rather than as owned quantum hardware.",
  },
  {
    name: "Photon-QDrivers",
    current:
      "The driver stack has a Python API, C++ runtime, native backend, FPGA mailbox contract, portable SystemVerilog, and a Red Pitaya host profile.",
    boundary:
      "SchroSIM and LiDMaS plugins are currently placeholders, and the Red Pitaya profile is a host/runtime path rather than a complete board firmware image.",
  },
];

const researchThesisItems = [
  {
    signal: "model",
    name: "SchroSIM",
    path: "/software",
    image: "/assets/home/schrosim-workstation.webp",
    imageAlt:
      "Illustrative research workstation showing photonic circuit simulation beside an optical bench",
    role: "Photonic circuit design and simulation",
    copy:
      "Define continuous-variable photonic circuits, expose numerical assumptions, check backend policy, and produce reproducible simulator-ready workloads.",
  },
  {
    signal: "decode",
    name: "LiDMaS+",
    path: "/software",
    image: "/assets/home/lidmas-decoder-evidence.webp",
    imageAlt:
      "Illustrative decoder-validation workstation with syndrome maps, benchmark curves, and experiment notes",
    role: "Fault-tolerance and decoder validation",
    copy:
      "Preserve decoder settings, noise models, seeds, run identity, and output artifacts so QEC studies can be replayed and compared.",
  },
  {
    signal: "drive",
    name: "Photon-QDrivers",
    path: "/lab",
    image: "/assets/home/photon-qdrivers-control.webp",
    imageAlt:
      "Illustrative prototype control board connected to fiber and measurement hardware on an optical bench",
    role: "Prototype control and execution boundaries",
    copy:
      "Route validated workloads through emulators, native runtime paths, FPGA contracts, and hardware adapters without losing provenance.",
  },
];

const workflowSteps = [
  {
    step: "01",
    name: "SchroSIM",
    label: "Design",
    path: "/software",
    output: "PhotonicCircuit IR",
    copy: "Define continuous-variable photonic circuits, check backend policy, and produce simulator-ready workloads.",
  },
  {
    step: "02",
    name: "LiDMaS+",
    label: "Decode",
    path: "/software",
    output: "Replayable QEC runs",
    copy: "Attach noise models, decoder settings, seeds, and result artifacts to fault-tolerance studies.",
  },
  {
    step: "03",
    name: "Photon-QDrivers",
    label: "Control",
    path: "/lab",
    output: "Validated execution boundary",
    copy: "Route workloads through emulators, native boundaries, FPGA paths, and hardware-adapter contracts.",
  },
  {
    step: "04",
    name: "Prototype Lab",
    label: "Validate",
    path: "/lab",
    output: "Evidence for collaboration",
    copy: "Use controlled prototype workflows to test circuit, decoder, and control assumptions before broader lab evaluation.",
  },
];

const evidenceStandards = [
  {
    label: "Run provenance",
    copy:
      "Circuit source, backend policy, decoder settings, seeds, and artifact locations should stay attached to each result.",
  },
  {
    label: "Replayable artifacts",
    copy:
      "Simulator output and hardware-like streams should be replayable through the same decoder contracts for comparison.",
  },
  {
    label: "Boundary clarity",
    copy:
      "Each layer should state what is validated, what remains simulated, and what requires collaborator or lab hardware.",
  },
];

const quantumResearchThemes = [
  {
    theme: "Differentiable Mitigation",
    signal: "DIF",
    title:
      "DifGa: differentiable error mitigation for multi-mode Gaussian and non-Gaussian noise in quantum photonic circuits",
    authors: "Dennis Delali Kwesi Wayo, Rodrigo Alves Dias, Leonardo Goliatt, Sven Groppe",
    venue: "Journal of Physics: Photonics 8, 035004, 2026",
    href: "https://iopscience.iop.org/article/10.1088/2515-7647/ae7864/meta",
    summary:
      "Defines an observable-level mitigation workflow for continuous-variable photonic circuits under Gaussian loss and weak non-Gaussian phase noise, using differentiable optimization over trainable Gaussian recovery layers.",
    tags: ["CV photonics", "error mitigation", "Gaussian noise", "PennyLane"],
  },
  {
    theme: "Hardware-to-Decoder QEC",
    signal: "H2D",
    title:
      "A Unified Hardware-to-Decoder Architecture for Hybrid Continuous-Variable and Discrete-Variable Quantum Error Correction in LiDMaS+",
    authors: "Dennis Delali Kwesi Wayo, Chinonso Onah, Leonardo Goliatt, Sven Groppe",
    venue: "arXiv:2604.15389, 2026",
    href: "https://arxiv.org/abs/2604.15389",
    summary:
      "Introduces a LiDMaS+ hardware-to-logical-to-decoder stack that normalizes provider records into one decoder I/O contract and replays them across MWPM, UF, BP, and neural-MWPM.",
    tags: ["LiDMaS+", "hardware replay", "decoder I/O", "hybrid CV-DV QEC"],
  },
  {
    theme: "Coherent-State Codes",
    signal: "RAC",
    title:
      "RaCS: Near-Zero-Error Classical Data Encoding on Photonic Quantum Processors via Redundancy-Assisted Coherent-State Codes",
    authors: "Dennis Delali Kwesi Wayo, Sven Groppe",
    venue: "Fortschritte der Physik 74(4), e70095, 2026",
    href: "https://onlinelibrary.wiley.com/doi/full/10.1002/prop.70095",
    summary:
      "Evaluates redundancy-assisted coherent-state encoding for classical data on photonic quantum processors, comparing homodyne and threshold detection under loss and alphabet-size sweeps.",
    tags: ["coherent states", "photonic processors", "homodyne detection", "PennyLane"],
  },
  {
    theme: "GKP Threshold Estimation",
    signal: "GKP",
    title:
      "Decoder Dependence in Surface-Code Threshold Estimation with Native Gottesman-Kitaev-Preskill Digitization and Parallelized Sampling",
    authors: "Dennis Delali Kwesi Wayo, Chinonso Onah, Leonardo Goliatt, Sven Groppe",
    venue: "arXiv:2603.25757, 2026",
    href: "https://arxiv.org/abs/2603.25757",
    summary:
      "Quantifies how decoder and estimator choices affect surface-code threshold studies under Pauli noise and native GKP-style Gaussian displacement digitization with parallelized LiDMaS+ sampling.",
    tags: ["GKP digitization", "surface code", "thresholds", "parallel sampling"],
  },
  {
    theme: "Published Decoder Study",
    signal: "DEC",
    title:
      "Decoder Dependence in Surface-Code Threshold Estimation Under Digitized Hybrid Continuous-Variable and Discrete Noise",
    authors: "Dennis Delali Kwesi Wayo, Chinonso Onah, Leonardo Goliatt, Sven Groppe",
    venue: "Fortschritte der Physik 74(6), e70124, 2026",
    href: "https://onlinelibrary.wiley.com/doi/full/10.1002/prop.70124",
    summary:
      "Compares decoder backends and estimator behavior inside one LiDMaS+ workflow, showing that fallback diagnostics, estimator resolution, and neural guidance change auditable threshold claims.",
    tags: ["LiDMaS+", "decoder comparison", "hybrid CV-discrete", "Fortschritte der Physik"],
  },
  {
    theme: "Ultrafast Quantum Photonics",
    signal: "NLSE",
    title:
      "Simulation of ultrafast photonic circuits via nonlinear Schrodinger dynamics and quantum detector modeling",
    authors: "Dennis Delali Kwesi Wayo",
    venue: "Optical and Quantum Electronics 58, article 125, 2026",
    href: "https://link.springer.com/article/10.1007/s11082-026-08700-y",
    summary:
      "Builds a Python simulation framework for integrated quantum photonic systems governed by nonlinear Schrodinger dynamics, split-step Fourier propagation, and probabilistic photodetection models.",
    tags: ["NLSE", "ultrafast photonics", "single-photon detectors", "SchroSIM"],
  },
  {
    theme: "Photonic Magic-State Modeling",
    signal: "LID",
    title: "LiDMaS: Architecture-Level Modeling of Fault-Tolerant Magic-State Injection in GKP Photonic Qubits",
    authors: "Dennis Delali Kwesi Wayo",
    venue: "arXiv:2601.16244, 2026",
    href: "https://arxiv.org/abs/2601.16244",
    summary:
      "Models repeat-until-success logical T-gate magic-state preparation in GKP photonic qubits, tracking finite squeezing, photon loss, surface-code distance, success probability, and logical fidelity.",
    tags: ["GKP qubits", "magic states", "finite squeezing", "fault tolerance"],
  },
  {
    theme: "Physics-Informed Materials AI",
    signal: "PINN",
    title: "Ensembles of Graph and Physics-Informed Machine Learning for Scientific Modeling in Materials Science: A Review",
    authors: "Dennis Delali Kwesi Wayo",
    venue: "Archives of Computational Methods in Engineering 33, 963-988, 2026",
    href: "https://link.springer.com/article/10.1007/s11831-025-10325-5",
    summary:
      "Reviews ensemble GNNs, PINNs, mixture-of-experts, uncertainty assessment, and benchmark datasets for robust scientific modeling in materials science and physics-informed simulation.",
    tags: ["graph ML", "PINNs", "materials modeling", "uncertainty"],
  },
  {
    theme: "Photonic Simulator Architecture",
    signal: "SCS",
    title:
      "SchroSIM: A Schroedinger-Inspired Scalable Quantum Photonic Circuit Simulator for Hardware-Agnostic Quantum Computing",
    authors: "Dennis Delali Kwesi Wayo",
    venue: "TechRxiv preprint, 2025",
    href: "https://www.techrxiv.org/doi/abs/10.36227/techrxiv.175008354.44543221/v1",
    summary:
      "Presents the SchroSIM simulator concept: a modular frontend, intermediate compiler, and GPU-oriented backend stack for hardware-agnostic photonic quantum circuit simulation.",
    tags: ["SchroSIM", "photonic circuits", "hardware-agnostic simulation", "TechRxiv"],
  },
];

const researchFocusTracks = [
  "photonic circuit simulation",
  "continuous-variable mitigation",
  "hardware-to-decoder replay",
  "GKP and surface-code threshold studies",
  "coherent-state photonic encoding",
  "physics-informed scientific modeling",
];

const researchSpotlight = {
  eyebrow: "Publication Spotlight",
  signal: "DEC",
  title: "Decoder Dependence in Surface-Code Threshold Estimation Under Digitized Hybrid Continuous-Variable and Discrete Noise",
  authors: "Dennis Delali Kwesi Wayo, Chinonso Onah, Leonardo Goliatt, Sven Groppe",
  image: "/assets/research/decoder-dependence-spotlight.png",
  imageAlt:
    "First page preview of the Fortschritte der Physik article on decoder dependence in surface-code threshold estimation.",
  href: "https://onlinelibrary.wiley.com/doi/full/10.1002/prop.70124",
  venue: "Fortschritte der Physik 74(6), e70124, 2026",
  summary:
    "Decoder choice and estimator resolution can shift threshold conclusions under hybrid CV-discrete noise. This paper anchors the LiDMaS+ decoder-evidence program.",
  facts: ["LiDMaS+ workflow", "hybrid CV-discrete sweeps", "accepted 4 June 2026"],
};

const researchAgenda = [
  {
    signal: "SIM",
    title: "Model photonic circuits.",
    body:
      "Use SchroSIM to test circuit assumptions, runtime policy, and simulator behavior.",
    outputs: ["circuit IR", "validation gates"],
    image: "/assets/software/schrosim-ui-preview.gif",
    imageAlt: "Actual SchroSIM circuit simulation workspace",
  },
  {
    signal: "QEC",
    title: "Test decoder claims.",
    body:
      "Use LiDMaS+ to compare thresholds, estimators, and replayed syndrome streams.",
    outputs: ["decoder traces", "threshold studies"],
    image: "/assets/research/decoder-dependence-spotlight.png",
    imageAlt: "First page of the published decoder-dependence study",
  },
  {
    signal: "LAB",
    title: "Translate evidence to control.",
    body:
      "Use Photon-QDrivers to carry validated workloads toward board and partner-lab checks.",
    outputs: ["timing evidence", "claim labels"],
    image: "/assets/software/photon-qdrivers-compile-run-flow.png",
    imageAlt: "Photon-QDrivers compile and run workflow",
  },
];

const claimEvidencePipeline = [
  {
    step: "01",
    label: "Question",
    copy: "Define the claim.",
  },
  {
    step: "02",
    label: "Artifact",
    copy: "Attach source, version, and seed.",
  },
  {
    step: "03",
    label: "Replay",
    copy: "Run the same fixture.",
  },
  {
    step: "04",
    label: "Benchmark",
    copy: "Measure thresholds or timing.",
  },
  {
    step: "05",
    label: "Publish",
    copy: "Release scripts and figures.",
  },
  {
    step: "06",
    label: "Translate",
    copy: "Feed results back into software.",
  },
];

const activeResearchTracks = [
  {
    name: "SchroSIM validation gates",
    software: "SchroSIM",
    question: "Which photonic circuit claims survive cross-runtime and backend-policy checks?",
    evidence: ["CV validation suite", "trace SLO gate", "compute baseline JSON"],
  },
  {
    name: "Decoder dependence and threshold evidence",
    software: "LiDMaS+",
    question: "How do MWPM, UF, BP, neural guidance, and estimator choices change threshold claims?",
    evidence: ["paper_01 workflows", "decoder trace bundles", "crossing summaries"],
  },
  {
    name: "Simulator-to-decoder replay",
    software: "LiDMaS+",
    question: "Can provider-style records be normalized into one decoder I/O contract?",
    evidence: ["syndrome fixtures", "provider-shaped records", "exact counter checks"],
  },
  {
    name: "Lab-control boundary",
    software: "Photon-QDrivers",
    question: "Where does a simulated result become a board-facing or partner-lab measurement?",
    evidence: ["RuntimeJob fixtures", "Red Pitaya loopback", "claim labels"],
  },
];

const reproducibilityStandards = [
  {
    label: "Executable workflow",
    copy: "Scripts should regenerate the table, figure, benchmark, or fixture that supports the claim.",
  },
  {
    label: "Attached provenance",
    copy: "Each result should carry software version, seed, backend policy, decoder setting, and source artifact.",
  },
  {
    label: "Failure visibility",
    copy: "Warnings, fallback paths, residual syndromes, and decoder failures should be visible rather than hidden.",
  },
  {
    label: "Boundary labels",
    copy: "Every result should say whether it is simulated, replayed, emulated, loopback-bench, or partner-lab evidence.",
  },
];

const publicationResearchMatrix = [
  {
    paper: "Decoder Dependence in Surface-Code Threshold Estimation",
    theme: "Decoder evidence",
    software: "LiDMaS+",
    evidence: "threshold sweeps, trace artifacts, decoder comparisons",
    status: "published",
  },
  {
    paper: "Unified Hardware-to-Decoder Architecture",
    theme: "Hardware replay",
    software: "LiDMaS+ / Photon-QDrivers",
    evidence: "provider fixture conversion and decoder I/O replay",
    status: "preprint",
  },
  {
    paper: "SchroSIM photonic circuit simulator",
    theme: "Simulation architecture",
    software: "SchroSIM",
    evidence: "runtime IR, backend routing, validation benchmarks",
    status: "preprint",
  },
  {
    paper: "DifGa differentiable mitigation",
    theme: "Photonic methods",
    software: "SchroSIM methods layer",
    evidence: "observable-level optimization under Gaussian and weak non-Gaussian noise",
    status: "published",
  },
  {
    paper: "GKP and magic-state modeling studies",
    theme: "Fault tolerance",
    software: "LiDMaS+ research workflows",
    evidence: "finite-squeezing, surface-code, and digitized-noise studies",
    status: "active line",
  },
];

const openResearchQuestions = [
  "Can one artifact describe a photonic circuit prototype from SchroSIM design through LiDMaS+ replay and Photon-QDrivers timing evidence?",
  "Which decoder conclusions remain stable when syndrome streams move from synthetic models to hardware-derived records?",
  "How should GKP digitization and finite-squeezing assumptions be reported so threshold claims remain reproducible?",
  "What minimum evidence bundle should a collaborator receive before attempting a partner-lab replication?",
  "Where should simulation, emulator, loopback bench, and optical-lab claims be separated in public reporting?",
];

const capabilities = [
  {
    title: "Circuit layer",
    body: "Circuit definitions, schema validation, backend capability checks, and simulator routing.",
  },
  {
    title: "Decoder layer",
    body: "Benchmarks, threshold sweeps, failure replay, run keys, and publication-ready comparison artifacts.",
  },
  {
    title: "Hardware layer",
    body: "HAL boundaries, emulator parity, timing paths, capture schemas, and native adapter foundations.",
  },
];

const labSteps = [
  "Host command serialization",
  "GPIO or DAC pulse generation",
  "Detector event capture",
  "Coincidence window counting",
  "Result readback and replay",
];

const labAssets = {
  volteraVone: "/assets/headers/lab-voltera-vone.webp",
  redPitaya: "/assets/lab/red-pitaya-stemlab-125-14.png",
  artyA7: "/assets/lab/digilent-arty-a7.png",
  kriaKv260: "/assets/lab/amd-kria-kv260.jpg",
  eclypseZ7: "/assets/lab/digilent-eclypse-z7.jpg",
};

const prototypingSteps = [
  "Export circuit and control-board geometry from SchroSIM studies",
  "Fabricate and revise conductive PCB prototypes on a Voltera V-One workflow",
  "Measure routing, impedance, connector, and control-signal behavior on the bench",
  "Package Gerbers, fixture notes, test logs, and revision history for lab partners",
];

const qdriverValidationSteps = [
  "Serialize host commands into a validated workload contract",
  "Generate DAC/GPIO timing patterns for prototype control paths",
  "Capture detector or emulator events through ADC/digital inputs",
  "Count coincidence windows and latency/jitter envelopes",
  "Replay results into LiDMaS+ before promotion to partner labs",
];

const qdriverHardwareOptions = [
  {
    label: "Primary reference target",
    name: "Red Pitaya STEMlab 125-14",
    image: labAssets.redPitaya,
    source: "https://redpitaya.com/stemlab-125-14/",
    alt: "Red Pitaya STEMlab 125-14 board",
    copy:
      "Reference target for pulse generation, detector-pulse emulation, readout tests, and coincidence-counter validation.",
    specs: ["Zynq 7010", "2 RF inputs / 2 RF outputs", "125 MS/s, 14-bit ADC/DAC", "Ethernet, Wi-Fi option, digital IO"],
  },
  {
    label: "Alternative · RTL validation",
    name: "Digilent Arty A7-100T",
    image: labAssets.artyA7,
    source: "https://digilent.com/shop/arty-a7-100t-artix-7-fpga-development-board/",
    alt: "Digilent Arty A7-100T FPGA development board",
    copy:
      "Lower-cost FPGA option for GPIO scheduling, counter logic, timing fixtures, and board tests.",
    specs: ["Artix-7 FPGA", "256MB DDR3L", "JTAG and Quad-SPI programming", "Counter and GPIO timing validation"],
  },
  {
    label: "Alternative · host runtime",
    name: "AMD Kria KV260",
    image: labAssets.kriaKv260,
    source: "https://www.amd.com/en/products/system-on-modules/kria/k26/kv260-vision-starter-kit.html",
    alt: "AMD Kria KV260 Vision AI Starter Kit board",
    copy:
      "Linux-plus-FPGA option for transport, Ethernet or USB integration, and host orchestration.",
    specs: ["Zynq UltraScale+ MPSoC", "4 GB DDR", "1 Gb Ethernet", "USB 3.0 / 2.0"],
  },
  {
    label: "Alternative · instrumentation",
    name: "Digilent Eclypse Z7",
    image: labAssets.eclypseZ7,
    source: "https://digilent.com/shop/eclypse-z7/",
    alt: "Digilent Eclypse Z7 modular instrumentation board",
    copy:
      "Instrumentation-oriented option when modular ADC, DAC, scope, AWG, or digitizer expansion is needed.",
    specs: ["Zynq-7000", "2 SYZYGY/Zmod ports", "Gigabit Ethernet", "Zmod Scope, AWG, Digitizer support"],
  },
];

const labValidationLadder = [
  {
    step: "01",
    title: "Contract emulator",
    copy: "Run the same PhotonicCircuit shape through mock and emulator backends to validate schema, capability checks, and normalized results.",
  },
  {
    step: "02",
    title: "File mailbox",
    copy: "Use command and result files as the first hardware-like transport so runtime frames can be inspected without a board attached.",
  },
  {
    step: "03",
    title: "RTL testbench",
    copy: "Exercise portable pulse scheduling, detector readout, and coincidence-counter logic before a physical bench loop is introduced.",
  },
  {
    step: "04",
    title: "Red Pitaya loopback",
    copy: "Route native runtime commands to a board profile and read back controlled pulse or detector-emulator responses.",
  },
  {
    step: "05",
    title: "Detector-emulator bench",
    copy: "Drive repeatable electrical pulses into capture logic and compare event timing against the expected coincidence window.",
  },
  {
    step: "06",
    title: "Partner optical lab",
    copy: "Promote only validated command, timing, capture, and replay artifacts into a collaborator environment with real optical hardware.",
  },
];

const labProofBoundaries = [
  {
    title: "This bench can prove",
    items: [
      "Host command serialization reaches a board-facing transport.",
      "Pulse schedules, detector capture, and coincidence windows are measurable.",
      "Result buffers can be read back and converted into decoder-ready artifacts.",
      "Emulator and bench results can share a comparable schema and replay path.",
    ],
  },
  {
    title: "This bench cannot prove alone",
    items: [
      "It is not a complete photonic quantum computer.",
      "It does not prove optical advantage or full photonic hardware access.",
      "It does not replace calibrated sources, modulators, detectors, or partner lab instrumentation.",
      "It should not turn simulated or loopback results into hardware claims without labels.",
    ],
  },
];

const firstBenchProtocol = [
  "Select the Red Pitaya board profile and record firmware, runtime, and host versions.",
  "Load a known pulse schedule from a validated Photon-QDrivers RuntimeJob fixture.",
  "Emit DAC/GPIO pulse patterns into a loopback, detector emulator, or instrumented channel.",
  "Capture detector events through ADC thresholding or digital inputs with a fixed coincidence window.",
  "Read back result frames through the mailbox contract and compare counts against the expected fixture.",
  "Export NDJSON or table artifacts for LiDMaS+ replay with decoder choice, seed, and run identity attached.",
  "Label the result as simulated, loopback bench, detector-emulator bench, or partner-lab measurement.",
];

const measurementTargets = [
  {
    name: "Command latency",
    target: "submit-to-ack and submit-to-result timing envelope",
    artifact: "runtime timing log",
  },
  {
    name: "Pulse jitter",
    target: "edge placement variation across repeated schedules",
    artifact: "scope or logic-analyzer capture",
  },
  {
    name: "Detector window",
    target: "threshold, holdoff, and coincidence-window behavior",
    artifact: "event stream and counter table",
  },
  {
    name: "Buffer depth",
    target: "maximum result frames before loss or timeout",
    artifact: "transport stress log",
  },
  {
    name: "Replay integrity",
    target: "bench result converts into deterministic LiDMaS+ replay input",
    artifact: "decoder request and response bundle",
  },
];

const labArtifactBundle = [
  "PhotonicCircuit or RuntimeJob fixture",
  "Backend capability profile",
  "Mailbox command and result frames",
  "Board, firmware, runtime, and host versions",
  "Scope, logic-analyzer, or ADC capture evidence",
  "Coincidence-counter table",
  "LiDMaS+ replay key and decoder responses",
  "Claim label: simulated, loopback, bench, or partner-lab",
];

const teamLeadership = [
  {
    name: "Dennis Wayo, PhD",
    role: "Founder & Research Lead",
    focus: "Quantum Software Engineer / System Architect",
    initials: "DW",
    status: "Founder",
    tone: "tone-cyan",
    image: "/assets/team/dennis-wayo.jpeg",
    imageAlt: "Dennis Wayo portrait",
    profiles: [
      { icon: "github", label: "Dennis Wayo on GitHub", href: "https://github.com/DennisWayo" },
      { icon: "linkedin", label: "Dennis Wayo on LinkedIn", href: "https://www.linkedin.com/in/dennis-wayo-765a38b1/" },
      { icon: "scholar", label: "Dennis Wayo on Google Scholar", href: "https://scholar.google.com/citations?hl=en&user=YCXIi1wAAAAJ" },
    ],
    bio:
      "Leads Gottesman Software's research direction, system architecture, and translation of photonic quantum methods into reproducible software.",
  },
  {
    name: "Prof. Dr. habil. Sven Groppe",
    role: "Professorship in Artificial Intelligence",
    focus: "Quantum Artificial Intelligence",
    initials: "SG",
    status: "Professor",
    tone: "tone-green",
    image: "/assets/team/sven-groppe-editorial.webp",
    imageAlt: "Prof. Dr. habil. Sven Groppe portrait",
    profiles: [
      { icon: "linkedin", label: "Sven Groppe on LinkedIn", href: "https://de.linkedin.com/in/sven-groppe-32373016b" },
      { icon: "scholar", label: "Sven Groppe on Google Scholar", href: "https://scholar.google.com/citations?hl=en&user=drGVVY0AAAAJ" },
    ],
    bio:
      "Contributes expertise in quantum artificial intelligence, scalable systems, and rigorous research methods across the software and publication program.",
  },
  {
    name: "Prof. Leonardo Goliatt",
    role: "Professorship in Computational Mechanics",
    focus: "Quantum Machine Learning",
    initials: "LG",
    status: "Professor",
    tone: "tone-violet",
    image: "/assets/team/leonardo-goliatt-editorial.webp",
    imageAlt: "Prof. Leonardo Goliatt portrait",
    profiles: [
      { icon: "linkedin", label: "Leonardo Goliatt on LinkedIn", href: "https://br.linkedin.com/in/leonardo-goliatt" },
      { icon: "scholar", label: "Leonardo Goliatt on Google Scholar", href: "https://scholar.google.com/citations?hl=en&user=OyIo0IUAAAAJ" },
    ],
    bio:
      "Contributes expertise in computational modeling, machine learning, and quantum machine learning for scientific research.",
  },
  {
    placeholder: true,
    initials: "",
  },
];

const groupMembers = [
  {
    name: "Undergraduate Researcher",
    role: "Training and reproducibility",
    initials: "UR",
    status: "Planned role",
    tone: "tone-green",
    bio:
      "Starts with reproducible examples, tests, documentation, plots, notebooks, and small simulator or decoder tasks before taking larger ownership.",
  },
  {
    name: "Rotation or Visiting Student",
    role: "Short-term research module",
    initials: "VS",
    status: "Visiting role",
    tone: "tone-blue",
    bio:
      "Participates in a scoped project such as decoder comparison, circuit examples, Red Pitaya validation, benchmark replication, or research artifact curation.",
  },
  {
    name: "Research Software Fellow",
    role: "Engineering quality",
    initials: "SF",
    status: "Fellowship role",
    tone: "tone-amber",
    bio:
      "Maintains code quality, CI, release notes, typed interfaces, examples, smoke tests, benchmark scripts, and archival research artifacts.",
  },
  {
    name: "External Collaborators",
    role: "Scientific review and co-advising",
    initials: "RC",
    status: "Collaboration",
    tone: "tone-slate",
    bio:
      "Support technical review, joint supervision, domain validation, and connections to partner labs without replacing the group training model.",
  },
];

const openResearchRoles = [
  {
    title: "Undergraduate Researcher",
    track: "Training and reproducibility",
    status: "Planned role",
    copy:
      "Build skill through reproducible examples, tests, documentation, plots, notebooks, and small simulator or decoder tasks before taking larger ownership.",
    artifact: "Expected artifact: a reproducible example, test suite, notebook, documentation page, or small benchmark task.",
    evidence: ["tests and examples", "notebooks", "documentation"],
  },
  {
    title: "Research Software Fellow",
    track: "Engineering quality and releases",
    status: "Open interest",
    copy:
      "Strengthen the codebase through typed interfaces, CI checks, examples, release discipline, and artifact packaging.",
    artifact: "Expected artifact: a maintained interface, CI path, documentation set, release note, or benchmark script.",
    evidence: ["tests and docs", "benchmark scripts", "release notes"],
  },
  {
    title: "FPGA and Controls Research Assistant",
    track: "Photon-QDrivers lab boundary",
    status: "Open interest",
    copy:
      "Work on board profiles, mailbox contracts, pulse scheduling, detector-emulator loops, and Red Pitaya validation paths.",
    artifact: "Expected artifact: a loopback protocol, timing log, board profile, or reproducible driver validation note.",
    evidence: ["timing logs", "loopback protocol", "hardware notes"],
  },
  {
    title: "Visiting or External Collaborator",
    track: "Joint validation and review",
    status: "Collaboration",
    copy:
      "Contribute review, partner-lab context, photonics expertise, hardware datasets, or co-advised research modules.",
    artifact: "Expected artifact: a review memo, shared fixture, validation dataset, or joint manuscript contribution.",
    evidence: ["review memos", "shared fixtures", "joint manuscripts"],
  },
];

const recruitingQualifications = [
  {
    label: "Academic preparation",
    body:
      "Typical backgrounds include BSc, MSc, or PhD study in computer science, quantum information, physics, electrical or computer engineering, photonics, applied mathematics, or related fields.",
  },
  {
    label: "Technical preparation",
    body:
      "We value careful programming, reproducible experiments, numerical or systems work, documentation habits, and the ability to explain assumptions, failures, and evidence clearly.",
  },
  {
    label: "Artifact selection",
    body:
      "Applicants should choose a track and name one artifact they want to build, such as a simulator example, decoder benchmark, paper-run script, driver profile, protocol note, dataset replay, or documentation package.",
  },
  {
    label: "Inclusive research environment",
    body:
      "Gottesman Software welcomes applicants and collaborators of all genders, races, ethnicities, nationalities, cultures, religions, disabilities, ages, sexual orientations, and socioeconomic backgrounds.",
  },
];

const recruitingEvidence = [
  {
    label: "Research ownership",
    body: "Every role should have a scoped question, a named artifact, and a credible path to paper-quality evidence.",
  },
  {
    label: "Software discipline",
    body: "Contributors should leave behind tests, scripts, examples, and documentation that another researcher can run.",
  },
  {
    label: "Claim boundaries",
    body: "We separate simulated, replayed, loopback, and partner-lab results so public claims stay honest.",
  },
];

const funderTracks = [
  {
    title: "SchroSIM validation package",
    body:
      "Support cross-runtime validation, benchmark baselines, documentation, and reproducible photonic-circuit examples.",
  },
  {
    title: "LiDMaS+ decoder evidence package",
    body:
      "Support threshold sweeps, hardware-to-decoder replay, paper-run automation, and auditable QEC artifacts.",
  },
  {
    title: "Photon-QDrivers bench package",
    body:
      "Support Red Pitaya loopback validation, FPGA mailbox contracts, detector-emulator studies, and timing evidence.",
  },
  {
    title: "Training and mobility package",
    body:
      "Support postdoctoral, graduate, undergraduate, visiting-student, and research-software fellowship pathways.",
  },
];

const countryFundingMap = [
  {
    country: "USA",
    fit: "Federal quantum programs, university-lab partnerships, benchmarking, and research software infrastructure.",
    routes: [
      { name: "NSF Quantum Leap Challenge Institutes", kind: "federal research", href: "https://www.nsf.gov/funding/opportunities/qlci-quantum-leap-challenge-institutes" },
      { name: "DOE Quantum Information Science", kind: "national labs", href: "https://science.osti.gov/Initiatives/QIS" },
      { name: "DARPA Quantum Benchmarking", kind: "advanced programs", href: "https://www.darpa.mil/research/programs/quantum-benchmarking" },
      { name: "NIST Quantum Information Science", kind: "standards and metrology", href: "https://www.nist.gov/quantum-information-science" },
    ],
  },
  {
    country: "Brazil",
    fit: "State and federal research grants, scientific mobility, innovation funding, and photonics or QEC collaboration.",
    routes: [
      { name: "FAPESP", kind: "state research foundation", href: "https://fapesp.br/en" },
      { name: "CNPq", kind: "federal research council", href: "https://www.gov.br/cnpq" },
      { name: "CAPES", kind: "graduate education", href: "https://www.gov.br/capes" },
      { name: "FINEP", kind: "innovation finance", href: "https://www.gov.br/finep" },
    ],
  },
  {
    country: "Germany",
    fit: "Quantum technology programs, DFG research grants, fellowships, and university-lab mobility.",
    routes: [
      { name: "BMBF Quantum Technologies", kind: "national program", href: "https://www.quantentechnologien.de/" },
      { name: "DFG", kind: "research funding", href: "https://www.dfg.de/en" },
      { name: "DAAD", kind: "mobility and exchange", href: "https://www.daad.de/en/" },
      { name: "Alexander von Humboldt Foundation", kind: "research fellowships", href: "https://www.humboldt-foundation.de/en/" },
    ],
  },
  {
    country: "Indonesia",
    fit: "National research coordination, scholarship pathways, university research grants, and applied innovation programs.",
    routes: [
      { name: "BRIN", kind: "national research agency", href: "https://www.brin.go.id/en" },
      { name: "LPDP", kind: "scholarships", href: "https://lpdp.kemenkeu.go.id/en/" },
      { name: "BIMA", kind: "higher-education research", href: "https://bima.kemdikbud.go.id/" },
      { name: "Kedaireka", kind: "campus-industry matching", href: "https://kedaireka.id/" },
    ],
  },
  {
    country: "Malaysia",
    fit: "MOSTI grants, higher-education research schemes, startup translation, and digital or semiconductor collaboration.",
    routes: [
      { name: "MOSTI eDana", kind: "science and technology funds", href: "https://edana.mosti.gov.my/" },
      { name: "MyGRANTS", kind: "research grant portal", href: "https://mygrants.gov.my/" },
      { name: "Cradle Fund", kind: "startup funding", href: "https://www.cradle.com.my/" },
      { name: "MDEC", kind: "digital ecosystem", href: "https://mdec.my/" },
    ],
  },
  {
    country: "Kazakhstan",
    fit: "Science commercialization, national research grants, innovation programs, and university lab partnerships.",
    routes: [
      { name: "Ministry of Science and Higher Education", kind: "national science policy", href: "https://www.gov.kz/memleket/entities/sci?lang=en" },
      { name: "Science Fund", kind: "commercialization grants", href: "https://science-fund.kz/en/" },
      { name: "NCSTE", kind: "science evaluation", href: "https://www.ncste.kz/en/" },
      { name: "QazInnovations", kind: "innovation development", href: "https://qazinn.kz/en/" },
    ],
  },
  {
    country: "Ghana",
    fit: "University research partnerships, science-ministry routes, engineering training, and applied technology collaboration.",
    routes: [
      { name: "MESTI", kind: "science and innovation policy", href: "https://mesti.gov.gh/" },
      { name: "GTEC", kind: "tertiary education", href: "https://gtec.edu.gh/" },
      { name: "CSIR Ghana", kind: "research institutes", href: "https://csir.org.gh/" },
      { name: "GAEC", kind: "atomic energy and research", href: "https://www.gaec.gov.gh/" },
    ],
  },
  {
    country: "Japan",
    fit: "Quantum technology missions, scientific fellowships, moonshot-style programs, and hardware collaboration.",
    routes: [
      { name: "JST", kind: "strategic research", href: "https://www.jst.go.jp/EN/" },
      { name: "JSPS", kind: "research fellowships", href: "https://www.jsps.go.jp/english/" },
      { name: "NEDO", kind: "technology development", href: "https://www.nedo.go.jp/english/" },
      { name: "Q-LEAP", kind: "quantum leap program", href: "https://www.jst.go.jp/stpp/q-leap/en/" },
    ],
  },
  {
    country: "Korea",
    fit: "ICT R&D, national research grants, quantum technology policy, and industry-academic translation.",
    routes: [
      { name: "MSIT", kind: "science and ICT ministry", href: "https://www.msit.go.kr/eng/" },
      { name: "NRF Korea", kind: "research foundation", href: "https://www.nrf.re.kr/eng/" },
      { name: "IITP", kind: "ICT R&D", href: "https://www.iitp.kr/eng/" },
      { name: "KIAT", kind: "industrial technology", href: "https://www.kiat.or.kr/eng/" },
    ],
  },
];

const supportCollaborationModels = [
  {
    title: "Co-write a proposal",
    body: "Build a grant plan around one software package, a validation artifact, and a publishable milestone.",
  },
  {
    title: "Host a visiting researcher",
    body: "Create a defined research module for a postdoc, graduate student, undergraduate, or research software fellow.",
  },
  {
    title: "Sponsor a benchmark release",
    body: "Support reproducible scripts, seeded datasets, figures, documentation, and release notes for one public result.",
  },
  {
    title: "Provide lab access or data",
    body: "Contribute photonic hardware context, detector traces, syndrome records, or instrumentation access for labeled validation.",
  },
];

const routePaths = new Set(navItems.map((item) => item.path));
const validRoutePaths = new Set([
  ...routePaths,
  "/studio/lidmas",
  ...(enableLidmasLiveRoute ? ["/studio/lidmas-live"] : []),
]);
const routeAliases = new Map([["/funders", "/support"]]);
let activeSpringScrollFrame = 0;

function currentRoute() {
  const pathname = window.location.pathname.replace(/\/+$/, "") || "/";
  const canonicalPath = routeAliases.get(pathname) || pathname;
  return validRoutePaths.has(canonicalPath) ? canonicalPath : "/";
}

function setMetaTag(attribute, key, content) {
  let element = document.querySelector(`meta[${attribute}="${key}"]`);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function updateDocumentMetadata(route) {
  const meta = routeMeta[route] || routeMeta["/"];
  const url = `${siteOrigin}${route === "/" ? "/" : route}`;
  const image = `${siteOrigin}/assets/gottesman-software-emblem-v3-white-background.png`;

  document.title = meta.title;
  setMetaTag("name", "description", meta.description);
  setMetaTag("name", "robots", "index, follow, max-image-preview:large");
  setMetaTag("property", "og:type", "website");
  setMetaTag("property", "og:site_name", "Gottesman Software");
  setMetaTag("property", "og:title", meta.title);
  setMetaTag("property", "og:description", meta.description);
  setMetaTag("property", "og:url", url);
  setMetaTag("property", "og:image", image);
  setMetaTag("name", "twitter:card", "summary_large_image");
  setMetaTag("name", "twitter:title", meta.title);
  setMetaTag("name", "twitter:description", meta.description);
  setMetaTag("name", "twitter:image", image);

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", url);

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteOrigin}/#organization`,
        name: "Gottesman Software Research Group",
        url: siteOrigin,
        sameAs: ["https://github.com/Gottesman-Software"],
      },
      {
        "@type": "WebSite",
        "@id": `${siteOrigin}/#website`,
        name: "Gottesman Software",
        url: siteOrigin,
        publisher: { "@id": `${siteOrigin}/#organization` },
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: meta.title,
        description: meta.description,
        isPartOf: { "@id": `${siteOrigin}/#website` },
        about: { "@id": `${siteOrigin}/#organization` },
      },
    ],
  };

  let script = document.querySelector("#gottesman-structured-data");
  if (!script) {
    script = document.createElement("script");
    script.id = "gottesman-structured-data";
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(structuredData);
}

function trackRouteView(route) {
  const meta = routeMeta[route] || routeMeta["/"];
  trackPageView(route, meta.title);
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getMaxScrollTop() {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

function springScrollTo(targetTop) {
  function resolveDestination() {
    const nextTarget = typeof targetTop === "function" ? targetTop() : targetTop;
    return Math.max(0, Math.min(nextTarget, getMaxScrollTop()));
  }

  let destination = resolveDestination();

  if (prefersReducedMotion()) {
    window.scrollTo({ top: destination, behavior: "smooth" });
    return;
  }

  window.cancelAnimationFrame(activeSpringScrollFrame);

  const start = window.scrollY;
  const initialDestination = resolveDestination();
  const startTime = window.performance.now();
  const duration = Math.min(850, Math.max(500, Math.abs(initialDestination - start) * 0.06));

  function springEase(progress) {
    const overshoot = 1.08;
    return 1 + (overshoot + 1) * Math.pow(progress - 1, 3) + overshoot * Math.pow(progress - 1, 2);
  }

  function step() {
    const elapsed = window.performance.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    destination = resolveDestination();

    if (progress >= 1) {
      window.scrollTo(0, destination);
      activeSpringScrollFrame = 0;
      return;
    }

    window.scrollTo(0, start + (destination - start) * springEase(progress));
    activeSpringScrollFrame = window.requestAnimationFrame(step);
  }

  activeSpringScrollFrame = window.requestAnimationFrame(step);
}

function PageLink({ to, onNavigate, className, children, ...props }) {
  function handleClick(event) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }

    event.preventDefault();
    onNavigate(to);
  }

  return (
    <a className={className} href={to} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}

function Header({ route, onNavigate }) {
  return (
    <header className="site-header">
      <PageLink className="brand" to="/" onNavigate={onNavigate} aria-label="Gottesman Software home">
        <span className="brand-mark" aria-hidden="true" />
        <span className="brand-wordmark">
          <span>Gottesman</span>
          <span>Software</span>
        </span>
      </PageLink>
      <nav className="nav-links" aria-label="Primary navigation">
        {navItems.map((item) => (
          <PageLink
            key={item.path}
            className={route === item.path ? "active" : undefined}
            to={item.path}
            onNavigate={onNavigate}
            aria-current={route === item.path ? "page" : undefined}
          >
            {item.label}
          </PageLink>
        ))}
      </nav>
    </header>
  );
}

function Hero({ onNavigate }) {
  return (
    <section className="hero" id="top">
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-inner">
        <p className="eyebrow">Open-source photonic quantum research software</p>
        <h1>One photonic workflow. Every result traceable.</h1>
        <p className="hero-copy">
          Gottesman Software develops SchroSIM, LiDMaS+, and Photon-QDrivers—a coordinated stack
          for photonic circuit simulation, quantum error-correction studies, and lab-facing
          control validation.
        </p>
        <div className="hero-actions">
          <PageLink className="hero-action hero-action-primary" to="/software" onNavigate={onNavigate}>
            Explore the software
          </PageLink>
          <PageLink className="hero-action" to="/research" onNavigate={onNavigate}>
            Review the research
          </PageLink>
        </div>
        <p className="hero-boundary">
          Public claims are limited to software, simulation, replay, and documented prototype
          workflows unless hardware evidence is explicitly identified.
        </p>
      </div>
    </section>
  );
}

function HomeIntro() {
  return (
    <section className="section home-intro-section">
      <div className="home-intro-grid">
        <div className="home-intro-copy">
          <p className="eyebrow">Research group</p>
          <h2>A university-led software effort for fault-tolerant photonics.</h2>
          <p className="status-note">
            We build inspectable research tools—not a black-box platform.
          </p>
          <p>
            Circuit sources, numerical assumptions, decoder settings, seeds, backend policies, and
            artifact locations remain connected to each result.
          </p>
          <p>
            The name references the stabilizer and fault-tolerance tradition that shaped modern
            quantum error correction. The work carries that discipline into photonic research
            software and carefully bounded prototype workflows.
          </p>
        </div>
        <figure className="home-intro-visual">
          <img
            src="/assets/home/research-collaboration.webp"
            alt="Illustrative university research team collaborating around a photonics optical bench"
            loading="lazy"
          />
          <figcaption>
            Illustrative research environment. Hardware access and institutional partnerships are
            identified separately where applicable.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

function ResearchThesis({ onNavigate }) {
  return (
    <section className="section thesis-section">
      <div className="section-heading compact">
        <p className="eyebrow">Software stack</p>
        <h2>Three tools. One traceable workflow.</h2>
        <p>
          Each project owns a clear layer of the research process and passes its assumptions,
          configuration, and artifacts to the next.
        </p>
      </div>
      <div className="thesis-list">
        {researchThesisItems.map((item) => (
          <PageLink
            className="thesis-item"
            key={item.signal}
            to={item.path}
            onNavigate={onNavigate}
          >
            <img src={item.image} alt={item.imageAlt} loading="lazy" />
            <div className="thesis-item-copy">
              <p className="mono-label">{item.signal}</p>
              <h3>{item.name}</h3>
              <p className="thesis-role">{item.role}</p>
              <p>{item.copy}</p>
              <span className="thesis-link-label">Explore {item.name}</span>
            </div>
          </PageLink>
        ))}
      </div>
      <p className="home-visual-disclaimer">
        Homepage imagery is illustrative and does not represent a claim of owned photonic quantum
        hardware.
      </p>
    </section>
  );
}

function IntegratedWorkflow({ onNavigate }) {
  return (
    <section className="section workflow-section">
      <div className="section-heading compact">
        <p className="eyebrow">Integrated Workflow</p>
        <h2>A defined path from circuit intent to reviewable evidence.</h2>
        <p>
          Every step has a defined input, output, validation boundary, and route back to the source
          or software layer that produced it.
        </p>
      </div>
      <div className="workflow-track" aria-label="Gottesman Software research workflow">
        {workflowSteps.map((item) => (
          <PageLink
            className="workflow-step"
            key={item.name}
            to={item.path}
            onNavigate={onNavigate}
          >
            <span>{item.step}</span>
            <p className="mono-label">{item.label}</p>
            <h3>{item.name}</h3>
            <p>{item.copy}</p>
            <strong>{item.output}</strong>
          </PageLink>
        ))}
      </div>
    </section>
  );
}

function EvidenceStandards() {
  return (
    <section className="section evidence-section">
      <div className="evidence-head">
        <p className="eyebrow cyan">Evidence Standards</p>
        <h2>Make claims easier to audit—and harder to overstate.</h2>
        <p>
          Public results should distinguish simulation, replay, prototype control, and partner-lab
          evidence without blurring the boundaries between them.
        </p>
      </div>
      <div className="evidence-grid">
        {evidenceStandards.map((item, index) => (
          <article className="evidence-standard" key={item.label}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{item.label}</h3>
            <p>{item.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function PageHero({ page }) {
  const pageSlug = page.path.replace(/^\//, "") || "home";
  const pageHeroClassName = [
    "page-hero",
    `page-hero-${pageSlug}`,
    page.heroVideo ? "has-video" : "",
    page.heroCode ? "has-code" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const heroStyle = page.heroImage || page.heroPosition
    ? {
        ...(page.heroImage ? { "--page-hero-image": `url("${page.heroImage}")` } : {}),
        "--page-hero-position": page.heroPosition || "center",
      }
    : undefined;

  return (
    <section className={pageHeroClassName} style={heroStyle}>
      {page.heroVideo && (
        <video
          className="page-hero-video"
          src={page.heroVideo}
          poster={page.heroImage}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          onLoadedMetadata={(event) => {
            event.currentTarget.playbackRate = page.heroPlaybackRate || 1;
          }}
        />
      )}
      {page.heroCode && (
        <div className="page-hero-code" aria-hidden="true">
          <div className="code-window-bar">
            <span className="code-window-controls">
              <span className="code-window-control close" />
              <span className="code-window-control minimize" />
              <span className="code-window-control zoom" />
            </span>
            <span>software_stack.py</span>
          </div>
          <pre>
            {page.heroCode.map((line, lineIndex) => (
              <React.Fragment key={`line-${lineIndex}`}>
                {line.map((part, partIndex) => (
                  <span
                    className={part.type ? `code-token code-${part.type}` : "code-token"}
                    key={`part-${lineIndex}-${partIndex}`}
                  >
                    {part.text}
                  </span>
                ))}
                {lineIndex < page.heroCode.length - 1 ? "\n" : null}
              </React.Fragment>
            ))}
          </pre>
        </div>
      )}
      <div className="page-hero-inner">
        <p className="eyebrow">{page.eyebrow}</p>
        <h1>{page.title}</h1>
        <p>{page.copy}</p>
      </div>
    </section>
  );
}

function CodeSnippet({ lines }) {
  return (
    <pre>
      {lines.map((line, lineIndex) => (
        <React.Fragment key={`snippet-line-${lineIndex}`}>
          {line.map((part, partIndex) => (
            <span
              className={part.type ? `code-token code-${part.type}` : "code-token"}
              key={`snippet-part-${lineIndex}-${partIndex}`}
            >
              {part.text}
            </span>
          ))}
          {lineIndex < lines.length - 1 ? "\n" : null}
        </React.Fragment>
      ))}
    </pre>
  );
}

function SoftwareImportantResults() {
  return (
    <section className="section software-results-section">
      <div className="section-heading">
        <p className="eyebrow">Important Results</p>
        <h2>The tools already produce useful research outcomes.</h2>
        <p>
          Together, the tools support earlier photonic-circuit validation, replayable decoder
          studies, and a controlled path from emulator work toward lab instrumentation.
        </p>
      </div>
      <div className="software-results-grid">
        {softwareResults.map((item) => (
          <article className="software-result-card" key={item.name}>
            <p className="mono-label">{item.label}</p>
            <h3>{item.name}</h3>
            <h4>{item.title}</h4>
            <ul>
              {item.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function SoftwareMeta({ repo, languages }) {
  return (
    <div className="software-meta" aria-label={`${repo.label} repository and languages`}>
      <a className="software-repo-link" href={repo.url} target="_blank" rel="noreferrer">
        <SocialIcon icon="github" />
        <span>{repo.label}</span>
      </a>
      <div className="software-language-list" aria-label="Languages used">
        {languages.map((language) => (
          <span className="software-language-chip" key={language.name}>
            <span
              className="software-language-dot"
              style={{ "--language-color": language.color }}
              aria-hidden="true"
            />
            {language.name}
          </span>
        ))}
      </div>
    </div>
  );
}

function SoftwareQuickStartFolder() {
  return (
    <section className="section quickstart-section">
      <div className="section-heading compact">
        <p className="eyebrow">Quick Start</p>
        <h2>Try the APIs.</h2>
        <p>
          Three small entry points show the Python driver API, C++ runtime boundary, and a Swift
          SchroSIM circuit path.
        </p>
      </div>
      <div className="quickstart-folder">
        <div className="quickstart-titlebar">
          <span className="code-window-controls">
            <span className="code-window-control close" />
            <span className="code-window-control minimize" />
            <span className="code-window-control zoom" />
          </span>
          <span>gottesman-software/quickstarts</span>
        </div>
        <div className="quickstart-body">
          <aside className="quickstart-sidebar" aria-label="Quick start files">
            {quickStartScripts.map((script) => (
              <div
                className="quickstart-file-card"
                key={script.file}
                style={{ "--script-accent": script.accent }}
              >
                <span className="folder-icon" aria-hidden="true" />
                <div>
                  <p>{script.file}</p>
                  <span>{script.language}</span>
                </div>
              </div>
            ))}
          </aside>
          <div className="quickstart-code-grid">
            {quickStartScripts.map((script) => (
              <article
                className="quickstart-code-window"
                key={script.file}
                style={{ "--script-accent": script.accent }}
              >
                <div className="quickstart-code-head">
                  <span>{script.file}</span>
                  <strong>{script.label}</strong>
                </div>
                <p>{script.summary}</p>
                <CodeSnippet lines={script.code} />
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SoftwareCurrentState() {
  return (
    <section className="section software-maturity-section">
      <div className="section-heading compact">
        <p className="eyebrow">Current State</p>
        <h2>What is ready now.</h2>
        <p>
          Each project states its working surface, active development track, and current limits.
        </p>
      </div>
      <div className="software-maturity-grid">
        {softwareMaturityBoundaries.map((item) => (
          <article className="software-maturity-card" key={item.name}>
            <h3>{item.name}</h3>
            <p>{item.current}</p>
            <p className="software-maturity-boundary">{item.boundary}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function SoftwarePage() {
  return (
    <>
      <section className="section software-suite-section flush-top">
        <div className="section-heading">
          <p className="eyebrow">Three open-source tools</p>
          <h2>Follow one workflow from model to execution.</h2>
          <p>
            Each project owns one stage of the workflow and exposes the repository, languages,
            working interface, and current boundary behind its claims.
          </p>
        </div>
        <div className="software-map" aria-label="Software flow">
          <span>SchroSIM</span>
          <span>circuit modeling</span>
          <span>LiDMaS+</span>
          <span>fault-tolerance analysis</span>
          <span>Photon-QDrivers</span>
          <span>execution boundary</span>
        </div>
      </section>

      {softwareShowcases.map((tool, index) => (
        <section
          className={`software-showcase${index % 2 === 1 ? " reverse" : ""}`}
          key={tool.name}
        >
          <div className="software-media">
            <div className="software-logo-band">
              <img src={tool.logo} alt={`${tool.name} logo`} loading="lazy" />
            </div>
            <figure className="software-preview">
              <img src={tool.media} alt={tool.mediaAlt} loading="lazy" />
              <figcaption>{tool.mediaCaption}</figcaption>
            </figure>
          </div>
          <div className="software-copy-panel">
            <p className="eyebrow">{tool.eyebrow}</p>
            <h2>{tool.name}</h2>
            <p className="software-role">{tool.role}</p>
            <p>{tool.summary}</p>
            <ul>
              {tool.fit.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="software-boundary">{tool.boundary}</p>
            <SoftwareMeta repo={tool.repo} languages={tool.languages} />
          </div>
        </section>
      ))}

      <SoftwareQuickStartFolder />
      <SoftwareCurrentState />
    </>
  );
}

function StudioPrimaryAction({ surface, onNavigate }) {
  if (surface.primaryPath) {
    return (
      <PageLink className="studio-primary-link" to={surface.primaryPath} onNavigate={onNavigate}>
        {surface.primaryLabel}
      </PageLink>
    );
  }

  return (
    <a className="studio-primary-link" href={surface.primaryHref} target="_blank" rel="noreferrer">
      {surface.primaryLabel}
    </a>
  );
}

function StudioRailLink({ item, onNavigate, route }) {
  const isExternal = item.href.startsWith("http");
  const isMail = item.href.startsWith("mailto:");
  const isInternalRoute = item.href.startsWith("/") && validRoutePaths.has(item.href);

  if (isInternalRoute) {
    return (
      <PageLink
        className={route === item.href ? "studio-rail-link active" : "studio-rail-link"}
        to={item.href}
        onNavigate={onNavigate}
        aria-label={item.label}
        aria-current={route === item.href ? "page" : undefined}
      >
        <span>{item.icon}</span>
        <small>{item.label}</small>
      </PageLink>
    );
  }

  return (
    <a
      className="studio-rail-link"
      href={item.href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer" : undefined}
      aria-label={item.label}
    >
      <span>{item.icon}</span>
      <small>{item.label}</small>
      {isMail ? <em>mail</em> : null}
    </a>
  );
}

function StudioPage({ onNavigate, route }) {
  const isLidmasWorkbench = route === "/studio/lidmas";
  const isLidmasLiveWorkbench = route === "/studio/lidmas-live";

  return (
    <div className="studio-platform">
      <header className="studio-rail" aria-label="Gottesman Studio navigation">
        <PageLink className="studio-rail-mark" to="/" onNavigate={onNavigate} aria-label="Back to Gottesman Software home">
          <img src="/assets/gottesman-software-emblem-concept-v3.svg" alt="" />
        </PageLink>
        <nav className="studio-rail-nav">
          {studioRailItems.map((item) => (
            <StudioRailLink item={item} key={item.label} onNavigate={onNavigate} route={route} />
          ))}
        </nav>
        <PageLink className="studio-rail-back" to="/" onNavigate={onNavigate}>
          <span>←</span>
          <small>Home</small>
        </PageLink>
      </header>

      <div className="studio-platform-main">
        {isLidmasWorkbench || isLidmasLiveWorkbench ? (
          <StudioEmbeddedWorkbench mode={isLidmasLiveWorkbench ? "live" : "public"} />
        ) : (
          <>
            <section className="studio-platform-hero">
          <div className="studio-platform-hero-bg" aria-hidden="true" />
          <div className="studio-platform-hero-copy">
            <p className="eyebrow cyan">Gottesman Studio</p>
            <h1>Design, decode, and validate photonic quantum experiments.</h1>
            <p>
              Open access workbenches for SchroSIM circuit studies, LiDMaS+ decoder evidence,
              and Photon-QDrivers simulator or loopback workflows.
            </p>
          </div>
            </section>

            <section className="studio-platform-start" aria-labelledby="studio-get-started">
          <div className="studio-platform-heading">
            <h2 id="studio-get-started">Get started</h2>
            <p>
              Start with the public workbenches available today, then follow each result from
              circuit design to decoder evidence and lab-ready validation notes.
            </p>
          </div>
          <div className="studio-platform-card-grid">
            {studioSurfaces.map((surface, index) => (
              <article
                className={`studio-platform-card${surface.name.includes("QDrivers") ? " is-coming-soon" : ""}`}
                id={surface.name.includes("QDrivers") ? "qdrivers-coming-soon" : undefined}
                key={surface.name}
              >
                <div className="studio-platform-card-head">
                  <span>{studioRailItems[index]?.icon || "GS"}</span>
                  <p>{surface.eyebrow}</p>
                </div>
                <h3>{surface.name}</h3>
                <p>{surface.copy}</p>
                <ul>
                  {surface.points.slice(0, 2).map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                <div className="studio-platform-card-actions">
                  <StudioPrimaryAction surface={surface} onNavigate={onNavigate} />
                  <a href={surface.repoHref} target="_blank" rel="noreferrer">
                    Repository
                  </a>
                </div>
              </article>
            ))}
          </div>
            </section>

            <section className="studio-platform-workflow" id="studio-docs">
          <div className="studio-platform-heading">
            <p className="eyebrow cyan">Workflow</p>
            <h2>Move from photonic circuit studies to reviewable evidence packages.</h2>
          </div>
          <div className="studio-platform-workflow-grid">
            {studioImplementationPlan.map((item) => (
              <article className="studio-platform-workflow-card" key={item.step}>
                <span>{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
            </section>

            <section className="studio-platform-docs">
          <article className="studio-doc-card">
            <p className="eyebrow">Docs</p>
            <h2>Read the public documentation and repositories.</h2>
            <div className="studio-doc-links">
              <a href="https://gottesman-software.github.io/SchroSIM/" target="_blank" rel="noreferrer">
                SchroSIM docs
              </a>
              <a href="https://gottesman-software.github.io/lidmas_cpp/" target="_blank" rel="noreferrer">
                LiDMaS+ docs
              </a>
              <a href="https://github.com/Gottesman-Software/photon-qdrivers" target="_blank" rel="noreferrer">
                Photon-QDrivers
              </a>
            </div>
          </article>
          <article className="studio-doc-card is-feedback">
            <p className="eyebrow">Feedback</p>
            <h2>Send Studio feedback or request a demo workflow.</h2>
            <a href="mailto:dwayo3@gatech.edu?subject=Gottesman%20Studio%20feedback">
              Send feedback
            </a>
          </article>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function appendQueryParam(route, key, value) {
  const separator = route.includes("?") ? "&" : "?";
  return `${route}${separator}${key}=${encodeURIComponent(value)}`;
}

function StudioEmbeddedWorkbench({ mode = "public" }) {
  const isLive = mode === "live";
  const [tourOpen, setTourOpen] = React.useState(false);
  const [activeStep, setActiveStep] = React.useState(0);
  const tourSteps = isLive ? lidmasLiveTourSteps : lidmasTourSteps;
  const currentStep = tourSteps[activeStep];
  const defaultRoute = isLive ? lidmasLiveDefaultRoute : "/decoder/scientific";
  const iframeRoute = tourOpen ? currentStep.route : defaultRoute;
  const iframeSrc = isLive
    ? `${lidmasLiveOrigin}${appendQueryParam(iframeRoute, "data", "api")}`
    : `/studio/lidmas-app/index.html?data=api#${iframeRoute}`;

  function startTour() {
    trackEvent("studio_tour_opened", {
      workbench: isLive ? "lidmas_live" : "lidmas_public",
    });
    setActiveStep(0);
    setTourOpen(true);
  }

  function nextTourStep() {
    if (activeStep < tourSteps.length - 1) {
      setActiveStep(activeStep + 1);
      return;
    }
    setTourOpen(false);
  }

  function previousTourStep() {
    setActiveStep(Math.max(activeStep - 1, 0));
  }

  return (
    <section className="studio-app-route">
      <div className="studio-app-frame-shell">
        <iframe
          className="studio-app-frame"
          src={iframeSrc}
          title="LiDMaS+ Decoder Workbench"
        />
      </div>
      {isLive ? (
        <div className="studio-live-badge" aria-label="Local live backend route">
          <span>Live API</span>
          <small>local only</small>
        </div>
      ) : null}
      <button
        type="button"
        className="studio-tour-trigger"
        onClick={startTour}
        aria-label={isLive ? "Open LiDMaS+ live API tour" : "Open LiDMaS+ decoder tour"}
      >
        i
      </button>
      {tourOpen && (
        <div className="studio-tour-panel" role="dialog" aria-modal="false" aria-labelledby="lidmas-tour-title">
          <div className="studio-tour-progress">
            <span>
              {String(activeStep + 1).padStart(2, "0")} / {String(tourSteps.length).padStart(2, "0")}
            </span>
            <button type="button" onClick={() => setTourOpen(false)} aria-label="Close tour">
              ×
            </button>
          </div>
          <h2 id="lidmas-tour-title">{currentStep.title}</h2>
          <p>{currentStep.body}</p>
          <div className="studio-tour-actions">
            <button type="button" onClick={previousTourStep} disabled={activeStep === 0}>
              Back
            </button>
            <button type="button" onClick={nextTourStep}>
              {activeStep === tourSteps.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function SoftwareStack({ standalone = false }) {
  return (
    <section className={`section stack-section${standalone ? " flush-top" : ""}`}>
      <div className="section-heading">
        <p className="eyebrow">Software Stack</p>
        <h2>Integrated software from circuit modeling to lab validation.</h2>
        <p>
          Gottesman Software connects photonic circuit design, decoder validation, and lab-facing
          control within a coordinated prototype pipeline.
        </p>
      </div>
      <div className="stack-grid">
        {stack.map((item, index) => (
          <article className="stack-card" key={item.name}>
            <span className="stack-index">{String(index + 1).padStart(2, "0")}</span>
            <h3>{item.name}</h3>
            <p className="stack-role">{item.role}</p>
            <p>{item.copy}</p>
            <p className="proof-line">{item.proof}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function CapabilityBand() {
  return (
    <section className="section capability-section">
      <div className="capability-grid">
        {capabilities.map((item) => (
          <article className="capability-card" key={item.title}>
            <p className="mono-label">{item.title}</p>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function LabDirection({ standalone = false }) {
  return (
    <section className={`dark-section${standalone ? " flush-top" : ""}`}>
      <div className="dark-grid">
        <div>
          <p className="eyebrow cyan">Prototype Lab</p>
          <h2>Prototype validation for photonic circuit and control-system studies.</h2>
          <p>
            Gottesman Software provides a prototyping bridge for university and collaborating labs:
            design in SchroSIM, analyze overheads in LiDMaS+, and validate control software through
            Photon-QDrivers before collaborating lab evaluation.
          </p>
        </div>
        <div className="lab-panel">
          <p className="mono-label">first bench target</p>
          <h3>Red Pitaya STEMlab 125-14</h3>
          <ul>
            {labSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
          <p className="boundary">
            The bench validates timing and control software. It is not presented as a complete
            photonic quantum computer.
          </p>
        </div>
      </div>
    </section>
  );
}

function LabRoadmap() {
  return (
    <section className="section roadmap-section">
      <div className="section-heading compact">
        <p className="eyebrow">Hardware Bridge</p>
        <h2>Structured validation before collaborating hardware evaluation.</h2>
      </div>
      <div className="roadmap-grid">
        <article>
          <span>01</span>
          <h3>Schema parity</h3>
          <p>Maintain consistent workload and result schemas across emulator and hardware adapters.</p>
        </article>
        <article>
          <span>02</span>
          <h3>Timing envelope</h3>
          <p>Measure command latency, pulse timing, event capture, and buffering boundaries.</p>
        </article>
        <article>
          <span>03</span>
          <h3>Replay path</h3>
          <p>Convert captured bench data into decoder-ready datasets for LiDMaS+ validation.</p>
        </article>
      </div>
    </section>
  );
}

function LidmasReplayMedia() {
  return (
    <figure className="lidmas-replay-media">
      <img
        src="/assets/lab/lidmas-control-plane-replay.gif"
        alt="Animated view of the actual LiDMaS+ control-plane interface"
        loading="lazy"
      />
      <figcaption>
        Actual LiDMaS+ control-plane preview from the public project interface. The full UI remains
        in active development.
      </figcaption>
    </figure>
  );
}

function LabValidationLadder() {
  return (
    <section className="section lab-ladder-section">
      <div className="section-heading compact">
        <p className="eyebrow">Validation Path</p>
        <h2>Promote evidence one controlled step at a time.</h2>
        <p>
          Each stage produces an inspectable artifact before the next environment is trusted.
        </p>
      </div>
      <div className="lab-ladder-track">
        {labValidationLadder.map((item) => (
          <article className="lab-ladder-card" key={item.step}>
            <span>{item.step}</span>
            <h3>{item.title}</h3>
            <p>{item.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function LabProofBoundary() {
  return (
    <section className="section lab-proof-section">
      <div className="lab-proof-grid">
        <div className="lab-proof-copy">
          <p className="eyebrow cyan">Proof Boundary</p>
          <h2>What the bench can—and cannot—prove.</h2>
          <p>
            Bench evidence covers control and measurement paths. Optical-hardware claims still
            depend on calibrated equipment and a collaborating lab.
          </p>
        </div>
        <div className="lab-proof-panels">
          {labProofBoundaries.map((group) => (
            <article className="lab-proof-panel" key={group.title}>
              <h3>{group.title}</h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FirstBenchProtocol() {
  return (
    <section className="section bench-protocol-section">
      <div className="section-heading compact">
        <p className="eyebrow">Bench Protocol</p>
        <h2>One loopback run. One replayable artifact.</h2>
        <p>
          A valid run records command, timing, capture, and replay evidence under a clear claim label.
        </p>
      </div>
      <div className="bench-protocol-board">
        {firstBenchProtocol.map((step, index) => (
          <article className="bench-protocol-step" key={step}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <p>{step}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function LabMeasurementArtifacts() {
  return (
    <section className="section lab-artifact-section">
      <div className="lab-artifact-grid">
        <div className="lab-measurement-panel">
          <p className="eyebrow">Evidence Captured</p>
          <h2>Measure the system, not the demo.</h2>
          <div className="measurement-table">
            {measurementTargets.map((item) => (
              <article className="measurement-row" key={item.name}>
                <h3>{item.name}</h3>
                <p>{item.target}</p>
                <span>{item.artifact}</span>
              </article>
            ))}
          </div>
        </div>
        <div className="artifact-bundle-panel">
          <p className="eyebrow cyan">Artifact Bundle</p>
          <h2>Hand off evidence, not just a result.</h2>
          <ul>
            {labArtifactBundle.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function LabPage() {
  return (
    <>
      <section className="lab-workstream">
        <div className="lab-workstream-copy">
          <p className="eyebrow">Reference workflow · SchroSIM &rarr; Voltera V-One</p>
          <h2>Turn circuit studies into bench-ready electronics.</h2>
          <p>
            The proposed workflow translates SchroSIM studies into routing boards, fixtures,
            control traces, and adapter circuits for evaluation before longer fabrication cycles.
          </p>
          <p className="lab-stage-note">
            <strong>Current stage:</strong> reference architecture and planned validation. Product
            images show target equipment, not Gottesman Software inventory.
          </p>
          <ol className="lab-step-list">
            {prototypingSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
        <figure className="lab-media-panel">
          <img
            src={labAssets.volteraVone}
            alt="Voltera V-One desktop PCB printer"
            loading="lazy"
          />
          <figcaption>
            Vendor reference image of the Voltera V-One. Target workflow; no current-inventory claim.
          </figcaption>
        </figure>
      </section>

      <LabValidationLadder />
      <LabProofBoundary />

      <section className="lab-workstream dark">
        <div className="lab-workstream-copy">
          <p className="eyebrow cyan">LiDMaS+ · Replay Evidence</p>
          <h2>Connect measured errors to reproducible decoder outcomes.</h2>
          <p>
            Each physical-error model or measured syndrome stream should map to one replayable
            logical-error estimate, preserving decoder choice, seed, code distance, loss model, and
            run identity.
          </p>
        </div>
        <LidmasReplayMedia />
      </section>

      <section className="lab-workstream">
        <div className="lab-workstream-copy">
          <p className="eyebrow">Reference workflow · Photon-QDrivers &rarr; Red Pitaya</p>
          <h2>Test timing and readout before an optical-lab handoff.</h2>
          <p>
            Red Pitaya STEMlab 125-14 is the primary reference target for pulse generation,
            detector emulation, readout tests, and coincidence counting. The additional boards are
            alternative vendor references, not owned equipment.
          </p>
          <ol className="lab-step-list">
            {qdriverValidationSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
        <div className="qdriver-board-stack">
          {qdriverHardwareOptions.map((board, index) => (
            <article
              className={index === 0 ? "qdriver-board-card is-primary" : "qdriver-board-card"}
              key={board.name}
            >
              <a
                className="qdriver-board-image"
                href={board.source}
                target="_blank"
                rel="noreferrer"
                aria-label={`${board.name} source reference`}
              >
                <img src={board.image} alt={board.alt} loading="lazy" />
              </a>
              <div className="qdriver-board-copy">
                <div className="qdriver-board-kicker">
                  <span>{board.label}</span>
                  <a href={board.source} target="_blank" rel="noreferrer">
                    Reference
                  </a>
                </div>
                <h3>{board.name}</h3>
                <p>{board.copy}</p>
                <ul>
                  {board.specs.map((spec) => (
                    <li key={spec}>{spec}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <FirstBenchProtocol />
      <LabMeasurementArtifacts />
    </>
  );
}

function ResearchProgramOverview() {
  return (
    <section className="section research-program-section flush-top">
      <div className="section-heading">
        <p className="eyebrow">Research in three views</p>
        <h2>See the program before reading the papers.</h2>
        <p>
          The work moves from photonic models, to decoder evidence, to controlled execution—with
          the working interface or publication shown beside each theme.
        </p>
      </div>
      <div className="research-agenda-grid">
        {researchAgenda.map((item) => (
          <article className="research-agenda-card" key={item.title}>
            <figure className="research-agenda-media">
              <img src={item.image} alt={item.imageAlt} loading="lazy" />
            </figure>
            <div className="research-agenda-card-body">
              <span>{item.signal}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <ul>
                {item.outputs.map((output) => (
                  <li key={output}>{output}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ClaimEvidencePipeline() {
  return (
    <section className="section research-pipeline-section">
      <div className="section-heading compact">
        <p className="eyebrow cyan">Evidence Path</p>
        <h2>Six steps from question to usable result.</h2>
      </div>
      <div className="research-pipeline-track" aria-label="Research claim to evidence pipeline">
        {claimEvidencePipeline.map((item) => (
          <article className="research-pipeline-step" key={item.step}>
            <span>{item.step}</span>
            <h3>{item.label}</h3>
            <p>{item.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ActiveResearchTracks() {
  return (
    <section className="section research-tracks-section">
      <div className="section-heading">
        <p className="eyebrow">Active Tracks</p>
        <h2>Each research track is tied to software that can be tested.</h2>
        <p>
          The research program connects papers, scripts, prototype boundaries, and software
          releases so each result can be traced back to a working artifact.
        </p>
      </div>
      <div className="research-track-list">
        {activeResearchTracks.map((track, index) => (
          <article className="research-track-row" key={track.name}>
            <div className="research-track-index">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <small>{track.software}</small>
            </div>
            <div className="research-track-copy">
              <h3>{track.name}</h3>
              <p>{track.question}</p>
            </div>
            <div className="research-track-evidence">
              {track.evidence.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ReproducibilityStandard() {
  return (
    <section className="section research-standard-section">
      <div className="research-standard-grid">
        <div className="research-standard-copy">
          <p className="eyebrow cyan">Reproducibility Standard</p>
          <h2>Research credibility depends on the artifact bundle.</h2>
          <p>
            A claim should travel with enough context for another researcher to inspect what
            was run, what changed, what failed, and what remains outside the validated boundary.
          </p>
        </div>
        <div className="research-standard-list">
          {reproducibilityStandards.map((item) => (
            <article className="research-standard-item" key={item.label}>
              <h3>{item.label}</h3>
              <p>{item.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PublicationMatrix() {
  return (
    <section className="section research-matrix-section">
      <div className="section-heading">
        <p className="eyebrow">Publication Matrix</p>
        <h2>Selected papers are connected to the software they support.</h2>
        <p>
          The matrix highlights the research thread, software surface, and evidence type behind
          each selected publication.
        </p>
      </div>
      <div className="research-matrix">
        <div className="research-matrix-row research-matrix-head" aria-hidden="true">
          <span>paper</span>
          <span>theme</span>
          <span>software</span>
          <span>evidence</span>
          <span>status</span>
        </div>
        {publicationResearchMatrix.map((item) => (
          <article className="research-matrix-row" key={item.paper}>
            <strong>{item.paper}</strong>
            <span>{item.theme}</span>
            <span>{item.software}</span>
            <span>{item.evidence}</span>
            <span>{item.status}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function OpenResearchQuestions() {
  return (
    <section className="section research-questions-section">
      <div className="section-heading">
        <p className="eyebrow cyan">Open Questions</p>
        <h2>The next phase is about sharper boundaries and better evidence.</h2>
      </div>
      <div className="research-question-grid">
        {openResearchQuestions.map((question, index) => (
          <article className="research-question" key={question}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <p>{question}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ResearchArtifacts({ standalone = false }) {
  return (
    <section className={`section research-section${standalone ? " flush-top" : ""}`}>
      <div className="section-heading">
        <p className="eyebrow">Selected Publications</p>
        <h2>Start with the paper, then follow the research thread.</h2>
        <p>
          Explore the featured study, then browse the wider research program by topic.
        </p>
      </div>
      <article className="research-spotlight">
        <a
          className="research-spotlight-paper"
          href={researchSpotlight.href}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open spotlight paper: ${researchSpotlight.title}`}
        >
          <img src={researchSpotlight.image} alt={researchSpotlight.imageAlt} loading="lazy" />
        </a>
        <div className="research-spotlight-copy">
          <p className="research-theme-index">00</p>
          <p className="eyebrow">{researchSpotlight.eyebrow}</p>
          <h3>{researchSpotlight.title}</h3>
          <p className="research-authors">{researchSpotlight.authors}</p>
          <p className="research-venue">{researchSpotlight.venue}</p>
          <p>{researchSpotlight.summary}</p>
          <div className="research-tags">
            {researchSpotlight.facts.map((fact) => (
              <span key={fact}>{fact}</span>
            ))}
          </div>
          <div className="research-links">
            <a href={researchSpotlight.href} target="_blank" rel="noreferrer">
              Paper
            </a>
          </div>
        </div>
      </article>
      <div className="research-theme-grid">
        {quantumResearchThemes.map((item, index) => (
          <article className="research-theme-card" key={item.title}>
            <div className="research-theme-copy">
              <p className="research-theme-index">{String(index + 1).padStart(2, "0")}</p>
              <p className="eyebrow">{item.theme}</p>
              <h3>{item.title}</h3>
              <p className="research-venue">{item.venue}</p>
              <div className="research-tags">
                {item.tags.slice(0, 2).map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <div className="research-links">
                <a href={item.href} target="_blank" rel="noreferrer">
                  Paper
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ResearchBrief() {
  return (
    <section className="section research-filter-section">
      <div className="research-filter-band">
        <div>
          <p className="mono-label">coverage</p>
          <h3>The selected papers support the software program from methods to implementation.</h3>
        </div>
        <p>
          Together they cover {researchFocusTracks.join(", ")}. The set establishes a direct bridge
          from published methods to SchroSIM, LiDMaS+, and lab-facing control work.
        </p>
      </div>
    </section>
  );
}

function TeamPage() {
  return (
    <>
      <section className="team-leadership-section flush-top">
        <div className="team-section-head">
          <div>
            <p className="eyebrow cyan">Core team</p>
            <h2>Three disciplines. One research program.</h2>
          </div>
          <p>
            Leadership connects quantum software architecture, artificial intelligence, and
            computational modeling around a shared standard: research should be inspectable,
            reproducible, and useful beyond a single paper.
          </p>
        </div>
        <div className="team-person-grid is-leadership">
          {teamLeadership.map((member, index) => member.placeholder ? (
            <article
              className="team-person-card is-placeholder"
              key={`leadership-placeholder-${index}`}
              aria-label="Reserved fourth leadership profile"
            >
              <span aria-hidden="true">{member.initials}</span>
            </article>
          ) : (
            <article className="team-person-card" key={member.name}>
              <div
                className={`team-portrait ${member.tone}${member.image ? " has-image" : ""}`}
                aria-hidden={member.image ? undefined : "true"}
              >
                {member.image ? (
                  <img src={member.image} alt={member.imageAlt} loading="lazy" />
                ) : (
                  <span>{member.initials}</span>
                )}
                <small>{member.status}</small>
              </div>
              <div className="team-person-copy">
                <h3>{member.name}</h3>
                <p className="team-role">{member.role}</p>
                <p className="team-focus">{member.focus}</p>
                {member.profiles?.length > 0 && (
                  <div className="team-profile-links" aria-label={`${member.name} profile links`}>
                    {member.profiles.map((profile) => (
                      <a
                        className="team-profile-link"
                        href={profile.href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={profile.label}
                        key={profile.href}
                      >
                        <SocialIcon icon={profile.icon} />
                      </a>
                    ))}
                  </div>
                )}
                <p>{member.bio}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section team-members-section">
        <div className="section-heading compact">
          <p className="eyebrow">Contribution paths</p>
          <h2>Participation stays deliberately small and scoped.</h2>
          <p>
            Current paths focus on undergraduate projects, short research visits, software
            fellowships, and external collaboration, with each contribution tied to one clear
            artifact.
          </p>
        </div>
        <div className="team-person-grid is-members">
          {groupMembers.map((member) => (
            <article className="team-person-card is-compact" key={member.name}>
              <div className={`team-portrait ${member.tone}`} aria-hidden="true">
                <span>{member.initials}</span>
                <small>{member.status}</small>
              </div>
              <div className="team-person-copy">
                <h3>{member.name}</h3>
                <p className="team-role">{member.role}</p>
                <p>{member.bio}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section team-recruiting-section">
        <div className="team-recruiting-head">
          <div>
            <p className="eyebrow">Work with us</p>
            <h2>Selected paths for focused contributions.</h2>
          </div>
          <p>
            These paths are for people who can take ownership of a clearly bounded artifact—from
            software tests and documentation to hardware notes, reproducible examples, or joint
            technical review.
          </p>
        </div>
        <div className="team-open-role-grid">
          {openResearchRoles.map((role) => (
            <article className="team-open-role-card" key={role.title}>
              <div className="team-open-role-top">
                <p className="mono-label">{role.status}</p>
                <span>{role.track}</span>
              </div>
              <h3>{role.title}</h3>
              <p>{role.copy}</p>
              <p className="team-role-artifact">{role.artifact}</p>
              <div className="team-role-evidence">
                {role.evidence.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
        <div className="team-qualifications-band">
          <div className="team-qualifications-grid">
            {recruitingQualifications.map((item) => (
              <article className="team-qualification-card" key={item.label}>
                <h3>{item.label}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="team-hiring-evidence-grid">
          {recruitingEvidence.map((item) => (
            <article className="team-hiring-evidence-item" key={item.label}>
              <h3>{item.label}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
        <div className="team-recruiting-callout">
          <div>
            <p className="mono-label">expression of interest</p>
            <h3>Send a short note with your track, background, and one artifact you would like to build.</h3>
          </div>
          <a href="mailto:dwayo3@gatech.edu?subject=Gottesman%20Software%20research%20role%20interest">
            Contact about roles
          </a>
        </div>
      </section>

      <section className="team-band">
        <div>
          <p className="mono-label">collaboration standard</p>
          <h2>Every contribution should strengthen the evidence trail.</h2>
        </div>
        <p>
          The operating model favors reproducible experiments, scoped claims, readable artifacts,
          and reviewable software over informal or unsupported technical assertions.
        </p>
      </section>
    </>
  );
}

function SupportPage() {
  return (
    <>
      <section className="section funders-section flush-top">
        <div className="section-heading">
          <p className="eyebrow">Support Paths</p>
          <h2>Support should turn research software into reproducible photonic quantum evidence.</h2>
          <p>
            Gottesman Software welcomes proposal partners, university programs, funders,
            foundations, and lab collaborators who understand that credible quantum progress
            depends on simulation, decoding, hardware control, and repeatable evidence.
          </p>
        </div>
        <div className="funder-grid">
          {funderTracks.map((track) => (
            <article className="funder-card" key={track.title}>
              <p className="mono-label">{track.title}</p>
              <p>{track.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section country-funding-section">
        <div className="section-heading">
          <p className="eyebrow cyan">International Funding Map</p>
          <h2>Candidate pathways by country.</h2>
          <p>
            These are representative routes for research proposals, fellowships, technology
            translation, and international collaboration. Each program has its own eligibility,
            deadline, and institutional requirements.
          </p>
        </div>
        <div className="country-funding-grid">
          {countryFundingMap.map((country) => (
            <article className="country-funding-card" key={country.country}>
              <div className="country-funding-head">
                <p className="mono-label">{country.country}</p>
                <p>{country.fit}</p>
              </div>
              <div className="country-funding-routes">
                {country.routes.map((route) => (
                  <a href={route.href} key={route.name} target="_blank" rel="noreferrer">
                    <span>{route.name}</span>
                    <small>{route.kind}</small>
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section support-collaboration-section">
        <div className="section-heading compact">
          <p className="eyebrow">How To Collaborate</p>
          <h2>Funding should attach to a concrete artifact.</h2>
        </div>
        <div className="support-collaboration-grid">
          {supportCollaborationModels.map((model) => (
            <article className="support-collaboration-card" key={model.title}>
              <h3>{model.title}</h3>
              <p>{model.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="funder-band">
        <div>
          <p className="mono-label">support boundary</p>
          <h2>The funding map is a proposal guide, not a list of current sponsors.</h2>
          <p>
            Listed agencies and programs are candidate alignment pathways for research support,
            collaboration, fellowships, and proposal development. Gottesman Software Research
            Group does not claim funding, endorsement, or eligibility unless explicitly stated in
            a confirmed award or signed collaboration.
          </p>
        </div>
      </section>
    </>
  );
}

function Contact() {
  return (
    <section className="cta-section" id="contact">
      <img src="/assets/gottesman-software-emblem-v3-black-background.png" alt="Gottesman Software emblem" />
      <div className="cta-copy">
        <div className="cta-text">
          <p className="eyebrow cyan">Open research and collaboration</p>
          <h2>Build reproducible photonic research with us.</h2>
          <p>
            Explore the public repositories, review the evidence boundaries, or contact the
            research group about software, publications, prototype validation, and collaboration.
          </p>
        </div>
        <div className="cta-actions">
          <div className="cta-action-row">
            <a
              className="contact-link contact-link-primary"
              href="https://github.com/Gottesman-Software"
              target="_blank"
              rel="noreferrer"
            >
              Explore GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function SocialIcon({ icon }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={socialIconPaths[icon]} />
    </svg>
  );
}

function Footer({ route, onNavigate }) {
  return (
    <footer className="footer">
      <Contact />
      <div className="footer-main">
        <div className="footer-left">
          <div className="footer-brand-block">
            <div>
              <p>&copy; 2026 Gottesman Software Research Group.</p>
              <p className="footer-legal">Open-source research software and public documentation.</p>
              <div className="footer-socials" aria-label="Social media links">
                {socialLinks.map((item) => {
                  const isExternal = item.href.startsWith("http");

                  return (
                    <a
                      href={item.href}
                      key={item.label}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noreferrer" : undefined}
                      aria-label={item.label}
                    >
                      <SocialIcon icon={item.icon} />
                    </a>
                  );
                })}
              </div>
              <button
                className="footer-cookie-settings"
                type="button"
                onClick={() => window.dispatchEvent(new Event("gottesman:open-cookie-preferences"))}
              >
                Cookie settings
              </button>
            </div>
          </div>
        </div>
        <div className="footer-link-groups">
          {footerLinkGroups.map((group) => (
            <div className="footer-link-group" key={group.title}>
              <p>{group.title}</p>
              {group.links.map((link) =>
                link.path ? (
                  <PageLink key={link.label} to={link.path} onNavigate={onNavigate}>
                    {link.label}
                  </PageLink>
                ) : (
                  <a href={link.href} key={link.label}>
                    {link.label}
                  </a>
                ),
              )}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}

const COOKIE_PREFERENCES_KEY = "gottesman-cookie-preferences-v2";
const COOKIE_PREFERENCES_LIFETIME = 1000 * 60 * 60 * 24 * 180;

function readCookiePreferences() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = JSON.parse(window.localStorage.getItem(COOKIE_PREFERENCES_KEY));
    if (!stored || stored.version !== 2 || stored.expiresAt <= Date.now()) {
      return null;
    }
    return stored;
  } catch {
    return null;
  }
}

function CookieBanner({ route }) {
  const analyticsAvailable = hasAnalyticsMeasurementId();
  const [isReady, setIsReady] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [showDetails, setShowDetails] = React.useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = React.useState(false);

  React.useEffect(() => {
    const saved = readCookiePreferences();
    setAnalyticsEnabled(Boolean(saved?.analytics));
    setIsOpen(!saved);
    setIsReady(true);

    function openPreferences() {
      const current = readCookiePreferences();
      setAnalyticsEnabled(Boolean(current?.analytics));
      setShowDetails(true);
      setIsOpen(true);
    }

    window.addEventListener("gottesman:open-cookie-preferences", openPreferences);
    return () => window.removeEventListener("gottesman:open-cookie-preferences", openPreferences);
  }, []);

  function savePreferences(nextAnalyticsChoice) {
    const preferences = {
      version: 2,
      necessary: true,
      analytics: nextAnalyticsChoice,
      savedAt: Date.now(),
      expiresAt: Date.now() + COOKIE_PREFERENCES_LIFETIME,
    };

    window.localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences));
    setAnalyticsConsent(nextAnalyticsChoice ? "accepted" : "declined");

    if (nextAnalyticsChoice && analyticsAvailable) {
      initializeAnalytics();
      trackRouteView(route);
    }

    setAnalyticsEnabled(nextAnalyticsChoice);
    setShowDetails(false);
    setIsOpen(false);
  }

  if (!isReady || !isOpen) {
    return null;
  }

  return (
    <div
      className={`cookie-banner${showDetails ? " is-expanded" : ""}`}
      role="dialog"
      aria-labelledby="cookie-preferences-title"
      aria-describedby="cookie-preferences-summary"
    >
      <div className="cookie-banner-copy">
        <p className="eyebrow cyan">Privacy choices</p>
        <h2 id="cookie-preferences-title">Choose how this site stores data.</h2>
        <p id="cookie-preferences-summary">
          Necessary storage remembers your choice. Optional analytics runs only when you allow it.
          You can change this later through Cookie settings in the footer.
        </p>
      </div>

      {showDetails && (
        <div className="cookie-preference-list">
          <label className="cookie-preference-row" htmlFor="necessary-storage">
            <span>
              <strong>Necessary storage</strong>
              <small>
                Saves this consent choice in local storage for up to six months. It is required
                for the preference control to work.
              </small>
            </span>
            <input id="necessary-storage" type="checkbox" checked disabled />
          </label>
          <label className="cookie-preference-row" htmlFor="analytics-storage">
            <span>
              <strong>Analytics</strong>
              <small>
                Google Analytics can receive page views and selected Studio interactions. Google
                Signals, advertising storage, and ad personalisation stay disabled.
                {!analyticsAvailable && " Analytics is not currently active on this deployment."}
              </small>
            </span>
            <input
              id="analytics-storage"
              type="checkbox"
              checked={analyticsEnabled}
              onChange={(event) => setAnalyticsEnabled(event.target.checked)}
            />
          </label>
          <p className="cookie-provider-note">
            Analytics data is handled under Google's privacy terms. No optional analytics script
            is loaded before consent.
          </p>
        </div>
      )}

      <div className="cookie-actions">
        <button className="cookie-action-secondary" type="button" onClick={() => savePreferences(false)}>
          Reject optional
        </button>
        {showDetails ? (
          <button className="cookie-action-settings" type="button" onClick={() => savePreferences(analyticsEnabled)}>
            Save choices
          </button>
        ) : (
          <button className="cookie-action-settings" type="button" onClick={() => setShowDetails(true)}>
            Choose settings
          </button>
        )}
        <button className="cookie-action-primary" type="button" onClick={() => savePreferences(true)}>
          Accept analytics
        </button>
      </div>
    </div>
  );
}

function ScrollEnhancements({ route }) {
  const [scrollState, setScrollState] = React.useState({
    progress: 0,
    atTop: true,
    atBottom: false,
    canScroll: false,
  });

  React.useEffect(() => {
    let frame = 0;

    function updateScrollState() {
      frame = 0;
      const maxScrollTop = getMaxScrollTop();
      const progress = maxScrollTop ? window.scrollY / maxScrollTop : 0;
      setScrollState({
        progress: Math.max(0, Math.min(progress, 1)),
        atTop: window.scrollY < 24,
        atBottom: maxScrollTop - window.scrollY < 24,
        canScroll: maxScrollTop > 24,
      });
    }

    function requestUpdate() {
      if (!frame) {
        frame = window.requestAnimationFrame(updateScrollState);
      }
    }

    updateScrollState();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [route]);

  React.useEffect(() => {
    const revealTargets = Array.from(
      document.querySelectorAll(
        [
          ".section",
          ".thesis-item",
          ".workflow-step",
          ".evidence-standard",
          ".software-showcase",
          ".software-result-card",
          ".quickstart-file-card",
          ".quickstart-code-window",
          ".software-maturity-card",
          ".studio-system-panel",
          ".studio-surface-card",
          ".studio-plan-card",
          ".studio-export-list article",
          ".stack-card",
          ".lab-workstream",
          ".lab-ladder-card",
          ".lab-proof-panel",
          ".bench-protocol-step",
          ".measurement-row",
          ".artifact-bundle-panel",
          ".qdriver-board-card",
          ".research-spotlight",
          ".research-agenda-card",
          ".research-pipeline-step",
          ".research-track-row",
          ".research-standard-item",
          ".research-matrix-row",
          ".research-question",
          ".research-theme-card",
          ".team-person-card",
          ".team-open-role-card",
          ".team-hiring-evidence-item",
          ".team-recruiting-callout",
          ".team-band",
          ".funder-card",
          ".funder-band",
          ".cta-section",
          ".footer-main",
        ].join(","),
      ),
    );

    revealTargets.forEach((element, index) => {
      element.classList.add("spring-reveal");
      element.style.setProperty("--spring-delay", `${Math.min((index % 4) * 24, 72)}ms`);
    });

    if (prefersReducedMotion()) {
      revealTargets.forEach((element) => element.classList.add("is-visible"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -4% 0px",
        threshold: 0.04,
      },
    );

    revealTargets.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [route]);

  const isDownControl = scrollState.atTop;

  return (
    <div
      className={`scroll-tools ${isDownControl ? "is-down" : "is-up"}${
        scrollState.atBottom ? " is-at-bottom" : ""
      }`}
      style={{ "--scroll-progress": scrollState.progress }}
      aria-label="Page scroll controls"
    >
      <button
        type="button"
        className="scroll-tool-button"
        onClick={() => springScrollTo(isDownControl ? getMaxScrollTop : 0)}
        disabled={!scrollState.canScroll}
        aria-label={isDownControl ? "Scroll to bottom" : "Scroll to top"}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          {isDownControl ? (
            <path d="M13 14.8V4h-2v10.8l-4.2-4.2L5.4 12l6.6 6.6 6.6-6.6-1.4-1.4L13 14.8Z" />
          ) : (
            <path d="M12 5.4 5.4 12l1.4 1.4L11 9.2V20h2V9.2l4.2 4.2 1.4-1.4L12 5.4Z" />
          )}
        </svg>
      </button>
    </div>
  );
}

function HomePage({ route, onNavigate }) {
  return (
    <>
      <Hero onNavigate={onNavigate} />
      <HomeIntro />
      <ResearchThesis onNavigate={onNavigate} />
      <IntegratedWorkflow onNavigate={onNavigate} />
      <EvidenceStandards />
    </>
  );
}

function RoutedPage({ route, onNavigate }) {
  if (route === "/studio" || route.startsWith("/studio/")) {
    return <StudioPage onNavigate={onNavigate} route={route} />;
  }

  const page = pageItems.find((item) => item.path === route);

  if (!page) {
    return <HomePage route={route} onNavigate={onNavigate} />;
  }

  return (
    <>
      <PageHero page={page} />
      {route === "/software" && <SoftwarePage />}
      {route === "/lab" && <LabPage />}
      {route === "/research" && (
        <>
          <ResearchProgramOverview />
          <ResearchArtifacts />
          <ClaimEvidencePipeline />
        </>
      )}
      {route === "/team" && <TeamPage />}
      {route === "/support" && <SupportPage />}
    </>
  );
}

export default function App() {
  const [route, setRoute] = React.useState(currentRoute);
  const isStudioRoute = route === "/studio" || route.startsWith("/studio/");

  React.useEffect(() => {
    updateDocumentMetadata(route);
    trackRouteView(route);
  }, [route]);

  React.useEffect(() => {
    function handlePopState() {
      setRoute(currentRoute());
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = React.useCallback((to) => {
    const nextRoute = validRoutePaths.has(to) ? to : "/";
    trackEvent("site_navigation", {
      destination: nextRoute,
    });

    if (window.location.pathname !== nextRoute) {
      window.history.pushState({}, "", nextRoute);
    }

    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return (
    <>
      {!isStudioRoute && <Header route={route} onNavigate={navigate} />}
      <main>
        <RoutedPage route={route} onNavigate={navigate} />
      </main>
      {!isStudioRoute && <Footer route={route} onNavigate={navigate} />}
      <ScrollEnhancements route={route} />
      <CookieBanner route={route} />
    </>
  );
}
