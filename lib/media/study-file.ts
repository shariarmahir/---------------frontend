/**
 * A file the batch shares for study: any format, kept on this device as a
 * small data URL. Pure helpers for how it is grouped and shown.
 */

export interface StudyFile {
  id: string;
  title: string;
  /** The sharer's name, kept so it survives. */
  by: string;
  /** Whether the sharer is the signed-in viewer, so they may take it down. */
  mine?: boolean;
  at: string;
  name: string;
  size: string;
  /** The file's media type, as the browser reported it. */
  type: string;
  href: string;
}

export type StudyGroup = "image" | "video" | "audio" | "pdf" | "slides" | "other";

export const STUDY_GROUPS: Record<StudyGroup, string> = { image: "ছবি", video: "ভিডিও", audio: "অডিও", pdf: "পিডিএফ", slides: "স্লাইড", other: "অন্যান্য" };

/** Which shelf a file goes on. */
export function groupOf(f: Pick<StudyFile, "type" | "name">): StudyGroup {
  if (f.type.startsWith("image/")) return "image";
  if (f.type.startsWith("video/")) return "video";
  if (f.type.startsWith("audio/")) return "audio";
  if (f.type === "application/pdf" || /\.pdf$/i.test(f.name)) return "pdf";
  if (/\.(pptx?|key|odp)$/i.test(f.name)) return "slides";
  return "other";
}
