import "./translations"

import {
	DOTAGameUIState,
	Events,
	EventsSDK,
	GameRules,
	GameState
} from "github.com/octarine-public/wrapper/index"

import { DEFAULT_WIN_RATE } from "./constants"
import { DashboardSettingsPanel } from "./dashboardSettings/index"
import {
	getPickRateForHero,
	getTierForHero as getDotaPlusTierForHero,
	getWinRateForHero,
	setDotaPlusData
} from "./dotaPlus/index"
import { HeroStatsDataProvider, HeroStatsOverlay } from "./heroStats/index"
import { MenuManager } from "./menu"
import { HeroDataResponse } from "./models/heroDataTypes"
import { isValidPanel } from "./panorama/utils"
import { TierLegendPanel, TierLegendPanelVisibility } from "./tierLegend/index"
import {
	getCurrentHeroPosition,
	getCurrentWinRateRank,
	getHeroTier,
	getPickRatesByRankAndPosition,
	getWinRatesByRankAndPosition
} from "./winRates/index"

new (class CMetaTracker {
	private isDestroyingHUD = false

	private readonly menu = new MenuManager()
	private readonly heroStatsOverlay: HeroStatsOverlay
	private readonly tierLegendPanel: TierLegendPanel

	private readonly dataProvider = this.createHeroStatsDataProvider()
	private readonly tierLegendVisibility = this.createTierLegendVisibility()

	constructor() {
		this.heroStatsOverlay = new HeroStatsOverlay(this.dataProvider)
		this.tierLegendPanel = new TierLegendPanel(
			this.tierLegendVisibility,
			new DashboardSettingsPanel(this.menu)
		)

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
		if (isDashboard) {
			this.applyInformation()
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
	private applyWinRatesToHeroGrid(uiState: DOTAGameUIState = GameState.UIState): void {
		const isDashboard = uiState !== DOTAGameUIState.DOTA_GAME_UI_DOTA_INGAME
		const root = !isDashboard
			? Panorama.FindRootPanel("DotaHud")
			: Panorama.FindRootPanel("DotaDashboard")
		if (!isValidPanel(root)) {
			return
		}
		if (this.isDestroyingHUD && !isDashboard) {
			return
		}
		this.heroStatsOverlay.ApplyToGrid(root)
	}
	private applyInformation(): void {
		const root = Panorama.FindRootPanel("DotaDashboard")
		if (!isValidPanel(root)) {
			return
		}
		const heroesPage = root.FindChildTraverse("DOTAHeroesPage")
		if (isValidPanel(heroesPage)) {
			this.tierLegendPanel.ensurePanel(heroesPage)
		}
	}
	private createHeroStatsDataProvider(): HeroStatsDataProvider {
		const menu = this.menu
		return {
			getWinRate(heroID: number): number {
				if (menu.isDota2Source()) {
					return getWinRateForHero(heroID)
				}
				const rank = getCurrentWinRateRank()
				const position = getCurrentHeroPosition()
				const byHero = getWinRatesByRankAndPosition(rank, position)
				return byHero?.get(heroID) ?? DEFAULT_WIN_RATE
			},
			getTier(heroID: number): string | undefined {
				if (menu.isDota2Source()) {
					return getDotaPlusTierForHero(heroID)
				}
				const rank = getCurrentWinRateRank()
				const position = getCurrentHeroPosition()
				return getHeroTier(heroID, rank, position)
			},
			getPickRate(heroID: number): number {
				if (menu.isDota2Source()) {
					return getPickRateForHero(heroID)
				}
				const rank = getCurrentWinRateRank()
				const position = getCurrentHeroPosition()
				const byHero = getPickRatesByRankAndPosition(rank, position)
				return byHero?.get(heroID) ?? 0
			},
			isVisible(): boolean {
				return menu.State.value
			}
		}
	}
	private createTierLegendVisibility(): TierLegendPanelVisibility {
		const menu = this.menu
		return {
			isVisible(): boolean {
				return menu.State.value
			},
			setInformationPanelVisible(visible: boolean): void {
				menu.State.value = visible
			}
		}
	}
})()
