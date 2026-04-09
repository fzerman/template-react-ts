import { useState, useEffect } from "react";
import { Panel } from "../Panel";
import { LoadingIndicator } from "../LoadingIndicator";
import { CyButton } from "../ui/Button";
import { CyInput, CySelect } from "../ui/Input";
import { CyBadge } from "../ui/Badge";
import { Row, Col } from "../ui/Grid";
import { useModal } from "../../context/ModalContext";
import { useToast } from "../../context/ToastContext";
import { usePanel } from "../../hooks/usePanel";

const MARKET_ITEMS = [
    {
        id: 1,
        icon: "\u{1F52B}",
        name: "Plasma Pistol",
        desc: "Compact sidearm with ionized rounds",
        price: 1200,
        category: "weapon",
    },
    {
        id: 2,
        icon: "\u{1F5E1}",
        name: "Neural Blade",
        desc: "Mono-edge with nerve disruption field",
        price: 850,
        category: "weapon",
    },
    {
        id: 3,
        icon: "\u{1F6E1}",
        name: "Nanoweave Vest",
        desc: "Stops ballistic and energy rounds",
        price: 2800,
        category: "gear",
    },
    {
        id: 4,
        icon: "\u{1F489}",
        name: "Stim Pack",
        desc: "Combat stimulant — heals and boosts reflexes",
        price: 400,
        category: "consumable",
    },
    {
        id: 5,
        icon: "\u{1F5DD}",
        name: "Safehouse Access Card",
        desc: "Encrypted keycard to a secure hideout",
        price: 3500,
        category: "intel",
    },
    {
        id: 6,
        icon: "\u{1F4C4}",
        name: "Forged ID Chip",
        desc: "New identity — clean biometric record",
        price: 5000,
        category: "intel",
    },
];

export function MarketPanel() {
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const { confirm } = useModal();
    const { addToast } = useToast();
    const { openPanel } = usePanel();

    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 1200);
        return () => clearTimeout(t);
    }, []);

    const filtered = MARKET_ITEMS.filter((item) => {
        const matchSearch =
            !search || item.name.toLowerCase().includes(search.toLowerCase());
        const matchCat = !category || item.category === category;
        return matchSearch && matchCat;
    });

    return (
        <Panel title="Black Market">
            {loading ? (
                <LoadingIndicator label="Fetching inventory..." />
            ) : (
                <>
                    <Row gap="sm" align="end" wrap>
                        <Col span={7}>
                            <CyInput
                                placeholder="Search items..."
                                inputSize="sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </Col>
                        <Col span={5}>
                            <CySelect
                                options={[
                                    { value: "", label: "All" },
                                    { value: "weapon", label: "Weapons" },
                                    { value: "gear", label: "Gear" },
                                    { value: "consumable", label: "Consumables" },
                                    { value: "intel", label: "Intel" },
                                ]}
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            />
                        </Col>
                    </Row>

                    <div className="market-grid">
                        {filtered.map((item) => (
                            <div className="market-item" key={item.id}>
                                <div className="market-item__icon">
                                    {item.icon}
                                </div>
                                <div className="market-item__info">
                                    <span className="market-item__name">
                                        {item.name}
                                    </span>
                                    <Row gap="xs" align="center">
                                        <Col span="auto">
                                            <span className="market-item__desc">
                                                {item.desc}
                                            </span>
                                        </Col>
                                        <Col span="auto">
                                            <CyBadge variant="gold">
                                                {item.category}
                                            </CyBadge>
                                        </Col>
                                    </Row>
                                </div>
                                <div className="market-item__price">
                                    <span className="market-item__cost">
                                        ${item.price.toLocaleString()}
                                    </span>
                                    <CyButton
                                        size="sm"
                                        onClick={() =>
                                            confirm({
                                                title: "Confirm Purchase",
                                                message: `Acquire ${item.name} for $${item.price.toLocaleString()}?`,
                                                confirmLabel: "Acquire",
                                                onConfirm: () =>
                                                    addToast({
                                                        variant: "success",
                                                        title: "Item Acquired",
                                                        message: `${item.name} added to your inventory.`,
                                                    }),
                                            })
                                        }
                                    >
                                        Acquire
                                    </CyButton>
                                </div>
                            </div>
                        ))}
                        {filtered.length === 0 && (
                            <p className="panel-placeholder">
                                No items match your search.
                            </p>
                        )}
                    </div>

                    <Row justify="center">
                        <Col span="auto">
                            <CyButton
                                variant="ghost"
                                size="sm"
                                onClick={() => openPanel("MarketItemDetail")}
                            >
                                View Item Detail Demo
                            </CyButton>
                        </Col>
                    </Row>
                </>
            )}
        </Panel>
    );
}
