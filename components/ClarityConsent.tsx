/**
 * @file: ClarityConsent.tsx
 * @responsibility: GDPR consent management for Microsoft Clarity
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { setClarityConsent } from "@/components/Clarity";

export function ClarityConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem("clarity-consent");
    if (consent === "true") {
      setHasConsent(true);
      setClarityConsent(true);
    } else if (consent === "false") {
      setHasConsent(false);
      setClarityConsent(false);
    } else {
      // First visit - show banner
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("clarity-consent", "true");
    setHasConsent(true);
    setShowBanner(false);
    setClarityConsent(true);
  };

  const handleDecline = () => {
    localStorage.setItem("clarity-consent", "false");
    setHasConsent(false);
    setShowBanner(false);
    setClarityConsent(false);
  };

  const handleWithdraw = () => {
    localStorage.setItem("clarity-consent", "false");
    setHasConsent(false);
    setClarityConsent(false);
  };

  if (!showBanner && hasConsent !== null) {
    return null;
  }

  return (
    <>
      {/* Consent Banner */}
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1">
                  🍪 Análise de Comportamento
                </h3>
                <p className="text-xs text-gray-600">
                  Usamos Microsoft Clarity para entender como você navega no
                  site e melhorar sua experiência. Nenhum dado pessoal é
                  coletado.{" "}
                  <a
                    href="/politica-privacidade"
                    className="text-blue-600 hover:underline"
                  >
                    Política de Privacidade
                  </a>
                  {" • "}
                  <a
                    href="/termos-uso"
                    className="text-blue-600 hover:underline"
                  >
                    Termos de Uso
                  </a>
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDecline}
                  className="text-xs"
                >
                  Recusar
                </Button>
                <Button size="sm" onClick={handleAccept} className="text-xs">
                  Aceitar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Consent Status (for testing) */}
      {hasConsent !== null && (
        <div className="fixed top-4 right-4 z-40">
          <div className="bg-gray-100 rounded-lg p-2 text-xs">
            <div className="flex items-center gap-2">
              <span>Clarity:</span>
              <span className={hasConsent ? "text-green-600" : "text-red-600"}>
                {hasConsent ? "Ativo" : "Desabilitado"}
              </span>
              {hasConsent && (
                <button
                  onClick={handleWithdraw}
                  className="text-blue-600 hover:underline"
                >
                  Desativar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
