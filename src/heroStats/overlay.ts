import {
	DEFAULT_PANEL_BG,
	getTierBackgroundColor,
	HERO_CARD_OVERLAYS_CLASS,
	HERO_ID_ATTR,
	OVERLAY_CONTAINER_ID,
	OVERLAY_PANEL_HEIGHT,
	PICK_RATE_COLOR,
	PICK_RATE_CONTAINER_ID,
	PICK_RATE_LABEL_ID,
	PICK_RATE_PANEL_ID,
	PICK_RATE_PANEL_WIDTH,
	TIER_LABEL_ID,
	TIER_PANEL_ID,
	TIER_PANEL_WIDTH,
	WIN_RATE_COLORS,
	WIN_RATE_LABEL_ID,
	WIN_RATE_PANEL_ID,
	WIN_RATE_PANEL_WIDTH
} from "../constants"
import { setPanelStyle } from "../panorama/utils"
import { HeroStatsDataProvider } from "./types"

function setLabelStyle(label: Panel, color: string): void {
	setPanelStyle(label, [
		"width: 100%",
		"height: 100%",
		"font-size: 12px",
		`color: ${color}`,
		"text-align: center",
		"vertical-align: center",
		"text-shadow: 0 1px 2px rgba(0,0,0,0.8)"
	])
}

export class HeroStatsOverlay {
	constructor(private readonly data: HeroStatsDataProvider) {}

	public ApplyToGrid(panoramaWindow: PanoramaWindow): void {
		const cards = this.collectHeroCardPanels(panoramaWindow)
		for (let i = cards.length - 1; i > -1; i--) {
			const card = cards[i]
			const heroID = this.getHeroIDFromCard(card)
			if (heroID === undefined) {
				continue
			}
			const tier = this.data.getTier(heroID)
			const winRate = this.data.getWinRate(heroID)
			const pickRate = this.data.getPickRate(heroID)
			this.applyToCard(card, winRate, tier, pickRate)
		}
	}

	private collectHeroCardPanels(panoramaWindow: PanoramaWindow): Panel[] {
		const cards: Panel[] = []
		const grid = Source2SDK.Panorama.Find(panoramaWindow, "HeroGrid")
		if (grid === undefined || !grid.IsVisible) {
			return cards
		}
		const gridCategories = grid.FindChild("MainContents")?.FindChild("GridCategories")
		if (gridCategories === undefined) {
			return cards
		}
		const n = gridCategories.ChildCount
		for (let i = 0; i < n; i++) {
			const heroList = gridCategories
				.Child(i)
				?.Find("HeroListContainer")
				?.FindChild("HeroList")
			if (heroList === undefined) {
				continue
			}
			const listCount = heroList.ChildCount
			for (let j = 0; j < listCount; j++) {
				const card = heroList.Child(j)
				if (card !== undefined) {
					cards.push(card)
				}
			}
		}
		return cards
	}

	private getHeroIDFromCard(card: Panel): number | undefined {
		const heroID = (card.FindChild("HeroCardContents") ?? card).Attribute(
			HERO_ID_ATTR,
			"-1"
		)
		return heroID === "-1" ? undefined : Number(heroID)
	}
	public applyToCard(
		card: Panel,
		winRatePct: number,
		tier: Nullable<string>,
		pickRatePct: number
	): void {
		if (winRatePct === 0 && tier === undefined && pickRatePct <= 0) {
			return
		}
		const parent = this.getOverlayParent(card)
		const container = this.ensureOverlayContainer(parent)
		if (container === undefined) {
			return
		}
		const state = this.data.isVisible()
		container.SetVisible(state)
		const bottomContainer = this.ensureBottomOverlayContainer(parent)
		bottomContainer?.SetVisible(state)
		if (!state) {
			return
		}
		this.ensureWinRatePanel(container, winRatePct)?.SetText(
			`${winRatePct.toFixed(0)}%`
		)
		this.ensureTierPanel(container, tier)?.SetVisible(
			tier !== undefined && tier !== null
		)
		if (bottomContainer !== undefined && pickRatePct > 0) {
			this.ensurePickRatePanel(bottomContainer)?.SetText(
				`${pickRatePct.toFixed(2)}%`
			)
		}
	}

	private getOverlayParent(card: Panel): Panel {
		return (
			card.FindChild("HeroCardOverlays") ??
			card.FindChild("HeroCardContents") ??
			card
		)
	}

