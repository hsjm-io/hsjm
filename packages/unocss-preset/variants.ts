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

/** Variant for selector `&[aria-busy="true"]`. */
export const variantLoading: Variant = {
  match: (input: string) => {
    const match = input.match(/^loading[:-]/)
    if (match) {
      return {
        matcher: input.slice(match[0].length),
        selector: (s: string) => `${s}[aria-busy="true"]`,
      }
    }
  },
  autocomplete: '(loading):',
}

export const variants: Variant[] = [
  variantCurrentPage,
  variantLoading,
]
