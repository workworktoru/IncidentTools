# AI-Driven ITIL Management Tool

A modern, full-stack ITIL-compliant management tool featuring AI-powered semantic search and multi-language support.

## 🚀 Features

- **Incident Management**: Report, track, and resolve service disruptions.
- **Problem Management**: Identify root causes and manage workarounds.
- **Change Management**: Plan and coordinate service changes with impact analysis.
- **Release Management**: Version tracking and deployment timeline management.
- **CI Inventory**: Track IT infrastructure components and assets.
- **AI Knowledge Search**: Discover similar incidents and historical resolutions using Gemini-powered semantic search and `pgvector`.
- **Multi-language Support**: Full support for English and Japanese (i18n).
- **Production Ready**: Optimized Docker configuration for AWS ECS (Fargate) with CI/CD via GitHub Actions.

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, TanStack Query, Lucide Icons.
- **Backend**: FastAPI (Python 3.12), SQLModel (SQLAlchemy), PostgreSQL with `pgvector`.
- **AI**: Google Gemini API (Text Embeddings).
- **Deployment**: Docker, AWS ECS (Fargate), Amazon ECR, GitHub Actions.

## 🏁 Getting Started

### Local Development (Docker)

1. Clone the repository.
2. Create a `.env` file in the root directory:
   ```env
   GOOGLE_API_KEY=your_gemini_api_key
   DATABASE_URL=postgresql://user:password@db:5432/incident_management
   ```
3. Start the application:
   ```bash
   docker compose up --build
   ```
4. Access the frontend at `http://localhost:3000` and the backend API docs at `http://localhost:8000/docs`.

### Testing

Run E2E tests using Playwright:
```bash
cd frontend
npm run test:e2e
```

## ☁️ Deployment to AWS

This project is configured for automated deployment to AWS ECS via GitHub Actions.

1. **Setup ECR**: Create an ECR repository named `incident-management-app`.
2. **Setup ECS**: Create a cluster named `incident-management-cluster` and a service named `incident-management-service`.
3. **IAM Role**: Setup an OIDC provider and an IAM role for GitHub Actions with permissions to ECR and ECS.
4. **GitHub Secrets**: Add `AWS_ROLE_ARN` to your GitHub repository secrets.
5. **Push to GitHub**: Pushing to the `main` branch will trigger the deployment pipeline.

## 📄 License

MIT
