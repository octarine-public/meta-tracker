import { Menu } from "github.com/octarine-public/wrapper/index"

import {
	getTierBackgroundColor,
	TIER_LEGEND_BADGE_SIZE,
	TIER_LEGEND_BOX_ID,
	TIER_LEGEND_DESC_FONT_SIZE,
	TIER_LEGEND_MARGIN_LEFT,
	TIER_LEGEND_MARGIN_TOP,
	TIER_LEGEND_TITLE_FONT_SIZE,
	TIER_LEGEND_WIDTH,
	TIER_ORDER
} from "../constants"
import { setPanelStyle } from "../panorama/utils"

type TierLegendKey =
	| "Tier legend"
	| "Tier S"
	| "Tier A"
	| "Tier B"
	| "Tier C"
	| "Tier D"
	| "Tier ?"
	| "Pick rate legend"

function getTierLegendText(key: TierLegendKey): string {
	return Menu.Localization.Localize(key)
}

export function setTierLegendRootStyle(legendRoot: IUIPanel): void {
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

export function buildTierLegendBox(legendRoot: IUIPanel): void {
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
	const headerRow = Panorama.CreatePanel("Panel", "OctarineTierLegendHeader", legendBox)
	if (headerRow?.BIsLoaded()) {
		setPanelStyle(headerRow, [
			"width: 100%",
			"height: 26px",
			"flow-children: right",
			"vertical-align: center"
		])
		const titleLabel = Panorama.CreatePanel<CLabel>(
			"Label",
			"OctarineTierLegendTitle",
			headerRow
		)
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
	const pickRateHintLabel = Panorama.CreatePanel<CLabel>(
		"Label",
		"OctarineTierLegendPickRateHint",
		legendBox
	)
	if (pickRateHintLabel?.BIsLoaded()) {
		setPanelStyle(pickRateHintLabel, [
			"width: 100%",
			"height: fit-children",
			"font-size: 12px",
			"color: #94a3b8",
			"text-align: left",
			"margin-bottom: 10px",
			"text-overflow: shrink"
		])
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
			const badgeLabel = Panorama.CreatePanel<CLabel>(
				"Label",
				`OctarineTierLegendBadgeLabel_${tier}`,
				badge
			)
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
		const descLabel = Panorama.CreatePanel<CLabel>(
			"Label",
			`OctarineTierLegendDesc_${tier}`,
			row
		)
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

export function updateTierLegendLabels(legendRoot: IUIPanel): void {
	const titleLabel = legendRoot.FindChildTraverse<CLabel>("OctarineTierLegendTitle")
	if (titleLabel?.BIsLoaded()) {
		titleLabel.SetText(getTierLegendText("Tier legend"))
	}
	const pickRateHint = legendRoot.FindChildTraverse<CLabel>(
		"OctarineTierLegendPickRateHint"
	)
	if (pickRateHint?.BIsLoaded()) {
		pickRateHint.SetText(getTierLegendText("Pick rate legend"))
	}
	const tierKey = (tier: string): TierLegendKey => `Tier ${tier}` as TierLegendKey
	for (const tier of TIER_ORDER) {
		const descLabel = legendRoot.FindChildTraverse<CLabel>(
			`OctarineTierLegendDesc_${tier}`
		)
		if (descLabel?.BIsLoaded()) {
			descLabel.SetText(getTierLegendText(tierKey(tier)))
		}
	}
}
