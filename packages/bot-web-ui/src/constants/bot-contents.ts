type TTabsTitle = {
    [key: string]: string | number;
};

type TDashboardTabIndex = {
    [key: string]: number;
};

export const tabs_title: TTabsTitle = Object.freeze({
    WORKSPACE: 'Workspace',
    CHART: 'Chart',
});

export const DBOT_TABS: TDashboardTabIndex = Object.freeze({
    DASHBOARD: 0,
    BOT_BUILDER: 1,
    SPEEDBOT: 2,
    CHART: 3,
    DCIRCLES: 4,
    TUTORIAL: 5,
    BOTLIST: 6,
    FINESTTOOL: 7,
    COPYTRADING: 8,
    DPT: 9,
});

export const MAX_STRATEGIES = 10;

export const TAB_IDS = [
    'id-dbot-dashboard',
    'id-bot-builder',
    'id-speedbot',
    'id-charts',
    'id-dcircles',
    'id-tutorials',
    'id-botlist',
    'id-finesttool',
    'id-copy-trading',
    'id-dp-tool',
];

export const DEBOUNCE_INTERVAL_TIME = 500;
