import { type ShortcutKey, SHORTCUT_ART } from './constants'

const ShortcutArt = ({ name }: { name: ShortcutKey }) => <img src={SHORTCUT_ART[name]} width={76} height={76} alt="" />

export default ShortcutArt
