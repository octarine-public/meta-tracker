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

	private readonly rankName = "StratzRank"
	private readonly periodName = "StratzPeriod"
	private readonly positionName = "StratzPosition"

	constructor(node: Menu.Node) {
		this.winRatePeriodDropdown = node.AddDropdown(
			this.periodName,
			[...PeriodOptions],
			1
		)
		// 0 = ALL, 1 = HERALD, ... 8 = IMMORTAL; default ALL
		this.winRateRankDropdown = node.AddDropdown(this.rankName, [...RankOptions], 1)
		this.winRatePositionDropdown = node.AddDropdown(
			this.positionName,
			[...PositionLabelList],
			1
		)
		this.winRatePeriodDropdown.OnValue(() => this.syncStateFromMenu())
		this.winRateRankDropdown.OnValue(() => this.syncStateFromMenu())
		this.winRatePositionDropdown.OnValue(() => this.syncStateFromMenu())
		this.syncStateFromMenu()
	}
	public SetVisible(visible: boolean): void {
		this.winRateRankDropdown.IsHidden = !visible
		this.winRatePositionDropdown.IsHidden = !visible
		this.winRatePeriodDropdown.IsHidden = !visible
	}

	public setPeriodIndex(index: number): void {
		this.winRatePeriodDropdown.SelectedID = index
		this.syncStateFromMenu()
	}

	public setRankIndex(index: number): void {
		this.winRateRankDropdown.SelectedID = index
		this.syncStateFromMenu()
	}

	public setPositionIndex(index: number): void {
		this.winRatePositionDropdown.SelectedID = index
		this.syncStateFromMenu()
	}

	public getPeriodIndex(): number {
		return this.winRatePeriodDropdown.SelectedID
	}

	public getRankIndex(): number {
		return this.winRateRankDropdown.SelectedID
	}

	public getPositionIndex(): number {
		return this.winRatePositionDropdown.SelectedID
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
