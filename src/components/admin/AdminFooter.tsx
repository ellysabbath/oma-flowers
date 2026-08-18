// src/components/admin/AdminFooter.tsx
import React from 'react';
import { Heart, Flower2, Shield, Zap } from 'lucide-react';

interface AdminFooterProps {
  className?: string;
}

const AdminFooter: React.FC<AdminFooterProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-white border-t border-amber-200/30 py-4 ${className}`}>
      <div className="px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left Section - Copyright */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>© {currentYear}</span>
            <div className="flex items-center gap-1">
              <Flower2 size={14} className="text-amber-500" />
              <span className="font-medium text-amber-600">OMA Flowers</span>
            </div>
            <span>Co. LTD</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">All rights reserved</span>
          </div>

          {/* Center Section - Version & Status */}
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Shield size={12} className="text-green-500" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap size={12} className="text-amber-500" />
              <span>v2.0.1</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>System Online</span>
            </div>
          </div>

          {/* Right Section - Links */}
          <div className="flex items-center gap-4 text-xs">
            <a 
              href="#" 
              className="text-gray-400 hover:text-amber-600 transition-colors duration-200"
            >
              Privacy Policy
            </a>
            <span className="text-gray-300">|</span>
            <a 
              href="#" 
              className="text-gray-400 hover:text-amber-600 transition-colors duration-200"
            >
              Terms of Service
            </a>
            <span className="text-gray-300">|</span>
            <a 
              href="#" 
              className="text-gray-400 hover:text-amber-600 transition-colors duration-200"
            >
              Support
            </a>
          </div>
        </div>

        {/* Bottom Bar - Made with love */}
        <div className="mt-3 pt-3 border-t border-amber-100/30 text-center">
          <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
            Made with
            <Heart size={12} className="text-rose-500 fill-rose-500 animate-pulse" />
            by OMA Flowers Team
          </p>
        </div>
      </div>
    </footer>
  );
};

export default AdminFooter;