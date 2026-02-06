/* eslint-disable @typescript-eslint/naming-convention -- constants file uses UPPER_SNAKE_CASE */

// Win rate label colors by value
export const WIN_RATE_COLORS = {
	low: "#f87171",
	mid: "#fb923c",
	high: "#4ade80"
} as const

// Tier badge background colors
export const TIER_BG_COLORS: Record<string, string> = {
	S: "rgba(124,58,237,0.9)",
	A: "rgba(59,130,246,0.9)",
	B: "rgba(20,184,166,0.9)",
	C: "rgba(249,115,22,0.9)",
	D: "rgba(239,68,68,0.9)"
}

// Default panel background
export const DEFAULT_PANEL_BG = "rgba(0,0,0,0.85)"

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

// Panel dimensions
export const OVERLAY_PANEL_HEIGHT = "14px"
export const WIN_RATE_PANEL_WIDTH = "28px"
export const TIER_PANEL_WIDTH = "15px"
export const PICK_RATE_PANEL_WIDTH = "32px"

// Win rates data
// Directory with win-rates JSON files (day/week, by rank)
export const WIN_RATES_DIR = "win-rates"

// Minimum matches required to show a tier (avoids noise from tiny samples)
export const MIN_MATCHES_FOR_TIER = 100

// Menu
export const META_TRACKER_MENU_PATH = "github.com/octarine-public/meta-tracker/"
export const CHART_ICON = `${META_TRACKER_MENU_PATH}scripts_files/chart.svg`
