/**
 * The home page's intro (components/ui/preloader.tsx) plays once a browser
 * session. This key marks it seen; the root layout reads it before the
 * first paint and sets `kl-intro-seen` on <html>, which hides the intro.
 */
export const INTRO_KEY = "kl-intro";

export const INTRO_SEEN_SCRIPT = `try{if(sessionStorage.getItem("${INTRO_KEY}")==="1")document.documentElement.classList.add("kl-intro-seen")}catch(e){}`;
