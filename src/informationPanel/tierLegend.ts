import { Menu } from "github.com/octarine-public/wrapper/index"

import {
	DEFAULT_PANEL_BG,
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
import { setPanelStyle } from "../panorama/utils"
import { InformationPanelVisibility } from "./types"

type TierLegendKey = "Tier legend" | "Tier S" | "Tier A" | "Tier B" | "Tier C" | "Tier D"

function getTierLegendText(key: TierLegendKey): string {
	return Menu.Localization.Localize(key)
}

function getTierBackgroundColor(tier: string): string {
	return TIER_BG_COLORS[tier] ?? DEFAULT_PANEL_BG
}

export class TierLegendPanel {
	constructor(private readonly visibility: InformationPanelVisibility) {}

	public ensurePanel(heroesPage: IUIPanel): void {
		const state = this.visibility.isVisible()
		let legendRoot = heroesPage.FindChildTraverse(TIER_LEGEND_PANEL_ID)
		if (legendRoot?.BIsLoaded()) {
			if (legendRoot.GetFirstChild() === null) {
				this.fillPanel(legendRoot)
			}
			this.updateLabels(legendRoot)
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
}
