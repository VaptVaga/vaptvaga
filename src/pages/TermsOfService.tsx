import React from 'react';

export const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12 lg:py-20">
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
          Termos de Serviço e Uso do VaptVaga
        </h1>
        <p className="text-muted-foreground text-sm mb-1">(Versão Beta)</p>
        <p className="text-muted-foreground text-sm mb-8">Última atualização: Março de 2026</p>

        <div className="prose prose-sm max-w-none text-foreground/90 space-y-6">
          <p>
            Bem-vindo(a) ao VaptVaga! Antes de utilizar nossa plataforma, pedimos que leia atentamente estes Termos de Serviço. Ao criar uma conta e utilizar o VaptVaga (seja pelo site ou aplicativo), você concorda com todas as regras descritas abaixo. Se você não concordar com qualquer um dos termos, por favor, não utilize nossos serviços.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">1. Elegibilidade e Cadastro</h2>
            <p><strong>1.1. Idade Mínima:</strong> Para se cadastrar e utilizar o VaptVaga, tanto como Contratante quanto como Freelancer, é estritamente obrigatório ter 18 (dezoito) anos completos ou mais. Contas de menores de idade serão banidas imediatamente.</p>
            <p><strong>1.2. Tipos de Cadastro:</strong> A plataforma permite o cadastro de Contratantes utilizando tanto CNPJ (empresas, restaurantes, bares) quanto CPF (pessoas físicas que precisem de ajuda pontual, como em eventos particulares).</p>
            <p><strong>1.3. Veracidade:</strong> Você é responsável por fornecer informações reais, precisas e atualizadas (nome, documentos, foto, telefone). O uso de dados falsos ou de terceiros resultará em exclusão sumária.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">2. Natureza dos Serviços (Sem Vínculo Empregatício)</h2>
            <p><strong>2.1. Somos um Conector:</strong> O VaptVaga é exclusivamente uma plataforma de tecnologia e classificados online (marketplace). Nosso único objetivo é facilitar o encontro entre quem precisa de mão de obra urgente (Contratante) e quem deseja prestar o serviço pontual (Freelancer).</p>
            <p><strong>2.2. Inexistência de Vínculo:</strong> O VaptVaga não é uma agência de empregos, não atua como empregador e não assina carteira de trabalho. Não existe qualquer vínculo empregatício, societário ou de subordinação entre o VaptVaga e os Freelancers, nem garantimos a aplicação das leis trabalhistas (CLT) nas relações firmadas entre os usuários.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">3. Dinâmica das Vagas e Pagamentos (Versão Beta)</h2>
            <p><strong>3.1. Pagamento por Fora da Plataforma:</strong> Nesta Versão Beta, o VaptVaga não processa, não retém e não intermedia o pagamento do valor das diárias ou turnos. O valor, a forma (Pix, dinheiro, etc.) e o momento do pagamento devem ser combinados e executados diretamente entre a Empresa/Contratante e o Freelancer.</p>
            <p><strong>3.2. Tolerância Zero para "Calotes":</strong> O não pagamento do valor combinado ao Freelancer, após a prestação do serviço, é uma violação gravíssima. Mediante denúncia e confirmação do fato, a conta do Contratante será banida imediatamente e permanentemente da plataforma. O VaptVaga, contudo, não se responsabiliza financeiramente por ressarcir o Freelancer por valores não pagos pelo Contratante.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">4. Política de Faltas e Cancelamentos (Freelancers)</h2>
            <p>Sabemos que imprevistos acontecem, mas a plataforma depende da confiança mútua. Se o Freelancer confirmar presença em um turno e não comparecer ("No-Show") sem aviso prévio, aplicaremos o seguinte sistema de punições:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>1ª Falta:</strong> O Freelancer recebe um Aviso Formal no perfil.</li>
              <li><strong>2ª Falta:</strong> O perfil do Freelancer sofre Suspensão Temporária de 1 (um) mês, ficando impedido de se candidatar a novas vagas.</li>
              <li><strong>3ª Falta:</strong> O perfil sofre Banimento Total e Definitivo.</li>
            </ul>
            <p className="mt-3"><strong>Exceções:</strong> Faltas devidamente justificadas (comprovadas por atestados médicos ou motivos de força maior aceitos pelo suporte) poderão ser analisadas e removidas do histórico do usuário.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">5. Assinaturas, Planos Premium e Cancelamentos</h2>
            <p><strong>5.1. Planos Pagos:</strong> O VaptVaga oferece planos de assinatura que liberam funcionalidades extras. Os valores são cobrados de forma recorrente.</p>
            <p><strong>5.2. Direito de Arrependimento (7 Dias):</strong> Em conformidade com o Código de Defesa do Consumidor, o usuário tem o direito de cancelar sua assinatura e solicitar o reembolso integral em até 7 (sete) dias corridos após a primeira contratação do plano.</p>
            <p><strong>5.3. Cancelamento Padrão:</strong> Após os 7 dias, o usuário pode cancelar a renovação da assinatura a qualquer momento. Não haverá reembolso proporcional, mas o usuário continuará tendo acesso aos benefícios do plano pago até o final do ciclo de faturamento que já foi quitado.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">6. Conduta e Moderação (Tolerância Zero)</h2>
            <p>Para manter o VaptVaga um ambiente seguro e profissional, as atitudes abaixo resultarão no banimento imediato e definitivo da plataforma, sem direito a reembolso ou aviso prévio:</p>
            <ul className="list-disc pl-6 space-y-3 mt-3">
              <li><strong>Assédio de qualquer natureza:</strong> Assédio sexual, moral ou importunação, seja por mensagens no chat da plataforma ou presencialmente durante o turno.</li>
              <li><strong>Violência e Ameaças:</strong> Agressão física, ameaças verbais ou intimidação contra qualquer usuário.</li>
              <li><strong>Discriminação e Preconceito:</strong> Qualquer atitude racista, homofóbica, machista, xenofóbica ou de intolerância religiosa.</li>
              <li><strong>Furtos e Danos Intencionais:</strong> Furtar mercadorias, dinheiro do caixa ou depredar de propósito o estabelecimento do contratante.</li>
              <li><strong>Trabalho sob efeito de entorpecentes:</strong> Comparecer ao turno embriagado ou sob o efeito de drogas ilícitas, colocando em risco a operação, a equipe e os clientes.</li>
              <li><strong>Falsidade Ideológica e Fraudes:</strong> Usar CPF, CNPJ, nome ou fotos de terceiros, criar perfis fakes ou manipular o sistema de avaliações da plataforma.</li>
              <li><strong>Violação de Privacidade (Stalking):</strong> Usar o número de telefone, endereço ou outras informações obtidas através do VaptVaga para perseguir, enviar spam ou importunar a pessoa fora do contexto de trabalho.</li>
              <li><strong>Atividades Ilícitas:</strong> Usar a plataforma para oferecer, buscar ou mascarar serviços ilegais (como venda de produtos irregulares, drogas ou prostituição).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">7. Limitação de Responsabilidade</h2>
            <p><strong>7.1. Acidentes e Danos:</strong> O VaptVaga não se responsabiliza por quaisquer acidentes de trabalho, lesões corporais, ou danos a equipamentos/materiais que ocorram durante a prestação do serviço no estabelecimento do Contratante. A responsabilidade pela segurança no local de trabalho é exclusiva do Contratante.</p>
            <p><strong>7.2. Qualidade do Serviço:</strong> Não garantimos a qualidade, pontualidade ou perfeição do serviço prestado pelo Freelancer, assim como não garantimos que o Contratante oferecerá um ambiente adequado. A plataforma oferece o sistema de "Avaliações" para que a própria comunidade regule os melhores profissionais e locais.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">8. Foro e Legislação</h2>
            <p>Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de Contagem, Estado de Minas Gerais, para dirimir quaisquer dúvidas ou controvérsias oriundas deste documento.</p>
          </section>
        </div>
      </div>
    </div>
  );
};
