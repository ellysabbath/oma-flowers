// src/App.tsx
import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Spinner from './components/common/Spinner';
import BackToTop from './components/common/BackToTop';
import Topbar from './components/Layout/Topbar';
import Header from './components/Layout/Header';
import Navigation from './components/Layout/Navigation';
import Footer from './components/Layout/Footer';

// Home (landing page)
import Home from './pages/Home';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ResetPassword from './pages/auth/ResetPassword';
import AccountVerify from './pages/auth/AccountVerify';
import PasswordResetVerify from './pages/auth/PasswordResetVerify';

// Shop Pages
import Shop from './pages/Shop';
import SinglePage from './pages/SinglePage';
import ProductDetail from './pages/ProductDetail';
import Bestseller from './pages/Bestseller';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Contact from './pages/Contact';
import Wishlist from './pages/Wishlist';
import Account from './pages/Account';
import Orders from './pages/Orders';
import Search from './pages/Search';
import Category from './pages/Category';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Blog from './pages/Blog';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

// Admin Pages
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/Admin/Dashboard';
import Distributors from './pages/Admin/Distributors';
import Products from './pages/Admin/Products';
import AdminOrders from './pages/Admin/Orders';
import Commissions from './pages/Admin/Commissions';
import Bonuses from './pages/Admin/Bonuses';
import Awards from './pages/Admin/Awards';
import Shops from './pages/Admin/Shops';
import Analytics from './pages/Admin/Analytics';
import Categories from './pages/Admin/Categories';
import Settings from './pages/Admin/Settings';
import AdminUsers from './pages/Admin/Users';

// Distributor Pages
import DistributorLayout from './components/DistributorLayout';
import DistributorDashboard from './pages/distributor/Dashboard';
import DistributorOrders from './pages/distributor/Orders';
import DistributorDownline from './pages/distributor/Downline';
import DistributorCommissions from './pages/distributor/Commissions';
import DistributorSettings from './pages/distributor/Settings';

// Shop Owner Pages
import ShopLayout from './pages/shop/ShopLayout';
import ShopDashboard from './pages/shop/Dashboard';
import ShopOrders from './pages/shop/Orders';
import ShopInventory from './pages/shop/Inventory';
import ShopCustomers from './pages/shop/Customers';
import ShopAnalytics from './pages/shop/Analytics';
import ShopSettings from './pages/shop/Settings';
import ShopCalendar from './pages/shop/Calendar';

// Profile
import Profile from './pages/distributor/Profile';

// Contexts
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';

/* ------------------------------------------------------------------ */
/* Scroll restoration                                                  */
/* ------------------------------------------------------------------ */

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

/* ------------------------------------------------------------------ */
/* Layout wrapper for storefront pages                                 */
/* ------------------------------------------------------------------ */

const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <>
      <Topbar />
      <Header />
      <Navigation />
      {children}
      <Footer />
      <BackToTop show={showBackToTop} onClick={scrollToTop} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Auth layout — no store chrome                                       */
/* ------------------------------------------------------------------ */

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);

/* ------------------------------------------------------------------ */
/* Route guards                                                        */
/* ------------------------------------------------------------------ */

const homeForRole = (role: string | null | undefined): string => {
  switch ((role || '').toLowerCase()) {
    case 'admin':
      return '/admin';
    case 'distributor':
      return '/distributor';
    default:
      return '/';
  }
};

const AuthLoading: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

/** Admin-only routes. */
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, userType, isLoading } = useAuth();

  if (isLoading) return <AuthLoading />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = (userType || 'customer').toLowerCase();
  if (role !== 'admin') {
    return <Navigate to={homeForRole(role)} replace />;
  }

  return <>{children}</>;
};

/** Distributor-only routes. */
const DistributorRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, userType, isLoading } = useAuth();

  if (isLoading) return <AuthLoading />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = (userType || 'customer').toLowerCase();
  if (role !== 'distributor') {
    return <Navigate to={homeForRole(role)} replace />;
  }

  return <>{children}</>;
};

/**
 * Requires the user to be logged in AND to be a customer.
 */
const CustomerRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, userType, isLoading } = useAuth();

  if (isLoading) return <AuthLoading />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = (userType || 'customer').toLowerCase();
  if (role === 'admin' || role === 'distributor') {
    return <Navigate to={homeForRole(role)} replace />;
  }

  return <>{children}</>;
};

/**
 * Requires the user to be logged in — any role.
 */
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <AuthLoading />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

/* ------------------------------------------------------------------ */
/* App content                                                         */
/* ------------------------------------------------------------------ */

