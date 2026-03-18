import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { logger } from './utils/logger';

// VERSION INDICATOR - Check browser console to verify deployment
// If you see this message, the new code is deployed
logger.log('[Lost in Transit] Build Version: 2026-02-23-PHASE4 - Finds, Admin Approval & Community Feed');
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/layout/Layout';
import { motion } from 'framer-motion';
import { ScrollToTop } from './components/common/ScrollToTop';
import { Loader } from './components/common/Loader';

// Route-level code splitting — each page loads only when first visited
const NewLandingPage = lazy(() => import('./pages/NewLandingPage').then(m => ({ default: m.NewLandingPage })));
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const StoreDetailPage = lazy(() => import('./pages/StoreDetailPage').then(m => ({ default: m.StoreDetailPage })));
const SavedStoresPage = lazy(() => import('./pages/SavedStoresPage').then(m => ({ default: m.SavedStoresPage })));
const SuggestStorePage = lazy(() => import('./pages/SuggestStorePage').then(m => ({ default: m.SuggestStorePage })));
const BlogPage = lazy(() => import('./pages/BlogPage').then(m => ({ default: m.BlogPage })));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage').then(m => ({ default: m.BlogPostPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const BulkImportPage = lazy(() => import('./pages/BulkImportPage'));
const DiagnosticPage = lazy(() => import('./pages/DiagnosticPage').then(m => ({ default: m.DiagnosticPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const CityPage = lazy(() => import('./pages/CityPage').then(m => ({ default: m.CityPage })));
const NeighborhoodPage = lazy(() => import('./pages/NeighborhoodPage').then(m => ({ default: m.NeighborhoodPage })));
const CitiesPage = lazy(() => import('./pages/CitiesPage').then(m => ({ default: m.CitiesPage })));
const NeighborhoodsPage = lazy(() => import('./pages/NeighborhoodsPage').then(m => ({ default: m.NeighborhoodsPage })));
const CategoryPage = lazy(() => import('./pages/CategoryPage').then(m => ({ default: m.CategoryPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('./pages/SignupPage').then(m => ({ default: m.SignupPage })));
const FindsPage = lazy(() => import('./pages/FindsPage').then(m => ({ default: m.FindsPage })));
const FindDetailPage = lazy(() => import('./pages/FindDetailPage').then(m => ({ default: m.FindDetailPage })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <>
      {/* Scroll to top on navigation, but preserve scroll on back button */}
      {/* Exclude store detail pages to maintain list scroll position when user goes back */}
      <ScrollToTop excludePaths={['/store/']} />

      <Suspense fallback={<Loader />}>
      <Routes location={location} key={location.pathname}>
        {/* New Premium Landing Page (no layout) */}
        <Route path="/" element={
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.18 }}>
            <NewLandingPage />
          </motion.div>
        } />

        {/* Saved stores page without layout (full screen) */}
        <Route path="/saved" element={
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SavedStoresPage />
          </motion.div>
        } />

        {/* Store detail page without layout (full screen) */}
        <Route path="/store/:id" element={
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <StoreDetailPage />
          </motion.div>
        } />

        {/* Auth pages (no layout, full screen) */}
        <Route path="/login" element={
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <LoginPage />
          </motion.div>
        } />
        <Route path="/signup" element={
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <SignupPage />
          </motion.div>
        } />
        <Route path="/reset-password" element={
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <ResetPasswordPage />
          </motion.div>
        } />

        {/* Finds page (no layout, full screen) */}
        <Route path="/finds" element={
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <FindsPage />
          </motion.div>
        } />
        {/* Redirect old /field-notes URL to /finds */}
        <Route path="/field-notes" element={
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <FindsPage />
          </motion.div>
        } />

        {/* Find detail page */}
        <Route path="/finds/:id" element={
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <FindDetailPage />
          </motion.div>
        } />

        {/* Neighborhoods page without layout (full screen Melee-style) */}
        <Route path="/neighborhoods" element={
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }}>
            <NeighborhoodsPage />
          </motion.div>
        } />

        {/* Cities page without layout (full screen transit card style) */}
        <Route path="/cities" element={
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }}>
            <CitiesPage />
          </motion.div>
        } />

        {/* All other pages with layout */}
        <Route path="/" element={<Layout />}>
          {/* Map view (old homepage) */}
          <Route path="map" element={
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <HomePage />
            </motion.div>
          } />
          <Route path="city/:citySlug/:neighborhoodSlug" element={
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <NeighborhoodPage />
            </motion.div>
          } />
          <Route path="category/:category/:subcategory?" element={
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <CategoryPage />
            </motion.div>
          } />
          <Route path="city/:slug" element={
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <CityPage />
            </motion.div>
          } />
          <Route path="suggest" element={
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
              <SuggestStorePage />
            </motion.div>
          } />
          <Route path="blog" element={
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
              <BlogPage />
            </motion.div>
          } />
          <Route path="blog/:slug" element={
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
              <BlogPostPage />
            </motion.div>
          } />
          <Route path="about" element={
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
              <AboutPage />
            </motion.div>
          } />
          <Route path="profile" element={
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
              <ProfilePage />
            </motion.div>
          } />
          <Route path="admin" element={
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
              <AdminDashboard />
            </motion.div>
          } />
          <Route path="admin/bulk-import" element={
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
              <BulkImportPage />
            </motion.div>
          } />
          <Route path="admin/diagnostic" element={
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
              <DiagnosticPage />
            </motion.div>
          } />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true }}>
      <AuthProvider>
        <AnimatedRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;


