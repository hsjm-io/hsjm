import Color from 'color'

/**
 * Generate a TailwindCSS palette from a single hex color.
 * @param {Color} color Input color, can be any format. For example : `#ff9` or `#rgb(200,30, 40)`
 * @return {Record<number,string>} Generated TailwindCSS Palette
 */
export default function colorToPalette(color: Color<any>): Record<number,string> {

    //--- Instantiate Color object.
    color = Color(color)

    //--- Return palette.
    return {
        50: color.lighten(0.95).toString(),
        100: color.lighten(0.90).toString(),
        200: color.lighten(0.75).toString(),
        300: color.lighten(0.60).toString(),
        400: color.lighten(0.30).toString(),
        500: color.lighten(0.00).toString(),
        600: color.darken(0.10).toString(),
        700: color.darken(0.25).toString(),
        800: color.darken(0.40).toString(),
        900: color.darken(0.51).toString(),
    }
}
