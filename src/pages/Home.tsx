// src/pages/Home.tsx
import React from 'react';
import Topbar from '../components/Layout/Topbar';
import Header from '../components/Layout/Header';
import Navigation from '../components/Layout/Navigation';
import Footer from '../components/Layout/Footer';
import BackToTop from '../components/common/BackToTop';

import Hero from '../components/sections/Hero';
import Services from '../components/sections/Services';
import ProductOffers from '../components/sections/ProductOffers';
import ProductGrid from '../components/sections/ProductGrid';
import ProductBanners from '../components/sections/ProductBanners';
import BestsellerProducts from '../components/sections/BestsellerProducts';

const Home: React.FC = () => {
  const [showBackToTop, setShowBackToTop] = React.useState(false);

  React.useEffect(() => {
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

      <main>
        <Hero />
        <Services />
        <ProductOffers />
        <ProductGrid />
        <ProductBanners />
        <BestsellerProducts />
      </main>

      <Footer />
      <BackToTop show={showBackToTop} onClick={scrollToTop} />
    </>
  );
};

export default Home;