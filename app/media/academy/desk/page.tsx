import { redirect } from "next/navigation";

/** The teacher's desk became the classroom: its tools live in each batch's room now. */
export default function DeskPage() {
  redirect("/media/academy/classroom");
}
