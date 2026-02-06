import { Menu } from "github.com/octarine-public/wrapper/index"

import { setCurrentDotaPlusRankChunk } from "../dotaPlusData"
import { RANKS_DOTA_PLUS } from "../winRates/index"

export class DotaPlusMenu {
	private readonly winRateRankDropdown: Menu.Dropdown
	private readonly rankName = "DotaPlusRank"
	private readonly onRankChanged: () => void
	constructor(node: Menu.Node, onRankChanged: () => void) {
		this.onRankChanged = onRankChanged
		this.winRateRankDropdown = node.AddDropdown(this.rankName, RANKS_DOTA_PLUS, 1)
		this.winRateRankDropdown.OnValue(() => this.syncRankChunk())
		this.syncRankChunk()
	}
	public SetVisible(visible: boolean): void {
		this.winRateRankDropdown.IsHidden = !visible
	}
	private syncRankChunk(): void {
		if (this.winRateRankDropdown.IsHidden) {
			return
		}
		setCurrentDotaPlusRankChunk(this.winRateRankDropdown.SelectedID)
		this.onRankChanged()
	}
}
