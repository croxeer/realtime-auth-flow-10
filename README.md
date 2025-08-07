# Skillzeer Chat App

Esta é uma aplicação de chat em tempo real construída com React, TypeScript e Vite, otimizada para deployment no Hugging Face Spaces.

## Funcionalidades

- 🔐 Sistema de autenticação completo (login/registro)
- 💬 Chat em tempo real com WebSocket
- 👥 Lista de usuários online
- 📱 Interface responsiva e mobile-friendly
- 🎨 Design moderno com Tailwind CSS e shadcn/ui
- 🌓 Suporte a tema claro/escuro

## Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Routing**: React Router
- **State Management**: React Query
- **API**: RESTful API + WebSocket
- **Deployment**: Hugging Face Spaces (Docker)

## Configuração para Desenvolvimento

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Acesse http://localhost:7860

## Deploy no Hugging Face Spaces

Este projeto está configurado para deployment automático no Hugging Face Spaces:

- **Porta**: 7860 (padrão do HF Spaces)
- **Docker**: Configuração otimizada no Dockerfile
- **Build**: Processo automatizado com Vite

## Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes UI reutilizáveis
│   ├── AuthPage.tsx    # Página de autenticação
│   ├── Chat.tsx        # Componente principal do chat
│   └── Dashboard.tsx   # Dashboard da aplicação
├── contexts/           # Contextos React
├── hooks/              # Hooks customizados
├── lib/                # Utilitários
└── pages/              # Páginas da aplicação
```

## API

A aplicação se conecta à API do Skillzeer:
- **Base URL**: https://skillzeer-api.hf.space
- **WebSocket**: wss://skillzeer-realtime.hf.space
- **Endpoints**: /login, /register, /messages, etc.

## Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run preview` - Preview da build
- `npm run lint` - Linting do código

---

## Projeto Original Lovable

**URL**: https://lovable.dev/projects/11d36be0-ef82-4e66-8cf3-0073d9edcb70

Este projeto foi criado originalmente no Lovable e depois adaptado para Hugging Face Spaces.