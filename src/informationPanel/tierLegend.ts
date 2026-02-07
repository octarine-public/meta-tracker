import { Menu } from "github.com/octarine-public/wrapper/index"

import {
	DEFAULT_PANEL_BG,
	SETTINGS_CONTAINER_ID,
	SETTINGS_DROPDOWN_HEIGHT,
	SETTINGS_ROW_HEIGHT,
	TIER_BG_COLORS,
	TIER_LEGEND_BADGE_SIZE,
	TIER_LEGEND_DESC_FONT_SIZE,
	TIER_LEGEND_MARGIN_LEFT,
	TIER_LEGEND_MARGIN_TOP,
	TIER_LEGEND_PANEL_ID,
	TIER_LEGEND_TITLE_FONT_SIZE,
	TIER_LEGEND_WIDTH,
	TIER_ORDER
} from "../constants"
import { MenuManager } from "../menu"
import { setPanelStyle } from "../panorama/utils"
import {
	HeroPositions,
	PeriodOptions,
	PositionLabelList,
	RankOptions,
	RANKS_DOTA_PLUS
} from "../winRates/index"
import { InformationPanelVisibility } from "./types"

type TierLegendKey = "Tier legend" | "Tier S" | "Tier A" | "Tier B" | "Tier C" | "Tier D"

type SettingsRowKey =
	| "Stats type"
	| "Win rate period"
	| "Win rate rank"
	| "Win rate position"

function getTierLegendText(key: TierLegendKey): string {
	return Menu.Localization.Localize(key)
}

function getTierBackgroundColor(tier: string): string {
	return TIER_BG_COLORS[tier] ?? DEFAULT_PANEL_BG
}

const STATS_TYPE_OPTIONS = ["Dota 2", "Stratz"] as const

export class TierLegendPanel {
	constructor(
		private readonly visibility: InformationPanelVisibility,
		private readonly menu: MenuManager
	) {}

	public ensurePanel(heroesPage: IUIPanel): void {
		const state = this.visibility.isVisible()
		let legendRoot = heroesPage.FindChildTraverse(TIER_LEGEND_PANEL_ID)
		if (legendRoot?.BIsLoaded()) {
			if (legendRoot.GetFirstChild() === null) {
				this.fillPanel(legendRoot)
			}
			this.updateLabels(legendRoot)
			this.updateSettingsFromMenu(legendRoot)
			legendRoot.SetVisible(state)
			return
		}
		legendRoot = Panorama.CreatePanel("Panel", TIER_LEGEND_PANEL_ID, heroesPage)
		if (!legendRoot?.BIsLoaded()) {
			return
		}
		this.setRootStyle(legendRoot)
		this.fillPanel(legendRoot)
		this.updateLabels(legendRoot)
		this.updateSettingsFromMenu(legendRoot)
		legendRoot.SetVisible(state)
	}

	private setRootStyle(legendRoot: IUIPanel): void {
		setPanelStyle(legendRoot, [
			`width: ${TIER_LEGEND_WIDTH}`,
			"height: fit-children",
			"flow-children: down",
			"horizontal-align: left",
			"vertical-align: top",
			`margin-left: ${TIER_LEGEND_MARGIN_LEFT}`,
			`margin-top: ${TIER_LEGEND_MARGIN_TOP}`,
			"border-radius: 6px",
			"padding: 12px 14px",
			"z-index: 5"
		])
	}

