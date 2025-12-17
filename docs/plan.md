# Scout CRM Demo - Implementation Plan

## Executive Summary

**Purpose:** Build a prototype CRM application demonstrating how natural language APIs can power applications.

**Tech Stack:**
- **Framework:** Svelte + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (shadcn-neutral aesthetic)
- **Backend:** Scout Workflow API (Natural Language interface)
- **Deployment:** Render.com (Static Site)

---

## Product Specification

| Aspect | Decision |
|--------|----------|
| **Purpose** | Prototype demonstrating NL API-powered applications |
| **Deployment** | Render.com static site |
| **Auth** | API key persisted to localStorage, logout to clear |
| **Status Badges** | Neutral/grayscale styling |
| **Activity Types** | All four: Call, Email, Meeting, Note |
| **Default View** | Dashboard summary with prompt to select contact |
| **Visual Design** | Clean, Tailwind + shadcn-neutral theme |
| **Routing** | Single-page app with conditional rendering |

---

## Project Structure

```
crm-mvp/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── LoginScreen.svelte
│   │   │   ├── Sidebar.svelte
│   │   │   ├── ContactList.svelte
│   │   │   ├── ContactCard.svelte
│   │   │   ├── ContactDetail.svelte
│   │   │   ├── Dashboard.svelte
│   │   │   ├── ActivityTimeline.svelte
│   │   │   ├── ActivityForm.svelte
│   │   │   ├── ContactForm.svelte
│   │   │   └── StatusBadge.svelte
│   │   ├── api/
│   │   │   ├── client.ts          # HTTP client for Scout API
│   │   │   └── commands.ts        # NL command builders
│   │   ├── stores/
│   │   │   ├── auth.ts            # Auth state (credentials)
│   │   │   ├── contacts.ts        # Contacts state
│   │   │   └── ui.ts              # UI state (selected contact, etc.)
│   │   └── types/
│   │       └── index.ts           # TypeScript interfaces
│   ├── app.css                    # Tailwind imports + custom styles
│   ├── App.svelte                 # Root component
│   └── main.ts                    # Entry point
├── index.html
├── package.json
├── vite.config.ts
├── svelte.config.js
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── plan.md
```

---

## Core Features (Read + Create Focus)

| Feature | NL Command Demonstrated |
|---------|------------------------|
| Login with API key | Credential validation |
| Contact list (sidebar) | `LIST ALL CONTACTS OUTPUT JSON...` |
| Contact detail view | `GET CONTACT DETAILS FOR {id}...` |
| Create new contact | `CREATE NEW CONTACT NAME...` |
| Log activity | `LOG {type} ACTIVITY FOR CONTACT...` |
| Dashboard summary | `GET DASHBOARD OVERVIEW...` |

---

## UI Layout

### Login Screen
```
┌─────────────────────────────────────────┐
│           Scout CRM                     │
├─────────────────────────────────────────┤
│                                         │
│         Username: [__________]          │
│         API Key:  [__________]          │
│                                         │
│              [Login]                    │
│                                         │
└─────────────────────────────────────────┘
```

### Main CRM Interface
```
┌─────────────────────────────────────────────────────────────┐
│  Scout CRM                                         [Logout] │
├────────────────┬────────────────────────────────────────────┤
│                │                                            │
│  CONTACTS      │   Dashboard                                │
│  ───────────   │   ─────────────────────────────────────    │
│  [+ Add New]   │   ┌─────────┐ ┌─────────┐ ┌─────────┐     │
│                │   │ Contacts│ │  Deals  │ │Activities│     │
│  ○ John Smith  │   │   12    │ │    5    │ │   34    │     │
│    Lead        │   └─────────┘ └─────────┘ └─────────┘     │
│  ○ Jane Doe    │                                            │
│    Customer    │   Recent Activities                        │
│  ○ Acme Corp   │   • Call with John - 2h ago                │
│    Prospect    │   • Email to Jane - 5h ago                 │
│                │                                            │
│                │   ─────────────────────────────────────    │
│                │   Select a contact to view details         │
│                │                                            │
└────────────────┴────────────────────────────────────────────┘
```

### Contact Detail View (when contact selected)
```
┌────────────────────────────────────────────┐
│  John Smith                                │
│  john@acme.com | 555-1234                  │
│  Company: Acme Corp                        │
│  Status: [Lead]                            │
│                                            │
│  [Call] [Email] [Meeting] [Note]           │
│                                            │
│  Activity History                          │
│  ─────────────────────────────────────     │
│  • Call - Discussed pricing - 2h ago       │
│  • Email - Sent proposal - 1d ago          │
│                                            │
└────────────────────────────────────────────┘
```

---

## TypeScript Types

