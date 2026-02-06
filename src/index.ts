import "./translations"

import {
	DOTAGameUIState,
	Events,
	EventsSDK,
	GameRules,
	GameState,
	UnitData
} from "github.com/octarine-public/wrapper/index"

import {
	DEFAULT_PANEL_BG,
	DEFAULT_WIN_RATE,
	OVERLAY_CONTAINER_ID,
	OVERLAY_PANEL_HEIGHT,
	PICK_RATE_COLOR,
	PICK_RATE_CONTAINER_ID,
	PICK_RATE_LABEL_ID,
	PICK_RATE_PANEL_ID,
	PICK_RATE_PANEL_WIDTH,
	TIER_BG_COLORS,
	TIER_LABEL_ID,
	TIER_PANEL_ID,
	TIER_PANEL_WIDTH,
	WIN_RATE_COLORS,
	WIN_RATE_LABEL_ID,
	WIN_RATE_PANEL_ID,
	WIN_RATE_PANEL_WIDTH
} from "./constants"
import { getPickRateForHero, getWinRateForHero, setDotaPlusData } from "./dotaPlusData"
import { MenuManager } from "./menu"
import { HeroDataResponse } from "./models/heroDataTypes"
import {
	getCurrentHeroPosition,
	getCurrentWinRateRank,
	getHeroTier,
	getPickRatesByRankAndPosition,
	getWinRatesByRankAndPosition
} from "./winRates/index"

