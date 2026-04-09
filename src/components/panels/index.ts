import { ComponentType } from 'react';
import { PanelName } from '../../context/PanelContext';
import { MarketPanel } from './MarketPanel';
import { MarketItemDetailPanel } from './MarketItemDetailPanel';
import { SettingsPanel } from './SettingsPanel';
import { PausePanel } from './PausePanel';
import { MapPanel } from './MapPanel';
import { NotificationsPanel } from './NotificationsPanel';
import { ComponentsPanel } from './ComponentsPanel';
import { InventoryPanel } from './InventoryPanel';

// Add new panels here — no changes needed in PanelLayer
export const PANEL_REGISTRY: Record<PanelName, ComponentType> = {
    Market:          MarketPanel,
    MarketItemDetail: MarketItemDetailPanel,
    Settings:        SettingsPanel,
    Pause:           PausePanel,
    Map:             MapPanel,
    Notifications:   NotificationsPanel,
    Components:      ComponentsPanel,
    Inventory:       InventoryPanel,
};
