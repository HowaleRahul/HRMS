# Frontend QA Audit Log

## 1. Routing & Authorization Vulnerabilities (Critical)
**File**: `src/App.jsx` & `src/components/auth/ProtectedRoute.jsx`
- **Issue**: Lack of Route-Level Role-Based Access Control (RBAC). 
- **Detail**: While `ProtectedRoute` supports a `requiredPermission` prop, none of the routes in `App.jsx` utilize it. As a result, ANY authenticated user (even a base-level employee) can manually navigate to sensitive routes like `/payroll`, `/settings/roles`, or `/employees/edit/1` by simply modifying the URL.
- **Fix**: Apply the `requiredPermission` prop to sensitive routes in `App.jsx`.

## 2. Missing Global Error Boundaries (High)
**File**: `src/App.jsx`
- **Issue**: No Global Error Boundary.
- **Detail**: In React 18, unhandled exceptions during render or inside effects will unmount the entire component tree, resulting in a blank white screen. There is no fallback UI for unexpected application crashes.
- **Fix**: Implement an `ErrorBoundary` component and wrap the main `<Routes>` block.

## 3. Data Loss & Validation Bypass (Critical)
**File**: `src/pages/employees/EmployeeForm.jsx`
- **Issue 1**: Silent Data Loss on Submission (Line 117). The `handleSubmit` function only merges `formData.personal` and `formData.employment` into the payload. The data collected in the Bank, Salary, and Emergency Contacts tabs is completely discarded and never sent to the backend.
- **Issue 2**: HTML5 Validation Bypass (Line 161). The form relies on `required` attributes for validation. However, because inactive tabs are unmounted (`{activeTab === 'personal' && ...}`), their inputs are removed from the DOM. If a user switches to the 'Employment' tab, the 'Personal' tab's required fields are no longer validated by the browser, allowing submission of incomplete data.
- **Fix**: Use CSS (`display: none`) to hide inactive tabs instead of conditionally unmounting them, or implement manual JS-based validation before submission. Update payload to include all form sections.

## 4. Performance Bottlenecks & Race Conditions (High)
**File**: `src/pages/employees/EmployeeList.jsx`
- **Issue 1**: API Spamming & Redundant Requests (Line 28). The `useEffect` depends on `[page, filters, searchTerm]` and calls both `fetchMasterData` and `fetchEmployees`. This means static master data (departments, designations) is re-fetched on every single keystroke or pagination change, needlessly overloading the server.
- **Issue 2**: Missing Debounce on Search (Line 149). The search input updates `searchTerm` immediately on every keystroke, firing a new API request instantly. This creates severe race conditions where older requests can resolve after newer ones, overwriting the UI with stale data.
- **Fix**: Split the `useEffect` into two: one for `fetchMasterData` (runs once on mount) and another for `fetchEmployees` (with a debounced search term).

## 5. Broken Navigation (Medium)
**File**: `src/pages/dashboard/Dashboard.jsx`
- **Issue**: Invalid Quick Action Link (Line 129). The "Apply Leave" button redirects to `/leaves/add`, but the actual route defined in `App.jsx` is `/leaves/apply`. Clicking this link results in a 404 Not Found error.
- **Fix**: Change `navigate('/leaves/add')` to `navigate('/leaves/apply')`.

## 6. Accessibility & State Management Issues (Low/Medium)
**File**: `src/pages/employees/EmployeeList.jsx` & `src/pages/auth/Login.jsx`
- **Issue 1**: The Delete action in `EmployeeList` has no loading state (`isDeleting`), allowing double-submission if clicked multiple times.
- **Issue 2**: Icon-only buttons (like Eye/Edit/Trash in lists, and the password reveal eye in Login) lack `aria-label` attributes, making them inaccessible to screen readers.
- **Issue 3**: `DataTable` in `EmployeeList` receives data but no pagination controls are passed down, leaving users trapped on page 1.
