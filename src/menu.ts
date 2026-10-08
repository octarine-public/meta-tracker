import { DotaPlusMenu } from "./dotaPlus/index"
import { MetaIcons } from "./icons"
import { StratzMenu } from "./stratz/index"

export class MenuManager {
	public readonly State: Menu.Toggle
	public readonly TierListEnabled: Menu.Toggle

	public readonly stratzMenu: StratzMenu
	public readonly dotaPlusMenu: DotaPlusMenu
	private readonly statsType: Menu.Dropdown
	/**
	 * A page in the side column of the Overwolf section, shared with the Overwolf script: the last
	 * of its pages (priority 3), after the Overwolf panel, MMR Tracker and Total in search.
	 */
	private readonly tree = Menu.AddEntry(
		"Overwolf",
		PathData.WrapperMenuPath + "/icons/info.svg"
	).AddNode("Meta tracker", MetaIcons.Page, "", -1, 3)

	constructor() {
		// the script's own switch rides the top bar beside the breadcrumb and gates the page
		this.State = this.tree.AddToggle("State", true)
		this.State.IconPath = MetaIcons.State
		this.tree.HeaderControl = this.State
		this.tree.Gate = this.State

		this.TierListEnabled = this.tree.AddToggle("Tier list", true)
		this.TierListEnabled.IconPath = MetaIcons.TierList
		this.tree.SortNodes = false
		this.statsType = this.tree.AddDropdown("Stats", ["Dota 2", "Stratz"])
		this.statsType.IconPath = MetaIcons.Stats

		this.stratzMenu = new StratzMenu(this.tree)
		this.dotaPlusMenu = new DotaPlusMenu(this.tree)
		this.statsType.OnValue(cb => this.statsTypeChanged(cb))
	}
	public get isDota2Source(): boolean {
		return this.statsType.SelectedID === 0
	}
	public get StatsTypeIndex(): number {
		return this.statsType.SelectedID
	}
	/** Set stats type from panorama (0 = Dota 2, 1 = Stratz) */
	public setStatsTypeIndex(index: number): void {
		if (this.statsType.SelectedID === index) {
			return
		}
		this.statsType.SelectedID = index
		this.statsTypeChanged(this.statsType)
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
		this.tree.Update()
	}
}
