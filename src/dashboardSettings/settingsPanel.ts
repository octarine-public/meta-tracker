import {
	SETTINGS_CONTAINER_ID,
	SETTINGS_DROPDOWN_HEIGHT,
	SETTINGS_DROPDOWN_WIDTH,
	SETTINGS_LABEL_FONT_SIZE,
	SETTINGS_LABEL_WIDTH,
	SETTINGS_LIST_ITEM_FONT_SIZE,
	SETTINGS_LIST_ITEM_HEIGHT,
	SETTINGS_PANEL_ID,
	SETTINGS_ROW_HEIGHT,
	SETTINGS_VALUE_FONT_SIZE,
	TIER_LEGEND_PANEL_ID
} from "../constants"
import { MenuManager } from "../menu"
import { setPanelStyle } from "../panorama/utils"
import {
	PeriodOptions,
	PositionLabelList,
	RankOptions,
	RANKS_DOTA_PLUS
} from "../winRates/index"
import {
	getSettingsRowsConfig,
	localizeLabel,
	localizeOption,
	SETTINGS_ROW_LABEL_KEYS,
	SettingsRowConfig,
	SettingsRowKey,
	STATS_TYPE_OPTIONS
} from "./settingsRowsConfig"

interface SettingsRowAction {
	type: "cycle" | "list"
	onSelect: (index: number) => void
	getSelectedIndex: () => number
	optionKeys: readonly string[]
	legendRoot: IUIPanel
	listPanel?: IUIPanel
}

export class DashboardSettingsPanel {
	private readonly openListRowIds = new Set<string>()
	private readonly settingsActions = new Map<string, SettingsRowAction>()
	private readonly handlers = new Map<string, number>()
	private readonly DROPDOWN_LIST_THRESHOLD = 2

	constructor(private readonly menu: MenuManager) {}

	public getConfig(): SettingsRowConfig[] {
		return getSettingsRowsConfig(this.menu)
	}

	/** Single handler for all settings panels (event delegation) */
	public onSettingsActivated(panel: IUIPanel): void {
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
				this.updateFromMenu(action.legendRoot)
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
				this.updateFromMenu(action.legendRoot)
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

	public appendTo(legendRoot: IUIPanel, settingsPanel: IUIPanel): void {
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
		for (const config of this.getConfig()) {
			this.createSettingsRow(
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

	public reregisterHandlers(legendRoot: IUIPanel): void {
		const settingsPanel = legendRoot.FindChildTraverse(SETTINGS_PANEL_ID)
		if (!settingsPanel?.BIsLoaded()) {
			return
		}
		const container = settingsPanel.FindChildTraverse(SETTINGS_CONTAINER_ID)
		if (!container?.BIsLoaded()) {
			return
		}
		for (const config of this.getConfig()) {
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
				this.registerValueHandler(valuePanel, config.rowId)
				for (let i = 0; i < config.optionKeys.length; i++) {
					const optPanel = listPanel.FindChildTraverse(
						`${config.rowId}ListOpt_${i}`
					)
					if (
						optPanel?.BIsLoaded() &&
						!this.handlers.has(`${config.rowId}ListOpt_${i}`)
					) {
						const h = Panorama.RegisterEventHandler(
							"Activated",
							optPanel,
							() => this.onSettingsActivated(optPanel)
						)
						this.handlers.set(`${config.rowId}ListOpt_${i}`, h)
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
				this.registerValueHandler(valuePanel, config.rowId)
			}
		}
	}

	public updateFromMenu(legendRoot: IUIPanel): void {
		this.updateRowLabels(legendRoot)
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

	private registerValueHandler(valuePanel: IUIPanel, rowId: string): void {
		if (this.handlers.has(`${rowId}Value`)) {
			return
		}
		const h = Panorama.RegisterEventHandler("Activated", valuePanel, () =>
			this.onSettingsActivated(valuePanel)
		)
		this.handlers.set(`${rowId}Value`, h)
	}

	private createSettingsRow(
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
			label.SetText(localizeLabel(labelKey))
		}
		if (useList) {
			this.createValuePanelWithList(
				legendRoot,
				row,
				topRow,
				rowId,
				optionKeys,
				getSelectedIndex,
				onSelect
			)
		} else {
			this.createValuePanel(
				legendRoot,
				topRow,
				rowId,
				optionKeys,
				getSelectedIndex,
				onSelect
			)
		}
	}

	private createValuePanel(
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
				localizeOption(optionKeys[getSelectedIndex()] ?? optionKeys[0])
			)
		}
		this.settingsActions.set(rowId, {
			type: "cycle",
			onSelect,
			getSelectedIndex,
			optionKeys,
			legendRoot
		})
		this.registerValueHandler(valuePanel, rowId)
	}

	private createValuePanelWithList(
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
				localizeOption(optionKeys[getSelectedIndex()] ?? optionKeys[0])
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
				optLabel.SetText(localizeOption(optionKeys[i]))
			}
			if (!this.handlers.has(`${rowId}ListOpt_${i}`)) {
				const h = Panorama.RegisterEventHandler("Activated", optPanel, () =>
					this.onSettingsActivated(optPanel)
				)
				this.handlers.set(`${rowId}ListOpt_${i}`, h)
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
		this.registerValueHandler(valuePanel, rowId)
	}

	private updateRowLabels(legendRoot: IUIPanel): void {
		for (const [rowId, labelKey] of Object.entries(SETTINGS_ROW_LABEL_KEYS)) {
			const label = legendRoot.FindChildTraverse(
				`${rowId}Label`
			) as Nullable<CLabel>
			if (label?.BIsLoaded()) {
				label.SetText(localizeLabel(labelKey))
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
					optLabel.SetText(localizeOption(optionKeys[i]))
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
			valueLabel.SetText(localizeOption(optionKeys[selectedIndex] ?? optionKeys[0]))
		}
	}
}