const AppContent: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Spinner isLoading={isLoading} />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* ---------------- Landing ---------------- */}
          <Route path="/" element={<Home />} />

          {/* ---------------- Auth ---------------- */}
          <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
          <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
          <Route path="/reset-password" element={<AuthLayout><ResetPassword /></AuthLayout>} />
          <Route path="/account-verify" element={<AuthLayout><AccountVerify /></AuthLayout>} />
          <Route path="/password-reset-verify" element={<AuthLayout><PasswordResetVerify /></AuthLayout>} />

          {/* ---------------- Admin ---------------- */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="distributors" element={<Distributors />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="commissions" element={<Commissions />} />
            <Route path="bonuses" element={<Bonuses />} />
            <Route path="awards" element={<Awards />} />
            <Route path="shops" element={<Shops />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="categories" element={<Categories />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* ---------------- Distributor ---------------- */}
          <Route
            path="/distributor"
            element={
              <DistributorRoute>
                <DistributorLayout />
              </DistributorRoute>
            }
          >
            <Route index element={<DistributorDashboard />} />
            <Route path="orders" element={<DistributorOrders />} />
            <Route path="downline" element={<DistributorDownline />} />
            <Route path="commissions" element={<DistributorCommissions />} />
            <Route path="settings" element={<DistributorSettings />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* ---------------- Shop Owner ---------------- */}
          <Route path="/shops" element={<ShopLayout />}>
            <Route index element={<ShopDashboard />} />
            <Route path="orders" element={<ShopOrders />} />
            <Route path="inventory" element={<ShopInventory />} />
            <Route path="customers" element={<ShopCustomers />} />
            <Route path="analytics" element={<ShopAnalytics />} />
            <Route path="calendar" element={<ShopCalendar />} />
            <Route path="settings" element={<ShopSettings />} />
          </Route>

          {/* ---------------- Storefront ---------------- */}

          {/* Public browsing */}
          <Route path="/shop" element={<LayoutWrapper><Shop /></LayoutWrapper>} />
          <Route path="/products" element={<LayoutWrapper><SinglePage /></LayoutWrapper>} />
          <Route path="/products/:id" element={<LayoutWrapper><ProductDetail /></LayoutWrapper>} />
          <Route path="/single-page" element={<LayoutWrapper><SinglePage /></LayoutWrapper>} />
          <Route path="/bestseller" element={<LayoutWrapper><Bestseller /></LayoutWrapper>} />
          <Route path="/contact" element={<LayoutWrapper><Contact /></LayoutWrapper>} />
          <Route path="/search" element={<LayoutWrapper><Search /></LayoutWrapper>} />
          <Route path="/category/:category" element={<LayoutWrapper><Category /></LayoutWrapper>} />
          <Route path="/about" element={<LayoutWrapper><About /></LayoutWrapper>} />
          <Route path="/faq" element={<LayoutWrapper><FAQ /></LayoutWrapper>} />
          <Route path="/blog" element={<LayoutWrapper><Blog /></LayoutWrapper>} />
          <Route path="/terms" element={<LayoutWrapper><Terms /></LayoutWrapper>} />
          <Route path="/privacy" element={<LayoutWrapper><Privacy /></LayoutWrapper>} />

          {/* Cart is fine for guests */}
          <Route path="/cart" element={<LayoutWrapper><Cart /></LayoutWrapper>} />

          {/* Customer-only */}
          <Route
            path="/checkout"
            element={
              <CustomerRoute>
                <LayoutWrapper><Checkout /></LayoutWrapper>
              </CustomerRoute>
            }
          />
          <Route
            path="/account"
            element={
              <CustomerRoute>
                <LayoutWrapper><Account /></LayoutWrapper>
              </CustomerRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <CustomerRoute>
                <LayoutWrapper><Orders /></LayoutWrapper>
              </CustomerRoute>
            }
          />

          {/* Any-authenticated-user */}
          <Route
            path="/wishlist"
            element={
              <RequireAuth>
                <LayoutWrapper><Wishlist /></LayoutWrapper>
              </RequireAuth>
            }
          />

          {/* ---------------- 404 ---------------- */}
          <Route
            path="*"
            element={
              <LayoutWrapper>
                <div className="min-h-[60vh] flex items-center justify-center py-12">
                  <div className="text-center">
                    <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                      Page Not Found
                    </h2>
                    <p className="text-gray-500 mb-6">
                      The page you're looking for doesn't exist or has been moved.
                    </p>
                    <a
                      href="/"
                      className="inline-block bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      Go Back Home
                    </a>
                  </div>
                </div>
              </LayoutWrapper>
            }
          />
        </Routes>
      </AnimatePresence>
    </>
  );
};

/* ------------------------------------------------------------------ */
/* App                                                                 */
/* ------------------------------------------------------------------ */

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AdminProvider>
          <ScrollToTop />
          <AppContent />
        </AdminProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;