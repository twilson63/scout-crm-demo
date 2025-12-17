# Scout CRM Demo

A demo CRM application showcasing how natural language APIs can power modern applications. Built with Svelte 5, TypeScript, and Tailwind CSS, using the Scout Workflow API as the backend.

## Features

- **Contact Management**: Create, view, and organize contacts with status tracking (Lead, Prospect, Customer)
- **Activity Logging**: Log calls, emails, meetings, and notes for each contact
- **Dashboard**: View contact statistics and recent activities at a glance
- **Natural Language API**: All data operations are powered by Scout's natural language workflow API

## Tech Stack

- **Frontend**: Svelte 5 + TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Testing**: Vitest (unit tests) + Playwright (E2E tests)
- **Backend**: Scout Workflow API

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Scout API key

### Installation

```bash
# Clone the repository
git clone https://github.com/twilson63/scout-crm-demo.git
cd scout-crm-demo

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Running Tests

```bash
# Run unit tests
npm run test:unit

# Run E2E tests (requires dev server or will start one)
npm run test:e2e

# Run unit tests in watch mode
npm test
```

## Project Structure

```
src/
├── lib/
│   ├── api/           # API client and command builders
│   ├── components/    # Svelte components
│   ├── stores/        # Svelte stores for state management
│   └── types/         # TypeScript type definitions
├── App.svelte         # Root application component
└── main.ts            # Application entry point

e2e/                   # Playwright E2E tests
docs/                  # Planning and design documents
```

## How It Works

This demo showcases how a natural language API can serve as the backend for a traditional CRUD application. Instead of calling specific REST endpoints, the app sends natural language commands to the Scout API:

- "List all contacts" → Returns contact data as JSON
- "Create a new contact with name=John, email=john@example.com" → Creates a contact
- "Log a call activity for contact X" → Logs an activity

The Scout API interprets these commands and returns structured JSON responses that the frontend can display.

## Documentation

See the [docs](./docs) folder for:
- [Implementation Plan](./docs/plan.md)
- [Test Plan](./docs/plan-test.md)
- [API Documentation](./docs/api.md)
- [Web Application Design](./docs/web.md)

## License

MIT
