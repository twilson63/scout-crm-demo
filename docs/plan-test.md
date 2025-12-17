# Scout CRM Demo - Test Plan

## Overview

This document outlines the testing strategy for verifying the Scout CRM Demo application. It covers unit tests, integration tests, end-to-end tests, and manual verification procedures.

---

## Test Categories

| Category | Tool | Purpose |
|----------|------|---------|
| Unit Tests | Vitest | Test business logic, command builders, API client |
| Component Tests | Vitest + Testing Library | Test individual Svelte components |
| E2E Tests | Playwright | Test full user flows in browser |
| Manual Tests | Browser | Visual verification, UX validation |

---

## 1. Unit Tests (Automated)

### 1.1 NL Command Builders (`src/lib/api/__tests__/commands.test.ts`)

| Test Case | Status | Description |
|-----------|--------|-------------|
| `listContactsCommand()` format | Implemented | Verify correct NL command structure |
| `getDashboardCommand()` default limit | Implemented | Verify default activity limit |
| `getDashboardCommand()` custom limit | Implemented | Verify custom limit parameter |
| `getContactDetailsCommand()` | Implemented | Verify contact ID insertion |
| `getContactActivitiesCommand()` | Implemented | Verify activities query format |
| `createContactCommand()` required fields | Implemented | Name + email only |
| `createContactCommand()` all fields | Implemented | Name, email, phone, company |
| `createContactCommand()` with status | Implemented | Custom status value |
| `logActivityCommand()` call type | Implemented | Verify CALL activity format |
| `logActivityCommand()` email type | Implemented | Verify EMAIL activity format |
| `logActivityCommand()` meeting type | Implemented | Verify MEETING activity format |
| `logActivityCommand()` note type | Implemented | Verify NOTE activity format |
| `logActivityCommand()` with outcome | Implemented | Optional outcome field |
| `updateContactStatusCommand()` | Implemented | Status update format |
| `searchContactsCommand()` | Implemented | Search query format |
| String escaping (single quotes) | Implemented | Escape `'` in all string fields |

**Run:** `npm run test:unit -- commands.test.ts`

### 1.2 API Client (`src/lib/api/__tests__/client.test.ts`)

| Test Case | Status | Description |
|-----------|--------|-------------|
| Request headers | Implemented | Content-Type, Authorization |
| Request body format | Implemented | message, stream: false |
| Response parsing - content field | Implemented | Extract from `content` |
| Response parsing - message field | Implemented | Extract from `message` |
| Response parsing - data field | Implemented | Extract from `data` |
| Response parsing - result field | Implemented | Extract from `result` |
| JSON in markdown code blocks | Implemented | Extract JSON from ```json``` |
| HTTP error handling | Implemented | 4xx, 5xx responses |
| Network error handling | Implemented | Fetch failures |
| `listContacts()` success | Implemented | Returns Contact[] |
| `listContacts()` wrapped response | Implemented | Handles `{ contacts: [] }` |
| `getDashboard()` success | Implemented | Returns DashboardData |
| `getContactDetails()` success | Implemented | Returns ContactWithActivities |
| `createContact()` success | Implemented | Returns created Contact |
| `logActivity()` success | Implemented | Returns created Activity |

**Run:** `npm run test:unit -- client.test.ts`

---

## 2. Component Tests (To Implement)

### 2.1 StatusBadge Component

| Test Case | Priority | Description |
|-----------|----------|-------------|
| Renders "lead" badge | High | Shows gray-100 background |
| Renders "prospect" badge | High | Shows gray-200 background |
| Renders "customer" badge | High | Shows gray-600 background |
| Displays correct text | High | Capitalizes status |

### 2.2 LoginScreen Component

| Test Case | Priority | Description |
|-----------|----------|-------------|
| Renders login form | High | Username, API key inputs visible |
| Submit disabled when empty | Medium | Button disabled without input |
| Calls onlogin with credentials | High | Passes username and apiKey |
| Trims whitespace | Medium | Trims input values |

### 2.3 ContactCard Component

| Test Case | Priority | Description |
|-----------|----------|-------------|
| Renders contact name | High | Displays name |
| Renders company | High | Shows company if present |
| Shows status badge | High | Renders StatusBadge |
| Selected state styling | Medium | Highlights when selected |
| Click calls onclick | High | Triggers selection |

