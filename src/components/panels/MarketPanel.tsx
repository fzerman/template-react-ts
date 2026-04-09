import { useState, useEffect } from "react";
import { Panel } from "../Panel";
import { LoadingIndicator } from "../LoadingIndicator";

const MARKET_ITEMS = [
    {
        id: 1,
        icon: "\u{1F52B}",
        name: "Plasma Pistol",
        desc: "Compact sidearm with ionized rounds",
        price: 1200,
    },
    {
        id: 2,
        icon: "\u{1F5E1}",
        name: "Neural Blade",
        desc: "Mono-edge with nerve disruption field",
        price: 850,
    },
    {
        id: 3,
        icon: "\u{1F6E1}",
        name: "Nanoweave Vest",
        desc: "Stops ballistic and energy rounds",
        price: 2800,
    },
    {
        id: 4,
        icon: "\u{1F489}",
        name: "Stim Pack",
        desc: "Combat stimulant — heals and boosts reflexes",
        price: 400,
    },
    {
        id: 5,
        icon: "\u{1F5DD}",
        name: "Safehouse Access Card",
        desc: "Encrypted keycard to a secure hideout",
        price: 3500,
    },
    {
        id: 6,
        icon: "\u{1F4C4}",
        name: "Forged ID Chip",
        desc: "New identity — clean biometric record",
        price: 5000,
    },
];

export function MarketPanel() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 1200);
        return () => clearTimeout(t);
    }, []);

    return (
        <Panel title="Black Market">
            {loading ? (
                <LoadingIndicator label="Fetching inventory..." />
            ) : (
                <div className="market-grid">
                    {MARKET_ITEMS.map((item) => (
                        <div className="market-item" key={item.id}>
                            <div className="market-item__icon">{item.icon}</div>
                            <div className="market-item__info">
                                <span className="market-item__name">
                                    {item.name}
                                </span>
                                <span className="market-item__desc">
                                    {item.desc}
                                </span>
                            </div>
                            <div className="market-item__price">
                                <span className="market-item__cost">
                                    ${item.price.toLocaleString()}
                                </span>
                                <button className="market-item__buy">
                                    Acquire
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Panel>
    );
}
