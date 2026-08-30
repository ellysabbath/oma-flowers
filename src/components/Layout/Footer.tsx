import React from 'react';
import { MapPin, Mail, Phone, Globe, ChevronDown, ChevronRight, Send } from 'lucide-react';

const Footer: React.FC = () => {
  // Navigation handlers
  const handleNavigation = (path: string) => {
    // For demo purposes, we'll use window.location
    // In a real app with React Router, you'd use useNavigate
    window.location.href = path;
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        {/* Top Section - Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <div className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer group">
            <div className="p-3 bg-secondary/20 rounded-full group-hover:bg-secondary/30 transition-colors">
              <MapPin size={22} className="text-primary" />
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-gray-300">Address</h4>
              <p className="text-gray-400 text-sm mt-1">barabara ya nane Street, DODOMA, TANZANIA</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer group">
            <div className="p-3 bg-secondary/20 rounded-full group-hover:bg-secondary/30 transition-colors">
              <Mail size={22} className="text-primary" />
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-gray-300">Mail Us</h4>
              <p className="text-gray-400 text-sm mt-1">info@omaflowers.com</p>
              <p className="text-gray-500 text-xs">support@omaflowers.com</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer group">
            <div className="p-3 bg-secondary/20 rounded-full group-hover:bg-secondary/30 transition-colors">
              <Phone size={22} className="text-primary" />
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-gray-300">Telephone</h4>
              <p className="text-gray-400 text-sm mt-1">(+255) 7425 786 92</p>
              <p className="text-gray-500 text-xs">Mon-Fri: 9AM - 6PM</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer group">
            <div className="p-3 bg-secondary/20 rounded-full group-hover:bg-secondary/30 transition-colors">
              <Globe size={22} className="text-primary" />
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-gray-300">Website</h4>
              <p className="text-gray-400 text-sm mt-1">www.omaflowers.com</p>
              <p className="text-gray-500 text-xs">24/7 Online</p>
            </div>
          </div>
        </div>

        {/* Middle Section - Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12 pt-8 border-t border-gray-800">
          {/* Newsletter */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h4 className="text-primary font-bold text-lg mb-4 flex items-center gap-2">
              <Send size={20} />
              Newsletter
            </h4>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              Subscribe to get special offers, free giveaways, and exclusive deals.
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1 px-4 py-2.5 rounded-l-lg outline-none text-gray-800 text-sm border-2 border-transparent focus:border-primary transition-colors"
                />
              
              </div>
              <div className="flex gap-3 mt-2">
                <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-primary transition-colors">
                  
                </a>
                <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-primary transition-colors">
                  
                </a>
                <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-primary transition-colors">
                  
                </a>
                <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-primary transition-colors">
                 
                </a>
              </div>
            </div>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-primary font-bold text-lg mb-4">Customer Service</h4>
            <ul className="space-y-2.5">
              <li>
                <button 
                  onClick={() => handleNavigation('/contact')}
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm group w-full text-left"
                >
                  <ChevronRight size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  Contact Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('/returns')}
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm group w-full text-left"
                >
                  <ChevronRight size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  Returns & Refunds
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('/orders')}
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm group w-full text-left"
                >
                  <ChevronRight size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  Order History
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('/sitemap')}
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm group w-full text-left"
                >
                  <ChevronRight size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  Site Map
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('/faq')}
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm group w-full text-left"
                >
                  <ChevronRight size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="text-primary font-bold text-lg mb-4">Information</h4>
            <ul className="space-y-2.5">
              <li>
                <button 
                  onClick={() => handleNavigation('/about')}
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm group w-full text-left"
                >
                  <ChevronRight size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  About Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('/delivery')}
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm group w-full text-left"
                >
                  <ChevronRight size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  Delivery Information
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('/privacy')}
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm group w-full text-left"
                >
                  <ChevronRight size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('/terms')}
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm group w-full text-left"
                >
                  <ChevronRight size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('/warranty')}
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm group w-full text-left"
                >
                  <ChevronRight size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  Warranty
                </button>
              </li>
            </ul>
          </div>

          {/* Extras */}
          <div>
            <h4 className="text-primary font-bold text-lg mb-4">Extras</h4>
            <ul className="space-y-2.5">
              <li>
                <button 
                  onClick={() => handleNavigation('/brands')}
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm group w-full text-left"
                >
                  <ChevronRight size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  Brands
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('/gift-vouchers')}
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm group w-full text-left"
                >
                  <ChevronRight size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  Gift Vouchers
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('/affiliates')}
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm group w-full text-left"
                >
                  <ChevronRight size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  Affiliates
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('/wishlist')}
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm group w-full text-left"
                >
                  <ChevronRight size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  Wishlist
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('/track-order')}
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm group w-full text-left"
                >
                  <ChevronRight size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  Track Your Order
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-6 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-400 text-sm text-center md:text-left">
            <p>&copy; 2024 <span className="text-white font-medium">omaflowers</span>. All rights reserved.</p>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <button 
              onClick={() => handleNavigation('/privacy')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Privacy Policy
            </button>
            <span className="text-gray-700">|</span>
            <button 
              onClick={() => handleNavigation('/terms')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Terms of Service
            </button>
            <span className="text-gray-700">|</span>
            <button 
              onClick={() => handleNavigation('/sitemap')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Sitemap
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-gray-500 text-xs">Payment Methods:</span>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400">Visa</span>
              <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400">Master</span>
              <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400">M-Pesa</span>
              <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400">Mixx by Yax</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;