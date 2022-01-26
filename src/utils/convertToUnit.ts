/**
 * Convert a string or number into a CSS unit.
 * @param {string | number} input Input string.
 * @param {string} [unit='px'] Used CSS unit.
 * @return {string | undefined} Unit converted into a valid CSS value string. Returns undefined if the input is invalid
 */
 export function convertToUnit(input?: string | number, unit = 'px'){

    //--- If input is invalid.
    if (!input && input !== 0) return undefined

    //--- If input is not a valid number.
    else if (isNaN(+input)) return String(input)

    //--- Convert to unit.
    else return `${Number(input)}${unit}`
}
