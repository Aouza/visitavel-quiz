/**
 * @file: politica-privacidade/page.tsx
 * @responsibility: página de política de privacidade do Cora Quiz
 * @exports: Política de Privacidade completa
 * @imports: React, Next.js
 * @layer: pages
 */

import React from "react";

export default function PoliticaPrivacidade() {
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white p-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-8">
            Política de Privacidade
          </h1>

          <div className="prose prose-gray max-w-none">
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  1. Introdução
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Esta Política de Privacidade descreve como o{" "}
                  <strong>Cora Quiz</strong>
                  (quiz.visitavel.com) coleta, usa e protege suas informações
                  pessoais. Nosso compromisso é garantir a transparência e
                  segurança dos seus dados.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  2. Informações que Coletamos
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      2.1 Informações Pessoais
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Coletamos apenas as informações essenciais para o
                      funcionamento do quiz:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 ml-4 space-y-2">
                      <li>
                        <strong>Nome:</strong> para personalização dos
                        resultados
                      </li>
                      <li>
                        <strong>E-mail:</strong> para envio dos resultados e
                        comunicações
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      2.2 Informações Técnicas
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Coletamos automaticamente informações técnicas para
                      melhorar sua experiência:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 ml-4 space-y-2">
                      <li>Endereço IP (anonimizado)</li>
                      <li>Tipo de navegador e dispositivo</li>
                      <li>Páginas visitadas e tempo de permanência</li>
                      <li>Respostas do quiz (sem identificação pessoal)</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  3. Como Usamos suas Informações
                </h2>
                <div className="space-y-4">
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Envio dos resultados do quiz para seu e-mail</li>
                    <li>Comunicação sobre melhorias e novidades do produto</li>
                    <li>
                      Análise de comportamento para otimizar a experiência
                    </li>
                    <li>Prevenção de fraudes e segurança da plataforma</li>
                    <li>Suporte técnico quando necessário</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  4. Cookies e Tecnologias de Rastreamento
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    Utilizamos as seguintes ferramentas para entender melhor
                    como você interage com nosso site:
                  </p>

                  <div className="bg-gray-50 p-4 rounded">
                    <h3 className="text-base font-medium text-gray-900 mb-2">
                      Ferramentas Utilizadas:
                    </h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>
                        <strong>Meta Pixel:</strong> para análise de conversões
                        e otimização de anúncios
                      </li>
                      <li>
                        <strong>Google Analytics:</strong> para métricas de uso
                        e comportamento
                      </li>
                      <li>
                        <strong>Microsoft Clarity:</strong> para análise de
                        experiência do usuário
                      </li>
                      <li>
                        <strong>Cookies essenciais:</strong> para funcionamento
                        básico do site
                      </li>
                    </ul>
                  </div>

                  <p className="text-gray-700 leading-relaxed">
                    Você pode desabilitar os cookies nas configurações do seu
                    navegador, mas isso pode afetar algumas funcionalidades do
                    site.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  5. Compartilhamento de Dados
                </h2>
                <div className="space-y-4">
                  <div className="bg-green-50 border-l-2 border-green-200 p-4 rounded">
                    <p className="text-green-800 font-medium">
                      <strong>Importante:</strong> Não vendemos, alugamos ou
                      compartilhamos seus dados pessoais com terceiros para fins
                      comerciais.
                    </p>
                  </div>

                  <p className="text-gray-700 leading-relaxed">
                    Compartilhamos informações apenas nas seguintes situações:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 ml-4 space-y-2">
                    <li>
                      Com prestadores de serviços que nos ajudam a operar a
                      plataforma
                    </li>
                    <li>Quando exigido por lei ou autoridades competentes</li>
                    <li>Para proteger nossos direitos legais</li>
                    <li>Com seu consentimento explícito</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  6. Seus Direitos
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    Você tem os seguintes direitos sobre seus dados pessoais:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 ml-4 space-y-2">
                    <li>
                      <strong>Acesso:</strong> solicitar uma cópia dos dados que
                      temos sobre você
                    </li>
                    <li>
                      <strong>Correção:</strong> corrigir informações incorretas
                      ou incompletas
                    </li>
                    <li>
                      <strong>Exclusão:</strong> solicitar a remoção dos seus
                      dados
                    </li>
                    <li>
                      <strong>Portabilidade:</strong> receber seus dados em
                      formato legível
                    </li>
                    <li>
                      <strong>Oposição:</strong> se opor ao processamento dos
                      seus dados
                    </li>
                  </ul>

                  <p className="text-gray-700 leading-relaxed">
                    Para exercer qualquer um desses direitos, entre em contato
                    conosco através do e-mail{" "}
                    <a
                      href="mailto:contato@visitavel.com"
                      className="text-purple-600 hover:text-purple-800 underline"
                    >
                      contato@visitavel.com
                    </a>
                    .
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  7. Segurança e Armazenamento
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    Implementamos medidas de segurança para proteger suas
                    informações:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 ml-4 space-y-2">
                    <li>Criptografia SSL/TLS para transmissão de dados</li>
                    <li>Armazenamento seguro em servidores confiáveis</li>
                    <li>Acesso restrito aos dados pessoais</li>
                    <li>Monitoramento contínuo de segurança</li>
                  </ul>

                  <p className="text-gray-700 leading-relaxed">
                    Seus dados são armazenados pelo tempo necessário para
                    cumprir os propósitos descritos nesta política ou conforme
                    exigido por lei.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  8. Alterações na Política
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Podemos atualizar esta Política de Privacidade periodicamente.
                  Quando isso acontecer, notificaremos você através do e-mail
                  cadastrado ou por meio de aviso no site. A data da última
                  atualização sempre aparecerá no topo desta página.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  9. Contato
                </h2>
                <div className="bg-purple-50 p-4 rounded">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Se você tiver dúvidas sobre esta Política de Privacidade ou
                    sobre como tratamos seus dados pessoais, entre em contato
                    conosco:
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
