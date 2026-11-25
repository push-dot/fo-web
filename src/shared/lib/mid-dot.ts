export const splitMiddleDot = (line: string): string[] => line.split(/(·)/).filter(Boolean)

export const splitDotWords = (text: string): string[] => text.split(/(\S*·\S*)/).filter(Boolean)
