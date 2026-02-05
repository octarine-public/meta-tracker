import "./translations"

import {
	DOTAGameUIState,
	EventsSDK,
	GameRules,
	GameState,
	UnitData
} from "github.com/octarine-public/wrapper/index"

import { MenuManager } from "./menu"
import {
	getCurrentHeroPosition,
	getCurrentWinRateRank,
	getHeroTier,
	getWinRatesByRankAndPosition
} from "./winRates"

new (class CMetaTracker {
	private readonly DEFAULT_WIN_RATE = 0
	private readonly OVERLAY_CONTAINER_ID = "OctarineWinRateOverlay"
	private readonly WIN_RATE_PANEL_ID = "OctarineWinRatePanel"
	private readonly WIN_RATE_LABEL_ID = "OctarineWinRate"
	private readonly TIER_PANEL_ID = "OctarineTierPanel"
	private readonly TIER_LABEL_ID = "OctarineTierLabel"
	/** Fixed sizes for overlay panels */
	private readonly OVERLAY_PANEL_HEIGHT = "14px"
	private readonly WIN_RATE_PANEL_WIDTH = "28px"
	private readonly TIER_PANEL_WIDTH = "15px"

	private readonly menu = new MenuManager()
	private isDestroyingHUD = false

	constructor() {
		this.menu.State.OnValue(() => this.ApplyWinRatesToHeroGrid())
		EventsSDK.on("PostDataUpdate", this.OnPostDataUpdate.bind(this))
		Panorama.SetWindowDestroyCallback(this.OnWindowDestroy.bind(this))
		Panorama.SetWindowCreateCallback(this.OnWindowCreate.bind(this))
	}

	private isValidPanel(panel: Nullable<IUIPanel>): panel is IUIPanel {
		return (
			panel !== undefined &&
			panel !== null &&
			panel.BIsLoaded() &&
			panel.GetContentWidth() !== 0 &&
			panel.GetContentHeight() !== 0
		)
	}

	private setPanelStyle(panel: IUIPanel, styleParts: string[]): void {
		const style = styleParts.join("; ") + ";"
		const sym = Panorama.MakeSymbol("style")
		if (sym >= 0) {
			panel.BSetProperty(sym, style)
		}
	}

	private setLabelStyle(label: IUIPanel, color: string): void {
		this.setPanelStyle(label, [
			"width: 100%",
			"height: 100%",
			"font-size: 12px",
			"color: " + color,
			"text-align: center",
			"vertical-align: center",
			"text-shadow: 0 1px 2px rgba(0,0,0,0.8)"
		])
	}

	private collectHeroCardPanels(root: IUIPanel): IUIPanel[] {
		const cards: IUIPanel[] = []
		const grid = root.FindChildTraverse("HeroGrid")
		if (!this.isValidPanel(grid)) {
			return cards
		}
		const mainContents = grid.FindChild("MainContents")
		if (!this.isValidPanel(mainContents)) {
			return cards
		}
		const gridCategories = mainContents.FindChild("GridCategories")
		if (!this.isValidPanel(gridCategories)) {
			return cards
		}
		const n = gridCategories.GetChildCount()
		for (let i = 0; i < n; i++) {
			const category = gridCategories.GetChild(i)
			if (!category) {
				continue
			}
			const listContainer = category.FindChildTraverse("HeroListContainer")
			if (!this.isValidPanel(listContainer)) {
				continue
			}
			const heroList = listContainer.FindChild("HeroList")
			if (!this.isValidPanel(heroList)) {
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

	private getWinRateTextColor(pct: number): string {
		if (pct < 50) {
			return "#f87171"
		}
		if (pct === 50) {
			return "#fb923c"
		}
		return "#4ade80"
	}

	private setWinRatePanelStyle(panel: IUIPanel, _winRatePct: number): void {
		this.setPanelStyle(panel, [
			"width: " + this.WIN_RATE_PANEL_WIDTH,
			"height: " + this.OVERLAY_PANEL_HEIGHT,
			"background-color: rgba(0,0,0,0.85)",
			"border-radius: 1px",
			"z-index: 10"
		])
	}

	private setWinRateLabelStyle(label: IUIPanel, winRatePct: number): void {
		this.setLabelStyle(label, this.getWinRateTextColor(winRatePct))
	}

	private getTierBackgroundColor(tier: string): string {
		switch (tier) {
			case "S":
				return "rgba(124,58,237,0.9)"
			case "A":
				return "rgba(59,130,246,0.9)"
			case "B":
				return "rgba(20,184,166,0.9)"
			case "C":
				return "rgba(249,115,22,0.9)"
			case "D":
				return "rgba(239,68,68,0.9)"
			default:
				return "rgba(0,0,0,0.85)"
		}
	}

	private setTierPanelStyle(panel: IUIPanel, tier: string): void {
		this.setPanelStyle(panel, [
			"width: " + this.TIER_PANEL_WIDTH,
			"height: " + this.OVERLAY_PANEL_HEIGHT,
			"background-color: " + this.getTierBackgroundColor(tier),
			"border-radius: 1px",
			"text-align: center",
			"vertical-align: center",
			"z-index: 10"
		])
	}

	private setTierLabelStyle(label: IUIPanel, _tier: string): void {
		this.setLabelStyle(label, "#ffffff")
	}

	private getHeroIDFromCard(card: IUIPanel): number | undefined {
		const contents = card.FindChild("HeroCardContents")
		const parent = contents ?? card
		const image = parent.FindChildTraverse("HeroImage") as Nullable<CImage>
		if (!this.isValidPanel(image)) {
			return undefined
		}
		const imageSrc = image.GetImage()
		const heroName = imageSrc.split("/").pop()?.split(".")[0]
		if (heroName === undefined) {
			return undefined
		}
		return UnitData.GetHeroID(heroName)
	}

	private ensureOverlayContainer(card: IUIPanel): Nullable<IUIPanel> {
		const overlays = card.FindChild("HeroCardOverlays")
		const contents = card.FindChild("HeroCardContents")
		const parent = overlays ?? contents ?? card

		let container = parent.FindChildTraverse(this.OVERLAY_CONTAINER_ID)
		if (container && container.BIsLoaded()) {
			return container
		}
		container = Panorama.CreatePanel("Panel", this.OVERLAY_CONTAINER_ID, parent)
		container?.AddClass(Panorama.MakeSymbol("HeroCardOverlays"))
		if (!container || !container.BIsLoaded()) {
			return undefined
		}

		this.setPanelStyle(container, [
			"x: 4px",
			"y: 4px",
			"flow-children: right",
			"width: fit-children",
			"height: " + this.OVERLAY_PANEL_HEIGHT
		])
		return container
	}

	private ensureWinRatePanel(
		container: IUIPanel,
		winRatePct: number
	): Nullable<CLabel> {
		let panel = container.FindChild(this.WIN_RATE_PANEL_ID)
		if (!panel || !panel.BIsLoaded()) {
			panel = Panorama.CreatePanel("Panel", this.WIN_RATE_PANEL_ID, container)
			if (!panel || !panel.BIsLoaded()) {
				return undefined
			}
			const labelPanel = Panorama.CreatePanel(
				"Label",
				this.WIN_RATE_LABEL_ID,
				panel
			)
			if (!labelPanel || !labelPanel.BIsLoaded()) {
				return undefined
			}
		}
		this.setWinRatePanelStyle(panel, winRatePct)
		const label = panel.FindChild(this.WIN_RATE_LABEL_ID) as Nullable<CLabel>
		if (!label) {
			return undefined
		}
		if (label.BIsLoaded()) {
			this.setWinRateLabelStyle(label, winRatePct)
		}
		return label
	}

	private ensureTierPanel(
		container: IUIPanel,
		tier: string | undefined
	): Nullable<CLabel> {
		let panel = container.FindChild(this.TIER_PANEL_ID)
		if (!panel || !panel.BIsLoaded()) {
			panel = Panorama.CreatePanel("Panel", this.TIER_PANEL_ID, container)
			if (!panel || !panel.BIsLoaded()) {
				return undefined
			}
			const labelPanel = Panorama.CreatePanel("Label", this.TIER_LABEL_ID, panel)
			if (!labelPanel || !labelPanel.BIsLoaded()) {
				return undefined
			}
		}
		this.setTierPanelStyle(panel, tier ?? "?")
		const label = panel.FindChild(this.TIER_LABEL_ID) as Nullable<CLabel>
		if (!label) {
			return undefined
		}
		if (label.BIsLoaded()) {
			if (tier !== undefined) {
				this.setTierLabelStyle(label, tier)
				label.SetText(tier)
			} else {
				label.SetText("")
			}
		}
		return label
	}

	private getWinRateByHeroId(heroID: number | undefined): number {
		if (heroID === undefined) {
			return this.DEFAULT_WIN_RATE
		}
		const rank = getCurrentWinRateRank()
		const position = getCurrentHeroPosition()
		const byHero = getWinRatesByRankAndPosition(rank, position)
		return byHero?.get(heroID) ?? this.DEFAULT_WIN_RATE
	}

	private getTierForHero(heroID: number | undefined): string | undefined {
		if (heroID === undefined) {
			return undefined
		}
		const rank = getCurrentWinRateRank()
		const position = getCurrentHeroPosition()
		return getHeroTier(heroID, rank, position)
	}

	private setOverlayVisibility(container: IUIPanel, visible: boolean): void {
		const visibility = visible ? "visible" : "collapse"
		this.setPanelStyle(container, [
			"x: 4px",
			"y: 4px",
			"flow-children: right",
			"width: fit-children",
			"height: " + this.OVERLAY_PANEL_HEIGHT,
			"visibility: " + visibility
		])
	}

	private applyWinRateToCard(
		card: IUIPanel,
		winRatePct: number,
		heroID: number | undefined
	): void {
		const tier = this.getTierForHero(heroID)
		if (winRatePct === 0 && tier === undefined) {
			return
		}
		const container = this.ensureOverlayContainer(card)
		if (!container || !container.BIsLoaded()) {
			return
		}
		this.setOverlayVisibility(container, true)
		const winRateLabel = this.ensureWinRatePanel(container, winRatePct)
		if (!winRateLabel || !winRateLabel.BIsLoaded()) {
			return
		}
		winRateLabel.SetText(winRatePct.toFixed(0) + "%")
		this.ensureTierPanel(container, tier)
	}

	public ApplyWinRatesToHeroGrid(state: DOTAGameUIState = GameState.UIState): void {
		const isDashboard = state !== DOTAGameUIState.DOTA_GAME_UI_DOTA_INGAME
		const root = !isDashboard
			? Panorama.FindRootPanel("DotaHud")
			: Panorama.FindRootPanel("DotaDashboard")
		if (!this.isValidPanel(root)) {
			return
		}
		if (this.isDestroyingHUD && !isDashboard) {
			return
		}
		const cards = this.collectHeroCardPanels(root)
		for (const card of cards) {
			const heroID = this.getHeroIDFromCard(card)
			const winRate = this.getWinRateByHeroId(heroID)
			this.applyWinRateToCard(card, winRate, heroID)
		}
	}

	private OnPostDataUpdate(): void {
		const isDashboard = GameState.UIState !== DOTAGameUIState.DOTA_GAME_UI_DOTA_INGAME
		if (GameRules && !isDashboard && GameRules.IsInGame) {
			return
		}
		this.ApplyWinRatesToHeroGrid()
	}

	private OnWindowDestroy(name: string): void {
		if (name === "DotaHud") {
			this.isDestroyingHUD = true
		}
	}

	private OnWindowCreate(name: string): void {
		if (name === "DotaHud") {
			this.isDestroyingHUD = false
		}
	}
})()
