import { Variant } from 'unocss'

/** Variant for selector `&[aria-current="page"]`. */
export const variantCurrentPage: Variant = {
  match: (input: string) => {
    const match = input.match(/^current[:-]/)
    if (match) {
      return {
        matcher: input.slice(match[0].length),
        selector: (s: string) => `${s}[aria-current="page"]`,
      }
    }
  },
  autocomplete: '(current):',
}

export const variants: Variant[] = [
  variantCurrentPage,
]
