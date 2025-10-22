/**
 * @file: app/api/events/route.ts
 * @responsibility: API endpoint para log de eventos (opcional)
 * @exports: POST handler
 */

import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

interface EventPayload {
  event: string;
  timestamp: string;
  properties?: Record<string, unknown>;
  userAgent?: string;
  referer?: string;
}

const TMP_DIR = join(process.cwd(), "tmp");
const EVENTS_FILE = join(TMP_DIR, "events.jsonl");

async function saveEventToFile(event: EventPayload): Promise<void> {
  try {
    // Criar diretório tmp se não existir
    if (!existsSync(TMP_DIR)) {
      await mkdir(TMP_DIR, { recursive: true });
    }

    // Adicionar evento ao arquivo JSONL
    const line = JSON.stringify(event) + "\n";
    await writeFile(EVENTS_FILE, line, { flag: "a" });
  } catch (error) {
    console.error("[Event] Error saving to file:", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const event: EventPayload = {
      event: body.event,
      timestamp: body.timestamp || new Date().toISOString(),
      properties: body.properties || {},
      userAgent: request.headers.get("user-agent") || undefined,
      referer: request.headers.get("referer") || undefined,
    };

    // Salvar evento localmente (opcional, para debugging)
    if (process.env.NODE_ENV === "development") {
      await saveEventToFile(event);
    }

    // Aqui você pode adicionar integração com outros serviços de analytics
    // Por exemplo: Mixpanel, Segment, etc.

    return NextResponse.json({
      ok: true,
      message: "Event tracked",
    });
  } catch (error) {
    console.error("[Event] Error processing event:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Failed to track event",
      },
      { status: 500 }
    );
  }
}

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
