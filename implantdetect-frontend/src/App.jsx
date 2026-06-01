import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

// Layout
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import AdminSidebar from "./components/layout/AdminSidebar";

// Auth guards
import {
  ProtectedRoute,
  AdminRoute,
  GuestRoute,
} from "./components/auth/ProtectedRoute";

// Pages – Landing
import Landing from "./pages/Landing";

// Pages – Auth
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Logout from "./pages/auth/Logout";

// Pages – Dashboard
import Home from "./pages/dashboard/Home";

// Pages – Profile
import Profile from "./pages/profile/Profile";

// Pages – Images
import Upload from "./pages/images/Upload";
import Results from "./pages/images/Results";
import History from "./pages/images/History";

// Pages – Admin
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminProcesses from "./pages/admin/Processes";

// Pages – Errors
import NotFound from "./pages/errors/NotFound";
import ServerError from "./pages/errors/ServerError";
import Unauthorized from "./pages/errors/Unauthorized";

const MainLayout = () => (
  <div className="flex flex-col min-h-screen bg-gray-50">
    <Header />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

const AdminLayout = () => (
  <div className="flex flex-col min-h-screen bg-gray-50">
    <Header />
    <div className="flex flex-1">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        {/* ── Public / Guest routes ── */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Landing />} />

          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* ── Authenticated routes ── */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/images/upload" element={<Upload />} />
            <Route path="/images/history" element={<History />} />
            <Route path="/process/:process_id/results" element={<Results />} />
            <Route path="/logout" element={<Logout />} />
          </Route>

          {/* ── Error pages ── */}
          <Route path="/403" element={<Unauthorized />} />
          <Route path="/500" element={<ServerError />} />
          <Route path="/404" element={<NotFound />} />
        </Route>

        {/* ── Admin routes ── */}
        <Route element={<AdminLayout />}>
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/processes" element={<AdminProcesses />} />
          </Route>
        </Route>

        {/* ── Catch all ── */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
