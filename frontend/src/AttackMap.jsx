import { useState } from "react";

function AttackMap({ logs }) {
  const [selected, setSelected] = useState(null);
  const [hoveredKey, setHoveredKey] = useState(null);

  const validLogs = logs.filter(
    (l) => l.latitude && l.longitude && l.latitude !== 0 && l.longitude !== 0
  );

  const pointMap = {};
  validLogs.forEach((l) => {
    const key = `${l.latitude},${l.longitude}`;
    if (!pointMap[key] || l.risk_score > pointMap[key].risk_score) {
      pointMap[key] = l;
    }
  });
  const points = Object.values(pointMap);

  const W = 1000, H = 500;
  const toXY = (lat, lng) => {
    const x = ((lng + 180) / 360) * W;
    const latR = (Math.max(-85, Math.min(85, lat)) * Math.PI) / 180;
    const mercN = Math.log(Math.tan(Math.PI / 4 + latR / 2));
    const y = H / 2 - (H * mercN) / (2 * Math.PI);
    return [x, y];
  };

  const WORLD_PATHS = [
    "M108.3,145.2L33.3,130.1L66.7,107.7L108.3,119.7L108.3,136.5L108.3,145.2Z",
    "M333.3,27.6L166.7,27.6L108.3,111.9L108.3,145.2L158.3,171.7L236.1,171.7L352.8,171.7L344.4,165.2L322.2,145.2L311.1,136.5L291.7,119.7L277.8,88.6L333.3,27.6Z",
    "M236.1,171.7L158.3,171.7L155.6,185.6L161.1,194.6L166.7,199.7L175.0,201.4L175.0,204.7L211.1,207.9L230.6,212.6L252.8,207.9L255.6,206.3L275.0,206.3L277.8,214.1L275.0,206.3L286.1,199.7L288.9,194.6L305.6,187.5L313.9,175.9L352.8,175.9L352.8,171.7L236.1,171.7Z",
    "M211.1,207.9L175.0,204.7L180.6,209.5L205.6,218.7L244.4,228.9L255.6,227.5L258.3,220.2L230.6,212.6L211.1,207.9Z",
    "M244.4,228.9L269.4,236.0L286.1,238.9L280.6,237.4L286.1,238.9L269.4,236.0L250.0,228.9L244.4,228.9Z",
    "M444.4,27.6L333.3,27.6L311.1,88.6L355.6,119.7L383.3,142.4L394.4,130.1L438.9,103.4L450.0,83.1L444.4,27.6Z",
    "M300.0,233.2L325.0,236.0L333.3,238.9L355.6,243.0L358.3,244.4L358.3,247.2L402.8,257.0L397.2,264.0L391.7,271.1L380.6,282.8L352.8,300.3L327.8,310.7L311.1,334.8L319.4,341.9L313.9,339.5L319.4,314.4L341.7,307.1L341.7,300.3L363.9,290.5L380.6,281.3L388.9,278.4L386.1,254.2L355.6,243.0L333.3,238.9L325.0,236.0L300.0,233.2Z",
    "M486.1,150.6L497.2,142.4L500.0,150.6L502.8,162.9L502.8,167.4L494.4,169.6L486.1,167.4L486.1,162.9L483.3,158.1L486.1,150.6Z",
    "M477.8,158.1L472.2,160.5L472.2,165.2L477.8,167.4L483.3,165.2L483.3,160.5L477.8,158.1Z",
    "M577.8,107.7L555.6,111.9L538.9,130.1L513.9,150.6L522.2,153.2L533.3,153.2L533.3,145.2L538.9,139.5L538.9,130.1L555.6,119.7L577.8,107.7Z",
    "M577.8,111.9L577.8,119.7L569.4,130.1L569.4,145.2L566.7,147.9L572.2,145.2L577.8,130.1L583.3,119.7L577.8,111.9Z",
    "M475.0,181.8L475.0,196.3L486.1,196.3L500.0,194.6L508.3,189.3L513.9,183.7L522.2,181.8L508.3,181.8L494.4,183.7L475.0,181.8Z",
    "M505.6,167.4L494.4,173.8L494.4,181.8L513.9,183.7L522.2,181.8L522.2,175.9L522.2,173.8L516.7,169.6L511.1,167.4L505.6,167.4Z",
    "M527.8,160.5L516.7,167.4L522.2,173.8L522.2,175.9L538.9,173.8L550.0,169.6L538.9,160.5L527.8,160.5Z",
    "M522.2,181.8L533.3,181.8L533.3,187.5L541.7,192.9L541.7,194.6L544.4,192.9L550.0,187.5L538.9,181.8L536.1,177.9L522.2,181.8Z",
    "M538.9,173.8L550.0,169.6L550.0,160.5L561.1,160.5L561.1,173.8L561.1,181.8L555.6,189.3L561.1,194.6L563.9,192.9L572.2,185.6L577.8,181.8L566.7,173.8L550.0,169.6L538.9,173.8Z",
    "M572.2,185.6L572.2,192.9L600.0,196.3L600.0,194.6L622.2,194.6L622.2,189.3L611.1,185.6L600.0,185.6L572.2,185.6Z",
    "M566.7,165.2L600.0,169.6L605.6,173.8L605.6,177.9L594.4,173.8L583.3,169.6L566.7,165.2Z",
    "M577.8,107.7L577.8,119.7L583.3,130.1L583.3,145.2L588.9,158.1L588.9,165.2L600.0,169.6L666.7,165.2L688.9,158.1L688.9,150.6L666.7,139.5L666.7,130.1L655.6,119.7L611.1,107.7L577.8,107.7Z",
    "M688.9,158.1L722.2,150.6L777.8,153.2L833.3,145.2L875.0,158.1L891.7,165.2L875.0,175.9L866.7,181.8L861.1,185.6L888.9,175.9L891.7,165.2L891.7,145.2L891.7,130.1L861.1,111.9L777.8,98.7L722.2,103.4L694.4,123.3L666.7,119.7L652.8,103.4L611.1,107.7L655.6,119.7L666.7,130.1L666.7,139.5L688.9,150.6L688.9,158.1Z",
    "M688.9,158.1L666.7,165.2L661.1,169.6L622.2,173.8L622.2,185.6L644.4,185.6L644.4,181.8L666.7,181.8L666.7,173.8L688.9,165.2L688.9,158.1Z",
    "M600.0,194.6L600.0,196.3L605.6,218.7L622.2,233.2L650.0,224.6L650.0,218.7L655.6,215.6L655.6,212.6L633.3,206.3L616.7,206.3L600.0,199.7L600.0,194.6Z",
    "M622.2,194.6L622.2,189.3L644.4,185.6L644.4,181.8L666.7,181.8L666.7,189.3L666.7,196.3L666.7,209.5L655.6,209.5L633.3,206.3L622.2,199.7L622.2,194.6Z",
    "M711.1,198.0L716.7,199.7L769.4,209.5L772.2,212.6L755.6,218.7L713.9,238.9L711.1,238.9L705.6,236.0L702.8,228.9L688.9,218.7L688.9,215.6L694.4,209.5L705.6,203.0L711.1,198.0Z",
    "M769.4,209.5L777.8,218.7L788.9,218.7L788.9,228.9L788.9,236.0L777.8,236.0L777.8,230.4L783.3,224.6L777.8,218.7L772.2,212.6L769.4,209.5Z",
    "M833.3,162.9L866.7,173.8L861.1,185.6L844.4,189.3L833.3,189.3L833.3,192.9L833.3,198.0L838.9,206.3L833.3,214.1L816.7,218.7L805.6,218.7L805.6,221.6L788.9,218.7L777.8,218.7L772.2,212.6L769.4,209.5L766.7,203.0L722.2,198.0L705.6,191.1L722.2,185.6L741.7,173.8L741.7,169.6L833.3,162.9Z",
    "M844.4,189.3L833.3,192.9L855.6,196.3L861.1,192.9L861.1,189.3L844.4,189.3Z",
    "M888.9,189.3L891.7,181.8L900.0,185.6L894.4,192.9L877.8,198.0L863.9,199.7L877.8,196.3L883.3,192.9L888.9,189.3Z",
    "M527.8,194.6L591.7,206.3L605.6,218.7L622.2,233.2L616.7,244.4L616.7,247.2L616.7,251.4L611.1,265.4L591.7,287.4L575.0,302.0L552.8,302.0L547.2,293.7L533.3,275.4L527.8,255.6L527.8,247.2L541.7,230.4L541.7,218.7L569.4,218.7L588.9,206.3L583.3,194.6L527.8,194.6Z",
    "M636.1,266.8L638.9,269.6L633.3,275.4L622.2,284.4L625.0,287.4L633.3,281.3L638.9,272.5L636.1,266.8Z",
    "M861.1,269.6L877.8,266.8L894.4,269.6L911.1,275.4L927.8,290.5L905.6,307.1L888.9,307.1L877.8,300.3L866.7,297.0L819.4,293.7L816.7,281.3L838.9,274.0L855.6,269.6L861.1,269.6Z",
    "M977.8,300.3L986.1,307.1L986.1,310.7L983.3,307.1L977.8,300.3Z",
    "M977.8,310.7L966.7,322.1L972.2,322.1L972.2,318.2L983.3,310.7L977.8,310.7Z",
    "M766.7,241.7L777.8,243.0L794.4,258.3L797.2,258.3L819.4,261.1L805.6,252.8L805.6,247.2L800.0,241.7L766.7,241.7Z",
    "M825.0,240.3L822.2,244.4L805.6,248.6L816.7,255.6L825.0,257.0L833.3,251.4L827.8,244.4L825.0,240.3Z",
    "M838.9,224.6L838.9,227.5L838.9,233.2L844.4,236.0L850.0,233.2L844.4,227.5L838.9,224.6Z",
    "M433.3,126.8L438.9,133.3L450.0,136.5L461.1,133.3L461.1,126.8L433.3,126.8Z",
    "M272.2,217.2L291.7,221.6L294.4,218.7L283.3,217.2L272.2,217.2Z"
  ];

  const latLines = [-60, -30, 0, 30, 60].map((lat) => {
    const [, y] = toXY(lat, 0);
    return { y, lat };
  });

  const lngLines = [-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150].map((lng) => {
    const [x] = toXY(0, lng);
    return { x, lng };
  });

  const getRiskColor = (score) =>
    score >= 75 ? "#ef4444" : score >= 50 ? "#f59e0b" : "#3b82f6";

  const getRiskLabel = (score) =>
    score >= 75 ? "HIGH" : score >= 50 ? "MEDIUM" : "LOW";

  const formatTime = (ts) => {
    try {
      return new Date(ts).toLocaleTimeString("en-US", {
        hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit"
      });
    } catch { return "--:--:--"; }
  };

  return (
    <div className="map-panel">
      <div className="panel-header">
        <div className="panel-title">
          <div className="panel-title-dot pulse" style={{ background: "#f59e0b" }} />
          Global Attack Map
          <span style={{ fontSize: "10px", color: "var(--muted)", fontFamily: "var(--mono)", marginLeft: "8px" }}>
            click a dot for details
          </span>
        </div>
        <div className="panel-badge amber">{validLogs.length} events plotted</div>
      </div>

      <div className="map-body" onClick={() => setSelected(null)}>
        <svg
          viewBox="0 0 1000 500"
          width="100%"
          height="100%"
          style={{ display: "block", background: "linear-gradient(180deg, #020918 0%, #060d1a 60%, #030b14 100%)" }}
        >
          <defs>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </radialGradient>
            <filter id="glow-filter">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="strong-glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {latLines.map(({ y, lat }) => (
            <g key={lat}>
              <line x1={0} y1={y} x2={W} y2={y} stroke="rgba(59,130,246,0.07)" strokeWidth={0.5} />
              <text x={4} y={y - 2} fill="rgba(100,130,180,0.35)" fontSize={8} fontFamily="monospace">{lat}°</text>
            </g>
          ))}
          {lngLines.map(({ x, lng }) => (
            <g key={lng}>
              <line x1={x} y1={0} x2={x} y2={H} stroke="rgba(59,130,246,0.07)" strokeWidth={0.5} />
              <text x={x + 2} y={H - 4} fill="rgba(100,130,180,0.35)" fontSize={8} fontFamily="monospace">{lng}°</text>
            </g>
          ))}

          {(() => {
            const [, y] = toXY(0, 0);
            return <line x1={0} y1={y} x2={W} y2={y} stroke="rgba(59,130,246,0.18)" strokeWidth={0.8} strokeDasharray="4,4" />;
          })()}

          {WORLD_PATHS.map((d, i) => (
            <path key={i} d={d} fill="#0f2240" stroke="#1e4080" strokeWidth={0.6} opacity={0.9} />
          ))}

          <rect x={0} y={0} width={W} height={H} fill="url(#glow)" />

          {points.map((log, i) => {
            const key = `${log.latitude},${log.longitude}`;
            const [x, y] = toXY(log.latitude, log.longitude);
            const isHigh = log.risk_score >= 75;
            const isMed = log.risk_score >= 50;
            const color = getRiskColor(log.risk_score);
            const r = isHigh ? 5 : isMed ? 3.5 : 2.5;
            const isSelected = selected && selected.latitude === log.latitude && selected.longitude === log.longitude;
            const isHovered = hoveredKey === key;

            return (
              <g
                key={i}
                style={{ cursor: "pointer" }}
                onClick={(e) => { e.stopPropagation(); setSelected(isSelected ? null : log); }}
                onMouseEnter={() => setHoveredKey(key)}
                onMouseLeave={() => setHoveredKey(null)}
                filter={isHigh || isSelected ? "url(#strong-glow)" : "url(#glow-filter)"}
              >
                {isHigh && (
                  <>
                    <circle cx={x} cy={y} r={r} fill={color} opacity={0.1}>
                      <animate attributeName="r" from={r} to={r + 16} dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from={0.4} to={0} dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={x} cy={y} r={r} fill={color} opacity={0.2}>
                      <animate attributeName="r" from={r} to={r + 8} dur="2s" begin="0.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from={0.5} to={0} dur="2s" begin="0.5s" repeatCount="indefinite" />
                    </circle>
                  </>
                )}

                {/* Selection ring */}
                {isSelected && (
                  <circle cx={x} cy={y} r={r + 6} fill="none" stroke={color} strokeWidth={1.5} opacity={0.8} strokeDasharray="3,2" />
                )}

                {/* Hover ring */}
                {isHovered && !isSelected && (
                  <circle cx={x} cy={y} r={r + 4} fill="none" stroke={color} strokeWidth={1} opacity={0.5} />
                )}

                <circle cx={x} cy={y} r={isHovered || isSelected ? r + 1.5 : r} fill={color} opacity={0.95} />
                <circle cx={x} cy={y} r={r * 0.35} fill="white" opacity={0.8} />
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="map-legend">
          <div className="legend-item"><span className="legend-dot" style={{ background: "#ef4444" }} />High (75+)</div>
          <div className="legend-item"><span className="legend-dot" style={{ background: "#f59e0b" }} />Medium (50-74)</div>
          <div className="legend-item"><span className="legend-dot" style={{ background: "#3b82f6" }} />Low (under 50)</div>
        </div>

        {/* Detail popup */}
        {selected && (() => {
          const color = getRiskColor(selected.risk_score);
          const reasons = typeof selected.reasons === "string"
            ? selected.reasons.split(", ")
            : selected.reasons || [];
          return (
            <div className="map-popup" onClick={(e) => e.stopPropagation()}>
              <div className="map-popup-header" style={{ borderColor: color }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="map-popup-risk" style={{ color }}>
                    ⚠ RISK {selected.risk_score}/100 — {getRiskLabel(selected.risk_score)}
                  </span>
                  <button className="map-popup-close" onClick={() => setSelected(null)}>✕</button>
                </div>
                <div className="map-popup-location">
                  {selected.city && selected.city !== "Unknown" ? `${selected.city}, ` : ""}{selected.country}
                </div>
              </div>
              <div className="map-popup-body">
                <div className="map-popup-row"><span className="map-popup-key">IP</span><span className="map-popup-val">{selected.ip}</span></div>
                <div className="map-popup-row"><span className="map-popup-key">User</span><span className="map-popup-val">{selected.user}</span></div>
                <div className="map-popup-row"><span className="map-popup-key">Endpoint</span><span className="map-popup-val">{selected.endpoint}</span></div>
                <div className="map-popup-row"><span className="map-popup-key">Status</span>
                  <span className="map-popup-val" style={{ color: selected.status === "failed" ? "#ef4444" : "#22c55e" }}>
                    {selected.status}
                  </span>
                </div>
                <div className="map-popup-row"><span className="map-popup-key">Agent</span><span className="map-popup-val" style={{ fontSize: "9px" }}>{selected.user_agent}</span></div>
                <div className="map-popup-row"><span className="map-popup-key">Time</span><span className="map-popup-val">{formatTime(selected.timestamp)}</span></div>
                <div className="map-popup-row"><span className="map-popup-key">ML</span><span className="map-popup-val" style={{ color: selected.ml_anomaly ? "#ef4444" : "#22c55e" }}>{selected.ml_anomaly ? "Anomaly detected" : "Normal"}</span></div>
                {reasons.length > 0 && (
                  <div style={{ marginTop: "8px" }}>
                    <div className="map-popup-key" style={{ marginBottom: "5px" }}>REASONS</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      {reasons.map((r, i) => (
                        <span key={i} className="reason-tag">{r}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {points.length === 0 && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7a94", fontSize: "12px", fontFamily: "var(--mono)" }}>
            Waiting for geo data...
          </div>
        )}
      </div>
    </div>
  );
}

export default AttackMap;