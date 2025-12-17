# UX Enhancements: Loading States & Feedback

## Overview

This document outlines enhancements to improve user experience during slow API operations (20-30 second response times). The goal is to provide clear visual feedback that the system is working, using skeleton loaders, spinners, and a global progress bar.

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Loading indicator style | Skeleton loaders | More aesthetically pleasing, feels faster |
| Time estimates | No | Keep it simple with just visual indicators |
| Toast animations | Simple | No fancy slide-in/progress bars needed |
| Global progress bar | Yes | Subtle top-of-page indicator for any loading |
| Progress bar color | Neutral gray | Matches overall design aesthetic |
| Skeleton color | Standard gray (`bg-gray-200`) | Clean, unobtrusive pulse animation |

---

## Components to Create

### 1. Spinner Component
**File**: `src/lib/components/Spinner.svelte`

A reusable spinner with size variants.

**Props**:
- `size`: `'sm' | 'md' | 'lg'` (default: `'md'`)
  - `sm`: 16px - for buttons/inline
  - `md`: 24px - for content areas  
  - `lg`: 32px - for larger areas
- `class`: optional additional CSS classes

**Implementation Notes**:
- Use SVG-based spinner with `animate-spin`
- Support `prefers-reduced-motion` media query
- Use `currentColor` for flexibility
- Include `role="status"` and `aria-label` for accessibility

**Example Usage**:
```svelte
<Spinner size="sm" />
<Spinner size="md" class="text-blue-500" />
```

---

### 2. Skeleton Card Component
**File**: `src/lib/components/SkeletonCard.svelte`

Base skeleton component for loading placeholders.

**Props**:
- `class`: optional additional CSS classes

**Implementation Notes**:
- Gray background with pulse animation
- Rounded corners to match card styling
- Flexible height/width via class prop

---

### 3. Skeleton Contact Card Component
**File**: `src/lib/components/SkeletonContactCard.svelte`

Skeleton that mimics the shape of a contact card.

**Structure**:
```
┌─────────────────────────────┐
│ [====== name ======]  [tag] │
│ [=== company/email ===]     │
└─────────────────────────────┘
```

**Implementation Notes**:
- Match dimensions of `ContactCard.svelte`
- Include skeleton for name (wider), company (narrower), and status badge

---

### 4. Skeleton Dashboard Component
**File**: `src/lib/components/SkeletonDashboard.svelte`

Skeleton layout matching the dashboard structure.

**Structure**:
```
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Stat 1   │ │ Stat 2   │ │ Stat 3   │
│ [=====]  │ │ [=====]  │ │ [=====]  │
└──────────┘ └──────────┘ └──────────┘

┌─────────────────────────────────────┐
│ Recent Activities                   │
│ [============================]      │
│ [============================]      │
│ [============================]      │
└─────────────────────────────────────┘
```

**Implementation Notes**:
- 3 stat card skeletons in a grid
- Activity section with 3-4 skeleton list items
- Match padding and spacing of actual Dashboard component

---

### 5. Global Progress Bar Component
**File**: `src/lib/components/ProgressBar.svelte`

Thin progress bar at top of viewport.

**Props**:
- `visible`: `boolean` - controls visibility

**Implementation Notes**:
- Fixed position at top of viewport
- Height: 2-3px
- Neutral gray color (`bg-gray-400`)
- Indeterminate animation (sliding gradient or repeating pulse)
- Smooth fade in/out transitions
- `z-index` high enough to appear above all content

**Animation Style**:
```css
/* Indeterminate progress animation */
@keyframes progress-indeterminate {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
}
```

---

## Components to Modify

### 6. LoginScreen Component
**File**: `src/lib/components/LoginScreen.svelte`

**Current State**: No loading feedback during sign-in

**Changes**:
1. Add `loading` prop: `boolean`
2. When `loading`:
   - Disable username and API key inputs
   - Disable submit button
   - Change button text to "Signing in..." with inline `<Spinner size="sm" />`
3. Optionally show helper text below button: "Validating your credentials..."

**Updated Props**:
```typescript
{
  onlogin?: (data: { username: string; apiKey: string }) => void;
  loading?: boolean;  // NEW
}
```

---

### 7. ContactList Component
**File**: `src/lib/components/ContactList.svelte`

