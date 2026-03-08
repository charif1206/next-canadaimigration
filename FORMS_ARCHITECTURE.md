# Forms Module Refactoring - Architecture Documentation

## Overview
The forms functionality has been refactored following clean architecture principles with clear separation of concerns. This improves maintainability, testability, and scalability.

## Architecture Layers

### 1. **Constants Layer** (`lib/constants/`)
**Purpose:** Centralized configuration and static data

**Files:**
- `forms.constants.ts` - Form types, statuses, metadata, UI messages, and configuration

**Benefits:**
- Single source of truth for all form-related constants
- Easy to update text and configuration
- Type-safe constants with TypeScript `as const`

### 2. **Utilities Layer** (`lib/utils/`)
**Purpose:** Pure helper functions with no side effects

**Files:**
- `formTime.utils.ts` - Time calculation for form resubmission
  - `calculateTimeRemaining()` - Calculate hours/minutes until resubmission allowed
  - `canResubmitForm()` - Check if resubmission is permitted

- `formStorage.utils.ts` - LocalStorage management
  - `setTempSendingState()` - Save temporary sending state
  - `getTempSendingState()` - Retrieve temporary sending state
  - `removeTempSendingState()` - Clear temporary state
  - `cleanupOldTempStates()` - Remove stale data for other clients

**Benefits:**
- Reusable functions across components
- Easy to test in isolation
- No dependencies on React or state

### 3. **Hooks Layer** (`lib/hooks/`)
**Purpose:** Custom React hooks for stateful logic

**Files:**
- `useFormState.ts` - Complete form state management
  - Manages temporary sending state
  - Handles localStorage sync
  - Calculates resubmission eligibility
  - Provides form submit handler
  - Auto-refreshes auth state

**Benefits:**
- Encapsulates complex state logic
- Reusable across different form pages
- Follows React hooks patterns
- Automatically handles side effects

### 4. **Components Layer** (`components/forms/`)
**Purpose:** Presentational UI components

**Files:**
- `FormCard.tsx` - Reusable form selection card
- `FormsHelpSection.tsx` - Help/contact section
- `BackToFormsLink.tsx` - Navigation link component
- `FormPageHeader.tsx` - Page title and description

**Benefits:**
- Small, focused components
- Easy to test and maintain
- Consistent UI across pages
- Reusable across application

### 5. **Pages Layer** (`app/forms/`)
**Purpose:** Route components that compose everything together

**Files:**
- `page.tsx` - Forms landing page (listing)
- `equivalence/page.tsx` - Equivalence form page
- `residence/page.tsx` - Residence form page

**Benefits:**
- Clean, readable page components
- Minimal logic (orchestration only)
- Easy to understand data flow

## Data Flow

```
User Interaction
      ↓
Page Component (orchestrates)
      ↓
useFormState Hook (manages state)
      ↓
├─→ formStorage.utils (localStorage)
├─→ formTime.utils (calculations)
└─→ useAuth (API calls)
      ↓
UI Components (render)
```

## Key Improvements

### Before Refactoring:
- ❌ Duplicate `calculateTimeRemaining` function in each page
- ❌ Mixed UI and business logic
- ❌ Direct localStorage manipulation in components
- ❌ Hardcoded strings throughout
- ❌ Difficult to test
- ❌ Hard to reuse logic

### After Refactoring:
- ✅ Single source of truth for all logic
- ✅ Clear separation of concerns
- ✅ Reusable utilities and components
- ✅ Centralized constants
- ✅ Easy to test each layer independently
- ✅ Type-safe with TypeScript
- ✅ Consistent behavior across forms

## Usage Examples

### Using the FormState Hook:
```typescript
const {
  isSendingTemporarily,
  canResubmit,
  isFormSending,
  formStatus,
  rejectedAt,
  rejectionReason,
  handleFormSubmit,
} = useFormState(FORM_TYPES.EQUIVALENCE);
```

### Using FormCard Component:
```typescript
<FormCard
  href="/forms/equivalence"
  icon={FORM_METADATA.equivalence.icon}
  title={FORM_METADATA.equivalence.title}
  description={FORM_METADATA.equivalence.description}
/>
```

### Using Time Utilities:
```typescript
const timeRemaining = calculateTimeRemaining(rejectedAt);
const canSubmit = canResubmitForm(status, rejectedAt);
```

## Testing Strategy

Each layer can be tested independently:

1. **Utils Tests:** Pure functions, easy to test
2. **Hook Tests:** Using React Testing Library hooks testing
3. **Component Tests:** Snapshot and interaction tests
4. **Integration Tests:** Full page flow testing

## Future Enhancements

- Add form validation utilities
- Create form analytics tracking
- Add form draft saving
- Implement form progress indicators
- Add accessibility improvements

## Migration Notes

### Breaking Changes:
- None - All existing functionality preserved

### Backward Compatibility:
- ✅ All existing components work unchanged
- ✅ API calls remain the same
- ✅ User experience identical

### Deprecated:
- Inline `calculateTimeRemaining` functions in pages (use `formTime.utils` instead)
- Direct localStorage access (use `formStorage.utils` instead)
