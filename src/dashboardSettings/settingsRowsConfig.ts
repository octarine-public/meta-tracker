import { Menu } from "github.com/octarine-public/wrapper/index"

import { MenuManager } from "../menu"
import {
	PeriodOptions,
	PositionLabelList,
	RankOptions,
	RANKS_DOTA_PLUS
} from "../winRates/index"

export type SettingsRowKey = "Stats" | "Period" | "Rank" | "Position"

// eslint-disable-next-line @typescript-eslint/naming-convention
export const STATS_TYPE_OPTIONS = ["Dota 2", "Stratz"] as const

// eslint-disable-next-line @typescript-eslint/naming-convention
export const SETTINGS_ROW_LABEL_KEYS: Readonly<Record<string, SettingsRowKey>> = {
	OctarineStatsType: "Stats",
	OctarinePeriod: "Period",
	OctarineRankStratz: "Rank",
	OctarineRankDota2: "Rank",
	OctarinePosition: "Position"
}

export interface SettingsRowConfig {
	rowId: string
	labelKey: SettingsRowKey
	optionKeys: readonly string[]
	getSelectedIndex: () => number
	onSelect: (index: number) => void
}

export function getSettingsRowsConfig(menu: MenuManager): SettingsRowConfig[] {
	return [
		{
			rowId: "OctarineStatsType",
			labelKey: "Stats",
			optionKeys: STATS_TYPE_OPTIONS,
			getSelectedIndex: () => menu.StatsTypeIndex,
			onSelect: (idx: number) => menu.setStatsTypeIndex(idx)
		},
		{
			rowId: "OctarinePeriod",
			labelKey: "Period",
			optionKeys: PeriodOptions,
			getSelectedIndex: () => menu.stratzMenu.PeriodIndex,
			onSelect: (idx: number) => menu.stratzMenu.setPeriodIndex(idx)
		},
		{
			rowId: "OctarineRankStratz",
			labelKey: "Rank",
			optionKeys: RankOptions,
			getSelectedIndex: () => menu.stratzMenu.RankIndex,
			onSelect: (idx: number) => menu.stratzMenu.setRankIndex(idx)
		},
		{
			rowId: "OctarineRankDota2",
			labelKey: "Rank",
			optionKeys: RANKS_DOTA_PLUS,
			getSelectedIndex: () => menu.dotaPlusMenu.RankIndex,
			onSelect: (idx: number) => menu.dotaPlusMenu.setRankIndex(idx)
		},
		{
			rowId: "OctarinePosition",
			labelKey: "Position",
			optionKeys: PositionLabelList,
			getSelectedIndex: () => menu.stratzMenu.PositionIndex,
			onSelect: (idx: number) => menu.stratzMenu.setPositionIndex(idx)
		}
	]
}

export function localizeLabel(key: SettingsRowKey): string {
	return Menu.Localization.Localize(key)
}

export function localizeOption(optionKey: string): string {
	return Menu.Localization.Localize(optionKey)
}
