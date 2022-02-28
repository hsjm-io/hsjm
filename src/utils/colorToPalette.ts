import Color, { ColorInput } from 'tinycolor2'

export interface ColorPalette {
    default: string
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
    900: string
}

/**
 * Generate a TailwindCSS / WindiCSS palette from a single hex color.
 * @param {ColorInput} color Input color, can be any format. For example : `#ff9` or `#rgb(200,30, 40)`
 * @return {ColorPalette} Generated TailwindCSS Palette
 */
export function colorToPalette(color: ColorInput): ColorPalette {

    //--- Return palette.
    return {
        default: Color(color).toString(),
        50: Color(color).lighten(30).toString(),
        100: Color(color).lighten(25).toString(),
        200: Color(color).lighten(20).toString(),
        300: Color(color).lighten(15).toString(),
        400: Color(color).lighten(10).toString(),
        500: Color(color).toHexString(),
        600: Color(color).darken(10).toString(),
        700: Color(color).darken(15).toString(),
        800: Color(color).darken(30).toString(),
        900: Color(color).darken(50).toString(),
    }
}
