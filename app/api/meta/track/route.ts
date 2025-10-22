/**
 * @file: app/api/meta/track/route.ts
 * @responsibility: Endpoint para enviar eventos à Meta Conversions API
 * @exports: POST handler
 */

import { NextRequest, NextResponse } from "next/server";
import { sendMetaEvent } from "@/lib/meta-capi";

interface TrackRequest {
  eventName: string;
  eventId: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  birthdate?: string;
  customData?: Record<string, string | number>;
  fbp?: string;
  fbc?: string;
  eventSourceUrl: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: TrackRequest = await request.json();

    // 🔍 LOG: Requisição recebida
    console.log("[Meta Track API] 📨 Requisição recebida:", {
      eventName: body.eventName,
      eventId: body.eventId?.slice(0, 8) + "...",
      hasEmail: !!body.email,
      hasPhone: !!body.phone,
      hasFbp: !!body.fbp,
      hasFbc: !!body.fbc,
    });

    // Validação básica
    if (!body.eventName || !body.eventId) {
      console.error(
        "[Meta Track API] ❌ Validação falhou: faltam campos obrigatórios"
      );
      return NextResponse.json(
        { success: false, error: "eventName e eventId são obrigatórios" },
        { status: 400 }
      );
    }

    // Coletar dados do servidor (IP, User Agent)
    const ipAddress = (request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown") as string;

    const userAgent = request.headers.get("user-agent") || undefined;

    console.log("[Meta Track API] 🔧 Dados do servidor:", {
      ip: ipAddress,
      hasUserAgent: !!userAgent,
    });

    // Enviar para Meta Conversions API
    const success = await sendMetaEvent({
      eventName: body.eventName,
      eventId: body.eventId,
      email: body.email,
      phone: body.phone,
      firstName: body.firstName, // 🆕
      lastName: body.lastName, // 🆕
      gender: body.gender, // 🆕
      birthdate: body.birthdate, // 🆕
      ipAddress,
      userAgent,
      eventSourceUrl: body.eventSourceUrl,
      customData: body.customData,
      fbp: body.fbp,
      fbc: body.fbc,
    });

    console.log("[Meta Track API] ✅ Resultado final:", { success });

    return NextResponse.json({ success });
  } catch (error) {
    console.error("[Meta Track API] ❌ Erro fatal:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
