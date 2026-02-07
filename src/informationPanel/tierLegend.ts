import { Menu } from "github.com/octarine-public/wrapper/index"

import {
	DEFAULT_PANEL_BG,
	SETTINGS_CONTAINER_ID,
	SETTINGS_DROPDOWN_HEIGHT,
	SETTINGS_DROPDOWN_WIDTH,
	SETTINGS_LABEL_FONT_SIZE,
	SETTINGS_LABEL_WIDTH,
	SETTINGS_LIST_ITEM_FONT_SIZE,
	SETTINGS_LIST_ITEM_HEIGHT,
	SETTINGS_PANEL_ID,
	SETTINGS_PANEL_WIDTH,
	SETTINGS_ROW_HEIGHT,
	SETTINGS_VALUE_FONT_SIZE,
	TIER_BG_COLORS,
	TIER_LEGEND_BADGE_SIZE,
	TIER_LEGEND_BOX_ID,
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
	PeriodOptions,
	PositionLabelList,
	RankOptions,
	RANKS_DOTA_PLUS
} from "../winRates/index"
import { InformationPanelVisibility } from "./types"

type TierLegendKey = "Tier legend" | "Tier S" | "Tier A" | "Tier B" | "Tier C" | "Tier D"

type SettingsRowKey = "Stats" | "Period" | "Rank" | "Position"

function getTierLegendText(key: TierLegendKey): string {
	return Menu.Localization.Localize(key)
}

function getTierBackgroundColor(tier: string): string {
	return TIER_BG_COLORS[tier] ?? DEFAULT_PANEL_BG
}

const STATS_TYPE_OPTIONS = ["Dota 2", "Stratz"] as const

const SETTINGS_ROW_LABEL_KEYS: Readonly<Record<string, SettingsRowKey>> = {
	OctarineStatsType: "Stats",
	OctarinePeriod: "Period",
	OctarineRankStratz: "Rank",
	OctarineRankDota2: "Rank",
	OctarinePosition: "Position"
}

interface SettingsRowAction {
	type: "cycle" | "list"
	onSelect: (index: number) => void
	getSelectedIndex: () => number
	optionKeys: readonly string[]
	legendRoot: IUIPanel
	listPanel?: IUIPanel
}

interface SettingsRowConfig {
	rowId: string
	labelKey: SettingsRowKey
	optionKeys: readonly string[]
	getSelectedIndex: () => number
	onSelect: (index: number) => void
}

export class TierLegendPanel {
	private readonly openListRowIds = new Set<string>()
	private readonly settingsActions = new Map<string, SettingsRowAction>()
	private readonly DROPDOWN_LIST_THRESHOLD = 2
	private readonly handlers = new Map<string, number>()

	constructor(
		private readonly visibility: InformationPanelVisibility,
		private readonly menu: MenuManager
	) {}

	/** Single handler for all settings panels (event delegation) */
	private onSettingsActivated(panel: IUIPanel): void {
		if (!panel?.BIsLoaded() || !panel.FindAncestor(TIER_LEGEND_PANEL_ID)) {
			return
		}
		const id = panel.GetID()
		if (id.includes("ListOpt_")) {
			const idx = id.indexOf("ListOpt_")
			const rowId = id.slice(0, idx)
			const optIndex = parseInt(id.slice(idx + "ListOpt_".length), 10)
			const action = this.settingsActions.get(rowId)
			if (action?.type === "list" && action.listPanel?.BIsLoaded()) {
				action.onSelect(optIndex)
				action.listPanel.SetVisible(false)
				this.openListRowIds.delete(rowId)
				this.updateSettingsFromMenu(action.legendRoot)
			}
			return
		}
		if (id.endsWith("Value")) {
			const rowId = id.slice(0, -5)
			const action = this.settingsActions.get(rowId)
			if (!action) {
				return
			}
			if (action.type === "cycle") {
				const next = (action.getSelectedIndex() + 1) % action.optionKeys.length
				action.onSelect(next)
				this.updateSettingsFromMenu(action.legendRoot)
			} else if (action.listPanel?.BIsLoaded()) {
				const isOpen = this.openListRowIds.has(rowId)
				for (const rid of this.openListRowIds) {
					action.legendRoot.FindChildTraverse(`${rid}List`)?.SetVisible(false)
				}
				this.openListRowIds.clear()
				if (!isOpen) {
					action.listPanel.SetVisible(true)
					this.openListRowIds.add(rowId)
				}
			}
		}
	}

