/**
 * @file: app/interesse/page.tsx
 * @responsibility: Página de "fake door" - interesse no relatório completo
 */

"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Users, ArrowLeft } from "lucide-react";
import { getLeadInfo } from "@/lib/storage";
import { gtagEvent } from "@/lib/analytics";

function InteresseContent() {
  const searchParams = useSearchParams();
  const [leadName, setLeadName] = useState("");

  useEffect(() => {
    const leadInfo = getLeadInfo();
    if (leadInfo?.name) {
      const firstName = leadInfo.name.split(" ")[0];
      setLeadName(firstName);
    }

    // Track visualização da página de interesse
    const segment = searchParams.get("seg") || "unknown";
    const location = searchParams.get("loc") || "unknown";

    // Track GA4 (análise interna de fake door)
    gtagEvent("interesse_page_view", {
      segment,
      location,
      page: "/interesse",
    });
  }, [searchParams]);

  const handleBackToQuiz = () => {
    // Track GA4 (análise de desistência)
    gtagEvent("interesse_back_click", {
      page: "/interesse",
    });

    window.location.href = "/quiz";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Card principal */}
        <div className="relative overflow-hidden rounded-[32px] border-2 border-slate-200 bg-white shadow-xl">
          {/* Gradiente de fundo */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.03),_transparent_70%)]" />

          <div className="relative px-8 md:px-12 py-12 md:py-16 space-y-10">
            {/* Ícone de sucesso */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
                <div className="relative w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
              </div>
            </div>

            {/* Mensagem principal */}
            <div className="text-center space-y-6">
              <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
                {leadName ? `${leadName}, ` : ""}Recebemos seu interesse!
              </h1>

              <div className="space-y-4 text-base md:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
                <p>
                  Estamos com uma{" "}
                  <strong className="text-slate-900">demanda muito alta</strong>{" "}
                  de pessoas querendo acessar o Relatório Completo.
                </p>
                <p>
                  Para garantir que cada análise seja feita com a qualidade e
                  profundidade que você merece, estamos temporariamente pausando
                  novos acessos.
                </p>
              </div>
            </div>

            {/* Info boxes */}
            <div className="grid md:grid-cols-3 gap-4 pt-4">
              <div className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm mb-1">
                    Você está na fila
                  </p>
                  <p className="text-xs text-slate-600">
                    Seu interesse foi registrado
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm mb-1">
                    Alta procura
                  </p>
                  <p className="text-xs text-slate-600">
                    Muitas pessoas interessadas
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-emerald-900 text-sm mb-1">
                    Te avisaremos
                  </p>
                  <p className="text-xs text-emerald-700">
                    Por e-mail e WhatsApp
                  </p>
                </div>
              </div>
            </div>

            {/* O que acontece agora */}
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900 text-center">
                O que acontece agora?
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      <strong className="text-slate-900">
                        Você está na nossa lista de interesse.
                      </strong>{" "}
                      Seu e-mail e WhatsApp foram registrados.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      <strong className="text-slate-900">
                        Assim que voltarmos a disponibilizar,
                      </strong>{" "}
                      você receberá um aviso prioritário por e-mail e WhatsApp.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      <strong className="text-slate-900">
                        Não se preocupe —
                      </strong>{" "}
                      sua análise gratuita continua disponível. Você pode reler
                      quando quiser.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA para voltar */}
            <div className="flex flex-col items-center gap-4 pt-6">
              <Button
                onClick={handleBackToQuiz}
                size="lg"
                variant="outline"
                className="inline-flex items-center gap-2 rounded-full border-2 border-slate-300 px-8 py-3 text-base font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-400"
              >
                <ArrowLeft className="w-5 h-5" />
                Voltar ao início
              </Button>

              <p className="text-sm text-slate-500 text-center max-w-md">
                Você receberá uma notificação assim que o Relatório Completo
                estiver disponível novamente.
              </p>
            </div>

            {/* Footer com reassurance */}
            <div className="text-center pt-8 border-t border-slate-200">
              <p className="text-xs text-slate-500">
                💚 Obrigado pela paciência e compreensão
              </p>
            </div>
          </div>
        </div>

        {/* Mensagem extra abaixo do card */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Enquanto isso, você pode reler sua análise gratuita e refletir sobre
            os insights que já recebeu.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function InteressePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-slate-600">Carregando...</p>
        </div>
      }
    >
      <InteresseContent />
    </Suspense>
  );
}
