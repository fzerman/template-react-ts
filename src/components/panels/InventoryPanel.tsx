import { useState } from "react";
import { Panel } from "../Panel";
import { CyButton } from "../ui/Button";
import { CyBadge } from "../ui/Badge";
import { Row, Col } from "../ui/Grid";
import { useModal } from "../../context/ModalContext";
import { useToast } from "../../context/ToastContext";

type ItemRarity = "common" | "uncommon" | "rare" | "legendary";
type ItemCategory = "weapon" | "gear" | "consumable" | "intel" | "key";

interface InventoryItem {
    id: number;
    icon: string;
    name: string;
    desc: string;
    rarity: ItemRarity;
    category: ItemCategory;
    quantity: number;
    equipped?: boolean;
}

const INVENTORY: InventoryItem[] = [
    {
        id: 1,
        icon: "\u{1F52B}",
        name: "Plasma Pistol",
        desc: "Compact sidearm with ionized rounds",
        rarity: "uncommon",
        category: "weapon",
        quantity: 1,
        equipped: true,
    },
    {
        id: 2,
        icon: "\u{1F6E1}",
        name: "Nanoweave Vest",
        desc: "Stops ballistic and energy rounds",
        rarity: "rare",
        category: "gear",
        quantity: 1,
        equipped: true,
    },
    {
        id: 3,
        icon: "\u{1F5E1}",
        name: "Neural Blade",
        desc: "Mono-edge with nerve disruption field",
        rarity: "legendary",
        category: "weapon",
        quantity: 1,
    },
    {
        id: 4,
        icon: "\u{1F489}",
        name: "Stim Pack",
        desc: "Combat stimulant — heals and boosts reflexes",
        rarity: "common",
        category: "consumable",
        quantity: 5,
    },
    {
        id: 5,
        icon: "\u{1F48A}",
        name: "Reflex Booster",
        desc: "Temporary reaction speed enhancement",
        rarity: "uncommon",
        category: "consumable",
        quantity: 2,
    },
    {
        id: 6,
        icon: "\u{1F5DD}",
        name: "Safehouse Access Card",
        desc: "Encrypted keycard to a secure hideout",
        rarity: "rare",
        category: "key",
        quantity: 1,
    },
    {
        id: 7,
        icon: "\u{1F4C4}",
        name: "Forged ID Chip",
        desc: "New identity — clean biometric record",
        rarity: "rare",
        category: "intel",
        quantity: 1,
    },
    {
        id: 8,
        icon: "\u{1F4E1}",
        name: "Signal Jammer",
        desc: "Blocks comms in a 50m radius",
        rarity: "uncommon",
        category: "gear",
        quantity: 3,
    },
    {
        id: 9,
        icon: "\u{2694}",
        name: "Monofilament Whip",
        desc: "Retractable carbon wire — cuts through anything",
        rarity: "legendary",
        category: "weapon",
        quantity: 1,
    },
];

function rarityVariant(r: ItemRarity): "dim" | "default" | "gold" | "orange" | "pink" {
    switch (r) {
        case "common":    return "dim";
        case "uncommon":  return "default";
        case "rare":      return "gold";
        case "legendary": return "orange";
    }
}

const CATEGORY_FILTERS: { value: string; label: string }[] = [
    { value: "", label: "All" },
    { value: "weapon", label: "Weapons" },
    { value: "gear", label: "Gear" },
    { value: "consumable", label: "Consumables" },
    { value: "intel", label: "Intel" },
    { value: "key", label: "Keys" },
];

