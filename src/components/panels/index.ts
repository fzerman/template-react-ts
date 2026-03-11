import { ComponentType } from 'react';
import { PanelName } from '../../context/PanelContext';
import { MarketPanel } from './MarketPanel';
import { SettingsPanel } from './SettingsPanel';
import { PausePanel } from './PausePanel';

// Add new panels here — no changes needed in PanelLayer
export const PANEL_REGISTRY: Record<PanelName, ComponentType> = {
    Market:   MarketPanel,
    Settings: SettingsPanel,
    Pause:    PausePanel,
};
