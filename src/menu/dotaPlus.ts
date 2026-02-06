import { Menu } from "github.com/octarine-public/wrapper/index"

import { RANKS_DOTA_PLUS } from "../winRates"

export class DotaPlusMenu {
	private readonly winRateRankDropdown: Menu.Dropdown
	private readonly rankName = "DotaPlusRank"
	constructor(node: Menu.Node) {
		this.winRateRankDropdown = node.AddDropdown(this.rankName, RANKS_DOTA_PLUS, 1)
	}
	public SetVisible(visible: boolean): void {
		this.winRateRankDropdown.IsHidden = !visible
	}
}
