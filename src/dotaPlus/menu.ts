import { Menu } from "github.com/octarine-public/wrapper/index"

import { RANKS_DOTA_PLUS } from "../winRates/index"
import { setCurrentDotaPlusRankChunk } from "./data"

export class DotaPlusMenu {
	private readonly winRateRankDropdown: Menu.Dropdown
	private readonly rankName = "DotaPlusRank"
	constructor(node: Menu.Node) {
		this.winRateRankDropdown = node.AddDropdown(this.rankName, RANKS_DOTA_PLUS, 1)
		this.winRateRankDropdown.OnValue(() => this.syncRankChunk())
		this.syncRankChunk()
	}
	public SetVisible(visible: boolean): void {
		this.winRateRankDropdown.IsHidden = !visible
	}

	public setRankIndex(index: number): void {
		this.winRateRankDropdown.SelectedID = index
		this.syncRankChunk()
	}

	public getRankIndex(): number {
		return this.winRateRankDropdown.SelectedID
	}

	private syncRankChunk(): void {
		if (this.winRateRankDropdown.IsHidden) {
			return
		}
		setCurrentDotaPlusRankChunk(this.winRateRankDropdown.SelectedID)
	}
}
