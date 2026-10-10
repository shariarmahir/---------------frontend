export type MediaTheme = "dark" | "light";

/** The viewer's theme, kept in a cookie so the server draws the right one first. */
export const THEME_COOKIE = "sm-theme";

/** Dark is the platform's own look; light only when the viewer picked it. */
export const readTheme = (value?: string): MediaTheme => (value === "light" ? "light" : "dark");