**Current State**: Shows "No contacts yet" immediately (even while loading)

**Changes**:
1. Add `loading` prop: `boolean`
2. Conditional rendering:
   - If `loading`: Show 4 `<SkeletonContactCard />` components
   - If `!loading && contacts.length === 0`: Show "No contacts yet"
   - If `!loading && contacts.length > 0`: Show actual contacts
3. "Add New" button remains visible (optionally disabled while loading)

**Updated Props**:
```typescript
{
  contacts: Contact[];
  selectedId?: string | null;
  loading?: boolean;  // NEW
  onselect?: (id: string) => void;
  onadd?: () => void;
}
```

---

### 8. Dashboard Component
**File**: `src/lib/components/Dashboard.svelte`

**Current State**: Shows "Loading dashboard..." text

**Changes**:
1. When `loading`: Render `<SkeletonDashboard />` instead of text
2. Smooth transition when data arrives (optional fade-in)

**No prop changes needed** - already has `loading` prop

---

### 9. ContactDetail Component
**File**: `src/lib/components/ContactDetail.svelte`

**Current State**: Shows "Loading contact..." text

**Changes**:
1. When `loading`: Show skeleton layout:
   - Back button (always visible, functional)
   - Skeleton for contact info card (name, status, details)
   - Action buttons (visible but slightly dimmed/disabled)
   - Skeleton for activity timeline
2. Create inline skeleton structure (no separate component needed)

**No prop changes needed** - already has `loading` prop

---

### 10. Sidebar Component
**File**: `src/lib/components/Sidebar.svelte`

**Changes**:
1. Add `loading` prop: `boolean`
2. Pass `loading` to `<ContactList />`

**Updated Props**:
```typescript
{
  contacts: Contact[];
  selectedId?: string | null;
  loading?: boolean;  // NEW
  onselect?: (id: string) => void;
  onadd?: () => void;
}
```

---

### 11. App.svelte
**File**: `src/App.svelte`

**Changes**:
1. Import and add `<ProgressBar />` at top of authenticated view
2. Add granular loading state tracking:
   ```typescript
   let isLoggingIn = $state(false);
   let isLoadingContacts = $state(false);
   let isLoadingDashboard = $state(false);
   let isLoadingContactDetail = $state(false);
   ```
3. Compute `anyLoading` for progress bar:
   ```typescript
   let anyLoading = $derived(
     isLoggingIn || isLoadingContacts || isLoadingDashboard || isLoadingContactDetail
   );
   ```
4. Pass `loading={isLoggingIn}` to `<LoginScreen />`
5. Pass `loading={isLoadingContacts}` to `<Sidebar />`
6. Update async functions to set appropriate loading states

---

### 12. CSS Styles
**File**: `src/app.css`

**Add**:
```css
/* Skeleton loading animation */
.skeleton {
  @apply bg-gray-200 rounded;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Progress bar animation */
.progress-bar-indeterminate {
  background: linear-gradient(90deg, transparent, theme('colors.gray.400'), transparent);
  background-size: 200% 100%;
  animation: progress-slide 1.5s ease-in-out infinite;
}

@keyframes progress-slide {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .skeleton,
  .progress-bar-indeterminate,
  .animate-spin {
    animation: none;
  }
  .skeleton {
    opacity: 0.7;
  }
}
```

---

## Implementation Order

Execute tasks in this order to minimize dependencies:

1. **CSS Styles** (`src/app.css`) - Add skeleton and progress bar animations
2. **Spinner Component** - Base component used by others
3. **SkeletonCard Component** - Base skeleton component
4. **SkeletonContactCard Component** - Depends on SkeletonCard
5. **SkeletonDashboard Component** - Depends on SkeletonCard
6. **ProgressBar Component** - Independent
7. **LoginScreen** - Add loading prop and spinner
8. **ContactList** - Add loading prop and skeletons
9. **Dashboard** - Replace loading text with skeleton
10. **ContactDetail** - Add skeleton loading state
11. **Sidebar** - Pass loading prop through
12. **App.svelte** - Wire everything together

---

## Delegation Instructions

### For Sub-Agents

When delegating implementation tasks, use this format:

