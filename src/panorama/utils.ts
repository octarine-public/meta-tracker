export function setPanelStyle(panel: IUIPanel, styleParts: string[]): void {
	const style = styleParts.join("; ") + ";"
	const sym = Panorama.MakeSymbol("style")
	if (sym >= 0) {
		panel.BSetProperty(sym, style)
	}
}

export function isValidPanel(panel: Nullable<IUIPanel>): panel is IUIPanel {
	return (
		panel !== undefined &&
		panel !== null &&
		panel.BIsLoaded() &&
		panel.GetContentWidth() !== 0 &&
		panel.GetContentHeight() !== 0
	)
}