```typescript
// src/lib/types/index.ts

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'lead' | 'prospect' | 'customer';
}

export interface Activity {
  id: string;
  contactId: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  description: string;
  outcome?: string;
  timestamp: string;
}

export interface DashboardData {
  contactCounts: {
    lead: number;
    prospect: number;
    customer: number;
    total: number;
  };
  activityCount: number;
  recentActivities: Activity[];
}

export interface AuthState {
  username: string;
  apiKey: string;
  isAuthenticated: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

---

## API Integration

### Scout API Configuration
- **Workflow ID:** `wf_cmj94h2ij00010hs6hqatcw6x`
- **Endpoint:** `https://api-prod.scoutos.com/v2/workflows/wf_cmj94h2ij00010hs6hqatcw6x/execute`
- **Auth:** Bearer token (user's API key)
- **Response Format:** JSON (via `stream: false`)

### API Client Pattern
```typescript
// Direct browser call to Scout API (no CORS proxy needed)
async function executeCommand(apiKey: string, message: string): Promise<any> {
  const response = await fetch(SCOUT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({ message, stream: false })
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
}
```

### NL Commands Reference

| Operation | Command Pattern |
|-----------|----------------|
| List Contacts | `LIST ALL CONTACTS OUTPUT JSON WITH ID NAME EMAIL COMPANY STATUS PHONE` |
| Get Dashboard | `GET DASHBOARD OVERVIEW WITH CONTACT COUNTS BY STATUS AND RECENT ACTIVITIES LIMIT 5 OUTPUT JSON` |
| Get Contact Details | `GET CONTACT DETAILS FOR {id} WITH ALL FIELDS AND ACTIVITIES FROM LAST 24 HOURS OUTPUT JSON` |
| Create Contact | `CREATE NEW CONTACT NAME '{name}' EMAIL '{email}' COMPANY '{company}' STATUS 'lead' OUTPUT JSON` |
| Log Activity | `LOG {type} ACTIVITY FOR CONTACT {id} DESCRIPTION '{desc}' OUTCOME '{outcome}' OUTPUT JSON` |

---

## Svelte Stores

### Auth Store
```typescript
// src/lib/stores/auth.ts
import { writable } from 'svelte/store';

interface AuthState {
  username: string;
  apiKey: string;
  isAuthenticated: boolean;
}

const storedAuth = localStorage.getItem('crm_auth');
const initialState: AuthState = storedAuth 
  ? JSON.parse(storedAuth) 
  : { username: '', apiKey: '', isAuthenticated: false };

export const auth = writable<AuthState>(initialState);

// Persist to localStorage on change
auth.subscribe(value => {
  if (value.isAuthenticated) {
    localStorage.setItem('crm_auth', JSON.stringify(value));
  } else {
    localStorage.removeItem('crm_auth');
  }
});
```

### Contacts Store
```typescript
// src/lib/stores/contacts.ts
import { writable } from 'svelte/store';
import type { Contact } from '../types';

export const contacts = writable<Contact[]>([]);
export const selectedContactId = writable<string | null>(null);
export const isLoading = writable<boolean>(false);
```

---

## Visual Design (Tailwind + shadcn-neutral)

### Color Palette
```css
/* Tailwind config extensions */
colors: {
  border: "hsl(214.3 31.8% 91.4%)",
  background: "hsl(0 0% 100%)",
  foreground: "hsl(222.2 84% 4.9%)",
  muted: "hsl(210 40% 96.1%)",
  "muted-foreground": "hsl(215.4 16.3% 46.9%)",
  card: "hsl(0 0% 100%)",
  "card-foreground": "hsl(222.2 84% 4.9%)",
}
```

### Status Badge Colors (Neutral)
- **Lead:** `bg-gray-100 text-gray-700`
- **Prospect:** `bg-gray-200 text-gray-800`
- **Customer:** `bg-gray-600 text-white`

### Component Styling
- Rounded corners: `rounded-md` (6px) or `rounded-lg` (8px)
- Subtle shadows: `shadow-sm`
- Border color: `border-gray-200`
- Focus rings: `focus:ring-2 focus:ring-gray-400`

---

## Implementation Tasks

### Phase 1: Project Setup
- [x] Update plan with Svelte + TypeScript approach
- [ ] Scaffold Svelte + Vite + TypeScript + Tailwind project
- [ ] Create TypeScript types for API entities
- [ ] Build API client and NL command builders
- [ ] Create Svelte stores (auth, contacts, ui)

### Phase 2: Core UI Components
- [ ] Build LoginScreen component
- [ ] Build Sidebar and ContactList components
- [ ] Build Dashboard component
- [ ] Build ContactDetail and ActivityTimeline components

### Phase 3: Create Operations
- [ ] Build ContactForm component (create contact)
- [ ] Build ActivityForm component (log activity)

### Phase 4: Integration & Polish
- [ ] Wire up App.svelte with all components
- [ ] Add loading states and error handling
- [ ] Test end-to-end functionality

### Phase 5: Deployment
- [ ] Configure for Render.com static site deployment
- [ ] Deploy and verify

---

## Deployment to Render.com

### Build Configuration
```json
{
  "build": "npm run build",
  "publish": "dist"
}
```

### Render.com Setup
1. Connect GitHub repository
2. Select "Static Site" 
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy

---

## Success Criteria

1. User can log in with username and Scout API key
2. Contact list displays from NL API call
3. Clicking contact shows detail view with activities
4. User can create a new contact via form
5. User can log activities (Call, Email, Meeting, Note)
6. Dashboard shows summary statistics
7. Clean, professional Tailwind appearance
8. Successfully deployed and accessible on Render.com

---

## Next Steps

1. ~~Review this plan~~
2. Scaffold Svelte + Vite + TypeScript + Tailwind project
3. Build components incrementally
4. Test with real Scout API
5. Deploy to Render.com