#### Task: Create Spinner Component
```
Create a new Svelte component at src/lib/components/Spinner.svelte

Requirements:
- Props: size ('sm' | 'md' | 'lg', default 'md'), class (optional string)
- Sizes: sm=16px, md=24px, lg=32px (use h-4/w-4, h-6/w-6, h-8/w-8)
- Use SVG spinner with animate-spin class
- Use currentColor for the stroke/fill
- Include role="status" and aria-label="Loading" for accessibility
- Export as default

Reference the existing spinner in ContactForm.svelte (lines 116-135) for the SVG markup.
```

#### Task: Create SkeletonContactCard Component
```
Create a new Svelte component at src/lib/components/SkeletonContactCard.svelte

Requirements:
- Match the visual structure of ContactCard.svelte
- Use div elements with class="skeleton" for animated placeholders
- Include: name skeleton (h-4 w-32), company skeleton (h-3 w-24), status badge skeleton (h-5 w-12)
- Match padding and layout of actual ContactCard
- No props needed
```

#### Task: Update ContactList with Loading State
```
Modify src/lib/components/ContactList.svelte

Requirements:
- Add loading prop (boolean, default false)
- When loading is true AND contacts.length === 0, show 4 SkeletonContactCard components
- When loading is false AND contacts.length === 0, show "No contacts yet"
- When contacts.length > 0, show actual contacts (regardless of loading)
- Import SkeletonContactCard component
- Keep "Add New" button always visible
```

---

## Testing & Verification

### Manual Testing Checklist

After implementation, verify each scenario:

#### Login Flow
- [ ] Click "Sign In" → Button shows spinner + "Signing in..."
- [ ] Inputs are disabled during loading
- [ ] Progress bar appears at top of page
- [ ] On success, progress bar disappears, main interface loads
- [ ] On error, button re-enables, error message shown

#### Contact List Loading
- [ ] On initial load, sidebar shows skeleton contact cards
- [ ] Skeletons have subtle pulse animation
- [ ] When contacts load, they replace skeletons smoothly
- [ ] If no contacts exist, "No contacts yet" appears after loading

#### Dashboard Loading
- [ ] Dashboard shows skeleton stat cards and activity section
- [ ] Skeletons have pulse animation
- [ ] When data loads, real content replaces skeletons

#### Contact Detail Loading
- [ ] Clicking a contact shows skeleton in detail area
- [ ] Back button is visible and functional during loading
- [ ] Action buttons visible (can be dimmed)
- [ ] When loaded, real contact info appears

#### Progress Bar
- [ ] Appears during any loading operation
- [ ] Has smooth sliding animation
- [ ] Disappears when all loading completes
- [ ] Works for: login, initial load, contact selection

#### Accessibility
- [ ] Spinners have appropriate ARIA labels
- [ ] Loading states announced to screen readers
- [ ] Reduced motion preference respected

### Automated Testing

Run existing test suites to ensure no regressions:

```bash
# Unit tests
npm run test:unit

# E2E tests  
npm run test:e2e
```

**Note**: Some component tests may need updates to account for new `loading` props. If tests fail due to missing props, update the test files to provide the new required props.

---

## Delegation Checklist for Implementation

Use this checklist to track progress:

- [ ] 1. Update `src/app.css` with skeleton and progress bar animations
- [ ] 2. Create `src/lib/components/Spinner.svelte`
- [ ] 3. Create `src/lib/components/SkeletonCard.svelte`
- [ ] 4. Create `src/lib/components/SkeletonContactCard.svelte`
- [ ] 5. Create `src/lib/components/SkeletonDashboard.svelte`
- [ ] 6. Create `src/lib/components/ProgressBar.svelte`
- [ ] 7. Update `src/lib/components/LoginScreen.svelte`
- [ ] 8. Update `src/lib/components/ContactList.svelte`
- [ ] 9. Update `src/lib/components/Dashboard.svelte`
- [ ] 10. Update `src/lib/components/ContactDetail.svelte`
- [ ] 11. Update `src/lib/components/Sidebar.svelte`
- [ ] 12. Update `src/App.svelte`
- [ ] 13. Run unit tests and fix any failures
- [ ] 14. Run E2E tests and fix any failures
- [ ] 15. Manual testing of all scenarios
- [ ] 16. Commit changes with descriptive message
