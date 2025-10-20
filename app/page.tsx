/**
 * @file: app/page.tsx
 * @responsibility: Redirect para /quiz
 */

import { redirect } from "next/navigation";

export default function Home() {
  redirect("/quiz");
}
