/**
 * @file: Clarity.tsx
 * @responsibility: Microsoft Clarity analytics integration
 *
 * 🚀 PERFORMANCE: Carregamento não-bloqueante e fila resiliente para eventos
 */

"use client";

import Script from "next/script";

const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
const CLARITY_CONSENTLESS_MODE =
  process.env.NEXT_PUBLIC_CLARITY_CONSENTLESS === "true";

type ClarityFunction = (action: string, ...args: any[]) => void;

type ClarityQueueItem = {
  action: string;
  args: any[];
};

type ClarityStubFunction = ClarityFunction & {
  __clarityStub?: true;
  q?: any[];
};

const MAX_FLUSH_ATTEMPTS = 20;
const FLUSH_INTERVAL_MS = 250;

declare global {
  interface Window {
    clarity?: unknown;
    clarityConsent?: string;
    __clarityQueue?: ClarityQueueItem[];
  }
}

function isClarityStub(fn: unknown): fn is ClarityStubFunction {
  return typeof fn === "function" && Boolean((fn as ClarityStubFunction).__clarityStub);
}

function ensureQueueExists() {
  if (typeof window === "undefined") return;
  if (!Array.isArray(window.__clarityQueue)) {
    window.__clarityQueue = [];
  }
}

function ensureClarityStub() {
  if (typeof window === "undefined") return;

  const current = window.clarity;
  if (typeof current === "function") {
    if (!isClarityStub(current)) {
      return;
    }
    return;
  }

  const stub: ClarityStubFunction = function clarityStub(
    action: string,
    ...args: any[]
  ) {
    queueClarityCall(action, ...args);
  };

  stub.__clarityStub = true;
  stub.q = stub.q || [];
  window.clarity = stub as ClarityFunction;
}

function queueClarityCall(action: string, ...args: any[]) {
  if (typeof window === "undefined") return;
  ensureQueueExists();
  ensureClarityStub();

  const current = window.clarity;
  if (isClarityStub(current)) {
    current.q = current.q || [];
    current.q.push([action, ...args]);
  }

  window.__clarityQueue!.push({ action, args });
}

function flushQueueIfReady(): boolean {
  if (typeof window === "undefined") return false;

  const clarity = window.clarity;
  if (typeof clarity !== "function" || isClarityStub(clarity)) {
    return false;
  }

  const queue = window.__clarityQueue;
  if (!queue?.length) {
    return true;
  }

  window.__clarityQueue = [];

  queue.forEach(({ action, args }) => {
    try {
      clarity(action, ...args);
    } catch (error) {
      // Ignorar falhas individuais da fila
    }
  });

  return true;
}

function scheduleQueueFlush() {
  if (flushQueueIfReady()) {
    return;
  }

  let attempts = 0;
  const intervalId = window.setInterval(() => {
    attempts += 1;
    const flushed = flushQueueIfReady();

    if (flushed || attempts >= MAX_FLUSH_ATTEMPTS) {
      window.clearInterval(intervalId);
    }
  }, FLUSH_INTERVAL_MS);
}

export function ClarityAnalytics() {
  if (!CLARITY_PROJECT_ID) {
    return null;
  }

  return (
    <Script
      id="microsoft-clarity"
      strategy="lazyOnload"
      onLoad={() => {
        if (CLARITY_CONSENTLESS_MODE) {
          window.clarityConsent = "granted";
        }
        scheduleQueueFlush();
      }}
    >
      {`
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
      `}
    </Script>
  );
}

function invokeOrQueue(action: string, ...args: any[]) {
  if (typeof window === "undefined") return;

  try {
    const clarity = window.clarity;
    if (typeof clarity === "function" && !isClarityStub(clarity)) {
      clarity(action, ...args);
      return;
    }

    queueClarityCall(action, ...args);
  } catch (error) {
    queueClarityCall(action, ...args);
  }
}

export function identifyUser(
  customId: string,
  customSessionId?: string,
  customPageId?: string,
  friendlyName?: string
) {
  invokeOrQueue("identify", customId, customSessionId, customPageId, friendlyName);
}

export function setClarityTag(key: string, value: string | string[]) {
  invokeOrQueue("set", key, value);
}

export function trackClarityEvent(eventName: string) {
  invokeOrQueue("event", eventName);
}

export function setClarityConsent(consent: boolean = true) {
  if (typeof window === "undefined") return;

  try {
    const clarity = window.clarity;
    if (typeof clarity === "function" && !isClarityStub(clarity)) {
      clarity("consent", consent);
    } else {
      window.clarityConsent = consent ? "granted" : "denied";
      queueClarityCall("consent", consent);
    }
  } catch (error) {
    queueClarityCall("consent", consent);
  }
}

export function upgradeClaritySession(reason: string) {
  invokeOrQueue("upgrade", reason);
}

if (typeof window !== "undefined") {
  ensureQueueExists();
  ensureClarityStub();
}
