-- Script CORRIGIDO para popular o banco de dados com 30 vagas e empresas em Contagem
-- Cole isso no SQL Editor do Supabase e clique em RUN

DO $$
DECLARE
  -- Variáveis para armazenar os IDs das empresas criadas
  emp1 UUID := gen_random_uuid();
  emp2 UUID := gen_random_uuid();
  emp3 UUID := gen_random_uuid();
  emp4 UUID := gen_random_uuid();
  emp5 UUID := gen_random_uuid();
  emp6 UUID := gen_random_uuid();
  emp7 UUID := gen_random_uuid();
  emp8 UUID := gen_random_uuid();
  emp9 UUID := gen_random_uuid();
  emp10 UUID := gen_random_uuid();
BEGIN

  -- 1. Criar os usuários de autenticação
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES
  (emp1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'emp1@teste.com', crypt('123456', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  (emp2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'emp2@teste.com', crypt('123456', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  (emp3, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'emp3@teste.com', crypt('123456', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  (emp4, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'emp4@teste.com', crypt('123456', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  (emp5, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'emp5@teste.com', crypt('123456', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  (emp6, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'emp6@teste.com', crypt('123456', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  (emp7, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'emp7@teste.com', crypt('123456', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  (emp8, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'emp8@teste.com', crypt('123456', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  (emp9, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'emp9@teste.com', crypt('123456', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  (emp10, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'emp10@teste.com', crypt('123456', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now());

  -- 2. Criar os Perfis das Empresas
  INSERT INTO public.profiles (id, role, name, cidade, estado, avatar_url, created_at)
  VALUES
  (emp1, 'company', 'Restaurante Sabor Mineiro', 'Contagem', 'MG', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80', now()),
  (emp2, 'company', 'Supermercado Central', 'Contagem', 'MG', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80', now()),
  (emp3, 'company', 'Logística Expressa Contagem', 'Contagem', 'MG', 'https://images.unsplash.com/photo-1586528116311-ad8ed7c663b0?w=400&q=80', now()),
  (emp4, 'company', 'Cafeteria Aroma', 'Contagem', 'MG', 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80', now()),
  (emp5, 'company', 'Eventos & Cia', 'Contagem', 'MG', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&q=80', now()),
  (emp6, 'company', 'Shopping do Calçado', 'Contagem', 'MG', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80', now()),
  (emp7, 'company', 'Padaria Pão Dourado', 'Contagem', 'MG', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80', now()),
  (emp8, 'company', 'Bar do João', 'Contagem', 'MG', 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&q=80', now()),
  (emp9, 'company', 'Construções Silva', 'Contagem', 'MG', 'https://images.unsplash.com/photo-1504307651254-35680f356f90?w=400&q=80', now()),
  (emp10, 'company', 'Hotel Contagem Centro', 'Contagem', 'MG', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', now());

  -- 3. Criar as 30 Vagas (3 por empresa)
  -- Nota: Convertido ::text para ::date
  INSERT INTO public.jobs (company_id, title, description, budget, valor_da_diaria, bairro, cidade, estado, data_do_turno, status, required_skills, created_at)
  VALUES
  (emp1, 'Garçom para Final de Semana', 'Atendimento a clientes em horário de pico (18:00 as 00:00).', 'R$ 120,00', 120, 'Eldorado', 'Contagem', 'MG', (current_date + interval '2 days')::date, 'open', '{"Garçom", "Atendimento ao Cliente"}', now()),
  (emp1, 'Auxiliar de Cozinha', 'Auxiliar no preparo de pratos quentes e limpeza (10:00 as 18:00).', 'R$ 100,00', 100, 'Eldorado', 'Contagem', 'MG', (current_date + interval '3 days')::date, 'open', '{"Auxiliar de Cozinha"}', now()),
  (emp1, 'Cozinheiro Chefe', 'Preparar cardápio especial de domingo.', 'R$ 250,00', 250, 'Eldorado', 'Contagem', 'MG', (current_date + interval '5 days')::date, 'open', '{"Cozinheiro"}', now()),
  
  (emp2, 'Operador de Caixa Extra', 'Cobrir folga de funcionário no feriado.', 'R$ 90,00', 90, 'Industrial', 'Contagem', 'MG', (current_date + interval '1 day')::date, 'open', '{"Caixa", "Atendimento ao Cliente"}', now()),
  (emp2, 'Estoquista Noturno', 'Organização de estoque recebido na madrugada.', 'R$ 150,00', 150, 'Industrial', 'Contagem', 'MG', (current_date + interval '2 days')::date, 'open', '{"Estoquista", "Trabalho Braçal"}', now()),
  (emp2, 'Repositor de Mercadorias', 'Reposição de prateleiras no setor de hortifruti.', 'R$ 95,00', 95, 'Industrial', 'Contagem', 'MG', (current_date + interval '4 days')::date, 'open', '{"Estoquista"}', now()),

  (emp3, 'Entregador de Van', 'Entrega de pacotes na região de Contagem.', 'R$ 200,00', 200, 'Cinco', 'Contagem', 'MG', (current_date + interval '1 day')::date, 'open', '{"Motorista", "Entregador"}', now()),
  (emp3, 'Ajudante de Carga', 'Ajudar a descarregar caminhão.', 'R$ 110,00', 110, 'Cinco', 'Contagem', 'MG', (current_date + interval '2 days')::date, 'open', '{"Trabalho Braçal"}', now()),
  (emp3, 'Motorista Categoria D', 'Viagem curta para cidade vizinha.', 'R$ 300,00', 300, 'Cinco', 'Contagem', 'MG', (current_date + interval '5 days')::date, 'open', '{"Motorista"}', now()),

  (emp4, 'Barista Freelancer', 'Preparo de cafés e bebidas expressas.', 'R$ 130,00', 130, 'Centro', 'Contagem', 'MG', (current_date + interval '2 days')::date, 'open', '{"Barista"}', now()),
  (emp4, 'Atendente de Balcão', 'Atender clientes e servir mesas.', 'R$ 85,00', 85, 'Centro', 'Contagem', 'MG', (current_date + interval '3 days')::date, 'open', '{"Atendimento ao Cliente"}', now()),
  (emp4, 'Auxiliar de Limpeza', 'Limpeza geral da loja ao fechamento.', 'R$ 60,00', 60, 'Centro', 'Contagem', 'MG', (current_date + interval '3 days')::date, 'open', '{"Limpeza"}', now()),

  (emp5, 'Segurança de Evento', 'Controle de acesso e segurança em festa.', 'R$ 180,00', 180, 'Riacho', 'Contagem', 'MG', (current_date + interval '6 days')::date, 'open', '{"Segurança"}', now()),
  (emp5, 'Recepcionista', 'Check-in de convidados em evento corporativo.', 'R$ 120,00', 120, 'Riacho', 'Contagem', 'MG', (current_date + interval '6 days')::date, 'open', '{"Recepcionista", "Atendimento ao Cliente"}', now()),
  (emp5, 'Bartender', 'Preparo de drinks clássicos e autorais.', 'R$ 250,00', 250, 'Riacho', 'Contagem', 'MG', (current_date + interval '6 days')::date, 'open', '{"Bartender"}', now()),

  (emp6, 'Vendedor(a) Comissionado', 'Atendimento de clientes no final de semana.', 'R$ 100,00', 100, 'Cidade Industrial', 'Contagem', 'MG', (current_date + interval '4 days')::date, 'open', '{"Vendas", "Atendimento ao Cliente"}', now()),
  (emp6, 'Promotor de Vendas', 'Panfletagem e abordagem na porta da loja.', 'R$ 80,00', 80, 'Cidade Industrial', 'Contagem', 'MG', (current_date + interval '5 days')::date, 'open', '{"Panfletagem"}', now()),
  (emp6, 'Vitrinista', 'Organizar a vitrine para a nova coleção.', 'R$ 200,00', 200, 'Cidade Industrial', 'Contagem', 'MG', (current_date + interval '7 days')::date, 'open', '{"Vendas"}', now()),

  (emp7, 'Padeiro Substituto', 'Produção de pães franceses na madrugada.', 'R$ 160,00', 160, 'Nova Contagem', 'Contagem', 'MG', (current_date + interval '1 day')::date, 'open', '{"Cozinheiro"}', now()),
  (emp7, 'Confeiteiro Extra', 'Preparar bolos de encomenda.', 'R$ 180,00', 180, 'Nova Contagem', 'Contagem', 'MG', (current_date + interval '2 days')::date, 'open', '{"Cozinheiro"}', now()),
  (emp7, 'Atendente de Padaria', 'Atendimento no balcão e chapa.', 'R$ 90,00', 90, 'Nova Contagem', 'Contagem', 'MG', (current_date + interval '3 days')::date, 'open', '{"Atendimento ao Cliente", "Garçom"}', now()),

  (emp8, 'Garçom de Bar', 'Servir bebidas e porções.', 'R$ 140,00', 140, 'Retiro', 'Contagem', 'MG', (current_date + interval '5 days')::date, 'open', '{"Garçom"}', now()),
  (emp8, 'Chapeiro', 'Fazer porções rápidas e hambúrgueres.', 'R$ 130,00', 130, 'Retiro', 'Contagem', 'MG', (current_date + interval '5 days')::date, 'open', '{"Cozinheiro"}', now()),
  (emp8, 'Músico Voz e Violão', 'Tocar repertório pop/rock por 3 horas.', 'R$ 300,00', 300, 'Retiro', 'Contagem', 'MG', (current_date + interval '5 days')::date, 'open', '{"Música"}', now()),

  (emp9, 'Pedreiro', 'Serviço de reboco e alvenaria.', 'R$ 250,00', 250, 'Cabral', 'Contagem', 'MG', (current_date + interval '2 days')::date, 'open', '{"Pedreiro"}', now()),
  (emp9, 'Servente de Obra', 'Preparar massa e carregar material.', 'R$ 120,00', 120, 'Cabral', 'Contagem', 'MG', (current_date + interval '2 days')::date, 'open', '{"Trabalho Braçal"}', now()),
  (emp9, 'Pintor Diarista', 'Pintura interna de 2 cômodos.', 'R$ 200,00', 200, 'Cabral', 'Contagem', 'MG', (current_date + interval '4 days')::date, 'open', '{"Pintor"}', now()),

  (emp10, 'Camareira Folguista', 'Arrumação de 15 quartos.', 'R$ 110,00', 110, 'Amazonas', 'Contagem', 'MG', (current_date + interval '1 day')::date, 'open', '{"Limpeza"}', now()),
  (emp10, 'Recepcionista Bilíngue', 'Cobertura de turno (Inglês necessário).', 'R$ 180,00', 180, 'Amazonas', 'Contagem', 'MG', (current_date + interval '2 days')::date, 'open', '{"Recepcionista"}', now()),
  (emp10, 'Mensageiro', 'Auxiliar hóspedes com bagagens.', 'R$ 95,00', 95, 'Amazonas', 'Contagem', 'MG', (current_date + interval '3 days')::date, 'open', '{"Atendimento ao Cliente"}', now());

END $$;
