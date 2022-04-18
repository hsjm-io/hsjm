import { Theme, parseColor } from '@unocss/preset-mini'
import { Shortcut } from 'unocss'

export const shortcutButton: Shortcut[] = [
  // --- Base + Size
  [/^btn(-\w{2,3})?$/, ([,fontSize]: string[], { theme }: { theme: Theme }) => {
    // --- Resolve font size.
    fontSize = fontSize?.slice(1)
    if (fontSize && !theme?.fontSize?.[fontSize]) return
    fontSize = fontSize ?? 'base'

    // --- Return classes.
    return 'inline-flex flex-nowrap items-center justify-center cursor-pointer'
    + ' select-none outline-none transition-all no-underline whitespace-nowrap'
    + ' rounded-md font-bold'
    + ' duration-500 ease-bounce children:not-last:mr-2'
    + ` px-4 py-3 text-${fontSize}`
    + ' ring-0 hover:ring-6'
  }],

  // --- Colors
  [/^btn(-outlined)?-(.+)$/, ([,outlined, color]: string[], { theme }: { theme: Theme }) => {
    // --- Resolve color.
    const themeColor = parseColor(color, theme)
    if (!themeColor?.color) return

    // --- Compute dynamic colors.
    const textColor = Number.parseInt(themeColor.no) >= 500 ? 'white' : 'black'

    // --- Color variants.
    return outlined
      ? `bg-white ring-${color} text-${color} mix-tint-10:hover:(ring-${color} text-${color})`
      : `bg-${color} ring-${color} text-${textColor} mix-tint-10:hover:(bg-${color} ring-${color})`
  }],
]

export const shortcutBadge: Shortcut[] = [
  [
    /badge-(.+)/,
    ([,color]) => 'inline-flex flex-nowrap items-center justify-center'
    + ' outline-none transition-all no-underline whitespace-nowrap'
    + ` bg-${color} text-white px-1.5 py-0.5 rounded`
    + ` mix-tint-10:hover:(bg-${color} ring-${color})`,
  ],
]

export const shortcutNavItem: Shortcut[] = [
  // --- Navigation bar item.
  ['nav-item', 'relative transition-all duration-50 ease-out'
    + ' select-none text-lg font-bold px-3 py-4 overflow-visible no-underline'
    + ' before:(absolute bottom-2 left-[50%] transform translate-x-[-50%] w-12 h-1.5 content-empty)'
    + ' before:(opacity-0 rounded-full transition-all duration-50 ease-out)'
    + ' hover:before:(w-1.5 opacity-100)'
    + ' current:before:(w-1.5 opacity-100)',
  ],

  // --- Navigation bar item color.
  [/^nav-item-(.+)$/, ([,color]: string[], { theme }: { theme: Theme }) => {
    // --- Resolve color.
    const themeColor = parseColor(color, theme)
    if (!themeColor?.color) return

    // --- Color variants.
    return `text-${color} before:(bg-${color})`
  }],
]

export const shortcutLink: Shortcut[] = [
  [/^link(?:-(.+))?$/,
    ([,color]) => (color
      ? `text-inherit text-lg hover:text-${color} no-underline disabled:(opacity-50 pointer-events-none)`
      : 'text-inherit text-lg no-underline disabled:(opacity-50 pointer-events-none)'
    )],
]

export const shortcutInput: Shortcut[] = [
  ['label', 'text-base block mb-1'],
  [/^input(?:-(.+))?$/, ([,color]) => (color
    ? 'rounded-2xl text-lg rounded-xl h-12 px-3 py-1.5'
      + ' w-full transition-all outline-none'
      + ' ring-1 ring-primary-500 !font-sans'
      + ' hover:(bg-primary-100 ring-primary-700)'
      + ' focus:(ring-primary-700)'
    : 'rounded-2xl text-lg rounded-xl h-12 px-3 py-1.5'
      + ' w-full transition-all outline-none'
      + ' ring-1 ring-primary-500 !font-sans'
      + ' hover:(bg-primary-100 ring-primary-700)'
      + ' focus:(ring-primary-700)'
  )],
]

export const shortcuts: Shortcut[] = [
  // --- Layouts
  ['layout', 'flex flex-col min-h-screen subpixel-antialiased'],
  ['page', 'flex flex-col space-y-24 pb-24'],
  ['contain', 'md:container mx-auto px-8'],
  ['overlay', 'absolute top-0 left-0 bottom-0 right-0 inner-content'],

  ...shortcutButton,
  ...shortcutBadge,
  ...shortcutNavItem,
  ...shortcutLink,
  ...shortcutInput,
]