new (class CMetaTracker {
	private readonly menu = new MenuManager()
	private isDestroyingHUD = false

	constructor() {
		this.menu.State.OnValue(() => this.applyWinRatesToHeroGrid())
		this.menu.setOnDotaPlusRankChanged(() => this.applyWinRatesToHeroGrid())
		EventsSDK.on("PostDataUpdate", this.OnPostDataUpdate.bind(this))
		Events.on("PanoramaWindowDestroy", this.PanoramaWindowDestroy.bind(this))
		Events.on("PanoramaWindowCreate", this.PanoramaWindowCreate.bind(this))
		Events.on(
			"DOTAFullHeroGlobalDataUpdated",
			this.OnFullHeroGlobalDataUpdated.bind(this)
		)
	}
	protected OnPostDataUpdate(): void {
		const isDashboard = GameState.UIState !== DOTAGameUIState.DOTA_GAME_UI_DOTA_INGAME
		if (GameRules && !isDashboard && GameRules.IsInGame) {
			return
		}
		this.applyWinRatesToHeroGrid()
	}
	protected PanoramaWindowDestroy(name: string): void {
		if (name === "DotaHud") {
			this.isDestroyingHUD = true
		}
	}
	protected PanoramaWindowCreate(name: string): void {
		if (name === "DotaHud") {
			this.isDestroyingHUD = false
		}
	}
	protected OnFullHeroGlobalDataUpdated(arr: HeroDataResponse[]): void {
		setDotaPlusData(arr)
		this.applyWinRatesToHeroGrid()
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
			`color: ${color}`,
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
			return WIN_RATE_COLORS.low
		}
		if (pct === 50) {
			return WIN_RATE_COLORS.mid
		}
		return WIN_RATE_COLORS.high
	}
	private setWinRatePanelStyle(panel: IUIPanel): void {
		this.setPanelStyle(panel, [
			`width: ${WIN_RATE_PANEL_WIDTH}`,
			`height: ${OVERLAY_PANEL_HEIGHT}`,
			`background-color: ${DEFAULT_PANEL_BG}`,
			"border-radius: 1px",
			"z-index: 10"
		])
	}
	private setWinRateLabelStyle(label: IUIPanel, winRatePct: number): void {
		this.setLabelStyle(label, this.getWinRateTextColor(winRatePct))
	}
	private getTierBackgroundColor(tier: string): string {
		return TIER_BG_COLORS[tier] ?? DEFAULT_PANEL_BG
	}
	private setTierPanelStyle(panel: IUIPanel, tier: string): void {
		this.setPanelStyle(panel, [
			`width: ${TIER_PANEL_WIDTH}`,
			`height: ${OVERLAY_PANEL_HEIGHT}`,
			`background-color: ${this.getTierBackgroundColor(tier)}`,
			"border-radius: 1px",
			"text-align: center",
			"vertical-align: center",
			"z-index: 10"
		])
	}
	private setTierLabelStyle(label: IUIPanel): void {
		this.setLabelStyle(label, "#ffffff")
	}
	private setPickRatePanelStyle(panel: IUIPanel): void {
		this.setPanelStyle(panel, [
			`width: ${PICK_RATE_PANEL_WIDTH}`,
			`height: ${OVERLAY_PANEL_HEIGHT}`,
			`background-color: ${DEFAULT_PANEL_BG}`,
			"border-radius: 1px",
			"text-align: center",
			"vertical-align: center",
			"z-index: 10"
		])
	}
	private setPickRateLabelStyle(label: IUIPanel): void {
		this.setLabelStyle(label, PICK_RATE_COLOR)
	}
	private getHeroIDFromCard(card: IUIPanel): Nullable<number> {
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
		if (container && container.BIsLoaded()) {
			return container
		}
		container = Panorama.CreatePanel("Panel", OVERLAY_CONTAINER_ID, parent)
		container?.AddClass(Panorama.MakeSymbol("HeroCardOverlays"))
		if (!container || !container.BIsLoaded()) {
			return undefined
		}
		this.setPanelStyle(container, [
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
		if (container && container.BIsLoaded()) {
			return container
		}
		container = Panorama.CreatePanel("Panel", PICK_RATE_CONTAINER_ID, parent)
		if (!container || !container.BIsLoaded()) {
			return undefined
		}
		this.setPanelStyle(container, [
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
	private ensureWinRatePanel(
		container: IUIPanel,
		winRatePct: number
	): Nullable<CLabel> {
		let panel = container.FindChild(WIN_RATE_PANEL_ID)
		if (!panel || !panel.BIsLoaded()) {
			panel = Panorama.CreatePanel("Panel", WIN_RATE_PANEL_ID, container)
			if (!panel || !panel.BIsLoaded()) {
				return undefined
			}
			Panorama.CreatePanel("Label", WIN_RATE_LABEL_ID, panel)
		}
		this.setWinRatePanelStyle(panel)
		const label = panel.FindChild(WIN_RATE_LABEL_ID) as Nullable<CLabel>
		if (label?.BIsLoaded()) {
			this.setWinRateLabelStyle(label, winRatePct)
		}
		return label ?? undefined
	}
	private ensureTierPanel(
		container: IUIPanel,
		tier: string | undefined
	): Nullable<CLabel> {
		let panel = container.FindChild(TIER_PANEL_ID)
		if (!panel || !panel.BIsLoaded()) {
			panel = Panorama.CreatePanel("Panel", TIER_PANEL_ID, container)
			if (!panel || !panel.BIsLoaded()) {
				return undefined
			}
			Panorama.CreatePanel("Label", TIER_LABEL_ID, panel)
		}
		this.setTierPanelStyle(panel, tier ?? "?")
		const label = panel.FindChild(TIER_LABEL_ID) as Nullable<CLabel>
		if (label?.BIsLoaded()) {
			this.setTierLabelStyle(label)
			label.SetText(tier ?? "")
		}
		return label ?? undefined
	}
	private ensurePickRatePanel(container: IUIPanel): Nullable<CLabel> {
		let panel = container.FindChild(PICK_RATE_PANEL_ID)
		if (!panel || !panel.BIsLoaded()) {
			panel = Panorama.CreatePanel("Panel", PICK_RATE_PANEL_ID, container)
			if (!panel || !panel.BIsLoaded()) {
				return undefined
			}
			Panorama.CreatePanel("Label", PICK_RATE_LABEL_ID, panel)
		}
		this.setPickRatePanelStyle(panel)
		const label = panel.FindChild(PICK_RATE_LABEL_ID) as Nullable<CLabel>
		if (label?.BIsLoaded()) {
			this.setPickRateLabelStyle(label)
		}
		return label ?? undefined
	}
	private getWinRateByHeroId(heroID: Nullable<number>): number {
		if (heroID === undefined) {
			return DEFAULT_WIN_RATE
		}
		if (this.menu.isDota2Source()) {
			return getWinRateForHero(heroID)
		}
		const rank = getCurrentWinRateRank()
		const position = getCurrentHeroPosition()
		const byHero = getWinRatesByRankAndPosition(rank, position)
		return byHero?.get(heroID) ?? DEFAULT_WIN_RATE
	}
	private getTierForHero(heroID: Nullable<number>): Nullable<string> {
		if (heroID === undefined) {
			return undefined
		}
		if (this.menu.isDota2Source()) {
			return undefined
		}
		const rank = getCurrentWinRateRank()
		const position = getCurrentHeroPosition()
		return getHeroTier(heroID, rank, position)
	}
	private getPickRateByHeroId(heroID: Nullable<number>): number {
		if (heroID === undefined) {
			return 0
		}
		if (this.menu.isDota2Source()) {
			return getPickRateForHero(heroID)
		}
		const rank = getCurrentWinRateRank()
		const position = getCurrentHeroPosition()
		const byHero = getPickRatesByRankAndPosition(rank, position)
		return byHero?.get(heroID) ?? 0
	}
	private applyWinRateToCard(
		card: IUIPanel,
		winRatePct: number,
		heroID: Nullable<number>
	): void {
		const tier = this.getTierForHero(heroID)
		const pickRatePct = this.getPickRateByHeroId(heroID)
		if (winRatePct === 0 && tier === undefined && pickRatePct <= 0) {
			return
		}
		const container = this.ensureOverlayContainer(card)
		if (!container || !container.BIsLoaded()) {
			return
		}
		const state = this.menu.State.value
		container.SetVisible(state)
		if (!state) {
			return
		}
		const winRateLabel = this.ensureWinRatePanel(container, winRatePct)
		if (!winRateLabel || !winRateLabel.BIsLoaded()) {
			return
		}
		winRateLabel.SetText(`${winRatePct.toFixed(0)}%`)
		this.ensureTierPanel(container, tier)
		const bottomContainer = this.ensureBottomOverlayContainer(card)
		if (bottomContainer && bottomContainer.BIsLoaded()) {
			bottomContainer.SetVisible(state)
			if (pickRatePct > 0) {
				const pickRateLabel = this.ensurePickRatePanel(bottomContainer)
				if (pickRateLabel?.BIsLoaded()) {
					pickRateLabel.SetText(`${pickRatePct.toFixed(2)}%`)
				}
			}
		}
	}
	private applyWinRatesToHeroGrid(uiState: DOTAGameUIState = GameState.UIState): void {
		const isDashboard = uiState !== DOTAGameUIState.DOTA_GAME_UI_DOTA_INGAME
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
		for (let i = cards.length - 1; i > -1; i--) {
			const card = cards[i]
			const heroID = this.getHeroIDFromCard(card)
			if (heroID === undefined) {
				continue
			}
			const winRate = this.getWinRateByHeroId(heroID)
			this.applyWinRateToCard(card, winRate, heroID)
		}
	}
})()