export function InventoryPanel() {
    const [filter, setFilter] = useState("");
    const [items, setItems] = useState(INVENTORY);
    const { confirm, danger } = useModal();
    const { addToast } = useToast();

    const filtered = items.filter((i) => !filter || i.category === filter);
    const equippedCount = items.filter((i) => i.equipped).length;

    const handleEquip = (item: InventoryItem) => {
        setItems((prev) =>
            prev.map((i) =>
                i.id === item.id ? { ...i, equipped: !i.equipped } : i
            )
        );
        addToast({
            variant: "success",
            title: item.equipped ? "Unequipped" : "Equipped",
            message: `${item.name} ${item.equipped ? "removed" : "equipped"}.`,
        });
    };

    const handleUse = (item: InventoryItem) => {
        confirm({
            title: `Use ${item.name}?`,
            message: item.quantity > 1
                ? `You have ${item.quantity}. Use one now?`
                : "This is your last one. Use it now?",
            confirmLabel: "Use",
            onConfirm: () => {
                setItems((prev) =>
                    prev
                        .map((i) =>
                            i.id === item.id
                                ? { ...i, quantity: i.quantity - 1 }
                                : i
                        )
                        .filter((i) => i.quantity > 0)
                );
                addToast({
                    variant: "success",
                    title: `Used ${item.name}`,
                    message: "Effect applied.",
                });
            },
        });
    };

    const handleDrop = (item: InventoryItem) => {
        danger({
            title: `Drop ${item.name}?`,
            message:
                item.quantity > 1
                    ? `Drop all ${item.quantity}? This cannot be undone.`
                    : "This item will be lost permanently.",
            confirmLabel: "Drop",
            cancelLabel: "Keep",
            onConfirm: () => {
                setItems((prev) => prev.filter((i) => i.id !== item.id));
                addToast({
                    variant: "warning",
                    title: "Item Dropped",
                    message: `${item.name} discarded.`,
                });
            },
        });
    };

    return (
        <Panel title="Inventory">
            {/* Stats bar */}
            <div className="inv-stats">
                <CyBadge variant="gold" dot>
                    {items.length} items
                </CyBadge>
                <CyBadge variant="default">
                    {equippedCount} equipped
                </CyBadge>
                <CyBadge variant="dim">
                    {items.reduce((sum, i) => sum + i.quantity, 0)} total units
                </CyBadge>
            </div>

            {/* Category filter tabs */}
            <div className="inv-filters">
                {CATEGORY_FILTERS.map((f) => (
                    <button
                        key={f.value}
                        className={`inv-filter-tab ${filter === f.value ? "inv-filter-tab--active" : ""}`}
                        onClick={() => setFilter(f.value)}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Item grid */}
            <div className="inv-grid">
                {filtered.map((item) => (
                    <div
                        className={`inv-card ${item.equipped ? "inv-card--equipped" : ""}`}
                        key={item.id}
                    >
                        <div className="inv-card__top">
                            <div className="inv-card__icon">{item.icon}</div>
                            {item.quantity > 1 && (
                                <span className="inv-card__qty">
                                    x{item.quantity}
                                </span>
                            )}
                            {item.equipped && (
                                <span className="inv-card__equipped-tag">E</span>
                            )}
                        </div>
                        <div className="inv-card__info">
                            <span className="inv-card__name">{item.name}</span>
                            <span className="inv-card__desc">{item.desc}</span>
                            <CyBadge variant={rarityVariant(item.rarity)}>
                                {item.rarity}
                            </CyBadge>
                        </div>
                        <div className="inv-card__actions">
                            {(item.category === "weapon" || item.category === "gear") && (
                                <CyButton
                                    size="sm"
                                    variant={item.equipped ? "ghost" : "primary"}
                                    onClick={() => handleEquip(item)}
                                >
                                    {item.equipped ? "Unequip" : "Equip"}
                                </CyButton>
                            )}
                            {item.category === "consumable" && (
                                <CyButton
                                    size="sm"
                                    variant="primary"
                                    onClick={() => handleUse(item)}
                                >
                                    Use
                                </CyButton>
                            )}
                            <CyButton
                                size="sm"
                                variant="danger"
                                onClick={() => handleDrop(item)}
                            >
                                Drop
                            </CyButton>
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <Row justify="center">
                    <Col span="auto">
                        <p className="panel-placeholder">
                            No items in this category.
                        </p>
                    </Col>
                </Row>
            )}
        </Panel>
    );
}
