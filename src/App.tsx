import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ProfileSetupPage from "./pages/ProfileSetupPage";
import DashboardPage from "./pages/DashboardPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";
import NotificationsPage from "./pages/NotificationsPage";
import CRNoticeUploadPage from "./pages/CRNoticeUploadPage";
import CRMaterialUploadPage from "./pages/CRMaterialUploadPage";
import TeacherNoticeUploadPage from "./pages/TeacherNoticeUploadPage";
import TeacherResultCreatePage from "./pages/TeacherResultCreatePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={
              <ProtectedRoute requireAuth={false}>
                <LoginPage />
              </ProtectedRoute>
            } />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/profile-setup" element={<ProfileSetupPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            } />
            {/* CR-specific routes */}
            <Route path="/cr/notices/upload" element={
              <ProtectedRoute>
                <CRNoticeUploadPage />
              </ProtectedRoute>
            } />
            <Route path="/cr/materials/upload" element={
              <ProtectedRoute>
                <CRMaterialUploadPage />
              </ProtectedRoute>
            } />
            {/* Teacher-specific routes */}
            <Route path="/teacher/notices/upload" element={
              <ProtectedRoute>
                <TeacherNoticeUploadPage />
              </ProtectedRoute>
            } />
            <Route path="/teacher/results/create" element={
              <ProtectedRoute>
                <TeacherResultCreatePage />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
