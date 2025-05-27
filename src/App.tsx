import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthGuard from "./components/AuthGuard";
import AuthRedirectGuard from "./components/AuthRedireectGuard";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Quiz from "./components/Quiz";
import History from "./pages/History";
import Resources from "./pages/Resources";
import PdfChat from "./pages/PdfChat";
import Courses from "./pages/Courses";
import ChapterContent from "./pages/ChapterContent";
import { Dashboard } from "./pages/Dashboard";
import { Notebook } from "./pages/Notebook";
import { History as BlackboardHistory } from "./pages/BlackboardHistory";
import { Whiteboard } from "./components/Whiteboard";
import Community from "./pages/Community";
import CommunityChat from "./pages/CommunityChat";
import Roadmaps from "./pages/Roadmaps";
import ContactPage from "./pages/footer-links/contact";
import AboutPage from "./pages/footer-links/about";
import TermsPage from "./pages/footer-links/terms";
import PrivacyPage from "./pages/footer-links/privacy";
import CookiesPage from "./pages/footer-links/cookies";
import QuizAnalytics from "./pages/QuizAnalytics";
import LanguageTutor from "./pages/LanguageTutor";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import EmailConfirmation from "./pages/EmailConfirmation";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={
              <AuthRedirectGuard>
                <Login />
              </AuthRedirectGuard>
            }
          />
          <Route
            path="/signup"
            element={
              <AuthRedirectGuard>
                <Signup />
              </AuthRedirectGuard>
            }
          />
          <Route
            path="/login/forgot-password"
            element={
              <AuthRedirectGuard>
                <ForgotPassword />
              </AuthRedirectGuard>
            }
          />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/email-confirmation" element={<EmailConfirmation />} />
          <Route
            path="/profile"
            element={
              <AuthGuard>
                <Profile />
              </AuthGuard>
            }
          />
          <Route
            path="/quiz"
            element={
              <AuthGuard>
                <Quiz />
              </AuthGuard>
            }
          />
          <Route
            path="/quiz-analytics/:id"
            element={
              <AuthGuard>
                <QuizAnalytics />
              </AuthGuard>
            }
          />
          <Route
            path="/history"
            element={
              <AuthGuard>
                <History />
              </AuthGuard>
            }
          />
          <Route
            path="/resources"
            element={
              <AuthGuard>
                <Resources />
              </AuthGuard>
            }
          />
          <Route
            path="/pdf-chat"
            element={
              <AuthGuard>
                <PdfChat />
              </AuthGuard>
            }
          />
          <Route
            path="/courses"
            element={
              <AuthGuard>
                <Courses />
              </AuthGuard>
            }
          />
          <Route
            path="/courses/:courseId/chapters/:chapterId"
            element={
              <AuthGuard>
                <ChapterContent />
              </AuthGuard>
            }
          />
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <Dashboard />
              </AuthGuard>
            }
          />
          <Route
            path="/notebook/:id"
            element={
              <AuthGuard>
                <Notebook />
              </AuthGuard>
            }
          />
          <Route
            path="/blackboard-history"
            element={
              <AuthGuard>
                <BlackboardHistory />
              </AuthGuard>
            }
          />
          <Route
            path="/whiteboard"
            element={
              <AuthGuard>
                <Whiteboard />
              </AuthGuard>
            }
          />
          <Route
            path="/community"
            element={
              <AuthGuard>
                <Community />
              </AuthGuard>
            }
          />
          <Route
            path="/community/:communityId"
            element={
              <AuthGuard>
                <CommunityChat />
              </AuthGuard>
            }
          />
          <Route
            path="/roadmaps"
            element={
              <AuthGuard>
                <Roadmaps />
              </AuthGuard>
            }
          />
          <Route
            path="/language-tutor"
            element={
              <AuthGuard>
                <LanguageTutor />
              </AuthGuard>
            }
          />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/cookies" element={<CookiesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
