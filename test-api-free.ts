/**
 * Script de teste para a API de relatório gratuito (modo "free")
 *
 * Para executar:
 * 1. Certifique-se que o servidor está rodando (yarn dev)
 * 2. Execute: npx tsx test-api-free.ts
 */

const API_URL = "http://localhost:3000/api/generate-report";

// Payload de teste com respostas simuladas
const testPayload = {
  segment: "abstinencia",
  answers: {
    "relationship-duration": "long",
    "breakup-initiator": "them",
    "contact-frequency": "high",
    "emotional-state": "anxious",
    "physical-symptoms": "yes",
    "support-system": "limited",
    "coping-mechanisms": "unhealthy",
    "future-outlook": "pessimistic",
  },
  scores: {
    devastacao: 85,
    abstinencia: 92,
    interiorizacao: 45,
    ira: 30,
    superacao: 25,
  },
  mode: "free", // ← Modo JSON estruturado
};

async function testFreeReport() {
  console.log("🚀 Testando API de relatório gratuito (modo 'free')...\n");
  console.log("📤 Enviando payload:", JSON.stringify(testPayload, null, 2));
  console.log("\n⏳ Aguardando resposta da OpenAI...\n");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testPayload),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ Erro na API:", error);
      process.exit(1);
    }

    const data = await response.json();

    console.log("✅ Resposta recebida!\n");
    console.log("📊 Metadata:");
    console.log(`  - Segment: ${data.segment}`);
    console.log(`  - Mode: ${data.mode}`);
    console.log(`  - Generated at: ${data.generatedAt}`);
    console.log("\n");

    console.log("📄 Estrutura do relatório:");
    console.log(`  - Headline: ${data.report.headline}`);
    console.log(`  - Subheadline: ${data.report.subheadline}`);
    console.log(
      `  - Progress: ${data.report.progress.revealed}/${data.report.progress.total}`
    );
    console.log(`  - Sections: ${data.report.sections.length}`);
    console.log(
      `  - Locked chapters: ${data.report.nextBlock.lockedChapters.length}`
    );
    console.log("\n");

    console.log("📝 Seções geradas:");
    data.report.sections.forEach((section: any, index: number) => {
      console.log(`\n  ${index + 1}. ${section.icon} ${section.title}`);
      console.log(`     ID: ${section.id}`);
      console.log(`     Severity: ${section.severity}`);
      console.log(`     Summary: ${section.summary.substring(0, 100)}...`);
      console.log(`     Insight: ${section.insight.substring(0, 100)}...`);

      if (section.bullets) {
        if (section.bullets.voce_pode_dizer_que) {
          console.log(
            `     ✓ voce_pode_dizer_que: ${section.bullets.voce_pode_dizer_que.length} items`
          );
        }
        if (section.bullets.voce_vai_perceber) {
          console.log(
            `     ✓ voce_vai_perceber: ${section.bullets.voce_vai_perceber.length} items`
          );
        }
        if (section.bullets.o_que_fazer_agora) {
          console.log(
            `     ✓ o_que_fazer_agora: ${section.bullets.o_que_fazer_agora.length} items`
          );
        }
      }

      if (section.callouts) {
        console.log(`     ✓ callouts: ${section.callouts.length} items`);
      }
    });

    console.log("\n");
    console.log("🔒 Next Block (Lockwall):");
    console.log(`  Summary: ${data.report.nextBlock.lockwallSummary}`);
    console.log(`  CTA: ${data.report.nextBlock.cta.label}`);
    console.log(`  Locked chapters:`);
    data.report.nextBlock.lockedChapters.forEach((chapter: any) => {
      console.log(`    - ${chapter.title}: ${chapter.oneLine}`);
    });

    console.log("\n");
    console.log("💾 Salvando JSON completo em test-report-output.json...");

    // Salvar JSON completo para inspeção
    const fs = require("fs");
    fs.writeFileSync(
      "test-report-output.json",
      JSON.stringify(data, null, 2),
      "utf-8"
    );

    console.log("✅ Teste concluído com sucesso!");
    console.log(
      "\n📁 Arquivo salvo: test-report-output.json (abra para ver o JSON completo)"
    );
  } catch (error) {
    console.error("❌ Erro ao testar API:", error);
    process.exit(1);
  }
}

// Executar teste
testFreeReport();
