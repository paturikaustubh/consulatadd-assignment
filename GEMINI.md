# Project Overview

This is a Next.js application named "CareerJunction" designed for job searching. It leverages the Next.js App Router for its architecture and is built with the following key technologies:

- **Framework**: Next.js (React)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom theming (light/dark mode) and `tw-animate-css` for animations.
- **UI Components**: `shadcn/ui` for pre-built, customizable UI components.
- **Fonts**: Utilizes Geist and Geist Mono from `next/font/google` for typography, and Material Symbols for icons.
- **HTTP Client**: `axios` for making API requests.
- **Linting**: ESLint for code quality and consistency.
- **Data Generation (Dev)**: `@faker-js/faker` is used in development, likely for mock data.

The application follows a standard Next.js project structure, including `app` directory for routes and API endpoints, and a `components` directory for reusable UI components.

# Building and Running

To get started with the project, use the following commands:

- **Install Dependencies**:

  ```bash
  npm install
  # or
  yarn install
  # or
  pnpm install
  # or
  bun install
  ```

- **Run Development Server**:

  ```bash
  npm run dev
  # or
  yarn dev
  # or
  pnpm dev
  # or
  bun dev
  ```

  This will start the development server, typically accessible at `http://localhost:3000`.

- **Build for Production**:

  ```bash
  npm run build
  ```

- **Start Production Server**:

  ```bash
  npm run start
  ```

- **Run Linter**:
  ```bash
  npm run lint
  ```

# Development Conventions

- **Styling**: The project uses Tailwind CSS. Global styles and theme variables are defined in `app/globals.css`. Custom color palettes and responsive design are managed through Tailwind's utility-first approach.
- **UI Components**: `shadcn/ui` components are used for consistent and accessible UI elements. These components are typically found in the `components/ui` directory.
- **Fonts**: The Geist and Geist Mono fonts are integrated via `next/font/google` for optimized loading. Material Symbols are imported globally for icon usage.
- **Linting**: ESLint is configured with Next.js specific rules (`next/core-web-vitals`, `next/typescript`) to enforce code quality and best practices.
- **Path Aliases**: The project uses path aliases for easier imports, as defined in `tsconfig.json` and `components.json`. Key aliases include:
  - `@/components`: Maps to the `components` directory.
  - `@/lib/utils`: Maps to utility functions within the `lib` directory.
  - `@/components/ui`: Maps to `shadcn/ui` components.
  - `@/lib`: Maps to the `lib` directory.
  - `@/hooks`: (Though not explicitly found in this analysis, `components.json` suggests its potential use for custom React hooks).
