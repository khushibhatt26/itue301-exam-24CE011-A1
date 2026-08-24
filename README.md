# Employee Leave Management System (SET C)

**Course:** ITUE301: Advanced Web Development Frameworks  
**Examination:** Open-Book Practical Examination (AY 2026–27)  
**Organization:** TechSolutions Pvt Ltd  
**Tech Stack:** React (Vite) + Express.js + MongoDB with Mongoose  

---

## 1. Project Setup & Prerequisites

- **Node.js** (v18+)
- **MongoDB** running locally or via MongoDB Atlas connection URI

---

## 2. Environment Configuration

1. In the `backend/` directory, configure `.env` (refer to `.env.example`):
   ```env
   PORT=5001
   MONGO_URI=mongodb://127.0.0.1:27017/leave_management
   JWT_SECRET=supersecretjwtkey_itue301_2026
   ```
   > **Note:** If using MongoDB Atlas or cloud MongoDB, replace `MONGO_URI` with your connection string.

---

## 3. How to Run the Application

### Step 1: Backend Setup & Seeding
Open a terminal and run:
```bash
cd backend
npm install
npm run seed      # Seeds default leave types and demo employee accounts
npm start         # Starts backend server on http://localhost:5001
```

### Step 2: Frontend Setup
Open a second terminal and run:
```bash
cd frontend
npm install
npm run dev       # Starts React frontend on http://localhost:3000
```

---

## 4. Test Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Employee (Rahul)** | `rahul@techsolutions.com` | `password123` |
| **Manager (Priya)** | `priya@techsolutions.com` | `password123` |
| **HR Admin (Sneha)** | `sneha@techsolutions.com` | `password123` |

---

## 5. REST API Endpoints Overview

| Method | Endpoint | Description | Protection |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Authenticate employee & issue JWT token | Public |
| `GET` | `/api/v1/leave-types` | Return all leave types (Casual, Sick, Earned, CompOff) | Public |
| `POST` | `/api/v1/leaves` | Apply for leave (validates balance & deducts days) | Protected (`authGuard`) |
| `GET` | `/api/v1/leaves/my` | Return employee's own leave history | Protected (`authGuard`) |
| `PATCH` | `/api/v1/leaves/:id/status`| Approve or reject a leave request | Protected (`authGuard`) |

---

## 6. Key Features Implemented

1. **Task 1 - React Component Architecture**:
   - Reusable [`LeaveRequestCard.jsx`](frontend/src/components/LeaveRequestCard.jsx) with colored status pill badges (`#FFC107` pending, `#28A745` approved, `#DC3545` rejected).
   - Component structure with props passing for `fromDate`, `toDate`, `days`, `leaveType`, `reason`, and `status`.

2. **Task 2 - React Routing & State Management**:
   - Protected client-side routing (`/apply`, `/my-leaves`).
   - Lazy-loaded HR Panel (`/hr`) using `React.lazy` and `Suspense` restricted to role `hr`.
   - Global `AuthContext` managing `{ employee, token, role, login, logout }`.
   - Dynamic date calculation for total leave days on `ApplyLeavePage`.

3. **Task 3 - Express REST API & Middleware**:
   - Global `requestLogger` logging `[METHOD] [PATH] [TIMESTAMP]`.
   - Custom `authGuard` validating Bearer JWT tokens with 401 response on missing/invalid token.
   - Status validation middleware for `PATCH /api/v1/leaves/:id/status` accepting only `approved` or `rejected`.
   - Global `errorHandler` returning structured JSON without raw stack traces.

4. **Task 4 - REST API Consumption**:
   - `MyLeavesPage` retrieves user's leaves on mount via `useEffect`.
   - Manages `leaves`, `loading`, and `error` states.
   - Client-side status filter dropdown (All, Pending, Approved, Rejected) without triggering redundant API calls.

5. **Task 5 - MongoDB & Mongoose Schemas**:
   - Schema validation with enum constraints for `Employee`, `LeaveType`, and `LeaveRequest`.
   - Balance check validation before leave creation.
   - Population with `.populate('leaveTypeId', 'name maxDaysPerYear')`.
