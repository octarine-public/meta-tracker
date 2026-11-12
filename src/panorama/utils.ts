export function setPanelStyle(panel: Panel, styleParts: string[]): void {
	panel.SetStyle(styleParts.join("; ") + ";")
}
