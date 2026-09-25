/**
 * Cookie holding the numeral preference ("bn" | "latn"). Lives in a plain
 * module: a constant imported from a "use client" file is a client
 * reference on the server, not the string.
 */
export const NUMERALS_COOKIE = "sm-numerals";
