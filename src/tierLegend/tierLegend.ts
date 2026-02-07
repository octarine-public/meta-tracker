import {
	SETTINGS_PANEL_ID,
	SETTINGS_PANEL_WIDTH,
	TIER_LEGEND_PANEL_ID
} from "../constants"
import type { DashboardSettingsPanel } from "../dashboardSettings"
import { setPanelStyle } from "../panorama/utils"
import {
	buildTierLegendBox,
	setTierLegendRootStyle,
	updateTierLegendLabels
} from "./tierLegendBox"
import type { TierLegendPanelVisibility } from "./types"

export class TierLegendPanel {
	constructor(
		private readonly visibility: TierLegendPanelVisibility,
		private readonly settingsPanel: DashboardSettingsPanel
	) {}

	public ensurePanel(heroesPage: IUIPanel): void {
		const state = this.visibility.isVisible()
		let legendRoot = heroesPage.FindChildTraverse(TIER_LEGEND_PANEL_ID)
		if (legendRoot?.BIsLoaded()) {
			if (legendRoot.GetFirstChild() === null) {
				this.fillPanel(legendRoot)
			} else {
				this.settingsPanel.reregisterHandlers(legendRoot)
			}
			this.updateLabels(legendRoot)
			this.settingsPanel.updateFromMenu(legendRoot)
			legendRoot.SetVisible(state)
			return
		}
		legendRoot = Panorama.CreatePanel("Panel", TIER_LEGEND_PANEL_ID, heroesPage)
		if (!legendRoot?.BIsLoaded()) {
			return
		}
		setTierLegendRootStyle(legendRoot)
		this.fillPanel(legendRoot)
		this.updateLabels(legendRoot)
		this.settingsPanel.updateFromMenu(legendRoot)
		legendRoot.SetVisible(state)
	}

	private fillPanel(legendRoot: IUIPanel): void {
		buildTierLegendBox(legendRoot)
		const settingsPanelEl = Panorama.CreatePanel(
			"Panel",
			SETTINGS_PANEL_ID,
			legendRoot
		)
		if (settingsPanelEl?.BIsLoaded()) {
			setPanelStyle(settingsPanelEl, [
				`width: ${SETTINGS_PANEL_WIDTH}`,
				"height: fit-children",
				"flow-children: down",
				"border-radius: 6px",
				"padding: 12px 14px",
				"margin-top: 10px"
			])
			this.settingsPanel.appendTo(legendRoot, settingsPanelEl)
		}
	}

	private updateLabels(legendRoot: IUIPanel): void {
		updateTierLegendLabels(legendRoot)
	}
}