### 2.4 ContactList Component

| Test Case | Priority | Description |
|-----------|----------|-------------|
| Renders all contacts | High | Maps contacts to cards |
| "Add New" button visible | High | Button present |
| Click contact calls onselect | High | Selection callback |
| Click add calls onadd | High | Add callback |
| Empty state | Medium | Shows message when no contacts |

### 2.5 Dashboard Component

| Test Case | Priority | Description |
|-----------|----------|-------------|
| Shows contact count | High | Total contacts stat |
| Shows status breakdown | High | Lead/Prospect/Customer counts |
| Shows activity count | High | Total activities |
| Shows recent activities | High | Activity timeline |
| Loading state | Medium | Shows spinner when loading |
| Empty state | Medium | Handles null data |

### 2.6 ContactDetail Component

| Test Case | Priority | Description |
|-----------|----------|-------------|
| Shows contact info | High | Name, email, phone, company |
| Shows status badge | High | Current status |
| Action buttons present | High | Call, Email, Meeting, Note |
| Activity timeline shown | High | Shows activities |
| Back button works | High | Calls onClose |
| Action button calls callback | High | Calls onLogActivity |

### 2.7 ContactForm Component

| Test Case | Priority | Description |
|-----------|----------|-------------|
| Renders all fields | High | Name, email, phone, company |
| Validates required fields | High | Name and email required |
| Submit disabled when invalid | High | Button disabled |
| Calls onsubmit with data | High | Passes CreateContactData |
| Cancel calls oncancel | High | Closes form |
| Loading state | Medium | Shows spinner during submit |

### 2.8 ActivityForm Component

| Test Case | Priority | Description |
|-----------|----------|-------------|
| Shows activity type | High | Icon and label |
| Validates description | High | Required field |
| Calls onsubmit with data | High | Passes LogActivityData |
| Cancel calls oncancel | High | Closes form |
| Loading state | Medium | Shows spinner during submit |

**Run:** `npm run test:unit -- --testPathPattern=components`

---

## 3. End-to-End Tests (Playwright)

### 3.1 Authentication Flow (`e2e/crm.spec.ts`)

| Test Case | Status | Description |
|-----------|--------|-------------|
| Login screen displays | Implemented | Shows form on load |
| Empty form shows validation | Implemented | Fields required |
| Successful login | Implemented | Redirects to dashboard |
| Invalid API key error | Implemented | Shows error message |
| Logout clears session | Implemented | Returns to login |
| Persists login on refresh | Implemented | localStorage persistence |

### 3.2 Contacts List

| Test Case | Status | Description |
|-----------|--------|-------------|
| Contacts load after login | Implemented | List populates |
| Contact cards show info | Implemented | Name, company, status |
| Clicking contact selects | Implemented | Highlights card |
| "Add New" button visible | Implemented | Button in sidebar |

### 3.3 Contact Detail View

| Test Case | Status | Description |
|-----------|--------|-------------|
| Detail view shows on select | Implemented | Main content updates |
| Shows contact information | Implemented | All fields displayed |
| Action buttons present | Implemented | 4 activity buttons |
| Activity timeline shows | Implemented | If activities exist |
| Back returns to dashboard | Implemented | Deselects contact |

### 3.4 Create Contact

| Test Case | Status | Description |
|-----------|--------|-------------|
| Form opens on "Add New" | Implemented | Modal appears |
| Validation prevents submit | Implemented | Required fields |
| Successful creation | Implemented | Contact added to list |
| Form closes after create | Implemented | Modal dismissed |
| Success message shown | Implemented | Toast notification |

### 3.5 Log Activity

| Test Case | Status | Description |
|-----------|--------|-------------|
| Form opens on action click | Implemented | Modal with type |
| Shows correct activity type | Implemented | Icon and label |
| Successful logging | Implemented | Activity added |
| Form closes after log | Implemented | Modal dismissed |
| Timeline updates | Implemented | New activity visible |

### 3.6 Error Handling

