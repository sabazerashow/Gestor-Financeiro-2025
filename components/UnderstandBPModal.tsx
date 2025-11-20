import React from 'react';

interface UnderstandBPModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UnderstandBPModal: React.FC<UnderstandBPModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Entenda Seu Bilhete de Pagamento</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-6 overflow-y-auto prose prose-sm max-w-none">
          <p>
            Aqui você encontra o significado de cada item do seu BP e como ele é calculado, com base nos percentuais identificados.
          </p>

          <h4 className="font-bold mt-6 mb-2 text-gray-800">Pagamentos (Créditos)</h4>
          <p>Estes são os valores que compõem sua remuneração bruta. A maioria é calculada como um percentual sobre o seu <strong>SOLDO</strong> (que é o valor-base do seu posto/graduação).</p>
          <div className="space-y-4 text-gray-700">
            <div>
              <strong>SOLDO (R$ 11.587,00)</strong>
              <p className="ml-4 pl-4 border-l-2 border-gray-200 mt-1">É o valor-base fixo para o seu posto, estabelecido por lei. Ele serve como referência para os demais cálculos.</p>
            </div>
            <div>
              <strong>AD MILITAR (Adicional Militar)</strong>
              <div className="ml-4 pl-4 border-l-2 border-gray-200 mt-1 space-y-1">
                <p><strong>O que é:</strong> Uma parcela devida pela natureza da atividade militar.</p>
                <p><strong>Como é calculado:</strong> Corresponde a <strong>25%</strong> do seu Soldo.</p>
                <em className="block text-gray-500">(R$ 11.587,00 × 0,25 = R$ 2.896,75)</em>
              </div>
            </div>
            <div>
              <strong>AD COMP DISP (Adicional de Compensação por Disponibilidade)</strong>
               <div className="ml-4 pl-4 border-l-2 border-gray-200 mt-1 space-y-1">
                    <p><strong>O que é:</strong> Um adicional pago pela disponibilidade permanente e dedicação exclusiva à carreira.</p>
                    <p><strong>Como é calculado:</strong> Corresponde a <strong>20%</strong> do seu Soldo.</p>
                    <em className="block text-gray-500">(R$ 11.587,00 × 0,20 = R$ 2.317,40)</em>
               </div>
            </div>
            <div>
              <strong>AD HABILIT (Adicional de Habilitação)</strong>
              <div className="ml-4 pl-4 border-l-2 border-gray-200 mt-1 space-y-1">
                <p><strong>O que é:</strong> Um acréscimo pago pelos seus cursos e qualificações.</p>
                <p><strong>Como é calculado:</strong> Corresponde a <strong>73%</strong> do seu Soldo. (Este é o percentual mais alto, referente a "Altos Estudos - Categoria I").</p>
                <em className="block text-gray-500">(R$ 11.587,00 × 0,73 = R$ 8.458,51)</em>
              </div>
            </div>
            <div>
              <strong>ACO VOO TM (Adicional de Compensação Orgânica - Voo Tripulante)</strong>
              <div className="ml-4 pl-4 border-l-2 border-gray-200 mt-1 space-y-1">
                <p><strong>O que é:</strong> Uma compensação pelo desgaste físico decorrente da atividade de voo.</p>
                <p><strong>Como é calculado:</strong> Corresponde a <strong>20%</strong> do seu Soldo.</p>
                <em className="block text-gray-500">(R$ 11.587,00 × 0,20 = R$ 2.317,40)</em>
              </div>
            </div>
          </div>

          <h4 className="font-bold mt-6 mb-2 text-gray-800">Descontos (Débitos)</h4>
          <p>Estes são os valores deduzidos da sua remuneração bruta.</p>

          <div className="mt-4">
            <h5 className="font-semibold text-gray-800">1. Descontos Obrigatórios (Percentuais)</h5>
            <p className="mt-1">Estes são calculados sobre o seu <strong>Total de Pagamentos</strong> (Remuneração Bruta de R$ 27.577,06).</p>
            <div className="space-y-4 mt-2 text-gray-700">
               <div>
                  <strong>PENSAO MILIT (Pensão Militar)</strong>
                  <div className="ml-4 pl-4 border-l-2 border-gray-200 mt-1 space-y-1">
                    <p><strong>O que é:</strong> A contribuição obrigatória que garante a pensão aos seus beneficiários.</p>
                    <p><strong>Como é calculado:</strong> Corresponde a <strong>10,5%</strong> da sua remuneração bruta.</p>
                    <em className="block text-gray-500">(R$ 27.577,06 × 0,105 = R$ 2.895,59)</em>
                  </div>
              </div>
              <div>
                  <strong>FUSMA TIT (Fundo de Saúde da Marinha - Titular)</strong>
                  <div className="ml-4 pl-4 border-l-2 border-gray-200 mt-1 space-y-1">
                    <p><strong>O que é:</strong> Sua contribuição mensal para o sistema de saúde da Marinha.</p>
                    <p><strong>Como é calculado:</strong> Corresponde a <strong>1,8%</strong> da sua remuneração bruta.</p>
                    <em className="block text-gray-500">(R$ 27.577,06 × 0,018 = R$ 496,38)</em>
                  </div>
              </div>
              <div>
                  <strong>FUSMA DEPDIR (Fundo de Saúde da Marinha - Dependente Direto)</strong>
                  <div className="ml-4 pl-4 border-l-2 border-gray-200 mt-1 space-y-1">
                    <p><strong>O que é:</strong> A contribuição adicional para seus dependentes no sistema de saúde.</p>
                    <p><strong>Como é calculado:</strong> Corresponde a <strong>0,3%</strong> da sua remuneração bruta (por dependente).</p>
                    <em className="block text-gray-500">(R$ 27.577,06 × 0,003 = R$ 82,73)</em>
                  </div>
              </div>
            </div>
          </div>

           <div className="mt-4">
                <h5 className="font-semibold text-gray-800">2. Outros Descontos (Consignações - Valor Fixo)</h5>
                <p className="mt-1">Estes não são percentuais, mas sim valores fixos autorizados por você.</p>
                <div className="space-y-4 mt-2 text-gray-700">
                    <div>
                        <strong>CN MENS (Clube Naval - Mensalidade)</strong>
                         <div className="ml-4 pl-4 border-l-2 border-gray-200 mt-1 space-y-1">
                            <p><strong>O que é:</strong> A mensalidade da sua associação ao Clube Naval.</p>
                            <p><strong>Como é calculado:</strong> É um <strong>valor fixo</strong> de <strong>R$ 250,80</strong>.</p>
                         </div>
                    </div>
                    <div>
                        <strong>PROMORAR</strong>
                        <div className="ml-4 pl-4 border-l-2 border-gray-200 mt-1 space-y-1">
                            <p><strong>O que é:</strong> O pagamento de uma prestação de financiamento imobiliário.</p>
                            <p><strong>Como é calculado:</strong> É um <strong>valor fixo</strong> de <strong>R$ 5.300,63</strong>.</p>
                        </div>
                    </div>
                </div>
           </div>

          <div className="mt-4">
            <h5 className="font-semibold text-gray-800">3. Imposto de Renda (Cálculo Complexo)</h5>
            <div className="space-y-4 mt-2 text-gray-700">
                <div>
                    <strong>IMP RENDA (Imposto de Renda Retido na Fonte)</strong>
                    <div className="ml-4 pl-4 border-l-2 border-gray-200 mt-1 space-y-1">
                        <p><strong>O que é:</strong> O imposto obrigatório sobre sua renda.</p>
                        <p><strong>Como é calculado:</strong> Este não é um percentual simples. O cálculo é:</p>
                        <ol className="list-decimal list-inside ml-4 space-y-1 mt-2">
                            <li>Pega-se o <strong>Total de Pagamentos</strong> (R$ 27.577,06).</li>
                            <li>Subtraem-se as deduções legais (Pensão Militar + FUSMA), que somam R$ 3.474,70.</li>
                            <li>A "Base de Cálculo" torna-se <strong>R$ 24.102,36</strong>.</li>
                            <li>Sobre esse valor, aplica-se a alíquota da tabela do IR, que no seu caso é a máxima de <strong>27,5%</strong>, com uma parcela a deduzir. O valor final descontado (R$ 5.719,41) é o resultado desse cálculo.</li>
                        </ol>
                    </div>
                </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-md text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnderstandBPModal;
