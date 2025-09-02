import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import CustomersList from "./pages/CustomersList.jsx";
import CustomerForm from "./pages/CustomerForm.jsx";
import CustomerProfile from "./pages/CustomerProfile.jsx";

const router = createBrowserRouter([
  { path: "/", element: <CustomersList /> },
  { path: "/customers/new", element: <CustomerForm /> },
  { path: "/customers/:id", element: <CustomerProfile /> },
  { path: "/customers/:id/edit", element: <CustomerForm /> },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
