/**
 * @file: AIReport.tsx
 * @responsibility: Componente para exibir relatório gerado pela IA
 * @exports: AIReport
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Mail } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface AIReportProps {
  report: string | null;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export function AIReport({ report, isLoading, error, onRetry }: AIReportProps) {
  const handleDownload = () => {
    if (!report) return;

    const blob = new Blob([report], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-pos-termino-${
      new Date().toISOString().split("T")[0]
    }.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleEmail = () => {
    alert(
      "Em breve você poderá receber este relatório por e-mail. Por enquanto, use a opção de download."
    );
  };

  // Loading State
  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto mt-8 border-2">
        <CardContent className="pt-12 pb-12">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Gerando seu relatório personalizado...
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Estamos analisando suas respostas e criando um relatório
                detalhado com orientações específicas para você.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error State
  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto mt-8 border-2 border-red-200">
        <CardContent className="pt-12 pb-12">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Erro ao gerar relatório
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">{error}</p>
            </div>
            {onRetry && (
              <Button onClick={onRetry} variant="outline">
                Tentar novamente
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Success State with Report
  if (!report) {
    return null;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8 border-2">
      <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-2xl">
              Seu Relatório Personalizado
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Análise profunda e orientações práticas geradas por IA
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEmail}
              className="gap-2"
            >
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Enviar</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="prose prose-sm sm:prose lg:prose-lg max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold mt-6 mb-4 text-gray-900">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-semibold mt-6 mb-3 text-gray-800">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-800">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="mb-4 text-gray-700 leading-relaxed">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="text-gray-700">{children}</li>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-gray-900">
                  {children}
                </strong>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-gray-600">
                  {children}
                </blockquote>
              ),
            }}
          >
            {report}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