	private ensureOverlayContainer(parent: Panel): Nullable<Panel> {
		const existing = parent.FindChild(OVERLAY_CONTAINER_ID)
		if (existing !== undefined) {
			return existing
		}
		const container = parent.CreateChild("Panel", OVERLAY_CONTAINER_ID)
		if (container === undefined) {
			return undefined
		}
		container.AddClass(HERO_CARD_OVERLAYS_CLASS)
		setPanelStyle(container, [
			"x: 4px",
			"y: 4px",
			"flow-children: right",
			"width: fit-children",
			`height: ${OVERLAY_PANEL_HEIGHT}`
		])
		return container
	}

	private ensureBottomOverlayContainer(parent: Panel): Nullable<Panel> {
		const existing = parent.FindChild(PICK_RATE_CONTAINER_ID)
		if (existing !== undefined) {
			return existing
		}
		const container = parent.CreateChild("Panel", PICK_RATE_CONTAINER_ID)
		if (container === undefined) {
			return undefined
		}
		setPanelStyle(container, [
			"width: fit-children",
			`height: ${OVERLAY_PANEL_HEIGHT}`,
			"horizontal-align: right",
			"vertical-align: bottom",
			"margin-right: 4px",
			"margin-bottom: 4px",
			"flow-children: right"
		])
		return container
	}

	private getWinRateTextColor(pct: number): string {
		if (pct < 50) {
			return WIN_RATE_COLORS.low
		}
		if (pct === 50) {
			return WIN_RATE_COLORS.mid
		}
		return WIN_RATE_COLORS.high
	}

	private ensureLabeledPanel(
		container: Panel,
		id: string,
		labelID: string
	): Nullable<Panel> {
		const existing = container.FindChild(id)
		if (existing !== undefined) {
			return existing
		}
		const panel = container.CreateChild("Panel", id)
		panel?.CreateChild("Label", labelID)
		return panel
	}

	private ensureWinRatePanel(container: Panel, winRatePct: number): Nullable<Panel> {
		const panel = this.ensureLabeledPanel(
			container,
			WIN_RATE_PANEL_ID,
			WIN_RATE_LABEL_ID
		)
		if (panel === undefined) {
			return undefined
		}
		setPanelStyle(panel, [
			`width: ${WIN_RATE_PANEL_WIDTH}`,
			`height: ${OVERLAY_PANEL_HEIGHT}`,
			`background-color: ${DEFAULT_PANEL_BG}`,
			"border-radius: 1px",
			"z-index: 10"
		])
		const label = panel.FindChild(WIN_RATE_LABEL_ID)
		if (label !== undefined) {
			setLabelStyle(label, this.getWinRateTextColor(winRatePct))
		}
		return label
	}

	private ensureTierPanel(container: Panel, tier: Nullable<string>): Nullable<Panel> {
		const panel = this.ensureLabeledPanel(container, TIER_PANEL_ID, TIER_LABEL_ID)
		if (panel === undefined) {
			return undefined
		}
		setPanelStyle(panel, [
			`width: ${TIER_PANEL_WIDTH}`,
			`height: ${OVERLAY_PANEL_HEIGHT}`,
			`background-color: ${getTierBackgroundColor(tier ?? "?")}`,
			"border-radius: 1px",
			"text-align: center",
			"vertical-align: center",
			"z-index: 10"
		])
		const label = panel.FindChild(TIER_LABEL_ID)
		if (label !== undefined) {
			setLabelStyle(label, "#ffffff")
			label.SetText(tier ?? "")
		}
		return panel
	}

	private ensurePickRatePanel(container: Panel): Nullable<Panel> {
		const panel = this.ensureLabeledPanel(
			container,
			PICK_RATE_PANEL_ID,
			PICK_RATE_LABEL_ID
		)
		if (panel === undefined) {
			return undefined
		}
		setPanelStyle(panel, [
			`width: ${PICK_RATE_PANEL_WIDTH}`,
			`height: ${OVERLAY_PANEL_HEIGHT}`,
			`background-color: ${DEFAULT_PANEL_BG}`,
			"border-radius: 1px",
			"text-align: center",
			"vertical-align: center",
			"z-index: 10"
		])
		const label = panel.FindChild(PICK_RATE_LABEL_ID)
		if (label !== undefined) {
			setLabelStyle(label, PICK_RATE_COLOR)
		}
		return label
	}
}
