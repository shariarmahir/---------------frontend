/*
 * One recorder per page: the header owns it (site-header.tsx), so recordings
 * saved from the header's menu and from the home page's "Record" card are
 * the same list. Anything else asks the header to open it with this event,
 * which keeps the recorder's code out of the caller's bundle.
 */
export const OPEN_RECORDER_EVENT = "kandari:open-recorder";

export function openRecorder() {
  window.dispatchEvent(new Event(OPEN_RECORDER_EVENT));
}
