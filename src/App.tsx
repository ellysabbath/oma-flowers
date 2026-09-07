// src/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Spinner from './components/common/Spinner';
import BackToTop from './components/common/BackToTop';
import Topbar from './components/Layout/Topbar';
import Header from './components/Layout/Header';
import Navigation from './components/Layout/Navigation';
import Footer from './components/Layout/Footer';
import Hero from './components/sections/Hero';
import Services from './components/sections/Services';
import ProductOffers from './components/sections/ProductOffers';
import ProductGrid from './components/sections/ProductGrid';
import ProductBanners from './components/sections/ProductBanners';
import BestsellerProducts from './components/sections/BestsellerProducts';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ResetPassword from './pages/auth/ResetPassword';
import AccountVerify from './pages/auth/AccountVerify';
import PasswordResetVerify from './pages/auth/PasswordResetVerify';

// Shop Pages
import Shop from './pages/Shop';
import SinglePage from './pages/SinglePage';
import Bestseller from './pages/Bestseller';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';


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

// Auth Context
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';

import { products, services, tabs } from './components/data/data';
import Contact from './pages/Contact';
import Wishlist from './pages/Wishlist';
import Account from './pages/Account';
import Orders from './pages/Orders';
import Search from './pages/Search';
import Category from './pages/Category';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Blog from './pages/Blog';
import FAQ from './pages/FAQ';
import About from './pages/About';

// Component to handle scroll restoration and page tracking
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Wrapper for pages that need the full layout
const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

// Main Home Page
const HomePage: React.FC = () => {
  return (
    <LayoutWrapper>
      <Hero />
      <Services services={services} />
      <ProductOffers />
      <ProductGrid products={products} tabs={tabs} />
      <ProductBanners />
      <BestsellerProducts products={products} />
    </LayoutWrapper>
  );
};

// Auth Layout (without header/footer for cleaner auth pages)
const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// Admin route guard (optional - for protected routes)
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // In a real app, you would check if user is authenticated and has admin role
  // For now, we'll just render the children
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Spinner isLoading={isLoading} />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Home Page */}
          <Route path="/" element={<HomePage />} />
          
          {/* Auth Pages */}
          <Route path="/login" element={
            <AuthLayout>
              <Login />
            </AuthLayout>
          } />
          
          <Route path="/register" element={
            <AuthLayout>
              <Register />
            </AuthLayout>
          } />
          
          <Route path="/reset-password" element={
            <AuthLayout>
              <ResetPassword />
            </AuthLayout>
          } />
          
          <Route path="/account-verify" element={
            <AuthLayout>
              <AccountVerify />
            </AuthLayout>
          } />
          
          <Route path="/password-reset-verify" element={
            <AuthLayout>
              <PasswordResetVerify />
            </AuthLayout>
          } />
          
          {/* Admin Pages */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            <Route index element={<Dashboard />} />
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
          </Route>
          
          {/* Shop Pages */}
          <Route path="/shop" element={
            <LayoutWrapper>
              <Shop />
            </LayoutWrapper>
          } />
          
          <Route path="/single-page" element={
            <LayoutWrapper>
              <SinglePage />
            </LayoutWrapper>
          } />
          
          <Route path="/bestseller" element={
            <LayoutWrapper>
              <Bestseller />
            </LayoutWrapper>
          } />
          
          <Route path="/cart" element={
            <LayoutWrapper>
              <Cart />
            </LayoutWrapper>
          } />
          
          <Route path="/checkout" element={
            <LayoutWrapper>
              <Checkout />
            </LayoutWrapper>
          } />
          
          <Route path="/contact" element={
            <LayoutWrapper>
              <Contact />
            </LayoutWrapper>
          } />
          
          <Route path="/wishlist" element={
            <LayoutWrapper>
              <Wishlist />
            </LayoutWrapper>
          } />
          
          <Route path="/account" element={
            <LayoutWrapper>
              <Account />
            </LayoutWrapper>
          } />
          
          <Route path="/orders" element={
            <LayoutWrapper>
              <Orders />
            </LayoutWrapper>
          } />
          
          <Route path="/search" element={
            <LayoutWrapper>
              <Search />
            </LayoutWrapper>
          } />
          
          <Route path="/category/:category" element={
            <LayoutWrapper>
              <Category />
            </LayoutWrapper>
          } />



          // Add these routes after the shop pages:
<Route path="/about" element={
  <LayoutWrapper>
    <About />
  </LayoutWrapper>
} />

<Route path="/faq" element={
  <LayoutWrapper>
    <FAQ />
  </LayoutWrapper>
} />

<Route path="/blog" element={
  <LayoutWrapper>
    <Blog />
  </LayoutWrapper>
} />

<Route path="/terms" element={
  <LayoutWrapper>
    <Terms />
  </LayoutWrapper>
} />

<Route path="/privacy" element={
  <LayoutWrapper>
    <Privacy />
  </LayoutWrapper>
} />
          
          {/* Catch all route - 404 */}
          <Route path="*" element={
            <LayoutWrapper>
              <div className="min-h-[60vh] flex items-center justify-center py-12">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
                  <h2 className="text-2xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
                  <p className="text-gray-500 mb-6">The page you're looking for doesn't exist or has been moved.</p>
                  <a href="/" className="inline-block bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-md hover:shadow-lg">
                    Go Back Home
                  </a>
                </div>
              </div>
            </LayoutWrapper>
          } />
        </Routes>
      </AnimatePresence>
    </>
  );
};

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