/** Where this package's own glyphs are shipped: a spelled-out repository path does not resolve. */
const iconsPath = `${__OCT_PACKAGE_ROOT__}/scripts_files/meta-tracker/icons`

/** Icons of the menu: the SDK set where it has one, our own line glyphs (white strokes on a 24 viewBox) next to it. */
export const MetaIcons = {
	/** A rising trend inside a tracking ring, the page's icon. */
	Page: `${iconsPath}/meta.svg`,
	State: Menu.Icons.Power,
	TierList: Menu.Icons.LevelBars,
	/** Where the numbers come from: Dota 2 or Stratz. */
	Stats: Menu.Icons.Globe,
	Rank: Menu.Icons.StarBadge,
	Period: Menu.Icons.History,
	/** A map pin, for the lane role the numbers are taken for. */
	Position: `${iconsPath}/position.svg`
} as const
