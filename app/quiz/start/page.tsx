/**
 * @file: app/quiz/start/page.tsx
 * @responsibility: Página onde o quiz começa DIRETO (sem captura de lead inicial)
 */

"use client";

import { useEffect } from "react";
import { QuizStepper } from "@/components/QuizStepper";
import { captureUTMsFromURL } from "@/lib/storage";

export default function QuizStartPage() {
  useEffect(() => {
    // Capturar UTMs da URL (para usar depois na captura de lead)
    captureUTMsFromURL();
  }, []);

  return <QuizStepper />;
}
