
## 📋 Sobre o Projeto

**HabitFlow** é uma aplicação moderna para construção de hábitos que combina **Gamificação** (XP, Níveis, Conquistas) com **Inteligência Artificial** para ajudar usuários a manterem a consistência. 

Diferente de apps tradicionais, o HabitFlow usa a IA do Google Gemini para atuar como um *coach comportamental*, oferecendo insights personalizados, conversas motivacionais e sugestões de hábitos baseadas no seu perfil.

---

## ✨ Funcionalidades Principais

### 🚀 Gestão de Hábitos Avançada
- **Flexibilidade Total**: Configure hábitos diários, semanais (X vezes/sem) ou em dias específicos.
- **Categorias**: Saúde, Produtividade, Mente, Finanças e Criatividade.
- **Lembretes**: Notificações personalizadas para não esquecer suas tarefas.

### 🎮 Gamificação (RPG da Vida Real)
- **Sistema de Níveis**: Ganhe XP ao completar hábitos e suba de nível.
- **Conquistas**: Desbloqueie medalhas exclusivas ao atingir marcos importantes.
- **Streaks**: Mantenha a ofensiva e visualize seu progresso contínuo.

### 🧠 Inteligência Artificial (Powered by Google Gemini)
- **AI Coach**: Converse com um assistente que entende sua rotina e dá dicas práticas.
- **Análise Comportamental**: Receba feedbacks periódicos sobre seu desempenho.
- **Smart Notifications**: Notificações motivacionais geradas dinamicamente pela IA.
- **Onboarding Inteligente**: Sugestões de hábitos iniciais baseadas nos seus objetivos de vida.
- **Avatar Editor**: Personalize sua imagem de perfil com ajuda da IA.

### 💻 Interface Moderna
- **Dark/Light Mode**: Tema automático ou manual.
- **Dashboards**: Gráficos de progresso e visualização clara de metas.
- **Design Responsivo**: Funciona perfeitamente em desktop e mobile.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 19, TypeScript
- **Build Tool**: Vite
- **Estilização**: Tailwind CSS
- **Navegação**: React Router
- **IA/ML**: Google Gemini API (`@google/genai`)
- **Ícones**: Lucide React
- **Gráficos**: Recharts
- **Utilitários**: Date-fns, jsPDF

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js (v18 ou superior)
- NPM ou Yarn
- Uma chave de API do Google Gemini (obtenha em [Google AI Studio](https://aistudio.google.com/))

### Passo a Passo

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/habitat-flow.git
   cd Habitat-flow
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure a API Key**
   - Crie um arquivo `.env.local` na raiz do projeto (opcional, ou configure via interface).
   - Adicione sua chave:
     ```env
     VITE_GEMINI_API_KEY=sua_chave_aqui
     ```
   - *Nota: A aplicação também permite inserir a API Key diretamente nas Configurações da interface.*

4. **Execute o projeto**
   ```bash
   npm run dev
   ```

5. **Acesse**
   - Abra `http://localhost:5173` no seu navegador.

---

## 📂 Estrutura do Projeto

```
/src
  ├── components/   # Componentes reutilizáveis (Layout, Modais, etc)
  ├── context/      # Estado Global (Context API)
  ├── pages/        # Páginas principais (Home, Profile, Finance, etc)
  ├── services/     # Integração com APIs (GeminiService)
  └── types.ts      # Definições de Tipos TypeScript
```

---

<div align="center">
  Desenvolvido com ❤️ e IA
</div>
