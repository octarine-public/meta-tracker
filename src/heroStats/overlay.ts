import { UnitData } from "github.com/octarine-public/wrapper/index"

import {
	DEFAULT_PANEL_BG,
	getTierBackgroundColor,
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
import { isValidPanel, setPanelStyle } from "../panorama/utils"
import { HeroStatsDataProvider } from "./types"

function setLabelStyle(label: IUIPanel, color: string): void {
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

	public ApplyToGrid(root: IUIPanel): void {
		const cards = this.collectHeroCardPanels(root)
		for (let i = cards.length - 1; i > -1; i--) {
			const card = cards[i]
			const heroID = this.getHeroIDFromCard(card)
			if (heroID === undefined) {
				continue
			}
			const winRate = this.data.getWinRate(heroID)
			const tier = this.data.getTier(heroID)
			const pickRate = this.data.getPickRate(heroID)
			this.applyToCard(card, heroID, winRate, tier, pickRate)
		}
	}

	private collectHeroCardPanels(root: IUIPanel): IUIPanel[] {
		const cards: IUIPanel[] = []
		const grid = root.FindChildTraverse("HeroGrid")
		if (!isValidPanel(grid)) {
			return cards
		}
		const mainContents = grid.FindChild("MainContents")
		if (!isValidPanel(mainContents)) {
			return cards
		}
		const gridCategories = mainContents.FindChild("GridCategories")
		if (!isValidPanel(gridCategories)) {
			return cards
		}
		const n = gridCategories.GetChildCount()
		for (let i = 0; i < n; i++) {
			const category = gridCategories.GetChild(i)
			if (!category) {
				continue
			}
			const listContainer = category.FindChildTraverse("HeroListContainer")
			if (!isValidPanel(listContainer)) {
				continue
			}
			const heroList = listContainer.FindChild("HeroList")
			if (!isValidPanel(heroList)) {
				continue
			}
			const listCount = heroList.GetChildCount()
			for (let j = 0; j < listCount; j++) {
				const card = heroList.GetChild(j)
				if (card) {
					cards.push(card)
				}
			}
		}
		return cards
	}

	private getHeroIDFromCard(card: IUIPanel): number | undefined {
		const contents = card.FindChild("HeroCardContents")
		const parent = contents ?? card
		const image = parent.FindChildTraverse("HeroImage") as Nullable<CImage>
		if (!isValidPanel(image)) {
			return undefined
		}
		const imageSrc = image.GetImage()
		const heroName = imageSrc.split("/").pop()?.split(".")[0]
		if (heroName === undefined) {
			return undefined
		}
		return UnitData.GetHeroID(heroName)
	}

	public applyToCard(
		card: IUIPanel,
		heroID: Nullable<number>,
		winRatePct: number,
		tier: Nullable<string>,
		pickRatePct: number
	): void {
		if (winRatePct === 0 && tier === undefined && pickRatePct <= 0) {
			return
		}
		const container = this.ensureOverlayContainer(card)
		if (!container?.BIsLoaded()) {
			return
		}
		const state = this.data.isVisible()
		container.SetVisible(state)
		const bottomContainer = this.ensureBottomOverlayContainer(card)
		if (bottomContainer?.BIsLoaded()) {
			bottomContainer.SetVisible(state)
		}
		if (!state) {
			return
		}
		const winRateLabel = this.ensureWinRatePanel(container, winRatePct)
		if (winRateLabel?.BIsLoaded()) {
			winRateLabel.SetText(`${winRatePct.toFixed(0)}%`)
		}
		this.ensureTierPanel(container, tier)
		if (bottomContainer?.BIsLoaded() && pickRatePct > 0) {
			const pickRateLabel = this.ensurePickRatePanel(bottomContainer)
			if (pickRateLabel?.BIsLoaded()) {
				pickRateLabel.SetText(`${pickRatePct.toFixed(2)}%`)
			}
		}
	}

	private getOverlayParent(card: IUIPanel): IUIPanel {
		return (
			card.FindChild("HeroCardOverlays") ??
			card.FindChild("HeroCardContents") ??
			card
		)
	}

	private ensureOverlayContainer(card: IUIPanel): Nullable<IUIPanel> {
		const parent = this.getOverlayParent(card)
		let container = parent.FindChildTraverse(OVERLAY_CONTAINER_ID)
		if (container?.BIsLoaded()) {
			return container
		}
		container = Panorama.CreatePanel("Panel", OVERLAY_CONTAINER_ID, parent)
		container?.AddClass(Panorama.MakeSymbol("HeroCardOverlays"))
		if (!container?.BIsLoaded()) {
			return undefined
		}
		setPanelStyle(container, [
			"x: 4px",
			"y: 4px",
			"flow-children: right",
			"width: fit-children",
			`height: ${OVERLAY_PANEL_HEIGHT}`
		])
		return container
	}

	private ensureBottomOverlayContainer(card: IUIPanel): Nullable<IUIPanel> {
		const parent = this.getOverlayParent(card)
		let container = parent.FindChildTraverse(PICK_RATE_CONTAINER_ID)
		if (container?.BIsLoaded()) {
			return container
		}
		container = Panorama.CreatePanel("Panel", PICK_RATE_CONTAINER_ID, parent)
		if (!container?.BIsLoaded()) {
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

	private ensureWinRatePanel(
		container: IUIPanel,
		winRatePct: number
	): Nullable<CLabel> {
		let panel = container.FindChild(WIN_RATE_PANEL_ID)
		if (!panel?.BIsLoaded()) {
			panel = Panorama.CreatePanel("Panel", WIN_RATE_PANEL_ID, container)
			if (!panel?.BIsLoaded()) {
				return undefined
			}
			Panorama.CreatePanel("Label", WIN_RATE_LABEL_ID, panel)
		}
		setPanelStyle(panel, [
			`width: ${WIN_RATE_PANEL_WIDTH}`,
			`height: ${OVERLAY_PANEL_HEIGHT}`,
			`background-color: ${DEFAULT_PANEL_BG}`,
			"border-radius: 1px",
			"z-index: 10"
		])
		const label = panel.FindChild(WIN_RATE_LABEL_ID) as Nullable<CLabel>
		if (label?.BIsLoaded()) {
			setLabelStyle(label, this.getWinRateTextColor(winRatePct))
		}
		return label ?? undefined
	}

	private ensureTierPanel(
		container: IUIPanel,
		tier: string | undefined
	): Nullable<CLabel> {
		let panel = container.FindChild(TIER_PANEL_ID)
		if (!panel?.BIsLoaded()) {
			panel = Panorama.CreatePanel("Panel", TIER_PANEL_ID, container)
			if (!panel?.BIsLoaded()) {
				return undefined
			}
			Panorama.CreatePanel("Label", TIER_LABEL_ID, panel)
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
		const label = panel.FindChild(TIER_LABEL_ID) as Nullable<CLabel>
		if (label?.BIsLoaded()) {
			setLabelStyle(label, "#ffffff")
			label.SetText(tier ?? "")
		}
		return label ?? undefined
	}

	private ensurePickRatePanel(container: IUIPanel): Nullable<CLabel> {
		let panel = container.FindChild(PICK_RATE_PANEL_ID)
		if (!panel?.BIsLoaded()) {
			panel = Panorama.CreatePanel("Panel", PICK_RATE_PANEL_ID, container)
			if (!panel?.BIsLoaded()) {
				return undefined
			}
			Panorama.CreatePanel("Label", PICK_RATE_LABEL_ID, panel)
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
		const label = panel.FindChild(PICK_RATE_LABEL_ID) as Nullable<CLabel>
		if (label?.BIsLoaded()) {
			setLabelStyle(label, PICK_RATE_COLOR)
		}
		return label ?? undefined
	}
}
