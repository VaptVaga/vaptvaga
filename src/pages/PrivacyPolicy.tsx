import React from 'react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12 lg:py-20">
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
          Política de Privacidade – VaptVaga
        </h1>
        <p className="text-muted-foreground text-sm mb-1">(Versão Beta)</p>
        <p className="text-muted-foreground text-sm mb-8">Última atualização: Março de 2026</p>

        <div className="prose prose-sm max-w-none text-foreground/90 space-y-6">
          <p>
            O VaptVaga leva a sua privacidade a sério. Esta Política de Privacidade foi elaborada em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018) e explica de forma clara como coletamos, usamos, armazenamos e protegemos as suas informações quando você utiliza nossa plataforma.
          </p>
          <p>
            Ao se cadastrar e utilizar o VaptVaga, você concorda com as práticas descritas neste documento.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">1. Quais dados coletamos e como são exibidos?</h2>
            <p>Para que a plataforma funcione e conecte Empresas a Freelancers com segurança, coletamos dois tipos de dados:</p>
            <p><strong>Dados Públicos (Visíveis na Plataforma):</strong> Nome, foto de perfil, cidade, habilidades profissionais, anúncios de vagas e avaliações recebidas. Esses dados ficam visíveis para outros usuários logados para facilitar a conexão de trabalho.</p>
            <p><strong>Dados Restritos (Não Visíveis):</strong> Documentos (CPF ou CNPJ), e-mail e número de telefone. Esses dados jamais são publicados no seu perfil público. Eles são armazenados de forma criptografada em nossos bancos de dados (Supabase) exclusivamente para fins de criação de conta, segurança, prevenção a fraudes e suporte.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">2. O Chat Nativo e a Proteção de Contato</h2>
            <p><strong>2.1. Privacidade Garantida:</strong> O VaptVaga possui um sistema de mensagens (chat) nativo e seguro. Nós não divulgamos o seu número de telefone ou WhatsApp para nenhuma Empresa ou Freelancer. Toda a negociação do turno deve ser feita por dentro do nosso chat.</p>
            <p><strong>2.2. Responsabilidade do Usuário:</strong> Caso você (Empresa ou Freelancer) decida, por livre e espontânea vontade, digitar o seu número de telefone, redes sociais ou endereço pessoal dentro do chat para o outro usuário, o VaptVaga não se responsabiliza pelo uso que a outra parte fará desses dados. A responsabilidade pela quebra do sigilo dentro da conversa é inteiramente de quem enviou a informação.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">3. Pagamentos e Dados Financeiros (Stripe)</h2>
            <p>O VaptVaga utiliza a Stripe, uma das plataformas de pagamento mais seguras do mundo, para processar as assinaturas dos planos Premium (Vapt PRO e Negócio Ágil).</p>
            <p><strong>Não armazenamos cartões:</strong> O VaptVaga não tem acesso e não armazena os números do seu cartão de crédito ou código de segurança (CVV) em nossos servidores. Todos os dados de pagamento são criptografados e processados diretamente pelo ambiente seguro da Stripe.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">4. Comunicação, Alertas e Marketing</h2>
            <p><strong>4.1. Notificações da Plataforma:</strong> Só enviaremos e-mails, mensagens ou alertas (sobre novas vagas, status de candidaturas ou novidades) se você marcar a caixa de seleção ("Opt-in") concordando em receber nossas comunicações durante o cadastro ou nas configurações do seu perfil.</p>
            <p><strong>4.2. Zero Spam com Terceiros:</strong> O VaptVaga não vende, não aluga e não compartilha o seu e-mail, telefone ou dados pessoais com empresas terceiras para fins de publicidade ou marketing. Seus dados são usados apenas para o funcionamento do nosso ecossistema.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">5. Cookies e Tecnologias de Rastreamento</h2>
            <p>Nós utilizamos cookies e ferramentas de análise de tráfego (como Google Analytics, Pixel da Meta/Facebook e similares) para entender como os usuários navegam no nosso site. Isso nos ajuda a:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Melhorar a velocidade e o design da plataforma;</li>
              <li>Rastrear a origem dos acessos;</li>
              <li>Exibir anúncios do próprio VaptVaga para você em outras redes sociais.</li>
            </ul>
            <p>Você pode configurar o seu navegador para bloquear cookies, mas isso pode afetar o funcionamento de algumas partes do site.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">6. Seus Direitos (LGPD) e Exclusão de Conta</h2>
            <p>Como titular dos dados, a LGPD garante a você controle total sobre suas informações.</p>
            <p><strong>6.1. Exclusão Autônoma:</strong> Se você decidir que não quer mais usar o VaptVaga, não precisa mandar e-mail ou ligar para o suporte. Você pode excluir sua conta e apagar todos os seus dados pessoais permanentemente clicando no botão "Excluir Minha Conta", disponível nas configurações do seu perfil dentro do próprio site ou aplicativo.</p>
            <p><strong>6.2. Retenção Legal:</strong> Mesmo após a exclusão da conta, o VaptVaga poderá manter o registro de certas transações (como histórico de pagamentos na Stripe) pelo tempo exigido por leis fiscais e normas de prevenção à lavagem de dinheiro no Brasil.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">7. Contato e Dúvidas</h2>
            <p>Se você tiver qualquer dúvida sobre esta Política de Privacidade ou sobre como seus dados são tratados, entre em contato com a nossa equipe de privacidade através dos canais de suporte oficiais disponíveis no site.</p>
          </section>
        </div>
      </div>
    </div>
  );
};
