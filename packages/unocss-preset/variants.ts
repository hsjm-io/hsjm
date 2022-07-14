import { Variant, VariantObject } from 'unocss'

const createVariant = (keyword: string, query: string | string[]): VariantObject => ({
  name: keyword,
  match: (input: string) => {
    const regexp = new RegExp(`^${keyword}[:-]`)
    const match = input.match(regexp)
    const queries = Array.isArray(query) ? query : [query]
    if (match) {
      return {
        matcher: input.slice(match[0].length),
        selector: (s: string) => queries.map(query => query.replace(/&/g, s)).join(','),
      }
    }
  },
  autocomplete: `${keyword}:`,
})

/** Variant for selector `&[aria-current="page"]`. */
export const variantCurrentPage: Variant = createVariant('current', '&[aria-current="page"]')

/** Variant for selected &[selected="true"] */
export const variantSelected: Variant = createVariant('selected', ['&[selected="true"]', '&[aria-selected="true"]'])

/** Variant for selected &[aria-invalid="true"] */
export const variantInvalid: Variant = createVariant('error', ['&[aria-invalid="true"]', '*[aria-invalid="true"] &'])

/** Variant for selector `&[aria-busy="true"]`. */
export const variantLoading: Variant = createVariant('loading', '&[aria-busy="true"]')

/** All variants. */
export const variants: Variant[] = [
  variantCurrentPage,
  variantSelected,
  variantInvalid,
  variantLoading,
]
