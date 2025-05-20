# Learnify - AI-Powered Learning Platform 🚀

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

Learnify is a cutting-edge, AI-powered learning platform that revolutionizes education through interactive learning experiences, personalized content generation, and intelligent tutoring systems.

## 🌟 Features

### 🤖 AI-Powered Learning

- **Interactive Quizzes**: Dynamic quiz generation with AI-powered analysis
- **PDF Chat**: Engage with your documents through intelligent conversations
- **Language Tutor**: Advanced AI language learning assistant
- **Smart Analytics**: Detailed performance insights and learning recommendations

### 📚 Learning Resources

- **Course Management**: Create and manage structured learning content
- **Learning Roadmaps**: Customized learning paths for various technologies
- **Resource Library**: Comprehensive collection of educational materials
- **Community Learning**: Collaborative learning environment

### ⚡ Smart Tools

- **Interactive Whiteboard**: Digital workspace with AI analysis
- **Notebook System**: Organized note-taking with smart features
- **Progress Tracking**: Advanced analytics and performance monitoring
- **Resource Management**: Efficient organization of learning materials

## 🚀 Getting Started

 ## AI Fallback System

 The project includes a robust AI fallback system to handle service disruptions and rate limiting, ensuring reliability for AI-powered features.

 ### Features
 - **Fallback AI Models**: Uses GROQ as the primary service and OpenAI as fallback for quiz generation, PDF chat, and language tutor features.
 - **Retry Logic**: Implements exponential backoff for retries (configured via `VITE_AI_RETRY_ATTEMPTS`).
 - **Circuit Breaker**: Prevents repeated calls to failing services (`src/services/circuitBreaker.ts`).
 - **Graceful Degradation**: Provides dynamic mock responses (`src/services/mockAI.ts`) when both primary and fallback services fail.
 - **Real-Time Monitoring**: Displays AI service health (feature, provider, duration, status, error) on the admin dashboard (`/admin`) using Supabase Realtime (`src/components/MonitoringDashboard.tsx`).
 - **Access Control**: Restricts the admin dashboard to users with the `admin` role (`src/hooks/useAuth.ts`).


### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Docker Desktop (for local development)
- Supabase CLI (`npm install -g supabase`)
- Supabase account
- GROQ API key

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/learnify.git
cd learnify
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```env
VITE_GROQ_API_KEY=your_groq_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the local Supabase instance:

```bash
supabase start
```

5. Apply database migrations:

```bash
supabase db push
```

6. Start the development server:

```bash
npm run dev
```

### Database Setup

For detailed instructions on setting up and working with the database, please refer to our [Contributing Guide](CONTRIBUTING.md#database-setup).

Key points:

- Local development uses Docker and Supabase CLI
- Migrations are stored in `/supabase/migrations`
- Follow migration guidelines when making database changes
- Test all changes locally before committing

## 🏗️ Architecture

Learnify is built with modern technologies and follows best practices:

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand
- **Database**: Supabase
- **AI Integration**: GROQ API
- **PDF Processing**: PDF.js
- **Routing**: React Router
- **Form Handling**: React Hook Form
- **Type Safety**: TypeScript

## 📦 Project Structure

```
learnify/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── services/      # API and service integrations
│   ├── store/         # State management
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   └── lib/           # Shared libraries and configurations
├── public/           # Static assets
├── supabase/        # Supabase configuration and migrations
│   └── migrations/  # Database migration files
└── tests/           # Test files
```

## 🔧 Configuration

The project uses various configuration files:

- `vite.config.ts`: Vite configuration
- `tailwind.config.js`: Tailwind CSS configuration
- `tsconfig.json`: TypeScript configuration
- `eslint.config.js`: ESLint configuration
- `supabase/config.toml`: Supabase configuration

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.io/) for the backend infrastructure
- [GROQ](https://groq.com/) for AI capabilities
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- All contributors who have helped shape Learnify

## 📞 Contact

- Project Maintainer: [Tarin Agarwal](mailto:tarinagarwal@gmail.com)
- Project Link: [https://github.com/tarinagarwal/learnify](https://github.com/tarinagarwal/learnify)

## 🌟 Support

If you find this project helpful, please consider giving it a star ⭐️
