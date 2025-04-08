# Project Overview

This document provides a high-level overview of the project structure.

## Root Directory

Contains configuration files, the main HTML entry point, and the main README.

-   `.env`: Environment variables (likely contains secrets, should not be committed).
-   `.gitignore`: Specifies intentionally untracked files that Git should ignore.
-   `eslint.config.js`: Configuration for ESLint, a code linter.
-   `index.html`: The main HTML file, entry point for the web application.
-   `netlify.toml`: Configuration file for Netlify deployment.
-   `package-lock.json`: Records the exact versions of dependencies used.
-   `package.json`: Defines project metadata, dependencies, and scripts.
-   `postcss.config.js`: Configuration for PostCSS, a CSS processing tool.
-   `README.md`: Main documentation file for the project.
-   `tailwind.config.js`: Configuration for Tailwind CSS framework.
-   `tsconfig.*.json`: TypeScript configuration files (for the app, Node.js environment, and general).
-   `vite.config.ts`: Configuration for Vite, the build tool and development server.

## `src/` Directory

Contains the core source code for the React application.

### Core Application Structure

-   `App.tsx`: The root component that sets up routing and layout:
    -   Routes: Home, Job Listings, Post Job, Job Details
    -   Layout: Header, Main Content, Footer
    -   Notifications: Sonner toaster
-   `index.css`: Global CSS styles.
-   `main.tsx`: The entry point that renders the root component in StrictMode.
-   `vite-env.d.ts`: TypeScript definitions for Vite environment variables.

### Authentication System

-   `AuthContext.tsx`: Manages authentication state using Supabase:
    -   Tracks current user
    -   Handles sign out
    -   Manages employer status
    -   Provides loading state

### `src/components/`

Reusable UI components used throughout the application.

-   `Footer.tsx`, `Header.tsx`: Layout components.
-   `JobCard.tsx`, `SearchBar.tsx`: Feature-specific components.
-   `auth/`: Components related to authentication (sign-in forms).
-   `form/`: Reusable form input components.
-   `job/`: Components related to job listings and filtering.

### `src/contexts/`

React Context providers for managing global state.

-   `AuthContext.tsx`: Manages authentication state.

### `src/data/`

Static or sample data used by the application.

-   `locations.ts`: List of locations.
-   `sampleCandidates.ts`, `sampleJobs.ts`: Sample data for development/testing.

### `src/hooks/`

Custom React Hooks for reusable logic.

-   `useJobFilters.ts`, `useSearch.ts`, `useTalentSearch.ts`: Hooks related to searching and filtering.

### `src/lib/`

Utility functions, library initializations, and core logic.

-   `auth.ts`: Authentication-related functions.
-   `initDatabase.ts`: Database initialization logic (likely Supabase).
-   `supabase.ts`: Supabase client configuration.
-   `utils.ts`: General utility functions.

### `src/pages/`

Top-level components representing different pages/views of the application.

-   `DashboardPage.tsx`, `FindJobsPage.tsx`, `FindTalentPage.tsx`, `HomePage.tsx`, `JobDetailsPage.tsx`, `LoginPage.tsx`, `PostJobPage.tsx`: Different application views.
-   `LinkedInCallback.tsx`: Handles the callback from LinkedIn authentication.

### `src/types/`

TypeScript type definitions.

-   `index.ts`: Main export for types.
-   `supabase.ts`: Types generated from the Supabase database schema.

## `supabase/` Directory

Configuration and migration files for the Supabase backend.

-   `migrations/`: SQL files defining database schema changes over time.
