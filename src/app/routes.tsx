import { createBrowserRouter } from "react-router";
import { useNavigate } from "react-router";
import React from "react";
import Root from "./components/Root";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import PhotographerDashboard from "./pages/PhotographerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import SearchPhotos from "./pages/SearchPhotos";
import Gallery from "./pages/Gallery";
import NotFound from "./pages/NotFound";
import PaymentDoc from "./pages/PaymentDoc";

// Component to redirect to appropriate dashboard based on role
function DashboardRedirect() {
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate(`/${user.role}`, { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  return null;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "login", Component: Login },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        ),
      },
      {
        path: "user",
        element: (
          <ProtectedRoute allowedRoles={["user"]}>
            <UserDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "photographer",
        element: (
          <ProtectedRoute allowedRoles={["photographer"]}>
            <PhotographerDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "search",
        element: (
          <ProtectedRoute allowedRoles={["user"]}>
            <SearchPhotos />
          </ProtectedRoute>
        ),
      },
      {
        path: "search/:eventId",
        element: (
          <ProtectedRoute allowedRoles={["user"]}>
            <SearchPhotos />
          </ProtectedRoute>
        ),
      },
      {
        path: "gallery/:eventId",
        element: (
          <ProtectedRoute allowedRoles={["user", "photographer"]}>
            <Gallery />
          </ProtectedRoute>
        ),
      },
      { path: "payment", Component: PaymentDoc },
      { path: "*", Component: NotFound },
    ],
  },
]);
