import React from "react";

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

const pageItems = [
  {
    label: "Software",
    path: "/software",
    eyebrow: "Software Stack",
    title: "Integrated software for photonic quantum research.",
    copy:
      "SchroSIM, LiDMaS+, and Photon-QDrivers provide coordinated capabilities for circuit modeling, decoder validation, and lab-oriented execution.",
    heroCode: softwareHeroCode,
    heroPosition: "right center",
  },
  {
    label: "Lab",
    path: "/lab",
    eyebrow: "Prototype Lab",
    title: "Prototype pathways for photonic circuit and control-system validation.",
    copy:
      "The lab program connects SchroSIM design studies, LiDMaS+ overhead analysis, and Photon-QDrivers control validation for university and collaborating research environments.",
    heroImage: "/assets/headers/lab-voltera-vone.webp",
    heroVideo: "/assets/headers/VOneAnatomyDispenserOverview.mp4",
    heroPlaybackRate: 0.45,
    heroPosition: "right center",
  },
  {
    label: "Research",
    path: "/research",
    eyebrow: "Quantum Research",
    title: "Research Foundations",
    copy:
      "The publication set covers continuous-variable photonic circuits, differentiable mitigation, decoder benchmarking, GKP photonic QEC, simulator architecture, and physics-informed scientific modeling.",
    heroImage: "/assets/headers/research-original-quantum.png",
    heroPosition: "center",
  },
  {
    label: "Team",
    path: "/team",
    eyebrow: "Team",
    title: "Leadership and research group development.",
    copy:
      "Gottesman Software is organized around research leadership, scientific software engineering, photonic simulation, decoder validation, and lab-facing hardware control.",
    heroImage: "/assets/headers/team-ligo-scientists.jpg",
    heroPosition: "center 45%",
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

const socialLinks = [
  { label: "X", icon: "x", href: "https://x.com/DennisWayogh" },
  {
    label: "LinkedIn",
    icon: "linkedin",
    href: "https://www.linkedin.com/in/dennis-wayo-765a38b1/",
  },
  { label: "GitHub", icon: "github", href: "https://github.com/DennisWayo" },
  { label: "Medium", icon: "medium", href: "https://medium.com/@iwayoden" },
];

const socialIconPaths = {
  x: "M18.901 1.153h3.68l-8.04 9.19L24 22.847h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.153h7.594l5.243 6.932Zm-1.292 19.492h2.039L6.486 3.24H4.298Z",
  linkedin:
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0Z",
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
      { label: "Prototype Lab", path: "/lab" },
      { label: "Publications", path: "/research" },
      { label: "Software Suite", path: "/software" },
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
    role: "Continuous-variable photonic circuit design, compilation, and simulation.",
    summary:
      "SchroSIM is the circuit-facing layer. It enables researchers to define photonic workloads, check backend policy, and run model-exact or controlled-approximation simulation paths before hardware access.",
    fit: [
      "Design CV photonic circuits and project-scoped workflows",
      "Compile into backend-aware runtime configuration",
      "Inspect failure modes such as unsupported operations, numerical limits, and policy mismatch",
    ],
    boundary:
      "The public UI, core workflows, docs, examples, and reproducibility guidance are part of the open-source research surface.",
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
    role: "Reproducible quantum error-correction simulation, decoder benchmarking, and hardware-to-decoder replay.",
    summary:
      "LiDMaS+ is the evidence layer. It preserves run scope, decoder settings, seeds, input streams, version identity, and result artifacts so QEC studies can be replayed and compared under consistent assumptions.",
    fit: [
      "Run surface, CSS-family, LDPC, and GKP-aware workflows",
      "Compare MWPM, UF, BP, neural MWPM, and reference decoders",
      "Convert simulator or hardware streams into scoped decoder experiments",
    ],
    boundary:
      "Stable workflows are CLI-first; the control-plane UI remains under active development.",
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
    media: "/assets/software/photon-qdrivers-execution-animation.svg",
    mediaAlt: "Photon-QDrivers animated emulator and hardware execution path from the project README",
    role: "A universal driver layer for photonic workloads across emulators, native runtime paths, FPGA boundaries, and hardware adapters.",
    summary:
      "Photon-QDrivers is the execution boundary. It validates a PhotonicCircuit IR, checks backend capabilities, routes jobs to the selected target, and normalizes results for downstream analysis.",
    fit: [
      "Expose one Python API for emulator and hardware-like targets",
      "Attach backend capability metadata before execution",
      "Bridge to native runtime, HAL contracts, FPGA mailboxes, and vendor adapters",
    ],
    boundary:
      "The driver layer validates software and control pathways; it does not imply access to complete photonic quantum hardware by itself.",
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
      "The paper-run tree now includes paper_01 through paper_05, including threshold estimation, native GKP, Xanadu replay, framework comparison, and hardware-in-the-loop syndrome extraction.",
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

const homeSoftware = [
  {
    name: "SchroSIM",
    path: "/software",
    role: "Photonic circuit design and simulation",
    copy:
      "A design environment for defining photonic circuits, checking backend policy, and producing reproducible simulation paths.",
  },
  {
    name: "LiDMaS+",
    path: "/software",
    role: "Fault-tolerance and decoder validation",
    copy:
      "A research framework for quantum error-correction studies, decoder benchmarking, threshold evidence, and replayable result artifacts.",
  },
  {
    name: "Photon-QDrivers",
    path: "/lab",
    role: "Prototype lab and hardware control",
    copy:
      "A driver layer for translating validated workloads into emulator, adapter, and preliminary bench-control workflows.",
  },
];

const researchThesisItems = [
  {
    signal: "model",
    title: "Design photonic circuits as inspectable workloads.",
    copy:
      "SchroSIM keeps circuit definitions, backend policy, numerical limits, and simulator assumptions visible before results are trusted.",
  },
  {
    signal: "decode",
    title: "Treat decoder evidence as part of the experiment.",
    copy:
      "LiDMaS+ preserves seeds, decoder settings, noise assumptions, and run identity so threshold and logical-error claims can be replayed.",
  },
  {
    signal: "drive",
    title: "Move toward lab control without losing provenance.",
    copy:
      "Photon-QDrivers turns validated workloads into emulator, adapter, and bench-control paths with explicit capability boundaries.",
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
    "This paper provides a central reference for LiDMaS+ research: decoder choice, estimator resolution, fallback diagnostics, and hybrid CV-discrete noise all influence threshold analysis. It is presented as the spotlight publication before the broader selected paper set.",
  facts: ["LiDMaS+ workflow", "hybrid CV-discrete sweeps", "accepted 4 June 2026"],
};

const researchAgenda = [
  {
    signal: "SIM",
    title: "Photonic circuit design and simulation",
    body:
      "Use SchroSIM to turn photonic circuit ideas into runtime artifacts, validation gates, and benchmarkable simulator workloads.",
    outputs: ["PhotonicCircuit IR", "validation suites", "runtime snapshots"],
  },
  {
    signal: "QEC",
    title: "Hardware-to-decoder quantum error correction",
    body:
      "Use LiDMaS+ to compare decoder behavior under synthetic, hybrid, and hardware-derived syndrome streams.",
    outputs: ["decoder requests", "threshold sweeps", "trace artifacts"],
  },
  {
    signal: "GKP",
    title: "Hybrid CV-DV fault tolerance",
    body:
      "Study how GKP digitization, surface-code distance, finite squeezing, and decoder choice affect auditable threshold claims.",
    outputs: ["GKP studies", "surface-code runs", "crossing summaries"],
  },
  {
    signal: "LAB",
    title: "Lab-facing control and validation",
    body:
      "Move only clearly labeled artifacts from simulation into Photon-QDrivers control paths, loopback benches, and partner-lab evaluation.",
    outputs: ["board profiles", "timing logs", "claim labels"],
  },
];

const claimEvidencePipeline = [
  {
    step: "01",
    label: "Question",
    copy: "State the physical, decoder, or control claim before running the workflow.",
  },
  {
    step: "02",
    label: "Artifact",
    copy: "Generate a circuit, runtime, or decoder fixture with source and version context attached.",
  },
  {
    step: "03",
    label: "Replay",
    copy: "Run the same artifact through simulator, decoder, emulator, or board-facing contracts.",
  },
  {
    step: "04",
    label: "Benchmark",
    copy: "Measure latency, threshold behavior, warning rates, replay integrity, or residual quality.",
  },
  {
    step: "05",
    label: "Publication",
    copy: "Promote scripts, tables, figures, and failure diagnostics into paper-ready evidence.",
  },
  {
    step: "06",
    label: "Translation",
    copy: "Feed validated findings back into SchroSIM, LiDMaS+, Photon-QDrivers, or lab protocols.",
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
    name: "Hardware-to-decoder replay",
    software: "LiDMaS+",
    question: "Can provider-style records be normalized into one decoder I/O contract?",
    evidence: ["Xanadu fixture replay", "real-data slices", "quality metrics"],
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
  volteraVone: "https://www.voltera.io/images/vone/largeVone.webp",
  redPitaya:
    "https://redpitaya.com/wp-content/uploads/elementor/thumbs/Red_Pitaya_STEMlab_125-14-1-qsxg9izwg7w9l4k9vgfy7rprako7dnj8bc7nugbe00.jpg",
  artyA7:
    "https://cdn11.bigcommerce.com/s-7gavg/images/stencil/1280x1280/products/471/3908/Arty_obl_2_600__25304.1670980518.png?c=2",
  kriaKv260: "https://www.amd.com/content/dam/amd/en/images/products/som/2362834-kv260-product.jpg",
  eclypseZ7:
    "https://cdn11.bigcommerce.com/s-7gavg/images/stencil/1280x1280/products/650/5474/Eclypse-obl-1000__98266.1670984787.jpg?c=2",
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
    label: "Primary evaluation board",
    name: "Red Pitaya STEMlab 125-14",
    image: labAssets.redPitaya,
    source: "https://redpitaya.com/stemlab-125-14/",
    alt: "Red Pitaya STEMlab 125-14 board",
    copy:
      "Closest common-market target for photonic lab control, including pulse generation, detector-pulse emulation, readout experiments, and coincidence-counter validation.",
    specs: ["Zynq 7010", "2 RF inputs / 2 RF outputs", "125 MS/s, 14-bit ADC/DAC", "Ethernet, Wi-Fi option, digital IO"],
  },
  {
    label: "RTL validation",
    name: "Digilent Arty A7-100T",
    image: labAssets.artyA7,
    source: "https://digilent.com/shop/arty-a7-100t-artix-7-fpga-development-board/",
    alt: "Digilent Arty A7-100T FPGA development board",
    copy:
      "Lower-cost FPGA platform for GPIO pulse scheduling, counter logic, timing fixtures, and CI-style board tests before lab instrumentation is involved.",
    specs: ["Artix-7 FPGA", "256MB DDR3L", "JTAG and Quad-SPI programming", "Counter and GPIO timing validation"],
  },
  {
    label: "Host runtime",
    name: "AMD Kria KV260",
    image: labAssets.kriaKv260,
    source: "https://www.amd.com/en/products/system-on-modules/kria/k26/kv260-vision-starter-kit.html",
    alt: "AMD Kria KV260 Vision AI Starter Kit board",
    copy:
      "A stronger Linux-plus-FPGA runtime target for transport, Ethernet/USB integration, and production-style host orchestration with expansion hardware.",
    specs: ["Zynq UltraScale+ MPSoC", "4 GB DDR", "1 Gb Ethernet", "USB 3.0 / 2.0"],
  },
  {
    label: "Instrumentation",
    name: "Digilent Eclypse Z7",
    image: labAssets.eclypseZ7,
    source: "https://digilent.com/shop/eclypse-z7/",
    alt: "Digilent Eclypse Z7 modular instrumentation board",
    copy:
      "Instrumentation-oriented Zynq board when Zmod/SYZYGY ADC, DAC, Scope, AWG, SDR, or Digitizer expansion is the right bench interface.",
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

const qecHeaderCells = Array.from({ length: 48 }, (_, index) => index);
const qecDefectIndexes = new Set([3, 9, 14, 22, 28, 35, 41]);

const teamLeadership = [
  {
    name: "Dennis Wayo, PhD",
    role: "Founder and Principal Investigator",
    initials: "DW",
    status: "Leadership",
    tone: "tone-cyan",
    image: "/assets/team/dennis-wayo.jpeg",
    imageAlt: "Dennis Wayo portrait",
    scholar: "https://scholar.google.com/citations?hl=en&user=YCXIi1wAAAAJ&view_op=list_works&sortby=pubdate",
    bio:
      "Leads the research direction, technical boundaries, public technical claims, and the transition from prototype software to institutional development.",
  },
  {
    name: "Research Lead",
    role: "Quantum Error-Correction Strategy",
    initials: "QL",
    status: "Placeholder",
    tone: "tone-violet",
    bio:
      "Guides LiDMaS+ decoder experiments, threshold methodology, GKP assumptions, and review standards for publishable QEC evidence.",
  },
  {
    name: "Prof. Dr Sven Groppe",
    role: "Simulation and Systems Architecture",
    initials: "SG",
    status: "Architecture",
    tone: "tone-green",
    image: "/assets/team/sven-groppe.png",
    imageAlt: "Prof. Dr Sven Groppe portrait",
    scholar: "https://scholar.google.com/citations?hl=en&user=drGVVY0AAAAJ&view_op=list_works&sortby=pubdate",
    bio:
      "Supports simulator architecture, system design, API boundaries, artifact formats, and the transition from research code to usable open-source software.",
  },
  {
    name: "Lab Lead",
    role: "Photonic Controls and Prototyping",
    initials: "PL",
    status: "Placeholder",
    tone: "tone-blue",
    bio:
      "Connects SchroSIM studies, Photon-QDrivers, bench instrumentation, and prototype board validation for partner lab workflows.",
  },
];

const groupMembers = [
  {
    name: "Postdoctoral Researcher",
    role: "Independent research lead",
    initials: "PD",
    status: "Planned role",
    tone: "tone-violet",
    bio:
      "Leads focused projects in photonic QEC, decoder benchmarking, hardware replay, or photonic circuit simulation while mentoring junior group members.",
  },
  {
    name: "Graduate Researcher",
    role: "Thesis-aligned project",
    initials: "GR",
    status: "Planned role",
    tone: "tone-cyan",
    bio:
      "Develops a publishable research track across SchroSIM, LiDMaS+, Photon-QDrivers, GKP workflows, or PER-to-LER overhead studies.",
  },
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
    title: "Postdoctoral Researcher",
    track: "Photonic QEC and decoder evidence",
    status: "Planned role",
    copy:
      "Lead a focused research track across GKP assumptions, decoder dependence, hardware replay, or photonic circuit validation.",
    artifact: "Expected artifact: a paper-ready benchmark, validation package, or reproducible research workflow.",
    evidence: ["first-author paper path", "benchmark suite", "student mentorship"],
  },
  {
    title: "Graduate Researcher",
    track: "Thesis-aligned software and physics",
    status: "Recruiting fit",
    copy:
      "Develop a thesis-scale project connected to SchroSIM, LiDMaS+, Photon-QDrivers, or lab-facing validation protocols.",
    artifact: "Expected artifact: a thesis module with scripts, tests, examples, and paper-facing figures or tables.",
    evidence: ["reproducible workflows", "paper artifacts", "software ownership"],
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
const routeAliases = new Map([["/funders", "/support"]]);
let activeSpringScrollFrame = 0;

function currentRoute() {
  const pathname = window.location.pathname.replace(/\/+$/, "") || "/";
  const canonicalPath = routeAliases.get(pathname) || pathname;
  return routePaths.has(canonicalPath) ? canonicalPath : "/";
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
        <img src="/assets/gottesman-software-emblem-concept-v3.svg" alt="" />
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

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-bg" aria-hidden="true" />
      <div className="formula-field" aria-hidden="true">
        <span>H|psi&gt; = E|psi&gt;</span>
        <span>rho -&gt; D(rho)</span>
        <span>pL &lt; pth</span>
        <span>Sx = 0</span>
      </div>
      <div className="hero-inner">
        <p className="eyebrow">University Research Group Initiative</p>
        <h1>Gottesman Software</h1>
        <p className="hero-copy">
          Open-source research software for designing, decoding, and driving fault-tolerant
          photonic quantum computing experiments from simulation to lab-facing validation.
        </p>
      </div>
    </section>
  );
}

function PageTabs({ route, onNavigate }) {
  return (
    <nav className="page-tabs" aria-label="Page tabs">
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
  );
}

function HomeIntro() {
  return (
    <section className="section home-intro-section">
      <div className="home-intro-grid">
        <div>
          <p className="eyebrow">Institutional Overview</p>
          <h2>A research software lab for fault-tolerant photonic quantum computing.</h2>
        </div>
        <div className="home-intro-copy">
          <p className="status-note">
            Gottesman Software is a university research-group initiative developing open research
            software for photonic quantum computing.
          </p>
          <p>
            Gottesman Software builds the software layer for photonic quantum research: circuit
            modeling, decoder validation, experiment replay, and lab-facing control.
          </p>
          <p>
            The name honors the stabilizer and fault-tolerance tradition that made large-scale
            quantum computing intellectually concrete. The work carries that standard into
            photonic architectures, where credible progress depends on reproducible software and
            careful evidence.
          </p>
        </div>
      </div>
    </section>
  );
}

function ResearchThesis() {
  return (
    <section className="section thesis-section">
      <div className="thesis-grid">
        <div className="thesis-copy">
          <p className="eyebrow">Research Thesis</p>
          <h2>Fault-tolerant photonic research needs one evidence trail.</h2>
          <p>
            Gottesman Software treats simulation, decoding, and lab control as one research
            workflow. The goal is not only to run experiments, but to preserve enough context that
            each claim can be inspected, replayed, and improved.
          </p>
        </div>
        <div className="thesis-diagram" aria-label="Research thesis formula diagram">
          <p>circuit</p>
          <span>ψ</span>
          <p>decoder</p>
          <span>|GS⟩</span>
          <p>control</p>
          <strong>evidence</strong>
        </div>
      </div>
      <div className="thesis-list">
        {researchThesisItems.map((item) => (
          <article className="thesis-item" key={item.signal}>
            <p className="mono-label">{item.signal}</p>
            <h3>{item.title}</h3>
            <p>{item.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function IntegratedWorkflow({ onNavigate }) {
  return (
    <section className="section workflow-section">
      <div className="section-heading compact">
        <p className="eyebrow">Integrated Workflow</p>
        <h2>From photonic circuit intent to reproducible lab-facing evidence.</h2>
        <p>
          The stack is organized as a research pipeline. Each step has a defined input, output,
          validation boundary, and route back to the software or lab layer that produced it.
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
        <h2>Research software should make claims easier to audit.</h2>
        <p>
          Gottesman Software is built around the idea that scientific progress in photonic quantum
          computing depends on clear assumptions, reproducible outputs, and careful technical
          boundaries.
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

function MissionVision() {
  return (
    <section className="mission-section">
      <div className="mission-grid">
        <article>
          <p className="mono-label">mission</p>
          <h2>Make photonic quantum research reproducible from model to measurement.</h2>
          <p>
            The mission connects circuit definitions, simulator policy, decoder settings,
            hardware-control boundaries, and result artifacts so experiments can be inspected,
            replayed, and improved.
          </p>
        </article>
        <article>
          <p className="mono-label">vision</p>
          <h2>Turn fault-tolerant photonic computing into a testable engineering discipline.</h2>
          <p>
            The long-term vision is a transparent software stack where researchers can design
            photonic circuits, evaluate fault-tolerance assumptions, validate decoders, and move
            toward lab execution without losing the evidence trail.
          </p>
        </article>
      </div>
    </section>
  );
}

function HostedSoftware({ onNavigate }) {
  return (
    <section className="section hosted-section">
      <div className="section-heading">
        <p className="eyebrow">Hosted Software</p>
        <h2>Integrated tools for fault-tolerant photonic quantum research.</h2>
        <p>
          Gottesman Software hosts research tools that connect photonic circuit design, decoder
          validation, and prototype lab control.
        </p>
      </div>
      <div className="hosted-grid">
        {homeSoftware.map((item, index) => (
          <PageLink className="hosted-card" key={item.name} to={item.path} onNavigate={onNavigate}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{item.name}</h3>
            <p className="hosted-role">{item.role}</p>
            <p>{item.copy}</p>
          </PageLink>
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
        <h2>Start from code, then move into the full research workflows.</h2>
        <p>
          A small set of entry scripts shows the Python driver API, the C++ native runtime
          boundary, and a Swift SchroSIM circuit simulation path.
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
        <h2>Use precise claims for each tool.</h2>
        <p>
          Each tool is presented by its current working surface, its active development track,
          and the boundary between research software and lab-facing validation.
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
          <p className="eyebrow">Hosted Research Software</p>
          <h2>Hosted software for photonic quantum research and validation.</h2>
          <p>
            Gottesman Software maintains distinct tools within a coordinated pipeline for circuit
            design, decoder validation, and emulator or lab-oriented execution.
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

      <SoftwareImportantResults />

      {softwareShowcases.map((tool, index) => (
        <section
          className={`software-showcase${index % 2 === 1 ? " reverse" : ""}`}
          key={tool.name}
        >
          <div className="software-media">
            <div className="software-logo-band">
              <img src={tool.logo} alt={`${tool.name} logo`} />
            </div>
            <div className="software-preview">
              <img src={tool.media} alt={tool.mediaAlt} />
            </div>
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

function StreamingDecoderPanel() {
  return (
    <div className="streaming-decoder-panel" role="img" aria-label="Animated streaming decoder panel">
      <div className="decoder-panel-top">
        <span>PER stream</span>
        <span>syndrome bus</span>
        <span>decoder replay</span>
        <span>LER estimate</span>
      </div>
      <div className="decoder-lattice">
        {qecHeaderCells.map((cell) => (
          <span
            className={qecDefectIndexes.has(cell) ? "decoder-cell is-defect" : "decoder-cell"}
            key={cell}
            style={{ "--pulse-delay": `${(cell % 8) * 0.13}s` }}
          />
        ))}
        <span className="decoder-path path-one" />
        <span className="decoder-path path-two" />
        <span className="decoder-path path-three" />
      </div>
      <div className="decoder-metrics">
        <p>
          <span>PER</span>
          <strong>model + measured stream</strong>
        </p>
        <p>
          <span>LER</span>
          <strong>logical outcome with replay key</strong>
        </p>
      </div>
    </div>
  );
}

function LabValidationLadder() {
  return (
    <section className="section lab-ladder-section">
      <div className="section-heading compact">
        <p className="eyebrow">Validation Ladder</p>
        <h2>Move from emulator confidence to bench evidence in controlled steps.</h2>
        <p>
          The lab path should not jump straight from software to hardware claims. Each rung produces
          one artifact that can be inspected before the next environment is trusted.
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
          <h2>Bench validation is powerful only when its limits are visible.</h2>
          <p>
            The lab program separates software-controlled instrumentation evidence from optical
            hardware claims that depend on calibrated equipment and collaborating lab conditions.
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
        <p className="eyebrow">First Bench Protocol</p>
        <h2>A repeatable Red Pitaya loopback should produce a replayable lab artifact.</h2>
        <p>
          The first bench is not about spectacle. It is about proving that a controlled command
          path, timing path, capture path, and decoder replay path can survive contact with
          instrumented hardware.
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
          <p className="eyebrow">Measurement Targets</p>
          <h2>Measure the bench like a system, not like a demo.</h2>
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
          <h2>Every collaborator handoff should carry evidence, not just a result.</h2>
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
          <p className="eyebrow">SchroSIM &rarr; Voltera V-One</p>
          <h2>Circuit prototype fabrication from photonic design studies.</h2>
          <p>
            SchroSIM provides the design surface for photonic circuit studies. The lab extension
            translates those studies into rapid in-house electronics prototypes, including routing
            boards, fixtures, sensor and control traces, and adapter circuits for academic and
            collaborating lab evaluation before longer fabrication cycles.
          </p>
          <ol className="lab-step-list">
            {prototypingSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
        <figure className="lab-media-panel">
          <img src={labAssets.volteraVone} alt="Voltera V-One desktop PCB printer" />
          <figcaption>
            Voltera V-One reference media. Used here to show the intended in-house PCB prototype
            pathway; this reference does not indicate current lab inventory.
          </figcaption>
        </figure>
      </section>

      <LabValidationLadder />
      <LabProofBoundary />

      <section className="lab-workstream dark">
        <div className="lab-workstream-copy">
          <p className="eyebrow cyan">LiDMaS+ Decoder Lab</p>
          <h2>Reducing overhead from physical-error evidence to logical-error outcomes.</h2>
          <p>
            The LiDMaS+ lab track investigates how photonic quantum systems can move from raw
            physical-error evidence to trustworthy logical-error reporting with less overhead. The
            practical target is a one-to-one audit trail: each PER model or measured syndrome
            stream should map to one reproducible LER estimate, with decoder choices, seeds,
            distance, loss model, and replay identity preserved.
          </p>
          <p>
            This track evaluates decoder policy, GKP and surface-code assumptions, measurement
            schedules, and hardware-to-decoder replay so overhead claims are supported by comparable
            artifacts rather than isolated plots.
          </p>
        </div>
        <StreamingDecoderPanel />
      </section>

      <section className="lab-workstream">
        <div className="lab-workstream-copy">
          <p className="eyebrow">Photon-QDrivers &rarr; Red Pitaya</p>
          <h2>Validating quantum control software before collaborating lab evaluation.</h2>
          <p>
            Photon-QDrivers turns validated photonic workloads into a board-tested control stack.
            The first target is Red Pitaya STEMlab 125-14 because it is close enough to an optical
            bench workflow for RF pulse generation, detector-pulse emulation, readout experiments,
            and coincidence-counter validation. The supporting boards provide lower-cost FPGA
            validation, stronger host/runtime integration, and modular instrumentation paths before
            collaborating lab use.
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
                <img src={board.image} alt={board.alt} />
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
        <p className="eyebrow">Research Program</p>
        <h2>Research software should turn claims into auditable evidence.</h2>
        <p>
          Gottesman Software is organized as a university research-group program around a
          simple question: can photonic quantum circuit ideas move from design, to decoder
          evidence, to controlled lab prototypes without losing provenance?
        </p>
      </div>
      <div className="research-agenda-grid">
        {researchAgenda.map((item) => (
          <article className="research-agenda-card" key={item.title}>
            <span>{item.signal}</span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
            <ul>
              {item.outputs.map((output) => (
                <li key={output}>{output}</li>
              ))}
            </ul>
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
        <p className="eyebrow cyan">Claim-To-Evidence Pipeline</p>
        <h2>A result is not mature until the evidence path is visible.</h2>
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
        <p className="eyebrow">Selected Paper Set</p>
        <h2>Selected publications supporting the research program.</h2>
        <p>
          This publication set documents the technical foundation for Gottesman Software, including
          photonic simulation, differentiable mitigation, LiDMaS+ decoder studies, GKP fault
          tolerance, coherent-state encoding, and physics-informed scientific modeling.
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
          <img src={researchSpotlight.image} alt={researchSpotlight.imageAlt} />
        </a>
        <div className="research-spotlight-visual" aria-hidden="true">
          <span>{researchSpotlight.signal}</span>
          <div>
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>
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
            <div className="research-theme-visual" aria-hidden="true">
              <span>{item.signal}</span>
              <div>
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
            </div>
            <div className="research-theme-copy">
              <p className="research-theme-index">{String(index + 1).padStart(2, "0")}</p>
              <p className="eyebrow">{item.theme}</p>
              <h3>{item.title}</h3>
              <p className="research-authors">{item.authors}</p>
              <p className="research-venue">{item.venue}</p>
              <p>{item.summary}</p>
              <div className="research-tags">
                {item.tags.map((tag) => (
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
            <p className="eyebrow cyan">Leadership</p>
            <h2>Research leadership across software, physics, and lab validation.</h2>
          </div>
          <p>
            Gottesman Software is currently structured as a focused university research group.
            Leadership is responsible for scientific claims, software boundaries, evidence
            standards, and partner-facing lab pathways as the group expands into permanent roles.
          </p>
        </div>
        <div className="team-person-grid is-leadership">
          {teamLeadership.map((member) => (
            <article className="team-person-card" key={member.name}>
              <div
                className={`team-portrait ${member.tone}${member.image ? " has-image" : ""}`}
                aria-hidden={member.image ? undefined : "true"}
              >
                {member.image ? (
                  <img src={member.image} alt={member.imageAlt} />
                ) : (
                  <span>{member.initials}</span>
                )}
                <small>{member.status}</small>
              </div>
              <div className="team-person-copy">
                <h3>{member.name}</h3>
                <p className="team-role">{member.role}</p>
                {member.scholar && (
                  <a
                    className="team-scholar-link"
                    href={member.scholar}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${member.name} Google Scholar profile`}
                  >
                    <SocialIcon icon="scholar" />
                    <span>Google Scholar</span>
                  </a>
                )}
                <p>{member.bio}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section team-members-section">
        <div className="section-heading compact">
          <p className="eyebrow">Group Member Tracks</p>
          <h2>Each role track has a clear research and development path.</h2>
          <p>
            The group is designed as a mentorship pipeline. A postdoctoral researcher can lead a
            research track, a graduate researcher can develop a thesis-aligned project, and an
            undergraduate researcher can build skill through reproducible experiments, software
            tasks, and paper artifacts.
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
            <p className="eyebrow">We Are Hiring</p>
            <h2>We are recruiting the first research cohort.</h2>
          </div>
          <p>
            The group is looking for people who want to build serious research software, publish
            careful quantum-computing evidence, and help translate photonic circuit prototypes
            toward lab validation. Exact appointments depend on research fit, supervision
            structure, funding, and university pathways.
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

function FooterPageLinks({ route, onNavigate, className = "" }) {
  return (
    <nav className={`footer-page-links ${className}`.trim()} aria-label="Footer page navigation">
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
  );
}

function Contact({ route, onNavigate }) {
  return (
    <section className="cta-section" id="contact">
      <img src="/assets/gottesman-software-emblem-v3-black-background.png" alt="Gottesman Software emblem" />
      <div className="cta-copy">
        <div className="cta-text">
          <p className="eyebrow cyan">Contact and Newsletter</p>
          <h2>Receive research updates or discuss collaboration.</h2>
          <p>
            Sign up for updates on SchroSIM, LiDMaS+, Photon-QDrivers, photonic QEC papers,
            prototype lab milestones, and opportunities for students, collaborators, and research
            supporters.
          </p>
        </div>
        <div className="cta-actions">
          <FooterPageLinks route={route} onNavigate={onNavigate} className="footer-top-page-links" />
          <form
            className="newsletter-form"
            action="mailto:dwayo3@gatech.edu"
            method="post"
            encType="text/plain"
          >
            <label htmlFor="newsletter-email">Email address</label>
            <div>
              <input id="newsletter-email" name="email" type="email" placeholder="name@example.com" required />
              <button type="submit">Sign up</button>
            </div>
          </form>
          <a className="contact-link" href="mailto:dwayo3@gatech.edu">
            Contact us directly
          </a>
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
      <Contact route={route} onNavigate={onNavigate} />
      <div className="footer-main">
        <div className="footer-left">
          <div className="footer-brand-block">
            <div>
              <p>&copy; 2026 Gottesman Software Research Group.</p>
              <p className="footer-legal">Terms / Privacy Policy</p>
              <div className="footer-socials" aria-label="Social media links">
                {socialLinks.map((item) => (
                  <a
                    href={item.href}
                    key={item.label}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.label}
                  >
                    <SocialIcon icon={item.icon} />
                  </a>
                ))}
              </div>
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

function CookieBanner() {
  const [choice, setChoice] = React.useState(() =>
    window.localStorage.getItem("gottesman-cookie-choice"),
  );

  function choose(nextChoice) {
    window.localStorage.setItem("gottesman-cookie-choice", nextChoice);
    setChoice(nextChoice);
  }

  if (choice) {
    return null;
  }

  return (
    <div className="cookie-banner" role="region" aria-label="Cookie notice">
      <p>
        This site stores only your cookie preference in this browser. It does not require tracking
        cookies for basic reading.
      </p>
      <div>
        <button type="button" onClick={() => choose("declined")}>
          Dismiss
        </button>
        <button type="button" onClick={() => choose("accepted")}>
          OK
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
          ".mission-section",
          ".thesis-item",
          ".workflow-step",
          ".evidence-standard",
          ".hosted-card",
          ".software-showcase",
          ".software-result-card",
          ".quickstart-file-card",
          ".quickstart-code-window",
          ".software-maturity-card",
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
      element.style.setProperty("--spring-delay", `${Math.min((index % 5) * 45, 180)}ms`);
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
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.12,
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
      <Hero />
      <PageTabs route={route} onNavigate={onNavigate} />
      <HomeIntro />
      <ResearchThesis />
      <IntegratedWorkflow onNavigate={onNavigate} />
      <EvidenceStandards />
      <MissionVision />
      <HostedSoftware onNavigate={onNavigate} />
    </>
  );
}

function RoutedPage({ route, onNavigate }) {
  const page = pageItems.find((item) => item.path === route);

  if (!page) {
    return <HomePage route={route} onNavigate={onNavigate} />;
  }

  return (
    <>
      <PageHero page={page} />
      <PageTabs route={route} onNavigate={onNavigate} />
      {route === "/software" && <SoftwarePage />}
      {route === "/lab" && <LabPage />}
      {route === "/research" && (
        <>
          <ResearchProgramOverview />
          <ClaimEvidencePipeline />
          <ActiveResearchTracks />
          <ReproducibilityStandard />
          <PublicationMatrix />
          <ResearchArtifacts />
          <OpenResearchQuestions />
          <ResearchBrief />
        </>
      )}
      {route === "/team" && <TeamPage />}
      {route === "/support" && <SupportPage />}
    </>
  );
}

export default function App() {
  const [route, setRoute] = React.useState(currentRoute);

  React.useEffect(() => {
    function handlePopState() {
      setRoute(currentRoute());
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = React.useCallback((to) => {
    const nextRoute = routePaths.has(to) ? to : "/";

    if (window.location.pathname !== nextRoute) {
      window.history.pushState({}, "", nextRoute);
    }

    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return (
    <>
      <Header route={route} onNavigate={navigate} />
      <main>
        <RoutedPage route={route} onNavigate={navigate} />
      </main>
      <Footer route={route} onNavigate={navigate} />
      <ScrollEnhancements route={route} />
      <CookieBanner />
    </>
  );
}
