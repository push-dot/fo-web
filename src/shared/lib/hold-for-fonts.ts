// The Korean web font comes in ~120 small files (font-display: swap), so a page drawn at once shows fallback glyphs that then turn into the
// font. In the app's web view the page stays hidden until its data is drawn and the fonts it asked for are in, so the text appears once, right.
const MAX_MS = 2000
const FRAMES = 3

let held = false
let show = () => {}

const frames = (n: number, then: () => void) => (n === 0 ? then() : requestAnimationFrame(() => frames(n - 1, then)))

export const holdForFonts = () => {
  const root = document.documentElement
  root.style.visibility = 'hidden'
  held = true
  let shown = false
  show = () => {
    if (shown) return
    shown = true
    root.style.visibility = ''
  }
  setTimeout(show, MAX_MS)
}

/** Call once the page's text is on screen: shows the page when no font file is still on its way. */
export const releaseAfterFonts = () => {
  if (!held) return
  const settle = () =>
    frames(FRAMES, () => {
      if (document.fonts.status === 'loading') void document.fonts.ready.then(settle)
      else show()
    })
  settle()
}
