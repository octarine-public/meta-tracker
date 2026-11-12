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
	SETTINGS_VALUE_FONT_SIZE
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
	legendRoot: Panel
	listPanel?: Panel
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
	public onSettingsActivated(id: string): void {
		if (id.includes("ListOpt_")) {
			const idx = id.indexOf("ListOpt_")
			const rowId = id.slice(0, idx)
			const optIndex = parseInt(id.slice(idx + "ListOpt_".length), 10)
			const action = this.settingsActions.get(rowId)
			if (action?.type === "list" && action.listPanel?.IsValid === true) {
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
			} else if (action.listPanel?.IsValid === true) {
				const isOpen = this.openListRowIds.has(rowId)
				for (const rid of this.openListRowIds) {
					this.rowOf(action.legendRoot, rid)
						?.FindChild(`${rid}List`)
						?.SetVisible(false)
				}
				this.openListRowIds.clear()
				if (!isOpen) {
					action.listPanel.SetVisible(true)
					this.openListRowIds.add(rowId)
				}
			}
		}
	}

	public appendTo(legendRoot: Panel, settingsPanel: Panel): void {
		this.handlers.clear()
		this.settingsActions.clear()
		this.openListRowIds.clear()
		const container = settingsPanel.CreateChild("Panel", SETTINGS_CONTAINER_ID)
		if (container === undefined) {
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

	public reregisterHandlers(legendRoot: Panel): void {
		const container = legendRoot
			.FindChild(SETTINGS_PANEL_ID)
			?.FindChild(SETTINGS_CONTAINER_ID)
		if (container === undefined) {
			return
		}
		for (const config of this.getConfig()) {
			const row = container.FindChild(config.rowId)
			const valuePanel = row
				?.FindChild(`${config.rowId}TopRow`)
				?.FindChild(`${config.rowId}Value`)
			if (row === undefined || valuePanel === undefined) {
				continue
			}
			const useList = config.optionKeys.length > this.DROPDOWN_LIST_THRESHOLD
			const listPanel = row.FindChild(`${config.rowId}List`)
			if (useList && listPanel !== undefined) {
				this.settingsActions.set(config.rowId, {
					type: "list",
					onSelect: config.onSelect,
					getSelectedIndex: config.getSelectedIndex,
					optionKeys: config.optionKeys,
					legendRoot,
					listPanel
				})
				this.registerHandler(valuePanel, `${config.rowId}Value`)
				for (let i = 0; i < config.optionKeys.length; i++) {
					const optId = `${config.rowId}ListOpt_${i}`
					const optPanel = listPanel.FindChild(optId)
					if (optPanel !== undefined) {
						this.registerHandler(optPanel, optId)
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
				this.registerHandler(valuePanel, `${config.rowId}Value`)
			}
		}
	}

	public updateFromMenu(legendRoot: Panel): void {
		this.updateRowLabels(legendRoot)
		const isDota2 = this.menu.isDota2Source
		this.updateRowSelection(
			legendRoot,
			"OctarineStatsType",
			[...STATS_TYPE_OPTIONS],
			this.menu.StatsTypeIndex
		)
		this.updateOptionalRow(
			legendRoot,
			"OctarinePeriod",
			!isDota2,
			[...PeriodOptions],
			this.menu.stratzMenu.PeriodIndex
		)
		this.updateOptionalRow(
			legendRoot,
			"OctarineRankStratz",
			!isDota2,
			[...RankOptions],
			this.menu.stratzMenu.RankIndex
		)
		this.updateOptionalRow(
			legendRoot,
			"OctarineRankDota2",
			isDota2,
			[...RANKS_DOTA_PLUS],
			this.menu.dotaPlusMenu.RankIndex
		)
		this.updateOptionalRow(
			legendRoot,
			"OctarinePosition",
			!isDota2,
			[...PositionLabelList],
			this.menu.stratzMenu.PositionIndex
		)
	}

	private rowOf(legendRoot: Panel, rowId: string): Nullable<Panel> {
		return legendRoot
			.FindChild(SETTINGS_PANEL_ID)
			?.FindChild(SETTINGS_CONTAINER_ID)
			?.FindChild(rowId)
	}

	private updateOptionalRow(
		legendRoot: Panel,
		rowId: string,
		shown: boolean,
		optionKeys: readonly string[],
		selectedIndex: number
	): void {
		const row = this.rowOf(legendRoot, rowId)
		if (row === undefined) {
			return
		}
		row.SetVisible(shown)
		if (shown) {
			this.updateRowSelection(legendRoot, rowId, optionKeys, selectedIndex)
		}
	}

	private registerHandler(panel: Panel, id: string): void {
		if (this.handlers.has(id)) {
			return
		}
		const handle = panel.OnEvent("Activated", () => this.onSettingsActivated(id))
		if (handle !== undefined) {
			this.handlers.set(id, handle)
		}
	}

	private createSettingsRow(
		legendRoot: Panel,
		container: Panel,
		rowId: string,
		labelKey: SettingsRowKey,
		optionKeys: readonly string[],
		getSelectedIndex: () => number,
		onSelect: (index: number) => void
	): void {
		const row = container.CreateChild("Panel", rowId)
		if (row === undefined) {
			return
		}
		setPanelStyle(row, [
			"width: 100%",
			"height: fit-children",
			"flow-children: down",
			"margin-bottom: 6px"
		])
		const topRow = row.CreateChild("Panel", `${rowId}TopRow`)
		if (topRow === undefined) {
			return
		}
		setPanelStyle(topRow, [
			"width: 100%",
			`height: ${SETTINGS_ROW_HEIGHT}`,
			"flow-children: right",
			"vertical-align: center"
		])
		const label = topRow.CreateChild("Label", `${rowId}Label`)
		if (label !== undefined) {
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
		const valuePanel = this.createValuePanel(
			topRow,
			rowId,
			optionKeys,
			getSelectedIndex
		)
		if (valuePanel === undefined) {
			return
		}
		const listPanel =
			optionKeys.length > this.DROPDOWN_LIST_THRESHOLD
				? this.createListPanel(row, rowId, optionKeys)
				: undefined
		this.settingsActions.set(rowId, {
			type: listPanel !== undefined ? "list" : "cycle",
			onSelect,
			getSelectedIndex,
			optionKeys,
			legendRoot,
			listPanel
		})
		this.registerHandler(valuePanel, `${rowId}Value`)
	}

	private createValuePanel(
		parent: Panel,
		rowId: string,
		optionKeys: readonly string[],
		getSelectedIndex: () => number
	): Nullable<Panel> {
		const valuePanel = parent.CreateChild("Panel", `${rowId}Value`)
		if (valuePanel === undefined) {
			return undefined
		}
		valuePanel.SetClickable(true)
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
		const valueLabel = valuePanel.CreateChild("Label", `${rowId}ValueLabel`)
		if (valueLabel !== undefined) {
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
		return valuePanel
	}

	private createListPanel(
		row: Panel,
		rowId: string,
		optionKeys: readonly string[]
	): Nullable<Panel> {
		const listPanel = row.CreateChild("Panel", `${rowId}List`)
		if (listPanel === undefined) {
			return undefined
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
			const optId = `${rowId}ListOpt_${i}`
			const optPanel = listPanel.CreateChild("Panel", optId)
			if (optPanel === undefined) {
				continue
			}
			optPanel.SetClickable(true)
			setPanelStyle(optPanel, [
				"width: 100%",
				`height: ${SETTINGS_LIST_ITEM_HEIGHT}`,
				"flow-children: right",
				"padding: 2px 6px",
				"background-color: transparent"
			])
			const optLabel = optPanel.CreateChild("Label", `${rowId}ListOptLabel_${i}`)
			if (optLabel !== undefined) {
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
			this.registerHandler(optPanel, optId)
		}
		return listPanel
	}

	private updateRowLabels(legendRoot: Panel): void {
		for (const [rowId, labelKey] of Object.entries(SETTINGS_ROW_LABEL_KEYS)) {
			this.rowOf(legendRoot, rowId)
				?.FindChild(`${rowId}TopRow`)
				?.FindChild(`${rowId}Label`)
				?.SetText(localizeLabel(labelKey))
		}
		for (const [rowId, action] of this.settingsActions) {
			if (action.type !== "list" || action.listPanel === undefined) {
				continue
			}
			const { optionKeys, listPanel } = action
			for (let i = 0; i < optionKeys.length; i++) {
				listPanel
					.FindChild(`${rowId}ListOpt_${i}`)
					?.FindChild(`${rowId}ListOptLabel_${i}`)
					?.SetText(localizeOption(optionKeys[i]))
			}
		}
	}

	private updateRowSelection(
		legendRoot: Panel,
		rowId: string,
		optionKeys: readonly string[],
		selectedIndex: number
	): void {
		this.rowOf(legendRoot, rowId)
			?.FindChild(`${rowId}TopRow`)
			?.FindChild(`${rowId}Value`)
			?.FindChild(`${rowId}ValueLabel`)
			?.SetText(localizeOption(optionKeys[selectedIndex] ?? optionKeys[0]))
	}
}
