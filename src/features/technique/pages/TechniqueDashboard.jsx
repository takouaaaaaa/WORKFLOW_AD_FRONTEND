import { Link } from "react-router-dom";
import "../../fonctionnel/styles/FileInPage.css";

export default function TechniqueDashboard() {
  const cards = [
    {
      title: "Senders",
      description: "Manage sender records, add new values, update existing ones, and keep the sender repository clean.",
      path: "/technique/senders",
      badge: "Configuration",
    },
    {
      title: "Receivers",
      description: "View and maintain receiver data used across technical workflow processing and integrations.",
      path: "/technique/receivers",
      badge: "Reference Data",
    },
    {
      title: "Type Flux",
      description: "Manage flow types used by the application to classify and structure banking workflow exchanges.",
      path: "/technique/typeflux",
      badge: "Flow Setup",
    },
  ];

  return (
    <div className="filein-page-bootstrap">
      {/* Header Card */}
      <div className="filein-card mb-4">
        <div className="filein-card-title">
          <span>
            Technical Workspace :{" "}
            <span style={{ color: "#a371f7" }}>Dashboard</span>
          </span>

          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "11px",
              color: "#8b949e",
              background: "#21262d",
              padding: "3px 10px",
              borderRadius: "20px",
              border: "1px solid #30363d",
              fontWeight: 400,
              letterSpacing: "0.04em",
              textTransform: "none",
            }}
          >
            USER_TECHNIQUE
          </span>
        </div>

        <div className="filein-card-body">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <h2
                style={{
                  color: "#e6edf3",
                  fontSize: "28px",
                  fontWeight: 700,
                  marginBottom: "10px",
                }}
              >
                Technical Dashboard
              </h2>

              <p
                style={{
                  color: "#8b949e",
                  marginBottom: 0,
                  fontSize: "14px",
                  lineHeight: 1.7,
                }}
              >
                Access and manage technical reference data used by the platform.
                This space lets you maintain senders, receivers, and flow types
                with the same design language as the File IN and File OUT pages.
              </p>
            </div>

            <div className="col-lg-4">
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(124,58,237,0.18), rgba(0,180,255,0.10))",
                  border: "1px solid rgba(163,113,247,0.22)",
                  borderRadius: "14px",
                  padding: "18px",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#a371f7",
                    marginBottom: "8px",
                    fontWeight: 700,
                  }}
                >
                  Overview
                </div>

                <div
                  style={{
                    color: "#e6edf3",
                    fontSize: "24px",
                    fontWeight: 700,
                    marginBottom: "6px",
                  }}
                >
                  3 Modules
                </div>

                <div
                  style={{
                    color: "#8b949e",
                    fontSize: "13px",
                    lineHeight: 1.6,
                  }}
                >
                  Sender management, receiver management, and flow type administration.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="row g-4">
        {cards.map((card) => (
          <div className="col-md-6 col-xl-4" key={card.path}>
            <div className="filein-card h-100">
              <div className="filein-card-title">
                <span>{card.title}</span>

                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "10px",
                    color: "#8b949e",
                    background: "#21262d",
                    padding: "3px 8px",
                    borderRadius: "20px",
                    border: "1px solid #30363d",
                    fontWeight: 400,
                    textTransform: "none",
                  }}
                >
                  {card.badge}
                </span>
              </div>

              <div className="filein-card-body d-flex flex-column">
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      "linear-gradient(135deg, rgba(124,58,237,0.18), rgba(0,180,255,0.10))",
                    border: "1px solid rgba(163,113,247,0.22)",
                    color: "#c084fc",
                    fontSize: "20px",
                    marginBottom: "16px",
                  }}
                >
                  ⚙
                </div>

                <h5
                  style={{
                    color: "#e6edf3",
                    fontWeight: 700,
                    marginBottom: "10px",
                  }}
                >
                  {card.title}
                </h5>

                <p
                  style={{
                    color: "#8b949e",
                    fontSize: "13px",
                    lineHeight: 1.7,
                    flexGrow: 1,
                    marginBottom: "18px",
                  }}
                >
                  {card.description}
                </p>

                <Link
                  to={card.path}
                  className="btn filein-btn-search"
                  style={{ alignSelf: "flex-start" }}
                >
                  Open {card.title}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Info */}
      <div className="filein-card mt-4">
        <div className="filein-card-title">
          <span>
            Technical Scope : <span style={{ color: "#a371f7" }}>Quick Access</span>
          </span>
        </div>

        <div className="filein-card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid #21262d",
                  borderRadius: "12px",
                  padding: "16px",
                  height: "100%",
                }}
              >
                <div className="filein-label mb-2">Module 01</div>
                <div style={{ color: "#e6edf3", fontWeight: 700, marginBottom: "8px" }}>
                  Senders
                </div>
                <div style={{ color: "#8b949e", fontSize: "13px", lineHeight: 1.6 }}>
                  Maintain sender reference values used in workflow exchanges.
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid #21262d",
                  borderRadius: "12px",
                  padding: "16px",
                  height: "100%",
                }}
              >
                <div className="filein-label mb-2">Module 02</div>
                <div style={{ color: "#e6edf3", fontWeight: 700, marginBottom: "8px" }}>
                  Receivers
                </div>
                <div style={{ color: "#8b949e", fontSize: "13px", lineHeight: 1.6 }}>
                  Organize receiver entities for traceability and routing consistency.
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid #21262d",
                  borderRadius: "12px",
                  padding: "16px",
                  height: "100%",
                }}
              >
                <div className="filein-label mb-2">Module 03</div>
                <div style={{ color: "#e6edf3", fontWeight: 700, marginBottom: "8px" }}>
                  Type Flux
                </div>
                <div style={{ color: "#8b949e", fontSize: "13px", lineHeight: 1.6 }}>
                  Control the available flow type catalog used by the application.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}