import { Menu } from "github.com/octarine-public/wrapper/index"

import {
	HeroPositions,
	PeriodOptions,
	PeriodValues,
	PositionLabelList,
	RankOptions,
	setCurrentHeroPosition,
	setCurrentWinRatePeriod,
	setCurrentWinRateRank
} from "../winRates/index"

export class StratzMenu {
	private readonly winRatePeriodDropdown: Menu.Dropdown
	private readonly winRateRankDropdown: Menu.Dropdown
	private readonly winRatePositionDropdown: Menu.Dropdown

	private readonly rankName = "Rank"
	private readonly periodName = "Period"
	private readonly positionName = "Position"

	constructor(node: Menu.Node) {
		this.winRatePeriodDropdown = node.AddDropdown(
			this.periodName,
			[...PeriodOptions],
			1
		)
		// 0 = ALL, 1 = HERALD, ... 8 = IMMORTAL; default ALL
		this.winRateRankDropdown = node.AddDropdown(this.rankName, RankOptions)
		// 0 = ALL, 1 = Carry, ... 5 = Hard support; default ALL
		this.winRatePositionDropdown = node.AddDropdown(
			this.positionName,
			PositionLabelList,
			0
		)
		this.winRatePeriodDropdown.OnValue(() => this.syncStateFromMenu())
		this.winRateRankDropdown.OnValue(() => this.syncStateFromMenu())
		this.winRatePositionDropdown.OnValue(() => this.syncStateFromMenu())
		this.syncStateFromMenu()
	}
	public get RankIndex(): number {
		return this.winRateRankDropdown.SelectedID
	}
	public get PeriodIndex(): number {
		return this.winRatePeriodDropdown.SelectedID
	}
	public get PositionIndex(): number {
		return this.winRatePositionDropdown.SelectedID
	}
	public SetVisible(visible: boolean): void {
		this.winRateRankDropdown.IsHidden = !visible
		this.winRatePositionDropdown.IsHidden = !visible
		this.winRatePeriodDropdown.IsHidden = !visible
	}
	public setPeriodIndex(index: number): void {
		this.winRatePeriodDropdown.SelectedID = index
		this.syncStateFromMenu()
		Menu.Base.SaveConfigASAP = true
	}
	public setRankIndex(index: number): void {
		this.winRateRankDropdown.SelectedID = index
		this.syncStateFromMenu()
		Menu.Base.SaveConfigASAP = true
	}
	public setPositionIndex(index: number): void {
		this.winRatePositionDropdown.SelectedID = index
		this.syncStateFromMenu()
		Menu.Base.SaveConfigASAP = true
	}
	private syncStateFromMenu(): void {
		if (
			this.winRateRankDropdown.IsHidden ||
			this.winRatePeriodDropdown.IsHidden ||
			this.winRatePositionDropdown.IsHidden
		) {
			return
		}
		setCurrentWinRatePeriod(PeriodValues[this.winRatePeriodDropdown.SelectedID])
		setCurrentWinRateRank(RankOptions[this.winRateRankDropdown.SelectedID])
		setCurrentHeroPosition(HeroPositions[this.winRatePositionDropdown.SelectedID])
	}
}
