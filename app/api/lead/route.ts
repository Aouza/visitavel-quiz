/**
 * @file: app/api/lead/route.ts
 * @responsibility: API endpoint para captura de leads
 * @exports: POST handler
 */

import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { sendMetaEvent } from "@/lib/meta-capi";

interface LeadPayload {
  email: string;
  whatsapp: string;
  consent: boolean;
  utms?: Record<string, string>;
  referrer?: string;
  timestamp: string;
  quizStartedAt?: string;
  quizCompletedAt?: string;
}

const TMP_DIR = join(process.cwd(), "tmp");
const LEADS_FILE = join(TMP_DIR, "leads.jsonl");

async function saveLeadToFile(lead: LeadPayload): Promise<void> {
  try {
    // Criar diretório tmp se não existir
    if (!existsSync(TMP_DIR)) {
      await mkdir(TMP_DIR, { recursive: true });
    }

    // Adicionar lead ao arquivo JSONL (uma linha por lead)
    const line = JSON.stringify(lead) + "\n";
    await writeFile(LEADS_FILE, line, { flag: "a" });
  } catch (error) {
    console.error("[Lead] Error saving to file:", error);
    throw error;
  }
}

async function sendLeadToWebhook(lead: LeadPayload): Promise<boolean> {
  const webhookUrl = process.env.LEAD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn("[Lead] No webhook URL configured");
    return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(lead),
    });

    if (!response.ok) {
      throw new Error(`Webhook returned ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error("[Lead] Error sending to webhook:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: LeadPayload = await request.json();

    // Validação básica
    if (!body.email || !body.whatsapp) {
      return NextResponse.json(
        { ok: false, error: "E-mail e WhatsApp são obrigatórios" },
        { status: 400 }
      );
    }

    if (!body.consent) {
      return NextResponse.json(
        { ok: false, error: "É necessário concordar com os termos" },
        { status: 400 }
      );
    }

    // Enriquecer com dados do servidor
    const enrichedLead: LeadPayload = {
      ...body,
      timestamp: body.timestamp || new Date().toISOString(),
    };

    // Coletar dados para Meta Conversion API
    const ipAddress = (request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown") as string;
    const userAgent = request.headers.get("user-agent") || undefined;
    const eventSourceUrl =
      request.headers.get("referer") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://quiz.visitavel.com";

    // Enviar evento Lead para Meta Conversion API (server-side tracking)
    sendMetaEvent({
      eventName: "Lead",
      email: enrichedLead.email,
      phone: enrichedLead.whatsapp,
      ipAddress,
      userAgent,
      eventSourceUrl,
      customData: {
        lead_source: "quiz",
      },
    }).catch((error) => {
      console.error("[Lead] Meta CAPI error (non-blocking):", error);
    });

    // Tentar enviar para webhook
    const webhookSuccess = await sendLeadToWebhook(enrichedLead);

    // Sempre salvar no arquivo como backup/fallback
    await saveLeadToFile(enrichedLead);

    return NextResponse.json({
      ok: true,
      message: "Lead captured successfully",
      webhookDelivered: webhookSuccess,
    });
  } catch (error) {
    console.error("[Lead] Error processing lead:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Erro ao processar lead",
      },
      { status: 500 }
    );
  }
}

// Método OPTIONS para CORS (se necessário)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
