/**
 * @file: app/test-ai/page.tsx
 * @responsibility: Página de teste para API de geração de relatório
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AIReport } from "@/components/AIReport";
import { type Segment } from "@/lib/questions";
import { Loader2 } from "lucide-react";

// Respostas de exemplo para cada segmento
const MOCK_ANSWERS: Record<Segment, Record<string, string>> = {
  devastacao: {
    tempo_fim: "0-7",
    checagens: "6+",
    sono: "insonia",
    apetite: "sem_apetite",
    impulso_contato: "constante",
    idealizacao: "totalmente",
    raiva: "leve",
    culpa: "frequente",
    reflexao: "nao",
    futuro: "nao",
    atividades: "nao",
    novas_conexoes: "nao",
  },
  abstinencia: {
    tempo_fim: "8-30",
    checagens: "6+",
    sono: "dificuldade",
    apetite: "diminuiu",
    impulso_contato: "constante",
    idealizacao: "totalmente",
    raiva: "leve",
    culpa: "as_vezes",
    reflexao: "comecando",
    futuro: "dificil",
    atividades: "forcando",
    novas_conexoes: "ainda_nao",
  },
  interiorizacao: {
    tempo_fim: "31-90",
    checagens: "1-2",
    sono: "dificuldade",
    apetite: "normal",
    impulso_contato: "as_vezes",
    idealizacao: "um_pouco",
    raiva: "leve",
    culpa: "frequente",
    reflexao: "bastante",
    futuro: "dificil",
    atividades: "forcando",
    novas_conexoes: "ainda_nao",
  },
  ira: {
    tempo_fim: "31-90",
    checagens: "3-5",
    sono: "acordo",
    apetite: "aumentou",
    impulso_contato: "frequente",
    idealizacao: "nao",
    raiva: "intensa",
    culpa: "nao",
    reflexao: "nao",
    futuro: "dificil",
    atividades: "forcando",
    novas_conexoes: "ainda_nao",
  },
  superacao: {
    tempo_fim: "90+",
    checagens: "nunca",
    sono: "normal",
    apetite: "normal",
    impulso_contato: "nao",
    idealizacao: "nao",
    raiva: "nao",
    culpa: "nao",
    reflexao: "mudancas",
    futuro: "sim",
    atividades: "sim",
    novas_conexoes: "sim",
  },
};

const MOCK_SCORES: Record<Segment, Record<Segment, number>> = {
  devastacao: {
    devastacao: 15,
    abstinencia: 8,
    interiorizacao: 4,
    ira: 2,
    superacao: 0,
  },
  abstinencia: {
    devastacao: 6,
    abstinencia: 16,
    interiorizacao: 4,
    ira: 2,
    superacao: 1,
  },
  interiorizacao: {
    devastacao: 4,
    abstinencia: 6,
    interiorizacao: 14,
    ira: 3,
    superacao: 2,
  },
  ira: {
    devastacao: 5,
    abstinencia: 8,
    interiorizacao: 3,
    ira: 15,
    superacao: 1,
  },
  superacao: {
    devastacao: 0,
    abstinencia: 1,
    interiorizacao: 2,
    ira: 0,
    superacao: 16,
  },
};

const SEGMENT_LABELS: Record<Segment, string> = {
  devastacao: "💔 Devastação",
  abstinencia: "🔄 Abstinência",
  interiorizacao: "🤔 Interiorização",
  ira: "😤 Ira",
  superacao: "🌟 Superação",
};

export default function TestAIPage() {
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRequestTime, setLastRequestTime] = useState<number | null>(null);
  const [userBirthdate, setUserBirthdate] = useState<string>("");
  const [exBirthdate, setExBirthdate] = useState<string>("");

  const handleGenerate = async () => {
    if (!selectedSegment) {
      alert("Selecione um segmento primeiro!");
      return;
    }

    setIsLoading(true);
    setError(null);
    setReport(null);

    const startTime = Date.now();

    try {
      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          segment: selectedSegment,
          answers: MOCK_ANSWERS[selectedSegment],
          scores: MOCK_SCORES[selectedSegment],
          birthdate: userBirthdate || undefined,
          exBirthdate: exBirthdate || undefined,
        }),
      });

      const endTime = Date.now();
      setLastRequestTime(endTime - startTime);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao gerar relatório");
      }

      const data = await response.json();
      setReport(data.report);
    } catch (err) {
      console.error("Erro:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao gerar relatório"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setReport(null);
    setError(null);
    setLastRequestTime(null);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">🧪 Teste de API - OpenAI</h1>
        <p className="text-muted-foreground">
          Gere relatórios de teste sem passar pelo quiz completo
        </p>
      </div>

      {/* Controls */}
      <Card className="mb-8 border-2">
        <CardHeader>
          <CardTitle>Configuração do Teste</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Segment Selector */}
          <div className="space-y-2">
            <Label htmlFor="segment">Selecione o Segmento</Label>
            <Select
              value={selectedSegment || ""}
              onValueChange={(value) => setSelectedSegment(value as Segment)}
            >
              <SelectTrigger id="segment">
                <SelectValue placeholder="Escolha um segmento para testar..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SEGMENT_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Segment Info */}
          {selectedSegment && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-sm">
                Dados de Teste para: {SEGMENT_LABELS[selectedSegment]}
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Respostas:</span>{" "}
                  {Object.keys(MOCK_ANSWERS[selectedSegment]).length} perguntas
                </div>
                <div>
                  <span className="text-muted-foreground">Score Total:</span>{" "}
                  {Object.values(MOCK_SCORES[selectedSegment]).reduce(
                    (a, b) => a + b,
                    0
                  )}{" "}
                  pontos
                </div>
              </div>
              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                  Ver scores detalhados
                </summary>
                <div className="mt-2 pl-4 space-y-1">
                  {Object.entries(MOCK_SCORES[selectedSegment]).map(
                    ([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize">{key}:</span>
                        <span className="font-mono">{value}</span>
                      </div>
                    )
                  )}
                </div>
              </details>
            </div>
          )}

          {/* Birthdate Fields */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">
                🔮 Enriquecimento Astrológico (Opcional)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userBirthdate" className="text-sm">
                  Data de nascimento do usuário
                </Label>
                <Input
                  id="userBirthdate"
                  type="date"
                  value={userBirthdate}
                  onChange={(e) => setUserBirthdate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exBirthdate" className="text-sm">
                  Data de nascimento do ex
                </Label>
                <Input
                  id="exBirthdate"
                  type="date"
                  value={exBirthdate}
                  onChange={(e) => setExBirthdate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="text-sm"
                />
              </div>
            </div>

            {(userBirthdate || exBirthdate) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900">
                ✨ Insights astrológicos serão incorporados sutilmente no
                relatório
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleGenerate}
              disabled={!selectedSegment || isLoading}
              className="flex-1"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                "🚀 Gerar Relatório"
              )}
            </Button>

            {(report || error) && (
              <Button
                onClick={handleClear}
                variant="outline"
                size="lg"
                disabled={isLoading}
              >
                🗑️ Limpar
              </Button>
            )}
          </div>

          {/* Performance Info */}
          {lastRequestTime !== null && (
            <div className="text-xs text-center text-muted-foreground">
              ⚡ Tempo de resposta: {(lastRequestTime / 1000).toFixed(2)}s
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Display */}
      <AIReport
        report={report}
        isLoading={isLoading}
        error={error}
        onRetry={handleGenerate}
      />

      {/* Debug Info */}
      {process.env.NODE_ENV === "development" && (
        <Card className="mt-8 border-dashed">
          <CardHeader>
            <CardTitle className="text-sm">🐛 Debug Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-xs space-y-1">
              <div>
                <span className="text-muted-foreground">Segmento:</span>{" "}
                <code className="bg-muted px-1 rounded">
                  {selectedSegment || "não selecionado"}
                </code>
              </div>
              <div>
                <span className="text-muted-foreground">Status API:</span>{" "}
                <code className="bg-muted px-1 rounded">
                  {isLoading
                    ? "⏳ carregando"
                    : error
                    ? "❌ erro"
                    : report
                    ? "✅ sucesso"
                    : "⚪ aguardando"}
                </code>
              </div>
              <div>
                <span className="text-muted-foreground">Endpoint:</span>{" "}
                <code className="bg-muted px-1 rounded">
                  POST /api/generate-report
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <div className="mt-8 text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          💡 Esta página é apenas para desenvolvimento e testes
        </p>
        <p className="text-xs text-muted-foreground">
          Certifique-se de que sua <code>OPENAI_API_KEY</code> está configurada
          em <code>.env.local</code>
        </p>
      </div>
    </div>
  );
}
