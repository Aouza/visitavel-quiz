/**
 * @file: termos-uso/page.tsx
 * @responsibility: página de termos de uso do Cora Quiz
 * @exports: Termos de Uso completos
 * @imports: React, Next.js
 * @layer: pages
 */

import React from "react";

export default function TermosUso() {
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white p-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-8">
            Termos de Uso
          </h1>

          <div className="prose prose-gray max-w-none">
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  1. Aceitação dos Termos
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Ao acessar e utilizar o <strong>Cora Quiz</strong>{" "}
                  (quiz.visitavel.com), você concorda em cumprir e estar sujeito
                  aos termos e condições descritos neste documento. Se você não
                  concorda com qualquer parte destes termos, não deve utilizar
                  nosso serviço.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  2. Descrição do Serviço
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    O Cora Quiz é uma ferramenta digital de entretenimento que
                    oferece:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 ml-4 space-y-2">
                    <li>Quiz interativo de autoconhecimento emocional</li>
                    <li>
                      Resultados personalizados baseados nas suas respostas
                    </li>
                    <li>Conteúdo educativo sobre inteligência emocional</li>
                    <li>Experiência de entretenimento digital</li>
                  </ul>

                  <div className="bg-blue-50 border-l-2 border-blue-200 p-4 rounded">
                    <p className="text-blue-800 font-medium">
                      <strong>Importante:</strong> Este serviço é exclusivamente
                      para entretenimento e autoconhecimento. Não possui caráter
                      médico, psicológico ou terapêutico.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  3. Elegibilidade e Registro
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    Para utilizar o Cora Quiz, você deve:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 ml-4 space-y-2">
                    <li>Ter pelo menos 13 anos de idade</li>
                    <li>Fornecer informações verdadeiras e atualizadas</li>
                    <li>
                      Ser responsável por manter a confidencialidade de suas
                      informações
                    </li>
                    <li>
                      Notificar-nos imediatamente sobre qualquer uso não
                      autorizado
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  4. Uso Aceitável
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    Você concorda em usar o Cora Quiz apenas para fins legais e
                    de acordo com estes termos. É proibido:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 ml-4 space-y-2">
                    <li>
                      Usar o serviço para qualquer propósito ilegal ou não
                      autorizado
                    </li>
                    <li>
                      Tentar obter acesso não autorizado aos nossos sistemas
                    </li>
                    <li>Interferir no funcionamento normal do serviço</li>
                    <li>Usar bots, scripts ou outros meios automatizados</li>
                    <li>
                      Reproduzir, distribuir ou modificar nosso conteúdo sem
                      autorização
                    </li>
                    <li>Enviar spam ou conteúdo ofensivo</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  5. Propriedade Intelectual
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    Todo o conteúdo do Cora Quiz, incluindo textos, gráficos,
                    logos, imagens e software, é propriedade da Visitável ou de
                    seus licenciadores e está protegido por leis de direitos
                    autorais e outras leis de propriedade intelectual.
                  </p>

                  <div className="bg-gray-50 p-4 rounded">
                    <h3 className="text-base font-medium text-gray-900 mb-2">
                      Você pode:
                    </h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>
                        Usar o serviço para fins pessoais e não comerciais
                      </li>
                      <li>Compartilhar seus resultados pessoais</li>
                      <li>
                        Fazer referência ao Cora Quiz em suas redes sociais
                      </li>
                    </ul>
                  </div>

                  <div className="bg-red-50 p-4 rounded">
                    <h3 className="text-base font-medium text-gray-900 mb-2">
                      Você NÃO pode:
                    </h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>Copiar ou reproduzir nosso conteúdo</li>
                      <li>Usar nossa marca para fins comerciais</li>
                      <li>Criar produtos derivados baseados no Cora Quiz</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  6. Limitação de Responsabilidade
                </h2>
                <div className="space-y-4">
                  <div className="bg-yellow-50 border-l-2 border-yellow-200 p-4 rounded">
                    <p className="text-yellow-800 font-medium mb-2">
                      <strong>Aviso Importante:</strong>
                    </p>
                    <p className="text-yellow-800">
                      O Cora Quiz é fornecido "como está" e "conforme
                      disponível". Não garantimos que o serviço será
                      ininterrupto, livre de erros ou vírus.
                    </p>
                  </div>

                  <p className="text-gray-700 leading-relaxed">
                    Em nenhuma circunstância seremos responsáveis por:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 ml-4 space-y-2">
                    <li>
                      Danos diretos, indiretos, incidentais ou consequenciais
                    </li>
                    <li>Perda de dados, lucros ou oportunidades de negócio</li>
                    <li>Interrupção de atividades comerciais</li>
                    <li>Decisões tomadas com base nos resultados do quiz</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  7. Privacidade e Dados
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Sua privacidade é importante para nós. O tratamento dos seus
                  dados pessoais é regido pela nossa
                  <a
                    href="/politica-privacidade"
                    className="text-purple-600 hover:text-purple-800 underline mx-1"
                  >
                    Política de Privacidade
                  </a>
                  , que faz parte integrante destes Termos de Uso.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  8. Modificações do Serviço
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    Reservamo-nos o direito de:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 ml-4 space-y-2">
                    <li>
                      Modificar ou descontinuar o serviço a qualquer momento
                    </li>
                    <li>Atualizar funcionalidades e conteúdo</li>
                    <li>Alterar estes termos com notificação prévia</li>
                    <li>Restringir o acesso em caso de violação dos termos</li>
                  </ul>

                  <p className="text-gray-700 leading-relaxed">
                    Continuar usando o serviço após mudanças constitui aceitação
                    dos novos termos.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  9. Rescisão
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    Você pode encerrar sua conta a qualquer momento entrando em
                    contato conosco. Podemos suspender ou encerrar seu acesso
                    imediatamente se você:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 ml-4 space-y-2">
                    <li>Violar estes Termos de Uso</li>
                    <li>Usar o serviço de forma inadequada</li>
                    <li>Fornecer informações falsas</li>
                    <li>Não cumprir com suas obrigações</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  10. Lei Aplicável
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Estes Termos de Uso são regidos pelas leis brasileiras.
                  Qualquer disputa será resolvida nos tribunais competentes do
                  Brasil, especificamente na jurisdição de São Paulo, SP.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  11. Contato
                </h2>
                <div className="bg-purple-50 p-4 rounded">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Para questões relacionadas a estes Termos de Uso, entre em
                    contato conosco:
                  </p>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <strong>E-mail:</strong>
                      <a
                        href="mailto:visitaveltap@gmail.com"
                        className="text-purple-600 hover:text-purple-800 underline ml-2"
                      >
                        visitaveltap@gmail.com
                      </a>
                    </p>
                    <p className="text-gray-700">
                      <strong>Site:</strong>
                      <a
                        href="https://quiz.visitavel.com"
                        className="text-purple-600 hover:text-purple-800 underline ml-2"
                      >
                        quiz.visitavel.com
                      </a>
                    </p>
                  </div>
                </div>
              </section>

              <section className="bg-yellow-50 border-l-2 border-yellow-200 p-4 rounded">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  Aviso Legal Importante
                </h2>
                <p className="text-gray-700 leading-relaxed font-medium">
                  O Cora Quiz é uma ferramenta de entretenimento e
                  autoconhecimento. Não substitui terapia, aconselhamento
                  psicológico, diagnóstico médico ou qualquer tipo de tratamento
                  profissional. Os resultados são simbólicos e destinados apenas
                  ao entretenimento pessoal.
                </p>
              </section>

              <div className="mt-12 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center">
                  <strong>Última atualização:</strong>{" "}
                  {new Date().toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
