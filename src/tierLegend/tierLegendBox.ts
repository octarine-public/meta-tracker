import {
	getTierBackgroundColor,
	PICK_RATE_COLOR,
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

const BADGE_LABEL_STYLE = [
	"width: 100%",
	"height: 100%",
	"line-height: 16px",
	"font-size: 11px",
	"font-weight: bold",
	"color: #ffffff",
	"text-align: center",
	"vertical-align: center"
]

const DESC_LABEL_STYLE = [
	"width: fill",
	`height: ${TIER_LEGEND_BADGE_SIZE}`,
	`line-height: ${TIER_LEGEND_BADGE_SIZE}`,
	`font-size: ${TIER_LEGEND_DESC_FONT_SIZE}`,
	"color: #cbd5e1",
	"text-align: left",
	"vertical-align: center",
	"text-overflow: shrink"
]

const ROW_STYLE = [
	"width: 100%",
	`height: ${TIER_LEGEND_BADGE_SIZE}`,
	"flow-children: right",
	"vertical-align: center",
	"margin-bottom: 6px"
]

export function setTierLegendRootStyle(legendRoot: Panel): void {
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

function buildLegendRow(
	legendBox: Panel,
	rowID: string,
	badgeID: string,
	badgeLabelID: string,
	badgeColor: string,
	badgeText: string,
	descID: string
): void {
	const row = legendBox.CreateChild("Panel", rowID)
	if (row === undefined) {
		return
	}
	setPanelStyle(row, ROW_STYLE)
	const badge = row.CreateChild("Panel", badgeID)
	if (badge !== undefined) {
		setPanelStyle(badge, [
			`width: ${TIER_LEGEND_BADGE_SIZE}`,
			`height: ${TIER_LEGEND_BADGE_SIZE}`,
			`background-color: ${badgeColor}`,
			"border-radius: 3px",
			"margin-right: 10px"
		])
		const badgeLabel = badge.CreateChild("Label", badgeLabelID)
		if (badgeLabel !== undefined) {
			setPanelStyle(badgeLabel, BADGE_LABEL_STYLE)
			badgeLabel.SetText(badgeText)
		}
	}
	const descLabel = row.CreateChild("Label", descID)
	if (descLabel !== undefined) {
		setPanelStyle(descLabel, DESC_LABEL_STYLE)
	}
}

export function buildTierLegendBox(legendRoot: Panel): void {
	const legendBox = legendRoot.CreateChild("Panel", TIER_LEGEND_BOX_ID)
	if (legendBox === undefined) {
		return
	}
	setPanelStyle(legendBox, [
		`width: ${TIER_LEGEND_WIDTH}`,
		"height: fit-children",
		"flow-children: down",
		"border-radius: 6px",
		"padding: 12px 14px"
	])
	const headerRow = legendBox.CreateChild("Panel", "OctarineTierLegendHeader")
	if (headerRow !== undefined) {
		setPanelStyle(headerRow, [
			"width: 100%",
			"height: 26px",
			"flow-children: right",
			"vertical-align: center"
		])
		const titleLabel = headerRow.CreateChild("Label", "OctarineTierLegendTitle")
		if (titleLabel !== undefined) {
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
	for (const tier of TIER_ORDER) {
		buildLegendRow(
			legendBox,
			`OctarineTierLegendRow_${tier}`,
			`OctarineTierLegendBadge_${tier}`,
			`OctarineTierLegendBadgeLabel_${tier}`,
			getTierBackgroundColor(tier),
			tier,
			`OctarineTierLegendDesc_${tier}`
		)
	}
	buildLegendRow(
		legendBox,
		"OctarineTierLegendPickRateRow",
		"OctarineTierLegendPickRateBadge",
		"OctarineTierLegendPickRateBadgeLabel",
		PICK_RATE_COLOR,
		"P",
		"OctarineTierLegendPickRateDesc"
	)
}

export function updateTierLegendLabels(legendRoot: Panel): void {
	const legendBox = legendRoot.FindChild(TIER_LEGEND_BOX_ID)
	if (legendBox === undefined) {
		return
	}
	legendBox
		.FindChild("OctarineTierLegendHeader")
		?.FindChild("OctarineTierLegendTitle")
		?.SetText(getTierLegendText("Tier legend"))
	legendBox
		.FindChild("OctarineTierLegendPickRateRow")
		?.FindChild("OctarineTierLegendPickRateDesc")
		?.SetText(getTierLegendText("Pick rate legend"))
	for (const tier of TIER_ORDER) {
		legendBox
			.FindChild(`OctarineTierLegendRow_${tier}`)
			?.FindChild(`OctarineTierLegendDesc_${tier}`)
			?.SetText(getTierLegendText(`Tier ${tier}` as TierLegendKey))
	}
}