	private fillPanel(legendRoot: IUIPanel): void {
		const headerRow = Panorama.CreatePanel(
			"Panel",
			"OctarineTierLegendHeader",
			legendRoot
		)
		if (headerRow?.BIsLoaded()) {
			setPanelStyle(headerRow, [
				"width: 100%",
				"height: 26px",
				"flow-children: right",
				"vertical-align: center"
			])
			const titleLabel = Panorama.CreatePanel(
				"Label",
				"OctarineTierLegendTitle",
				headerRow
			) as Nullable<CLabel>
			if (titleLabel?.BIsLoaded()) {
				setPanelStyle(titleLabel, [
					"width: fill",
					"height: 26px",
					`font-size: ${TIER_LEGEND_TITLE_FONT_SIZE}`,
					"color: #808fa6",
					"text-align: left",
					"vertical-align: center",
					"text-overflow: shrink",
					"text-shadow: 2px 2px 4px #00000044",
					"letter-spacing: 2px"
				])
			}
		}
		for (let i = 0; i < TIER_ORDER.length; i++) {
			const tier = TIER_ORDER[i]
			const row = Panorama.CreatePanel(
				"Panel",
				`OctarineTierLegendRow_${tier}`,
				legendRoot
			)
			if (!row?.BIsLoaded()) {
				continue
			}
			setPanelStyle(row, [
				"width: 100%",
				`height: ${TIER_LEGEND_BADGE_SIZE}`,
				"flow-children: right",
				"vertical-align: center",
				"margin-bottom: 6px"
			])
			const badge = Panorama.CreatePanel(
				"Panel",
				`OctarineTierLegendBadge_${tier}`,
				row
			)
			if (badge?.BIsLoaded()) {
				setPanelStyle(badge, [
					`width: ${TIER_LEGEND_BADGE_SIZE}`,
					`height: ${TIER_LEGEND_BADGE_SIZE}`,
					`background-color: ${getTierBackgroundColor(tier)}`,
					"border-radius: 3px",
					"margin-right: 10px"
				])
				const badgeLabel = Panorama.CreatePanel(
					"Label",
					`OctarineTierLegendBadgeLabel_${tier}`,
					badge
				) as Nullable<CLabel>
				if (badgeLabel?.BIsLoaded()) {
					setPanelStyle(badgeLabel, [
						"width: 100%",
						"height: 100%",
						"line-height: 16px",
						"font-size: 11px",
						"font-weight: bold",
						"color: #ffffff",
						"text-align: center",
						"vertical-align: center"
					])
					badgeLabel.SetText(tier)
				}
			}
			const descLabel = Panorama.CreatePanel(
				"Label",
				`OctarineTierLegendDesc_${tier}`,
				row
			) as Nullable<CLabel>
			if (descLabel?.BIsLoaded()) {
				setPanelStyle(descLabel, [
					"width: fill",
					`height: ${TIER_LEGEND_BADGE_SIZE}`,
					`line-height: ${TIER_LEGEND_BADGE_SIZE}`,
					`font-size: ${TIER_LEGEND_DESC_FONT_SIZE}`,
					"color: #cbd5e1",
					"text-align: left",
					"vertical-align: center",
					"text-overflow: shrink"
				])
			}
		}
		this.fillSettingsSection(legendRoot)
	}

	private fillSettingsSection(legendRoot: IUIPanel): void {
		const container = Panorama.CreatePanel("Panel", SETTINGS_CONTAINER_ID, legendRoot)
		if (!container?.BIsLoaded()) {
			return
		}
		setPanelStyle(container, [
			"width: 100%",
			"height: fit-children",
			"flow-children: down",
			"margin-top: 12px"
		])
		this.createSettingsRow(legendRoot, container, "OctarineStatsType", "Stats type", 2, () => {
			const next = (this.menu.getStatsTypeIndex() + 1) % 2
			this.menu.setStatsTypeIndex(next)
		})
		this.createSettingsRow(legendRoot, container, "OctarinePeriod", "Win rate period", 2, () => {
			const idx = (this.menu.stratzMenu.getPeriodIndex() + 1) % PeriodOptions.length
			this.menu.stratzMenu.setPeriodIndex(idx)
		})
		this.createSettingsRow(legendRoot, container, "OctarineRank", "Win rate rank", 0, () => {
			const isDota2 = this.menu.isDota2Source()
			const count = isDota2 ? RANKS_DOTA_PLUS.length : RankOptions.length
			const getIdx = () =>
				isDota2
					? this.menu.dotaPlusMenu.getRankIndex()
					: this.menu.stratzMenu.getRankIndex()
			const next = (getIdx() + 1) % count
			if (isDota2) {
				this.menu.dotaPlusMenu.setRankIndex(next)
			} else {
				this.menu.stratzMenu.setRankIndex(next)
			}
		})
		this.createSettingsRow(legendRoot, container, "OctarinePosition", "Win rate position", 5, () => {
			const idx = (this.menu.stratzMenu.getPositionIndex() + 1) % HeroPositions.length
			this.menu.stratzMenu.setPositionIndex(idx)
		})
	}

