/* eslint-disable @typescript-eslint/naming-convention -- constants file uses UPPER_SNAKE_CASE */

// Win rate label colors by value
export const WIN_RATE_COLORS = {
	low: "#f87171",
	mid: "#fb923c",
	high: "#4ade80"
} as const

// Default panel background
export const DEFAULT_PANEL_BG = "rgba(0,0,0,0.85)"

// Tier badge background colors
export const TIER_BG_COLORS: Record<string, string> = {
	S: "rgba(124,58,237,0.9)",
	A: "rgba(59,130,246,0.9)",
	B: "rgba(20,184,166,0.9)",
	C: "rgba(249,115,22,0.9)",
	D: "rgba(239,68,68,0.9)"
}

export function getTierBackgroundColor(tier: string): string {
	return TIER_BG_COLORS[tier] ?? DEFAULT_PANEL_BG
}

// Default win rate when hero has no data
export const DEFAULT_WIN_RATE = 0

// Pick rate label color
export const PICK_RATE_COLOR = "#22d3ee"

// Panorama panel IDs
export const OVERLAY_CONTAINER_ID = "OctarineWinRateOverlay"
export const WIN_RATE_PANEL_ID = "OctarineWinRatePanel"
export const WIN_RATE_LABEL_ID = "OctarineWinRate"
export const TIER_PANEL_ID = "OctarineTierPanel"
export const TIER_LABEL_ID = "OctarineTierLabel"
export const PICK_RATE_CONTAINER_ID = "OctarinePickRateOverlay"
export const PICK_RATE_PANEL_ID = "OctarinePickRatePanel"
export const PICK_RATE_LABEL_ID = "OctarinePickRateLabel"
export const TIER_LEGEND_PANEL_ID = "OctarineTierLegendPanel"
export const TIER_LEGEND_BOX_ID = "OctarineTierLegendBox"
export const SETTINGS_PANEL_ID = "OctarineSettingsPanel"
export const SETTINGS_PANEL_WIDTH = "200px"
export const SETTINGS_CONTAINER_ID = "OctarineSettingsContainer"
export const SETTINGS_ROW_HEIGHT = "28px"
export const SETTINGS_LABEL_WIDTH = "85px"
export const SETTINGS_DROPDOWN_HEIGHT = "26px"
export const SETTINGS_DROPDOWN_WIDTH = "120px"
export const SETTINGS_LIST_ITEM_HEIGHT = "22px"
export const SETTINGS_LABEL_FONT_SIZE = "15px"
export const SETTINGS_VALUE_FONT_SIZE = "15px"
export const SETTINGS_LIST_ITEM_FONT_SIZE = "13px"

// Panel dimensions
export const OVERLAY_PANEL_HEIGHT = "14px"
export const WIN_RATE_PANEL_WIDTH = "28px"
export const TIER_PANEL_WIDTH = "15px"
export const PICK_RATE_PANEL_WIDTH = "32px"

// Tier legend panel (left side of heroes page)
export const TIER_LEGEND_WIDTH = "180px"
export const TIER_LEGEND_ROW_HEIGHT = "28px"
/** Margin from top to align with first row of heroes */
export const TIER_LEGEND_MARGIN_TOP = "42px"
export const TIER_LEGEND_MARGIN_LEFT = "8px"
export const TIER_LEGEND_TITLE_FONT_SIZE = "18px"
export const TIER_LEGEND_DESC_FONT_SIZE = "14px"
export const TIER_LEGEND_BADGE_SIZE = "18px"
export const TIER_ORDER: string[] = ["S", "A", "B", "C", "D"]

// Win rates data
// Directory with win-rates JSON files (day/week, by rank)
export const WIN_RATES_DIR = "win-rates"

// Minimum matches required to show a tier (avoids noise from tiny samples)
export const MIN_MATCHES_FOR_TIER = 100

// Menu
export const META_TRACKER_MENU_PATH = "github.com/octarine-public/meta-tracker/"
export const CHART_ICON = `${META_TRACKER_MENU_PATH}scripts_files/chart.svg`
