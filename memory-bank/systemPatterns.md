# System Patterns

This file documents the system architecture, key technical decisions, design patterns in use, and component relationships.

## System Architecture

### Frontend Architecture
- React component-based architecture
- Context API for state management
- Custom hooks for reusable logic
- Page-based routing with React Router

### Backend Architecture
- Supabase for authentication, database, and storage
- PostgreSQL database with RLS (Row Level Security)
- Serverless functions for backend logic

### AI Integration Architecture
- Client-side API integration with Google Gemini
- Service-based pattern for AI functionality
- Asynchronous communication with AI services
- Streaming API for real-time response handling
- Stateful chat interface for job posting
- Guardrails system for LLM behavior control
- Workflow-driven conversation management
- Task-specific system prompts

## Key Technical Decisions

### Frontend Framework
- React with TypeScript for type safety and better developer experience
- Vite for faster development and building
- TailwindCSS for utility-first styling

### Backend Services
- Supabase for authentication, database, and storage
- PostgreSQL for relational data storage
- RLS for data access control

### AI Integration
- Google Gemini API for AI-powered job posting assistance
- Official @google/genai package for API integration
- Streaming API for better user experience
- Direct API integration without server-side proxy
- System prompts with strict guardrails to ensure the LLM stays focused on job posting tasks only
- Workflow-driven conversation to collect all required information
- Strict two-task limitation (job description crafting and job link parsing only)

## Design Patterns in Use

### Frontend Patterns
- Component Composition for UI building blocks
- Container/Presentational pattern for separation of concerns
- Custom Hooks for reusable logic
- Context API for state management
- Render Props for component sharing

### Backend Patterns
- Repository pattern for data access
- Service pattern for business logic
- Middleware pattern for request/response handling

### AI Integration Patterns
- Service pattern for AI functionality
- Adapter pattern for API integration
- Strategy pattern for different AI models
- Observer pattern for chat state management
- Streaming pattern for real-time data processing
- Guardrails pattern for LLM behavior control
- Workflow pattern for conversation management
- Task-specific system prompts pattern

## Component Relationships

### Frontend Components
- App (root component)
  - Header (navigation)
  - Pages (content)
    - HomePage
    - FindJobsPage
    - JobDetailsPage
    - PostJobPage (AI-powered)
    - FindTalentPage
    - DashboardPage
  - Footer (site information)

### AI Integration Components
- JobPostingService (service for job posting)
  - GeminiClient (API client for Google Gemini)
  - FirecrawlService (service for web scraping)
- PostJobPage (UI component for job posting)
  - Chat interface for job posting
  - Job data collection and submission

## LLM Guardrails Architecture
- System prompts with clear role definition
- Strict guidelines for staying on topic
- Explicit instructions to avoid non-job-related topics
- Specific formatting requirements for responses
- Context about the platform's purpose and audience
- Separate system prompts for different functions:
  - Job posting chat interface
  - Job data extraction
  - Job data updates extraction
- Explicit rejection responses for off-topic queries
- Strict two-task limitation (job description crafting and job link parsing only)

## Job Posting Workflow
- Help employers compose a complete job description through conversation
- Parse information from existing job posting links
- Collect all required information through conversation
- Collect email or phone when no application URL is available
- Ensure there's a way for students to apply (applicationUrl, email, or phone)
- Summarize collected information and ask for confirmation
- Store job posting data in the database
- Redirect off-topic queries back to job posting tasks
