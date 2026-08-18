// src/components/common/BackToTop.tsx
import React from 'react';
import { ArrowUp } from 'lucide-react';

interface BackToTopProps {
  show: boolean;
  onClick: () => void;
}

const BackToTop: React.FC<BackToTopProps> = ({ show, onClick }) => {
  if (!show) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 z-50 p-3 bg-amber-500 text-white rounded-full shadow-lg hover:bg-amber-600 transition-all duration-300 hover:scale-110"
    >
      <ArrowUp size={20} />
    </button>
  );
};

export default BackToTop;