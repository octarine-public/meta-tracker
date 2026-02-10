import { STYLE_SYMBOL } from "../constants"

export function setPanelStyle(panel: IUIPanel, styleParts: string[]): void {
	panel.BSetProperty(STYLE_SYMBOL, styleParts.join("; ") + ";")
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
