## Full-Stack CRUD Demo (React + Express + SQLite)

### Tech

- Backend: Node.js, Express.js, better-sqlite3, zod, morgan, winston
- Frontend: React, React Router, Vite, Axios
- DB: SQLite (file-based)

### Project Structure

```
backend/
  src/
    routes/
    scripts/
    utils/
    validation/
    server.js
  package.json
frontend/
  src/
    pages/
    main.jsx
  package.json
```

### Prerequisites

- Node.js 18+

### Backend Setup

```
cd backend
npm install
npm run migrate   # creates SQLite tables
npm run dev       # starts http://localhost:4000
```

Environment variables (optional):

- `SQLITE_PATH` — absolute or relative path to the sqlite file (default: `backend/src/data/app.sqlite`)
- `PORT` — API port (default: 4000)

### Frontend Setup

```
cd frontend
npm install
echo VITE_API_URL=http://localhost:4000/api > .env
npm run dev      # opens Vite dev server
```

### API Overview

- `GET  /health`
- `POST /api/customers` — create customer (validates first/last name, phone, optional email, optional address)
- `GET  /api/customers` — list with pagination, sorting and filters
  - query: `page`, `pageSize`, `sortBy` (created_at|first_name|last_name), `sortOrder` (asc|desc)
  - search: `q` (name/phone/email)
  - address filters: `city`, `state`, `pincode`
  - flags: `onlyOneAddress=true`, `multiAddress=true`
- `GET  /api/customers/:id` — customer with addresses
- `PUT  /api/customers/:id` — update basic fields
- `DELETE /api/customers/:id` — deletes the customer (addresses cascade)

- `GET    /api/addresses` — filter by `customer_id`, `city`, `state`, `pincode`
- `POST   /api/addresses/:customerId` — add address for a customer
- `PUT    /api/addresses/:id` — update address
- `DELETE /api/addresses/:id` — delete address

### Frontend Features

- Customers list with search, filters (city/state/pincode), sort, pagination, and Clear Filters
- Create/edit customer with client-side validation
- Profile view: show details, list/add/delete addresses; badge shows “Only One Address” when applicable
- Responsive, clean UI with accessible controls

### Testing (Backend)

Install jest & supertest are already added. Example run command:

```
cd backend
npm test
```

Add tests under `backend/__tests__/` and import the express app from `src/server.js`.

### Build & Run (Production)

- Backend: `npm run start` (in backend)
- Frontend: `npm run build` then `npm run preview` (in frontend)

### Notes

- Logging and central error handling included.
- SQLite uses WAL mode for better concurrency.
