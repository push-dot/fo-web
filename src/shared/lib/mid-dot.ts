/**
 * The device WebView draws U+00B7 from a system font 4 pt narrower than the boards' Noto at 15 px (6 pt at 26 px),
 * so the dot sits in its own fixed-width box (`.mid-dot`) and its word stays on one line (`.dot-word`).
 */
export const splitMiddleDot = (line: string): string[] => line.split(/(·)/).filter(Boolean)

export const splitDotWords = (text: string): string[] => text.split(/(\S*·\S*)/).filter(Boolean)
