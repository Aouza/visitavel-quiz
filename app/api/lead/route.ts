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
  name?: string;
  email: string;
  whatsapp: string;
  gender?: string;
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
    console.log(`[Lead] 📂 Diretório: ${TMP_DIR}`);
    console.log(`[Lead] 📄 Arquivo: ${LEADS_FILE}`);

    // Criar diretório tmp se não existir
    if (!existsSync(TMP_DIR)) {
      console.log("[Lead] 📁 Criando diretório tmp...");
      await mkdir(TMP_DIR, { recursive: true });
      console.log("[Lead] ✅ Diretório criado!");
    } else {
      console.log("[Lead] ✅ Diretório já existe");
    }

    // Adicionar lead ao arquivo JSONL (uma linha por lead)
    const line = JSON.stringify(lead) + "\n";
    console.log(`[Lead] ✍️ Escrevendo linha: ${line.substring(0, 100)}...`);
    await writeFile(LEADS_FILE, line, { flag: "a" });
    console.log("[Lead] ✅ Linha escrita com sucesso!");
  } catch (error) {
    console.error("[Lead] ❌ Erro ao salvar no arquivo:", error);
    throw error;
  }
}

async function sendLeadToWebhook(lead: LeadPayload): Promise<boolean> {
  const webhookUrl = process.env.LEAD_WEBHOOK_URL;

  console.log("[Lead] 🔍 DEBUG - LEAD_WEBHOOK_URL existe?", !!webhookUrl);
  console.log("[Lead] 🔍 DEBUG - URL (primeiros 50 chars):", webhookUrl?.substring(0, 50) || "UNDEFINED");

  if (!webhookUrl) {
    console.log("[Lead] ❌ LEAD_WEBHOOK_URL não está configurada em produção!");
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
  console.log("[Lead] 🔵 API endpoint /api/lead foi chamada!");

  try {
    const body: LeadPayload = await request.json();
    console.log("[Lead] 📦 Dados recebidos:", JSON.stringify(body, null, 2));

    // Validação básica
    if (!body.email || !body.whatsapp) {
      console.log("[Lead] ❌ Validação falhou: email ou whatsapp faltando");
      return NextResponse.json(
        { ok: false, error: "E-mail e WhatsApp são obrigatórios" },
        { status: 400 }
      );
    }

    if (!body.consent) {
      console.log("[Lead] ❌ Validação falhou: consent não dado");
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

    console.log(
      "[Lead] 📝 Lead enriquecido:",
      JSON.stringify(enrichedLead, null, 2)
    );

    // Meta Conversion API já é tratado pelo client-side via trackMetaEvent()
    // que chama /api/meta/track automaticamente (não duplicar aqui)

    // Tentar enviar para webhook
    console.log("[Lead] 🌐 Tentando enviar para webhook...");
    const webhookSuccess = await sendLeadToWebhook(enrichedLead);
    console.log(
      `[Lead] ${webhookSuccess ? "✅" : "⚠️"} Webhook ${
        webhookSuccess ? "enviado com sucesso" : "não configurado ou falhou"
      }`
    );

    // Sempre salvar no arquivo como backup/fallback
    console.log("[Lead] 💾 Salvando no arquivo local...");
    await saveLeadToFile(enrichedLead);
    console.log("[Lead] ✅ Lead salvo no arquivo com sucesso!");

    return NextResponse.json({
      ok: true,
      message: "Lead captured successfully",
      webhookDelivered: webhookSuccess,
    });
  } catch (error) {
    console.error("[Lead] ❌ Erro ao processar lead:", error);

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
