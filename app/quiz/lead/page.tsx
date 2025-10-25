/**
 * @file: app/quiz/lead/page.tsx
 * @responsibility: Captura de lead APÓS completar o quiz
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  saveLeadInfo,
  getLeadInfo,
  getUTMs,
  loadQuizResult,
} from "@/lib/storage";
import { trackLeadSubmitted, trackLeadStartView } from "@/lib/analytics";
import { trackMetaEvent } from "@/lib/track-meta-event";
import { trackMetaEventOnce } from "@/lib/track-meta-deduplicated";
import { Loader2, Heart, ArrowRight, Shield, Sparkles } from "lucide-react";

export default function QuizLeadPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    gender: "", // "M" ou "F"
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    // Verificar se o quiz foi completado
    const quizResult = loadQuizResult();
    if (!quizResult) {
      // Se não completou o quiz, redirecionar
      router.push("/quiz/start");
      return;
    }

    // Pré-preencher formulário se já tiver dados salvos (melhora UX)
    const leadInfo = getLeadInfo();
    if (leadInfo) {
      setFormData({
        name: leadInfo.name || "",
        email: leadInfo.email || "",
        whatsapp: leadInfo.whatsapp || "",
        gender: leadInfo.gender || "",
      });
      setAgreedToTerms(true); // Já concordou antes
    }

    // Obter UTMs para contexto
    const utms = getUTMs();

    // Track visualização do formulário de lead (GA4) - sempre executa
    trackLeadStartView();

    // Track visualização do formulário (Meta - lead_form_view) - proteção contra duplicação
    trackMetaEventOnce("lead_form_view", {
      eventName: "lead_form_view",
      customData: {
        page: "quiz_lead",
        form_type: "post_quiz_lead_capture",
        utm_source: utms.utm_source || "direct",
        utm_medium: utms.utm_medium || "none",
        has_referrer: utms.referrer ? 1 : 0,
        quiz_completed: 1,
        has_previous_lead: leadInfo ? 1 : 0,
      },
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const utms = getUTMs();
      const quizResult = loadQuizResult();

      // Salvar lead no localStorage (para uso no resultado)
      saveLeadInfo(
        formData.name,
        formData.email,
        formData.whatsapp,
        formData.gender
      );

      // Enviar lead para API (salva no servidor + webhook)
      fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          whatsapp: formData.whatsapp,
          gender: formData.gender,
          consent: agreedToTerms,
          utms,
          referrer: utms.referrer,
          timestamp: new Date().toISOString(),
          quizCompletedAt: new Date().toISOString(),
          segment: quizResult?.segment,
        }),
      }).catch((err) => console.error("[Lead] Error sending to API:", err));

      // Track captura (GA4)
      trackLeadSubmitted(formData.email);

      // Buffer mínimo para garantir que _fbp/_fbc foram setados pelo Pixel
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Track captura (Meta - Lead) com chaves de deduplicação melhoradas
      const nameParts = formData.name.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || undefined;

      // Gerar chave de deduplicação baseada em dados únicos do usuário
      const deduplicationKey = `${formData.email}_${
        formData.whatsapp
      }_${Date.now()}`;

      trackMetaEvent({
        eventName: "Lead",
        email: formData.email,
        phone: formData.whatsapp,
        firstName,
        lastName,
        gender: formData.gender,
        country: "br", // 🆕 ISO 3166-1 alpha-2 (Brasil)
        customData: {
          lead_source: "post_quiz_lead_page",
          gender: formData.gender || "not_informed",
          segment: quizResult?.segment || "unknown",
          deduplication_key: deduplicationKey,
          quiz_completed: 1,
          form_type: "post_quiz_capture",
        },
      });

      // Aguardar feedback visual
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 🆕 Log para debug do redirecionamento
      console.log("[Lead Page] Redirecionando para resultado:", {
        segment: quizResult?.segment,
        leadEmail: formData.email,
        timestamp: new Date().toISOString(),
      });

      // Redirecionar para resultado
      router.push(`/quiz/resultado?seg=${quizResult?.segment}`);
    } catch (error) {
      console.error("Erro ao salvar lead:", error);
      setIsSubmitting(false);
    }
  };

  const handleWhatsappChange = (value: string) => {
    // Remover tudo que não é número
    const numbers = value.replace(/\D/g, "");
    setFormData({ ...formData, whatsapp: numbers });
  };

  const formatWhatsapp = (value: string) => {
    if (!value) return "";
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(
        7
      )}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(
      7,
      11
    )}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center px-3 md:px-4 py-12">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header com contexto */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 text-primary mb-2">
            <Sparkles className="w-6 h-6" />
            <span className="font-semibold text-lg">
              Seu resultado está quase pronto...
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold leading-tight text-slate-900">
            Para onde enviamos seu relatório personalizado?
          </h1>

          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            Com base nas suas respostas, vamos criar uma análise profunda e
            personalizada sobre o momento que você está vivendo.
          </p>
        </div>

        {/* Card de captura */}
        <Card className="border-2 shadow-lg">
          <CardHeader className="space-y-2 pb-4">
            <CardTitle className="text-2xl text-center">
              Preencha para receber seu resultado
            </CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              Enviaremos por e-mail e WhatsApp
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-medium">
                  Seu nome
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Como podemos te chamar?"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="h-12 text-base"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Como você se identifica?
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    htmlFor="gender-f"
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.gender === "F"
                        ? "border-slate-900 bg-slate-50 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      id="gender-f"
                      name="gender"
                      value="F"
                      checked={formData.gender === "F"}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                      required
                      disabled={isSubmitting}
                      className="sr-only"
                    />
                    <span className="text-lg">👩</span>
                    <span className="font-medium text-sm text-slate-900">
                      Feminino
                    </span>
                  </label>

                  <label
                    htmlFor="gender-m"
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.gender === "M"
                        ? "border-slate-900 bg-slate-50 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      id="gender-m"
                      name="gender"
                      value="M"
                      checked={formData.gender === "M"}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                      required
                      disabled={isSubmitting}
                      className="sr-only"
                    />
                    <span className="text-lg">👨</span>
                    <span className="font-medium text-sm text-slate-900">
                      Masculino
                    </span>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Isso nos ajuda a personalizar melhor a experiência para você
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-medium">
                  Seu melhor e-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="h-12 text-base"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-base font-medium">
                  Seu WhatsApp
                </Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={formatWhatsapp(formData.whatsapp)}
                  onChange={(e) => handleWhatsappChange(e.target.value)}
                  required
                  className="h-12 text-base"
                  disabled={isSubmitting}
                  maxLength={15}
                />
                <p className="text-xs text-muted-foreground">
                  Vamos te enviar o resultado também pelo WhatsApp
                </p>
              </div>

              {/* Checkbox de consentimento */}
              <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-4 border border-slate-200">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) =>
                    setAgreedToTerms(checked as boolean)
                  }
                  disabled={isSubmitting}
                  className="mt-0.5"
                />
                <Label
                  htmlFor="terms"
                  className="text-sm leading-relaxed cursor-pointer text-slate-700"
                >
                  Concordo em receber o relatório personalizado e comunicações
                  por e-mail e WhatsApp. Seus dados estão protegidos e não serão
                  compartilhados com terceiros.
                </Label>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-lg font-semibold"
                disabled={isSubmitting || !agreedToTerms}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Gerando seu resultado...
                  </>
                ) : (
                  <>
                    Ver meu resultado agora
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Análise personalizada</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Seus dados estão seguros</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            <span>100% gratuito</span>
          </div>
        </div>
      </div>
    </div>
  );
}
