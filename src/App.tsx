import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { NewLandingPage } from './pages/NewLandingPage';
import { HomePage } from './pages/HomePage';
import { StoreDetailPage } from './pages/StoreDetailPage';
import { SavedStoresPage } from './pages/SavedStoresPage';
import { SuggestStorePage } from './pages/SuggestStorePage';
import { BlogPage } from './pages/BlogPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { AboutPage } from './pages/AboutPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboard } from './pages/AdminDashboard';
import BulkImportPage from './pages/BulkImportPage';
import { DiagnosticPage } from './pages/DiagnosticPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { CityPage } from './pages/CityPage';
import { NeighborhoodPage } from './pages/NeighborhoodPage';
import { CitiesPage } from './pages/CitiesPage';
import { NeighborhoodsPage } from './pages/NeighborhoodsPage';
import { CategoryPage } from './pages/CategoryPage';
import { motion } from 'framer-motion';
import { ScrollToTop } from './components/common/ScrollToTop';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <>
      {/* Scroll to top on navigation, but preserve scroll on back button */}
      {/* Exclude store detail pages to maintain list scroll position when user goes back */}
      <ScrollToTop excludePaths={['/store/']} />

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
    </>
  );
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true }}>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;


