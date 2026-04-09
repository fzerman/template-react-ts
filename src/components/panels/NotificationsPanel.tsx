import { useState } from "react";
import { Panel } from "../Panel";
import { CyButton } from "../ui/Button";
import { CyBadge } from "../ui/Badge";
import { Row, Col } from "../ui/Grid";

type NotifType = "alert" | "info" | "reward" | "threat";

interface Notification {
    id: number;
    type: NotifType;
    title: string;
    message: string;
    time: string;
    read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
    {
        id: 1,
        type: "threat",
        title: "Territory Breach",
        message: "Kurosawa operatives spotted in Midtown. Your turf is being scouted.",
        time: "2m ago",
        read: false,
    },
    {
        id: 2,
        type: "reward",
        title: "Racket Payout",
        message: "Your Neon Strip club earned $4,200 this cycle.",
        time: "15m ago",
        read: false,
    },
    {
        id: 3,
        type: "alert",
        title: "Contract Available",
        message: 'New hit contract posted: "The Accountant" — $8,000 reward.',
        time: "1h ago",
        read: false,
    },
    {
        id: 4,
        type: "info",
        title: "Market Update",
        message: "Plasma Pistol prices dropped 12% after a shipment arrived at Port Sector.",
        time: "2h ago",
        read: true,
    },
    {
        id: 5,
        type: "alert",
        title: "Alliance Request",
        message: "The Volkov Syndicate wants to negotiate a ceasefire in the Iron Quarter.",
        time: "4h ago",
        read: true,
    },
    {
        id: 6,
        type: "info",
        title: "Safehouse Ready",
        message: "Your new Undercity safehouse is fully operational.",
        time: "6h ago",
        read: true,
    },
];

function notifIcon(type: NotifType): string {
    switch (type) {
        case "threat":
            return "\u26A0";
        case "reward":
            return "\u25C6";
        case "alert":
            return "\u25CF";
        case "info":
            return "\u2139";
    }
}

function notifBadgeVariant(type: NotifType): "pink" | "gold" | "orange" | "dim" {
    switch (type) {
        case "threat":
            return "pink";
        case "reward":
            return "gold";
        case "alert":
            return "orange";
        case "info":
            return "dim";
    }
}

export function NotificationsPanel() {
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
    const unread = notifications.filter((n) => !n.read).length;

    const markAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const markRead = (id: number) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    return (
        <Panel title="Intel Feed">
            <Row justify="between" align="center">
                <Col span="auto">
                    <CyBadge variant={unread > 0 ? "gold" : "dim"} dot={unread > 0}>
                        {unread} unread
                    </CyBadge>
                </Col>
                <Col span="auto">
                    <CyButton
                        size="sm"
                        variant="ghost"
                        onClick={markAllRead}
                        disabled={unread === 0}
                    >
                        Mark all read
                    </CyButton>
                </Col>
            </Row>

            <div className="notif-list">
                {notifications.map((n) => (
                    <div
                        className={`notif-item ${!n.read ? "notif-item--unread" : ""}`}
                        key={n.id}
                        onClick={() => markRead(n.id)}
                    >
                        <span className="notif-item__icon" data-type={n.type}>
                            {notifIcon(n.type)}
                        </span>
                        <div className="notif-item__body">
                            <Row justify="between" align="center" gap="sm" wrap={false}>
                                <Col>
                                    <span className="notif-item__title">
                                        {n.title}
                                    </span>
                                </Col>
                                <Col span="auto">
                                    <Row gap="xs" align="center" wrap={false}>
                                        <Col span="auto">
                                            <CyBadge variant={notifBadgeVariant(n.type)}>
                                                {n.type}
                                            </CyBadge>
                                        </Col>
                                        <Col span="auto">
                                            <span className="notif-item__time">
                                                {n.time}
                                            </span>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <p className="notif-item__message">{n.message}</p>
                        </div>
                    </div>
                ))}
            </div>
        </Panel>
    );
}
