interface TestConnectionModalProps {
  provider: any;
  onClose: () => void;
}

export function TestConnectionModal({ provider, onClose }: TestConnectionModalProps) {
  const tests = [
    { id: "status", label: "Registry Status", message: provider.status ?? "unknown", status: "info" },
    { id: "type", label: "Simulator Type", message: provider.type ?? "unknown", status: "info" },
    {
      id: "formats",
      label: "Supported Formats",
      message:
        provider.supportedFormats && provider.supportedFormats.length > 0
          ? provider.supportedFormats.join(", ")
          : "none declared",
      status: "info",
    },
    {
      id: "capabilities",
      label: "Declared Capabilities",
      message:
        provider.capabilities && provider.capabilities.length > 0
          ? provider.capabilities.join(", ")
          : "none declared",
      status: "info",
    },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Test Connection</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="provider-info">
            <strong>Testing:</strong> {provider.name} ({provider.type}, {provider.region})
          </div>

          <div className="test-status-container">
            {tests.map((test) => (
              <div key={test.id} className="test-item">
                <div className={`test-icon ${test.status}`}>
                  i
                </div>
                <div className="test-content">
                  <div className="test-label">{test.label}</div>
                  <div className={`test-message ${test.status}`}>{test.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" disabled>
            Registry Only
          </button>
        </div>
      </div>
    </div>
  );
}
