import { Panel } from "../Panel";
import { CyButton } from "../ui/Button";
import { CyBadge } from "../ui/Badge";
import { Row, Col } from "../ui/Grid";
import { useToast } from "../../context/ToastContext";

const DISTRICTS = [
    {
        id: "neon-strip",
        name: "Neon Strip",
        control: "Volkov Syndicate",
        threat: "high" as const,
        desc: "Nightlife district — clubs, dealers, and chrome shops",
        coords: { x: 55, y: 20 },
    },
    {
        id: "port-sector",
        name: "Port Sector",
        control: "Unclaimed",
        threat: "extreme" as const,
        desc: "Cargo docks — smuggling routes and warehouse hideouts",
        coords: { x: 15, y: 65 },
    },
    {
        id: "midtown",
        name: "Midtown",
        control: "You",
        threat: "low" as const,
        desc: "Commercial hub — corporate fronts and money laundering",
        coords: { x: 45, y: 45 },
    },
    {
        id: "iron-quarter",
        name: "Iron Quarter",
        control: "Kurosawa Clan",
        threat: "medium" as const,
        desc: "Industrial zone — arms manufacturing and chop shops",
        coords: { x: 80, y: 55 },
    },
    {
        id: "undercity",
        name: "Undercity",
        control: "Contested",
        threat: "extreme" as const,
        desc: "Subterranean tunnels — black clinics and data dens",
        coords: { x: 35, y: 78 },
    },
];

type ThreatLevel = "low" | "medium" | "high" | "extreme";

function threatColor(threat: ThreatLevel) {
    switch (threat) {
        case "low":
            return "var(--neon-gold)";
        case "medium":
            return "var(--neon-orange)";
        case "high":
        case "extreme":
            return "var(--neon-pink)";
    }
}

function threatBadgeVariant(threat: ThreatLevel): "gold" | "orange" | "pink" {
    switch (threat) {
        case "low":
            return "gold";
        case "medium":
            return "orange";
        case "high":
        case "extreme":
            return "pink";
    }
}

export function MapPanel() {
    const { addToast } = useToast();

    return (
        <Panel title="District Map">
            <div className="map-container">
                <svg
                    className="map-svg"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="xMidYMid meet"
                >
                    {Array.from({ length: 11 }, (_, i) => (
                        <g key={`grid-${i}`}>
                            <line
                                x1={i * 10} y1={0} x2={i * 10} y2={100}
                                stroke="rgba(245,166,35,0.06)" strokeWidth={0.3}
                            />
                            <line
                                x1={0} y1={i * 10} x2={100} y2={i * 10}
                                stroke="rgba(245,166,35,0.06)" strokeWidth={0.3}
                            />
                        </g>
                    ))}
                    <path
                        d="M10,30 L90,30 M50,5 L50,95 M20,50 L80,50 M10,70 L60,70 L60,90"
                        stroke="rgba(255,255,255,0.08)" strokeWidth={0.8} fill="none"
                    />
                    <path
                        d="M30,10 L30,40 L70,40 L70,80"
                        stroke="rgba(255,255,255,0.06)" strokeWidth={0.5}
                        fill="none" strokeDasharray="2,2"
                    />
                    {DISTRICTS.map((d) => (
                        <g key={d.id}>
                            <circle
                                cx={d.coords.x} cy={d.coords.y} r={5}
                                fill="none" stroke={threatColor(d.threat)}
                                strokeWidth={0.3} opacity={0.4} className="map-pulse"
                            />
                            <circle
                                cx={d.coords.x} cy={d.coords.y} r={2}
                                fill={threatColor(d.threat)} opacity={0.8}
                            />
                            <text
                                x={d.coords.x} y={d.coords.y - 4}
                                textAnchor="middle" fill="rgba(255,250,240,0.7)"
                                fontSize={2.8} fontFamily="Orbitron, sans-serif"
                                fontWeight={700} letterSpacing={0.1}
                            >
                                {d.name.toUpperCase()}
                            </text>
                        </g>
                    ))}
                </svg>

                <div className="map-districts">
                    {DISTRICTS.map((d) => (
                        <div className="map-district" key={d.id}>
                            <Row align="center" gap="sm" wrap={false}>
                                <Col span="auto">
                                    <span
                                        className="map-district__dot"
                                        style={{
                                            background: threatColor(d.threat),
                                            boxShadow: `0 0 6px ${threatColor(d.threat)}`,
                                        }}
                                    />
                                </Col>
                                <Col>
                                    <span className="map-district__name">
                                        {d.name}
                                    </span>
                                </Col>
                                <Col span="auto">
                                    <CyBadge
                                        variant={threatBadgeVariant(d.threat)}
                                        dot
                                    >
                                        {d.threat}
                                    </CyBadge>
                                </Col>
                                <Col span="auto">
                                    <CyButton
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                            addToast({
                                                variant: "info",
                                                title: `Scouting ${d.name}`,
                                                message: `Deploying recon to ${d.name}...`,
                                            })
                                        }
                                    >
                                        Scout
                                    </CyButton>
                                </Col>
                            </Row>
                            <div className="map-district__meta">
                                <Row gap="xs" align="center">
                                    <Col span="auto">
                                        <span className="map-district__control">
                                            {d.control}
                                        </span>
                                    </Col>
                                </Row>
                                <span className="map-district__desc">
                                    {d.desc}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Panel>
    );
}
