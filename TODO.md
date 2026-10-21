# 📋 Plano de Modificações (TODO)

Este documento descreve as alterações planejadas para o sistema de avaliações **CoordCamp**. Analise os itens abaixo antes de iniciarmos a implementação.

---

## 1. Edição de Status e Nota no Painel (Modal de Avaliação)
- [x] **Atualizar estado global ([`src/App.tsx`](src/App.tsx))**:
  - Criar a função `handleUpdateCorrection(updatedCorrection: Correction)` para atualizar uma avaliação existente na lista de correções.
  - Passar `onUpdateCorrection` e `currentUser` como propriedades para o componente `Dashboard`.
- [x] **Tornar o Modal de Detalhes editável ([`src/components/Dashboard.tsx`](src/components/Dashboard.tsx))**:
  - Adicionar estados locais no modal ao selecionar uma avaliação para permitir editar:
    - **Nota Final**: input numérico (`0.0` a `10.0`, passo `0.1`) com validação.
    - **Status Atual**: seletor (`Aprovada`, `Devolvida`, `Recusada`, `Aguardando Revisão`).
  - Adicionar botão **"Salvar Alterações"** no rodapé do modal (além do botão de fechar/cancelar).
  - Recalcular automaticamente os cards de métricas do painel (Total de Aprovadas, Média de Notas e Aguardando Revisão) assim que a edição for salva.

---

## 2. Labels Dinâmicos em "Nova Correção" conforme a Campanha
- [x] **Criar helper de mapeamento de entidade por campanha ([`src/data.ts`](src/data.ts))**:
  - Criar uma função utilitária `getCampaignEntityLabels(campaign: string)` que retorna os textos dinâmicos (título da seção, label de nome, label de número e placeholders) de acordo com a campanha selecionada:
    | Campanhas | Label de Nome | Label de Número |
    | :--- | :--- | :--- |
    | **CNIE Capítulos**, **CRN - Capítulos** (ou CRN Capítulos), **Caneta de Ouro**, **Desafio Nacional de Filantropia (DNF)**, **Clube de Mães de Honra (CMH)** | `Nome Capítulo` | `Número Capítulo` |
    | **CNIE Castelos**, **CRN Castelos** | `Nome Castelo` | `Número Castelo` |
    | **CNIE Priorados**, **CRN Priorados**, **Protocolista de Ouro** | `Nome Priorado` | `Número Priorado` |
    | **CNIE Gabinetes**, **CRN Gabinetes** | `Nome Gabinete` | `Número Gabinete` |
    | **CNIE Regiões**, **CRN Regiões** | `Nome Região` | `Número Região` |
- [x] **Atualizar formulário de Nova Correção ([`src/components/NewCorrection.tsx`](src/components/NewCorrection.tsx))**:
  - Substituir os textos fixos (`"2. Dados do Castelo"`, `"Nome do Castelo *"`, `"Número do Castelo *"`) e os placeholders/mensagens de validação pelos valores dinâmicos retornados conforme a campanha ativa no `<select>`.

---

## 3. Histórico da Última Modificação (Dia, Horário e Coordenador)
- [x] **Expandir tipagem ([`src/types.ts`](src/types.ts))**:
  - Adicionar à interface `Correction` os campos:
    - `updatedAt: string` (armazenando data e hora completa em ISO ou timestamp).
    - `updatedBy: string` (nome do coordenador que registrou ou modificou a atividade).
- [x] **Atualizar dados iniciais ([`src/data.ts`](src/data.ts))**:
  - Preencher `updatedAt` (com data e hora) e `updatedBy` (ex: `Pedro Cruz`) nos registros de `initialCorrections`.
- [x] **Registrar data/hora na criação e na edição**:
  - Em [`src/components/NewCorrection.tsx`](src/components/NewCorrection.tsx): ao cadastrar uma nova avaliação, gravar `updatedAt` com o dia e horário atuais e `updatedBy` com o coordenador logado (`currentUser.name`).
  - Em [`src/components/Dashboard.tsx`](src/components/Dashboard.tsx): ao salvar a edição de nota ou status no modal, atualizar `updatedAt` para o instante atual e `updatedBy` para o coordenador logado.
- [x] **Exibir no Modal do Painel ([`src/components/Dashboard.tsx`](src/components/Dashboard.tsx))**:
  - Adicionar no modal de detalhes da avaliação uma seção/rodapé informativo exibindo:
    - **Última modificação**: Dia (`DD/MM/AAAA`) e Horário (`HH:mm`).
    - **Registrado/Modificado por**: Nome e função do coordenador responsável.

