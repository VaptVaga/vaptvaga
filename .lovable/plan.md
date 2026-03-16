

## Plano: Skills pré-definidas ranqueadas por demanda + input customizado + sem limites

### Abordagem

As skills pré-definidas serão **ordenadas dinamicamente** com base na frequência em que aparecem como `required_skills` nas vagas (`jobs`). Isso garante que as habilidades mais requisitadas pelo mercado apareçam primeiro no onboarding.

### Mudanças

**`src/pages/Onboarding.tsx`**:
1. **Buscar ranking do banco** — Query Supabase que conta a frequência de cada skill em `jobs.required_skills` (array unnest + group by + order by count desc)
2. **Ordenar skills pré-definidas** — A lista expandida (~20 opções) é reordenada pela frequência nas vagas; skills sem vagas ficam no final
3. **Input customizado** — Campo de texto com botão "+" para adicionar habilidades livres (trim, sem duplicatas)
4. **Sem limite de seleção** — Já não há limite; mantém assim

**Lista expandida de skills pré-definidas**:
Garçom, Barman, Cozinheiro, Auxiliar de Cozinha, Chapa, Vendedor, Operador de Caixa, Atendente, Faxineiro, Copeira, Promotor, Hostess, Recepcionista, Segurança, Motoboy, Entregador, DJ, Fotógrafo, Montador, Carregador

**Query de ranking** (via `supabase.rpc` ou raw query):
```sql
SELECT unnest(required_skills) as skill, count(*) as cnt
FROM jobs
WHERE status = 'open'
GROUP BY skill
ORDER BY cnt DESC
```

Será criada uma **função RPC** no Supabase (`get_skill_rankings`) para retornar o ranking, usada via `useQuery` no componente. Se a query falhar, usa a ordem padrão da lista.

### Componentes de UI
- Chips pré-definidos (ordenados por ranking) com toggle
- Input de texto abaixo: placeholder "Adicionar outra habilidade...", botão "+"
- Skills customizadas aparecem como chips selecionados com "X" para remover

