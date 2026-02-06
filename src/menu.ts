import { Menu } from "github.com/octarine-public/wrapper/index"

import { CHART_ICON } from "./constants"
import { DotaPlusMenu } from "./dotaPlus/index"
import { StratzMenu } from "./stratz/index"

export class MenuManager {
	public readonly State: Menu.Toggle

	/** Show/hide the tier legend (information) panel on the heroes page */
	public readonly InformationPanel: Menu.Toggle

	public readonly stratzMenu: StratzMenu
	public readonly dotaPlusMenu: DotaPlusMenu
	private readonly statsType: Menu.Dropdown
	private readonly tree = Menu.AddEntryDeep(["Visual", "Meta tracker"], [CHART_ICON])

	constructor() {
		this.State = this.tree.AddToggle("State", true)
		this.InformationPanel = this.tree.AddToggle("Information panel", true)
		this.tree.SortNodes = false
		this.statsType = this.tree.AddDropdown("Stats type", ["Dota 2", "Stratz"])

		this.stratzMenu = new StratzMenu(this.tree)
		this.dotaPlusMenu = new DotaPlusMenu(this.tree)
		this.statsType.OnValue(cb => this.statsTypeChanged(cb))
	}

	public isDota2Source(): boolean {
		return this.statsType.SelectedID === 0
	}

	private statsTypeChanged(call: Menu.Dropdown): void {
		switch (call.SelectedID) {
			case 0:
				this.stratzMenu.SetVisible(false)
				this.dotaPlusMenu.SetVisible(true)
				break
			case 1:
				this.stratzMenu.SetVisible(true)
				this.dotaPlusMenu.SetVisible(false)
				break
		}
		this.tree.Update(true)
	}
}
