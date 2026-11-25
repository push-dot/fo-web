export const tossClientKey = (): string | undefined => import.meta.env.VITE_TOSS_CLIENT_KEY?.trim() || undefined