	public ensurePanel(heroesPage: IUIPanel): void {
		const state = this.visibility.isVisible()
		let legendRoot = heroesPage.FindChildTraverse(TIER_LEGEND_PANEL_ID)
		if (legendRoot?.BIsLoaded()) {
			if (legendRoot.GetFirstChild() === null) {
				this.fillPanel(legendRoot)
			} else {
				this.reregisterSettingsHandlers(legendRoot)
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
			"width: fit-children",
			"height: fit-children",
			"flow-children: down",
			"horizontal-align: left",
			"vertical-align: top",
			`margin-left: ${TIER_LEGEND_MARGIN_LEFT}`,
			`margin-top: ${TIER_LEGEND_MARGIN_TOP}`,
			"z-index: 5"
		])
	}

	private fillPanel(legendRoot: IUIPanel): void {
		const legendBox = Panorama.CreatePanel("Panel", TIER_LEGEND_BOX_ID, legendRoot)
		if (!legendBox?.BIsLoaded()) {
			return
		}
		setPanelStyle(legendBox, [
			`width: ${TIER_LEGEND_WIDTH}`,
			"height: fit-children",
			"flow-children: down",
			"border-radius: 6px",
			"padding: 12px 14px"
		])
		const headerRow = Panorama.CreatePanel(
			"Panel",
			"OctarineTierLegendHeader",
			legendBox
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
				legendBox
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
		const settingsPanel = Panorama.CreatePanel("Panel", SETTINGS_PANEL_ID, legendRoot)
		if (settingsPanel?.BIsLoaded()) {
			setPanelStyle(settingsPanel, [
				`width: ${SETTINGS_PANEL_WIDTH}`,
				"height: fit-children",
				"flow-children: down",
				"border-radius: 6px",
				"padding: 12px 14px",
				"margin-top: 10px"
			])
			this.fillSettingsSection(legendRoot, settingsPanel)
		}
	}

	private fillSettingsSection(legendRoot: IUIPanel, settingsPanel: IUIPanel): void {
		const container = Panorama.CreatePanel(
			"Panel",
			SETTINGS_CONTAINER_ID,
			settingsPanel
		)
		if (!container?.BIsLoaded()) {
			return
		}
		setPanelStyle(container, [
			"width: 100%",
			"height: fit-children",
			"flow-children: down",
			"overflow: visible"
		])
		for (const config of this.getSettingsRowsConfig()) {
			this.createSettingsRowWithDropDown(
				legendRoot,
				container,
				config.rowId,
				config.labelKey,
				config.optionKeys,
				config.getSelectedIndex,
				config.onSelect
			)
		}
	}

	private getSettingsRowsConfig(): SettingsRowConfig[] {
		return [
			{
				rowId: "OctarineStatsType",
				labelKey: "Stats",
				optionKeys: [...STATS_TYPE_OPTIONS],
				getSelectedIndex: () => this.menu.getStatsTypeIndex(),
				onSelect: (idx: number) => this.menu.setStatsTypeIndex(idx)
			},
			{
				rowId: "OctarinePeriod",
				labelKey: "Period",
				optionKeys: [...PeriodOptions],
				getSelectedIndex: () => this.menu.stratzMenu.PeriodIndex,
				onSelect: (idx: number) => this.menu.stratzMenu.setPeriodIndex(idx)
			},
			{
				rowId: "OctarineRankStratz",
				labelKey: "Rank",
				optionKeys: [...RankOptions],
				getSelectedIndex: () => this.menu.stratzMenu.RankIndex,
				onSelect: (idx: number) => this.menu.stratzMenu.setRankIndex(idx)
			},
			{
				rowId: "OctarineRankDota2",
				labelKey: "Rank",
				optionKeys: [...RANKS_DOTA_PLUS],
				getSelectedIndex: () => this.menu.dotaPlusMenu.RankIndex,
				onSelect: (idx: number) => this.menu.dotaPlusMenu.setRankIndex(idx)
			},
			{
				rowId: "OctarinePosition",
				labelKey: "Position",
				optionKeys: [...PositionLabelList],
				getSelectedIndex: () => this.menu.stratzMenu.PositionIndex,
				onSelect: (idx: number) => this.menu.stratzMenu.setPositionIndex(idx)
			}
		]
	}

	private reregisterSettingsHandlers(legendRoot: IUIPanel): void {
		const settingsPanel = legendRoot.FindChildTraverse(SETTINGS_PANEL_ID)
		if (!settingsPanel?.BIsLoaded()) {
			return
		}
		const container = settingsPanel.FindChildTraverse(SETTINGS_CONTAINER_ID)
		if (!container?.BIsLoaded()) {
			return
		}
		for (const config of this.getSettingsRowsConfig()) {
			const row = container.FindChildTraverse(config.rowId)
			if (!row?.BIsLoaded()) {
				continue
			}
			const topRow = row.FindChildTraverse(`${config.rowId}TopRow`)
			const valuePanel = topRow?.FindChildTraverse(`${config.rowId}Value`)
			if (!valuePanel?.BIsLoaded()) {
				continue
			}
			const useList = config.optionKeys.length > this.DROPDOWN_LIST_THRESHOLD
			const listPanel = row.FindChildTraverse(`${config.rowId}List`)
			if (useList && listPanel?.BIsLoaded()) {
				this.settingsActions.set(config.rowId, {
					type: "list",
					onSelect: config.onSelect,
					getSelectedIndex: config.getSelectedIndex,
					optionKeys: config.optionKeys,
					legendRoot,
					listPanel
				})
				if (!this.handlers.has(`${config.rowId}Value`)) {
					const h = Panorama.RegisterEventHandler("Activated", valuePanel, () =>
						this.onSettingsActivated(valuePanel)
					)
					this.handlers.set(`${config.rowId}Value`, h)
				}
				for (let i = 0; i < config.optionKeys.length; i++) {
					const optPanel = listPanel.FindChildTraverse(
						`${config.rowId}ListOpt_${i}`
					)
					if (
						optPanel?.BIsLoaded() &&
						!this.handlers.has(`${config.rowId}ListOpt_${i}`)
					) {
						const oh = Panorama.RegisterEventHandler(
							"Activated",
							optPanel,
							() => this.onSettingsActivated(optPanel)
						)
						this.handlers.set(`${config.rowId}ListOpt_${i}`, oh)
					}
				}
			} else {
				this.settingsActions.set(config.rowId, {
					type: "cycle",
					onSelect: config.onSelect,
					getSelectedIndex: config.getSelectedIndex,
					optionKeys: config.optionKeys,
					legendRoot
				})
				if (!this.handlers.has(`${config.rowId}Value`)) {
					const h = Panorama.RegisterEventHandler("Activated", valuePanel, () =>
						this.onSettingsActivated(valuePanel)
					)
					this.handlers.set(`${config.rowId}Value`, h)
				}
			}
		}
	}

	private createSettingsRowWithDropDown(
		legendRoot: IUIPanel,
		container: IUIPanel,
		rowId: string,
		labelKey: SettingsRowKey,
		optionKeys: readonly string[],
		getSelectedIndex: () => number,
		onSelect: (index: number) => void
	): void {
		const useList = optionKeys.length > this.DROPDOWN_LIST_THRESHOLD
		const row = Panorama.CreatePanel("Panel", rowId, container)
		if (!row?.BIsLoaded()) {
			return
		}
		setPanelStyle(row, [
			"width: 100%",
			"height: fit-children",
			"flow-children: down",
			"margin-bottom: 6px"
		])
		const topRow = Panorama.CreatePanel("Panel", `${rowId}TopRow`, row)
		if (!topRow?.BIsLoaded()) {
			return
		}
		setPanelStyle(topRow, [
			"width: 100%",
			`height: ${SETTINGS_ROW_HEIGHT}`,
			"flow-children: right",
			"vertical-align: center"
		])
		const label = Panorama.CreatePanel(
			"Label",
			`${rowId}Label`,
			topRow
		) as Nullable<CLabel>
		if (label?.BIsLoaded()) {
			setPanelStyle(label, [
				`width: ${SETTINGS_LABEL_WIDTH}`,
				`height: ${SETTINGS_ROW_HEIGHT}`,
				"line-height: 20px",
				`font-size: ${SETTINGS_LABEL_FONT_SIZE}`,
				"color: #cbd5e1",
				"text-align: left",
				"vertical-align: center",
				"text-overflow: shrink",
				"margin-right: 8px"
			])
			label.SetText(Menu.Localization.Localize(labelKey))
		}
		if (useList) {
			this.createSettingsValuePanelWithList(
				legendRoot,
				row,
				topRow,
				rowId,
				optionKeys,
				getSelectedIndex,
				onSelect
			)
		} else {
			this.createSettingsValuePanel(
				legendRoot,
				topRow,
				rowId,
				optionKeys,
				getSelectedIndex,
				onSelect
			)
		}
	}
	private createSettingsValuePanel(
		legendRoot: IUIPanel,
		parent: IUIPanel,
		rowId: string,
		optionKeys: readonly string[],
		getSelectedIndex: () => number,
		onSelect: (index: number) => void
	): void {
		const valuePanel = Panorama.CreatePanel("Panel", `${rowId}Value`, parent)
		if (!valuePanel?.BIsLoaded()) {
			return
		}
		valuePanel.SetAcceptsFocus(true)
		valuePanel.SetActivationEnabled(true)
		setPanelStyle(valuePanel, [
			`width: ${SETTINGS_DROPDOWN_WIDTH}`,
			`height: ${SETTINGS_DROPDOWN_HEIGHT}`,
			"flow-children: right",
			"vertical-align: center",
			"background-color: rgba(40, 44, 52, 0.95)",
			"border: 1px solid #4a5568",
			"border-radius: 4px",
			"padding: 2px 6px"
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
				`font-size: ${SETTINGS_VALUE_FONT_SIZE}`,
				"color: #e2e8f0",
				"text-align: left",
				"vertical-align: center",
				"text-overflow: shrink"
			])
			valueLabel.SetText(
				Menu.Localization.Localize(
					optionKeys[getSelectedIndex()] ?? optionKeys[0]
				)
			)
		}
		this.settingsActions.set(rowId, {
			type: "cycle",
			onSelect,
			getSelectedIndex,
			optionKeys,
			legendRoot
		})
		if (!this.handlers.has(`${rowId}Value`)) {
			const handler = Panorama.RegisterEventHandler(
				"Activated",
				valuePanel,
				(panel: IUIPanel) => this.onSettingsActivated(panel)
			)
			this.handlers.set(`${rowId}Value`, handler)
		}
	}
	private createSettingsValuePanelWithList(
		legendRoot: IUIPanel,
		row: IUIPanel,
		topRow: IUIPanel,
		rowId: string,
		optionKeys: readonly string[],
		getSelectedIndex: () => number,
		onSelect: (index: number) => void
	): void {
		const valuePanel = Panorama.CreatePanel("Panel", `${rowId}Value`, topRow)
		if (!valuePanel?.BIsLoaded()) {
			return
		}
		valuePanel.SetAcceptsFocus(true)
		valuePanel.SetActivationEnabled(true)
		setPanelStyle(valuePanel, [
			`width: ${SETTINGS_DROPDOWN_WIDTH}`,
			`height: ${SETTINGS_DROPDOWN_HEIGHT}`,
			"flow-children: right",
			"vertical-align: center",
			"background-color: rgba(40, 44, 52, 0.95)",
			"border: 1px solid #4a5568",
			"border-radius: 4px",
			"padding: 2px 6px"
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
				`font-size: ${SETTINGS_VALUE_FONT_SIZE}`,
				"color: #e2e8f0",
				"text-align: left",
				"vertical-align: center",
				"text-overflow: shrink"
			])
			valueLabel.SetText(
				Menu.Localization.Localize(
					optionKeys[getSelectedIndex()] ?? optionKeys[0]
				)
			)
		}
		const listPanel = Panorama.CreatePanel("Panel", `${rowId}List`, row)
		if (!listPanel?.BIsLoaded()) {
			return
		}
		listPanel.SetVisible(false)
		setPanelStyle(listPanel, [
			`width: ${SETTINGS_DROPDOWN_WIDTH}`,
			`max-width: ${SETTINGS_DROPDOWN_WIDTH}`,
			"height: fit-children",
			"flow-children: down",
			"horizontal-align: right",
			"background-color: rgba(30, 34, 42, 0.98)",
			"border: 1px solid #4a5568",
			"border-radius: 4px",
			"z-index: 20",
			"overflow: clip"
		])
		for (let i = 0; i < optionKeys.length; i++) {
			const optPanel = Panorama.CreatePanel(
				"Panel",
				`${rowId}ListOpt_${i}`,
				listPanel
			)
			if (!optPanel?.BIsLoaded()) {
				continue
			}
			optPanel.SetAcceptsFocus(true)
			optPanel.SetActivationEnabled(true)
			setPanelStyle(optPanel, [
				"width: 100%",
				`height: ${SETTINGS_LIST_ITEM_HEIGHT}`,
				"flow-children: right",
				"padding: 2px 6px",
				"background-color: transparent"
			])
			const optLabel = Panorama.CreatePanel(
				"Label",
				`${rowId}ListOptLabel_${i}`,
				optPanel
			) as Nullable<CLabel>
			if (optLabel?.BIsLoaded()) {
				setPanelStyle(optLabel, [
					"width: fill",
					"height: 100%",
					`font-size: ${SETTINGS_LIST_ITEM_FONT_SIZE}`,
					"color: #e2e8f0",
					"text-align: left",
					"vertical-align: center",
					"text-overflow: shrink"
				])
				optLabel.SetText(Menu.Localization.Localize(optionKeys[i]))
			}
			if (!this.handlers.has(`${rowId}ListOpt_${i}`)) {
				const optHandler = Panorama.RegisterEventHandler(
					"Activated",
					optPanel,
					() => this.onSettingsActivated(optPanel)
				)
				this.handlers.set(`${rowId}ListOpt_${i}`, optHandler)
			}
		}
		this.settingsActions.set(rowId, {
			type: "list",
			onSelect,
			getSelectedIndex,
			optionKeys,
			legendRoot,
			listPanel
		})
		if (!this.handlers.has(`${rowId}Value`)) {
			const valueHandler = Panorama.RegisterEventHandler(
				"Activated",
				valuePanel,
				() => this.onSettingsActivated(valuePanel)
			)
			this.handlers.set(`${rowId}Value`, valueHandler)
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
		this.updateSettingsRowLabels(legendRoot)
		const isDota2 = this.menu.isDota2Source()
		this.updateRowSelection(
			legendRoot,
			"OctarineStatsType",
			[...STATS_TYPE_OPTIONS],
			this.menu.getStatsTypeIndex()
		)
		const periodRow = legendRoot.FindChildTraverse("OctarinePeriod")
		if (periodRow?.BIsLoaded()) {
			periodRow.SetVisible(!isDota2)
			if (!isDota2) {
				this.updateRowSelection(
					legendRoot,
					"OctarinePeriod",
					[...PeriodOptions],
					this.menu.stratzMenu.PeriodIndex
				)
			}
		}
		const rankStratzRow = legendRoot.FindChildTraverse("OctarineRankStratz")
		if (rankStratzRow?.BIsLoaded()) {
			rankStratzRow.SetVisible(!isDota2)
			if (!isDota2) {
				this.updateRowSelection(
					legendRoot,
					"OctarineRankStratz",
					[...RankOptions],
					this.menu.stratzMenu.RankIndex
				)
			}
		}
		const rankDota2Row = legendRoot.FindChildTraverse("OctarineRankDota2")
		if (rankDota2Row?.BIsLoaded()) {
			rankDota2Row.SetVisible(isDota2)
			if (isDota2) {
				this.updateRowSelection(
					legendRoot,
					"OctarineRankDota2",
					[...RANKS_DOTA_PLUS],
					this.menu.dotaPlusMenu.RankIndex
				)
			}
		}
		const positionRow = legendRoot.FindChildTraverse("OctarinePosition")
		if (positionRow?.BIsLoaded()) {
			positionRow.SetVisible(!isDota2)
			if (!isDota2) {
				this.updateRowSelection(
					legendRoot,
					"OctarinePosition",
					[...PositionLabelList],
					this.menu.stratzMenu.PositionIndex
				)
			}
		}
	}
	private updateSettingsRowLabels(legendRoot: IUIPanel): void {
		for (const [rowId, labelKey] of Object.entries(SETTINGS_ROW_LABEL_KEYS)) {
			const label = legendRoot.FindChildTraverse(
				`${rowId}Label`
			) as Nullable<CLabel>
			if (label?.BIsLoaded()) {
				label.SetText(Menu.Localization.Localize(labelKey))
			}
		}
		for (const [rowId, action] of this.settingsActions) {
			if (action.type !== "list" || !action.listPanel?.BIsLoaded()) {
				continue
			}
			const { optionKeys } = action
			for (let i = 0; i < optionKeys.length; i++) {
				const optLabel = legendRoot.FindChildTraverse(
					`${rowId}ListOptLabel_${i}`
				) as Nullable<CLabel>
				if (optLabel?.BIsLoaded()) {
					optLabel.SetText(Menu.Localization.Localize(optionKeys[i]))
				}
			}
		}
	}
	private updateRowSelection(
		legendRoot: IUIPanel,
		rowId: string,
		optionKeys: readonly string[],
		selectedIndex: number
	): void {
		const valueLabel = legendRoot.FindChildTraverse(
			`${rowId}ValueLabel`
		) as Nullable<CLabel>
		if (valueLabel?.BIsLoaded()) {
			valueLabel.SetText(
				Menu.Localization.Localize(optionKeys[selectedIndex] ?? optionKeys[0])
			)
		}
	}
}
