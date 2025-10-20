/**
 * @file: LeadModal.tsx
 * @responsibility: Modal de captura de lead (e-mail + WhatsApp)
 */

"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  leadSchema,
  type LeadFormData,
  normalizeWhatsApp,
} from "@/lib/validators";
import { saveLeadInfo } from "@/lib/storage";
import { trackLeadSubmitted, trackLeadError } from "@/lib/analytics";
import { getUTMs } from "@/lib/storage";

interface LeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function LeadModal({ open, onOpenChange, onSuccess }: LeadModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      email: "",
      whatsapp: "",
      consent: false,
    },
  });

  const whatsappValue = watch("whatsapp");

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const normalizedWhatsApp = normalizeWhatsApp(data.whatsapp);
      const utms = getUTMs();

      const payload = {
        email: data.email,
        whatsapp: normalizedWhatsApp,
        consent: data.consent,
        utms,
        referrer: utms.referrer || document.referrer,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch("/api/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Erro ao enviar dados");
      }

      // Salvar lead localmente
      saveLeadInfo({
        email: data.email,
        whatsapp: normalizedWhatsApp,
        capturedAt: new Date().toISOString(),
      });

      // Track sucesso
      trackLeadSubmitted(data.email);

      // Fechar modal e continuar
      onSuccess();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      trackLeadError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Envie o resultado para você
          </DialogTitle>
          <DialogDescription>
            Precisamos do seu e-mail e WhatsApp para entregar seu relatório
            personalizado e atualizações importantes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              {...register("email")}
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-red-600" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* WhatsApp */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp (com DDI) *</Label>
            <Input
              id="whatsapp"
              type="tel"
              placeholder="5511999999999"
              autoComplete="tel"
              {...register("whatsapp")}
              aria-invalid={errors.whatsapp ? "true" : "false"}
              aria-describedby="whatsapp-helper whatsapp-error"
            />
            <p id="whatsapp-helper" className="text-xs text-muted-foreground">
              Exemplo: 5511999999999 (apenas números)
            </p>
            {errors.whatsapp && (
              <p
                id="whatsapp-error"
                className="text-sm text-red-600"
                role="alert"
              >
                {errors.whatsapp.message}
              </p>
            )}
          </div>

          {/* Consent */}
          <div className="flex items-start space-x-2">
            <Controller
              name="consent"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="consent"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-invalid={errors.consent ? "true" : "false"}
                  aria-describedby={
                    errors.consent ? "consent-error" : undefined
                  }
                />
              )}
            />
            <div className="space-y-1 leading-none">
              <Label
                htmlFor="consent"
                className="text-sm font-normal cursor-pointer"
              >
                Concordo em receber o relatório personalizado e comunicações por
                e-mail e WhatsApp
              </Label>
              {errors.consent && (
                <p
                  id="consent-error"
                  className="text-sm text-red-600"
                  role="alert"
                >
                  {errors.consent.message}
                </p>
              )}
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Começar agora"}
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground mt-4">
          Seus dados estão protegidos e não serão compartilhados com terceiros.
        </p>
      </DialogContent>
    </Dialog>
  );
}