| Test Case | Status | Description |
|-----------|--------|-------------|
| API error shows message | Implemented | Error toast |
| Network error handled | Implemented | Error toast |
| Error auto-dismisses | Implemented | Clears after 5s |

**Run:** `npm run test:e2e`

---

## 4. Manual Testing Checklist

### 4.1 Visual/UI Verification

| Check | Pass/Fail | Notes |
|-------|-----------|-------|
| Login screen centered and styled | | |
| Form inputs have proper styling | | |
| Buttons have hover states | | |
| Cards have proper shadows/borders | | |
| Status badges have correct colors | | |
| Sidebar has fixed width | | |
| Main content scrolls properly | | |
| Modals have backdrop overlay | | |
| Toast notifications positioned correctly | | |
| Loading spinners visible | | |
| Typography is consistent | | |
| Spacing/padding is consistent | | |

### 4.2 Functional Verification (with Real API)

| Check | Pass/Fail | Notes |
|-------|-----------|-------|
| Login with valid Scout API key | | |
| Contacts list loads from API | | |
| Dashboard stats are accurate | | |
| Contact details load on click | | |
| Create contact saves to API | | |
| Log activity saves to API | | |
| Logout clears all data | | |
| Re-login restores session | | |

### 4.3 Edge Cases

| Check | Pass/Fail | Notes |
|-------|-----------|-------|
| Empty contacts list | | |
| Contact with no activities | | |
| Contact with no phone/company | | |
| Very long contact name | | |
| Special characters in fields | | |
| Rapid clicking doesn't break UI | | |
| Form double-submit prevented | | |

### 4.4 Browser Compatibility

| Browser | Version | Pass/Fail | Notes |
|---------|---------|-----------|-------|
| Chrome | Latest | | |
| Firefox | Latest | | |
| Safari | Latest | | |
| Edge | Latest | | |

### 4.5 Responsive Design (if applicable)

| Breakpoint | Pass/Fail | Notes |
|------------|-----------|-------|
| Desktop (1920px) | | |
| Laptop (1366px) | | |
| Tablet (768px) | | |
| Mobile (375px) | | |

---

## 5. Test Data

### 5.1 Valid Test Credentials

```
Username: testuser
API Key: [Your Scout API Key]
```

### 5.2 Test Contact Data

```json
{
  "name": "Test Contact",
  "email": "test@example.com",
  "phone": "+1-555-123-4567",
  "company": "Test Company"
}
```

### 5.3 Test Activity Data

```json
{
  "type": "call",
  "description": "Test call description",
  "outcome": "Scheduled follow-up"
}
```

---

## 6. Running Tests

### All Unit Tests
```bash
npm run test:unit
```

### Unit Tests in Watch Mode
```bash
npm test
```

### Specific Test File
```bash
npm run test:unit -- commands.test.ts
npm run test:unit -- client.test.ts
```

### E2E Tests
```bash
# First, start the dev server
npm run dev

# In another terminal, run Playwright
npm run test:e2e

# Or run with UI
npx playwright test --ui
```

### E2E Tests with Headed Browser
```bash
npx playwright test --headed
```

### Generate Test Report
```bash
npx playwright show-report
```

---

## 7. Test Coverage Goals

| Category | Target | Current |
|----------|--------|---------|
| Command Builders | 100% | 100% |
| API Client | 90% | ~90% |
| Stores | 80% | ~60% |
| Components | 70% | ~40% |
| E2E Flows | 100% critical paths | 100% |

---

## 8. Known Limitations

1. **E2E tests require mocked API** - Tests use route mocking, not real API
2. **No visual regression tests** - Consider adding Percy or similar
3. **No accessibility tests** - Consider adding axe-core
4. **No performance tests** - Consider adding Lighthouse CI

---

## 9. Test Maintenance

### Adding New Tests

1. Unit tests go in `src/lib/**/__tests__/`
2. E2E tests go in `e2e/`
3. Follow existing naming conventions
4. Update this document when adding new test categories

### Updating Tests

When modifying functionality:
1. Run related tests first to confirm baseline
2. Update tests to match new behavior
3. Verify all tests pass before committing

---

## 10. CI/CD Integration (Future)

```yaml
# Example GitHub Actions workflow
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:unit
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```
