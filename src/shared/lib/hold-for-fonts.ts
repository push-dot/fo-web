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

export const releaseAfterFonts = () => {
  if (!held) return
  const settle = () =>
    frames(FRAMES, () => {
      if (document.fonts.status === 'loading') void document.fonts.ready.then(settle)
      else show()
    })
  settle()
}
