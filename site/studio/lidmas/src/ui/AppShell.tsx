import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, MouseEvent as ReactMouseEvent, PropsWithChildren } from "react";
import {
  Activity,
  Bell,
  Cable,
  FileText,
  FlaskConical,
  Server,
  Settings,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { trackStudioPageView } from "../analytics";

const navSections = [
  {
    title: "Decoder",
    items: [
      { to: "/decoder/scientific", label: "Scientific", icon: FlaskConical },
      { to: "/decoder/telemetry", label: "Telemetry", icon: Activity },
      { to: "/decoder/validation", label: "Validation", icon: ShieldCheck },
      { to: "/decoder/logs", label: "Logs", icon: FileText },
    ],
  },
  {
    title: "Platform",
    className: "nav-section-spaced",
    items: [
      { to: "/runs", label: "Runs", icon: Workflow },
      { to: "/providers", label: "Providers", icon: Server },
      { to: "/observability", label: "Observability", icon: Bell },
    ],
  },
  {
    title: "System",
    className: "nav-section-divider",
    items: [
      { to: "/settings", label: "Settings", icon: Settings },
      { to: "/hardware-api", label: "API Boundary", icon: Cable },
    ],
  },
];

const RIGHT_RAIL_WIDTH_STORAGE_KEY = "lidmas.rightRailWidth";
const RIGHT_RAIL_DEFAULT_WIDTH = 340;
const RIGHT_RAIL_MIN_WIDTH = 280;
const RIGHT_RAIL_MAX_WIDTH = 560;

function clampRailWidth(value: number) {
  return Math.min(RIGHT_RAIL_MAX_WIDTH, Math.max(RIGHT_RAIL_MIN_WIDTH, value));
}

export function AppShell({ children }: PropsWithChildren) {
  const location = useLocation();
  const showRightRail = location.pathname === "/decoder/scientific";
  const [rightRailWidth, setRightRailWidth] = useState<number>(() => {
    if (typeof window === "undefined") {
      return RIGHT_RAIL_DEFAULT_WIDTH;
    }
    const raw = window.localStorage.getItem(RIGHT_RAIL_WIDTH_STORAGE_KEY);
    if (!raw) {
      return RIGHT_RAIL_DEFAULT_WIDTH;
    }
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed)) {
      return RIGHT_RAIL_DEFAULT_WIDTH;
    }
    return clampRailWidth(parsed);
  });
  const [rightRailDragging, setRightRailDragging] = useState(false);
  const rightRailDraggingRef = useRef(false);

  useEffect(() => {
    const title = `LiDMaS+ Decoder | ${location.pathname.replace(/^\/+/, "") || "scientific"}`;
    trackStudioPageView(location.pathname, title);
  }, [location.pathname]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(RIGHT_RAIL_WIDTH_STORAGE_KEY, String(rightRailWidth));
  }, [rightRailWidth]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (!rightRailDragging) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (!rightRailDraggingRef.current) {
        return;
      }
      const widthFromRight = window.innerWidth - event.clientX;
      setRightRailWidth(clampRailWidth(widthFromRight));
    };
    const stopDrag = () => {
      rightRailDraggingRef.current = false;
      setRightRailDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopDrag);
    window.addEventListener("mouseleave", stopDrag);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopDrag);
      window.removeEventListener("mouseleave", stopDrag);
    };
  }, [rightRailDragging]);

  useEffect(() => {
    if (showRightRail) {
      return;
    }
    rightRailDraggingRef.current = false;
    setRightRailDragging(false);
  }, [showRightRail]);

  const handleRightRailResizeStart = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!showRightRail) {
      return;
    }
    event.preventDefault();
    rightRailDraggingRef.current = true;
    setRightRailDragging(true);
  };

  return (
    <div
      className={`app-shell ${showRightRail ? "app-shell-with-right-rail" : ""} ${
        rightRailDragging ? "app-shell-resizing" : ""
      }`}
      style={{ "--right-rail-width": `${showRightRail ? rightRailWidth : 0}px` } as CSSProperties}
    >
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-text">LiDMaS+</div>
          <div className="logo-subtext">Decoder Intelligence Layer</div>
        </div>

        {navSections.map((section) => (
          <div key={section.title} className={section.className}>
            <div className="nav-section-title">{section.title}</div>
            <ul className="nav-menu">
              {section.items.map((item) => (
                <li key={item.to} className="nav-item">
                  <NavLink to={item.to} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                    <span className="nav-icon">
                      <item.icon size={14} aria-hidden="true" />
                    </span>
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}

      </aside>

      <main className="main-content">
        <div className="content-container">
          {children}
        </div>
      </main>
      <div
        className={`right-rail-resizer ${showRightRail ? "active" : ""}`}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize live console rail"
        onMouseDown={handleRightRailResizeStart}
      />

      <aside
        id="app-right-rail"
        className={`right-rail ${showRightRail ? "active" : ""}`}
        aria-label="Metric interpretation panel"
      />
    </div>
  );
}
