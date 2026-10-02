# Pointer — Landing Page

Landing page institucional da **Pointer**, plataforma de agendamento autônomo via WhatsApp para clínicas premium.

## Stack

- **Next.js 14** (App Router, `"use client"`)
- **Tailwind CSS 3**
- **Framer Motion 11** — animações e transições de estado
- **Lucide React** — ícones

## Pré-requisitos

- Node.js 18.17+ (https://nodejs.org)
- npm ou pnpm

## Como rodar

```bash
# 1. Instalar dependências
npm install

# 2. Servidor de desenvolvimento
npm run dev
```

Acesse **http://localhost:3000**

## Build para produção

```bash
npm run build
npm start
```

## Estrutura do Projeto

```
pointer-landing/
├── app/
│   ├── globals.css        # Reset global + estilos do range input
│   ├── layout.tsx         # Root layout com metadata
│   └── page.tsx           # ← Toda a landing page (componente único)
├── package.json
├── tailwind.config.ts
├── next.config.js
├── postcss.config.js
└── tsconfig.json
```

## Seções da Landing Page

| Seção | Descrição |
|---|---|
| **Header Fixo** | Logo + badge de status + nav suave + CTA "Acesso da Diretoria" |
| **Hero** | Badge, headline com gradiente metálico, subtítulo executivo, CTAs |
| **Showroom Interativo** | Máquina de estados React — WhatsApp mockup + Mini-Kanban sincronizados |
| **Bento Grid** | 4 cards com métricas e micro-visualizações animadas (inView) |
| **Calculadora de Receita** | Sliders reativos com lógica de 18% de recuperação em tempo real |
| **Footer** | Mínimo e elegante com badge de status |

## Comportamento da Simulação (Showroom)

Clique em **"▶ Executar Demonstração em Tempo Real"** para iniciar o ciclo:

| Tempo | Evento |
|---|---|
| 0.5s | Mensagem do paciente aparece |
| 1.6s | Indicador de digitação + card move para "Em Qualificação" |
| 3.4s | Pointer responde com horários disponíveis |
| 5.2s | Paciente confirma o horário |
| 6.0s | Indicador de digitação novamente |
| 7.4s | Confirmação final + card move para "Agendado" |
| 8.4s | Banner de sucesso — ciclo completo em ~7.8s |

## Calculadora de Receita

**Fórmula aplicada:**
- `leads_recuperados = consultas_mensais × 0.18`
- `receita_mensal = leads_recuperados × ticket_médio`
- `receita_anual = receita_mensal × 12`

Taxa de 18% = estimativa conservadora de leads perdidos por demora ou fora do horário comercial.
