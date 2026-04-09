import { useMemo } from "react";
import { Panel } from "../Panel";
import { CyButton } from "../ui/Button";
import { CyBadge } from "../ui/Badge";
import { Row, Col } from "../ui/Grid";
import { useModal } from "../../context/ModalContext";
import { useToast } from "../../context/ToastContext";

function generatePriceHistory(basePrice: number): number[] {
    const points: number[] = [];
    let price = basePrice * 0.85;
    for (let i = 0; i < 14; i++) {
        const change = Math.sin(i * 1.2) * 0.15 + Math.cos(i * 0.7) * 0.08;
        price = price + basePrice * change * 0.12;
        price = Math.max(basePrice * 0.5, Math.min(basePrice * 1.4, price));
        points.push(Math.round(price));
    }
    points[points.length - 1] = basePrice;
    return points;
}

interface PriceChartProps {
    prices: number[];
    currentPrice: number;
}

function PriceChart({ prices, currentPrice }: PriceChartProps) {
    const { path, area, min, max, points } = useMemo(() => {
        const mn = Math.min(...prices);
        const mx = Math.max(...prices);
        const range = mx - mn || 1;
        const padding = 8;
        const w = 280;
        const h = 100;

        const pts = prices.map((p, i) => ({
            x: padding + (i / (prices.length - 1)) * (w - padding * 2),
            y: padding + (1 - (p - mn) / range) * (h - padding * 2),
        }));

        let d = `M ${pts[0].x},${pts[0].y}`;
        for (let i = 1; i < pts.length; i++) {
            const prev = pts[i - 1];
            const curr = pts[i];
            const cpx = (prev.x + curr.x) / 2;
            d += ` C ${cpx},${prev.y} ${cpx},${curr.y} ${curr.x},${curr.y}`;
        }

        const last = pts[pts.length - 1];
        const first = pts[0];
        const areaD = `${d} L ${last.x},${h} L ${first.x},${h} Z`;

        return { path: d, area: areaD, min: mn, max: mx, points: pts };
    }, [prices]);

    const lastPoint = points[points.length - 1];
    const firstPrice = prices[0];
    const isUp = currentPrice >= firstPrice;

    return (
        <div className="price-chart">
            <Row justify="between" align="center">
                <Col span="auto">
                    <span className="price-chart__label">14-Day Price</span>
                </Col>
                <Col span="auto">
                    <CyBadge variant={isUp ? "gold" : "pink"}>
                        {isUp ? "\u25B2" : "\u25BC"}{" "}
                        {Math.abs(
                            Math.round(
                                ((currentPrice - firstPrice) / firstPrice) * 100
                            )
                        )}
                        %
                    </CyBadge>
                </Col>
            </Row>
            <svg
                className="price-chart__svg"
                viewBox="0 0 280 100"
                preserveAspectRatio="xMidYMid meet"
            >
                {[0.25, 0.5, 0.75].map((pct) => (
                    <line
                        key={pct}
                        x1={8}
                        y1={8 + pct * 84}
                        x2={272}
                        y2={8 + pct * 84}
                        stroke="rgba(245,166,35,0.08)"
                        strokeWidth={0.5}
                        strokeDasharray="4,4"
                    />
                ))}
                <path
                    d={area}
                    fill={isUp ? "url(#gradient-up)" : "url(#gradient-down)"}
                />
                <path
                    d={path}
                    fill="none"
                    stroke={isUp ? "var(--neon-gold)" : "var(--neon-pink)"}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <circle
                    cx={lastPoint.x}
                    cy={lastPoint.y}
                    r={3.5}
                    fill={isUp ? "var(--neon-gold)" : "var(--neon-pink)"}
                />
                <circle
                    cx={lastPoint.x}
                    cy={lastPoint.y}
                    r={6}
                    fill="none"
                    stroke={isUp ? "var(--neon-gold)" : "var(--neon-pink)"}
                    strokeWidth={1}
                    opacity={0.4}
                    className="chart-pulse"
                />
                <defs>
                    <linearGradient id="gradient-up" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--neon-gold)" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="var(--neon-gold)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradient-down" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--neon-pink)" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="var(--neon-pink)" stopOpacity={0} />
                    </linearGradient>
                </defs>
            </svg>
            <Row justify="between">
                <Col span="auto">
                    <span className="price-chart__range-val">${min.toLocaleString()}</span>
                </Col>
                <Col span="auto">
                    <span className="price-chart__range-val">${max.toLocaleString()}</span>
                </Col>
            </Row>
        </div>
    );
}

const ITEM = {
    icon: "\u{1F52B}",
    name: "Plasma Pistol",
    desc: "Compact sidearm with ionized energy rounds. Standard issue for syndicate enforcers. Modified barrel allows burst fire mode.",
    price: 1200,
    category: "Weapon",
    stats: [
        { label: "Damage", value: 72, max: 100 },
        { label: "Range", value: 45, max: 100 },
        { label: "Fire Rate", value: 60, max: 100 },
        { label: "Conceal", value: 80, max: 100 },
    ],
    seller: "Ghost Circuit",
    stock: 3,
};

export function MarketItemDetailPanel() {
    const priceHistory = useMemo(() => generatePriceHistory(ITEM.price), []);
    const { confirm } = useModal();
    const { addToast } = useToast();

    return (
        <Panel title="Item Detail">
            <Row gap="md" align="center">
                <Col span="auto">
                    <div className="market-item__icon">{ITEM.icon}</div>
                </Col>
                <Col>
                    <h3 className="item-detail__name">{ITEM.name}</h3>
                    <Row gap="xs" align="center">
                        <Col span="auto">
                            <span className="item-detail__seller">
                                Sold by {ITEM.seller}
                            </span>
                        </Col>
                        <Col span="auto">
                            <CyBadge variant="gold">{ITEM.category}</CyBadge>
                        </Col>
                    </Row>
                </Col>
                <Col span="auto">
                    <div className="item-detail__price-tag">
                        <span className="item-detail__cost">
                            ${ITEM.price.toLocaleString()}
                        </span>
                        <CyBadge variant={ITEM.stock > 0 ? "gold" : "pink"}>
                            {ITEM.stock} in stock
                        </CyBadge>
                    </div>
                </Col>
            </Row>

            <p className="item-detail__desc">{ITEM.desc}</p>

            <div className="item-detail__stats">
                {ITEM.stats.map((s) => (
                    <div className="stat-bar" key={s.label}>
                        <span className="stat-bar__label">{s.label}</span>
                        <div className="stat-bar__track">
                            <div
                                className="stat-bar__fill"
                                style={{ width: `${(s.value / s.max) * 100}%` }}
                            />
                        </div>
                        <span className="stat-bar__value">{s.value}</span>
                    </div>
                ))}
            </div>

            <PriceChart prices={priceHistory} currentPrice={ITEM.price} />

            <Row justify="center" gap="sm">
                <Col span="auto">
                    <CyButton
                        variant="primary"
                        size="lg"
                        onClick={() =>
                            confirm({
                                title: "Confirm Purchase",
                                message: `Acquire ${ITEM.name} for $${ITEM.price.toLocaleString()}?`,
                                confirmLabel: "Acquire",
                                onConfirm: () =>
                                    addToast({
                                        variant: "success",
                                        title: "Item Acquired",
                                        message: `${ITEM.name} added to your inventory.`,
                                    }),
                            })
                        }
                    >
                        Acquire — ${ITEM.price.toLocaleString()}
                    </CyButton>
                </Col>
            </Row>
        </Panel>
    );
}