	private createSettingsRow(
		legendRoot: IUIPanel,
		container: IUIPanel,
		rowId: string,
		labelKey: SettingsRowKey,
		_optionsCount: number,
		onCycle: () => void
	): void {
		const row = Panorama.CreatePanel("Panel", rowId, container)
		if (!row?.BIsLoaded()) {
			return
		}
		setPanelStyle(row, [
			"width: 100%",
			`height: ${SETTINGS_ROW_HEIGHT}`,
			"flow-children: right",
			"vertical-align: center",
			"margin-bottom: 6px"
		])
		const label = Panorama.CreatePanel("Label", `${rowId}Label`, row) as Nullable<CLabel>
		if (label?.BIsLoaded()) {
			setPanelStyle(label, [
				"width: fill",
				`height: ${SETTINGS_ROW_HEIGHT}`,
				"font-size: 12px",
				"color: #cbd5e1",
				"text-align: left",
				"vertical-align: center",
				"text-overflow: shrink",
				"margin-right: 8px"
			])
			label.SetText(Menu.Localization.Localize(labelKey))
		}
		const valuePanel = Panorama.CreatePanel("Panel", `${rowId}Value`, row)
		if (valuePanel?.BIsLoaded()) {
			const acceptFocusSym = Panorama.MakeSymbol("acceptsfocus")
			if (acceptFocusSym >= 0) {
				valuePanel.BSetProperty(acceptFocusSym, "true")
			}
			setPanelStyle(valuePanel, [
				"width: 90px",
				`height: ${SETTINGS_DROPDOWN_HEIGHT}`,
				"flow-children: right",
				"vertical-align: center",
				"background-color: rgba(40, 44, 52, 0.95)",
				"border-radius: 4px",
				"padding: 2px 6px",
				"border: 1px solid #4a5568"
			])
			const valueLabel = Panorama.CreatePanel(
				"Label",
				`${rowId}ValueLabel`,
				valuePanel
			) as Nullable<CLabel>
			if (valueLabel?.BIsLoaded()) {
				setPanelStyle(valueLabel, [
					"width: fill",
					"height: 100%",
					"font-size: 11px",
					"color: #e2e8f0",
					"text-align: left",
					"vertical-align: center",
					"text-overflow: shrink"
				])
			}
			Panorama.RegisterEventHandler("Activated", valuePanel, () => {
				onCycle()
				this.updateSettingsFromMenu(legendRoot)
			})
		}
	}

	private updateLabels(legendRoot: IUIPanel): void {
		const titleLabel = legendRoot.FindChildTraverse(
			"OctarineTierLegendTitle"
		) as Nullable<CLabel>
		if (titleLabel?.BIsLoaded()) {
			titleLabel.SetText(getTierLegendText("Tier legend"))
		}
		const tierKey = (tier: string): TierLegendKey => `Tier ${tier}` as TierLegendKey
		for (const tier of TIER_ORDER) {
			const descLabel = legendRoot.FindChildTraverse(
				`OctarineTierLegendDesc_${tier}`
			) as Nullable<CLabel>
			if (descLabel?.BIsLoaded()) {
				descLabel.SetText(getTierLegendText(tierKey(tier)))
			}
		}
	}

	private updateSettingsFromMenu(legendRoot: IUIPanel): void {
		const isDota2 = this.menu.isDota2Source()
		this.setSettingsRowValue(
			legendRoot,
			"OctarineStatsType",
			Menu.Localization.Localize(STATS_TYPE_OPTIONS[this.menu.getStatsTypeIndex()])
		)
		const periodRow = legendRoot.FindChildTraverse("OctarinePeriod")
		if (periodRow?.BIsLoaded()) {
			periodRow.SetVisible(!isDota2)
			if (!isDota2) {
				const periodIdx = this.menu.stratzMenu.getPeriodIndex()
				this.setSettingsRowValue(
					legendRoot,
					"OctarinePeriod",
					Menu.Localization.Localize(PeriodOptions[periodIdx])
				)
			}
		}
		const rankRow = legendRoot.FindChildTraverse("OctarineRank")
		if (rankRow?.BIsLoaded()) {
			const rankLabel = rankRow.FindChildTraverse("OctarineRankValueLabel") as Nullable<CLabel>
			if (rankLabel?.BIsLoaded()) {
				const text = isDota2
					? Menu.Localization.Localize(RANKS_DOTA_PLUS[this.menu.dotaPlusMenu.getRankIndex()])
					: Menu.Localization.Localize(
							RankOptions[this.menu.stratzMenu.getRankIndex()]
						)
				rankLabel.SetText(text)
			}
		}
		const positionRow = legendRoot.FindChildTraverse("OctarinePosition")
		if (positionRow?.BIsLoaded()) {
			positionRow.SetVisible(!isDota2)
			if (!isDota2) {
				const posIdx = this.menu.stratzMenu.getPositionIndex()
				this.setSettingsRowValue(
					legendRoot,
					"OctarinePosition",
					Menu.Localization.Localize(PositionLabelList[posIdx])
				)
			}
		}
	}

	private setSettingsRowValue(
		legendRoot: IUIPanel,
		rowId: string,
		text: string
	): void {
		const valueLabel = legendRoot.FindChildTraverse(
			`${rowId}ValueLabel`
		) as Nullable<CLabel>
		if (valueLabel?.BIsLoaded()) {
			valueLabel.SetText(text)
		}
	}
}
