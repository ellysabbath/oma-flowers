import React from 'react';
import pictur from '../../assets/pictur.jpg';
import picture from '../../assets/picture.jpg';

const ProductOffers: React.FC = () => {
  return (
    <section className="py-12 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 flex items-center justify-between shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            <div>
              <p className="text-gray-500 mb-2">Find The Best Camera for You!</p>
              <h3 className="text-primary text-xl font-bold">Smart Camera</h3>
              <h2 className="text-4xl font-bold text-secondary">40% <span className="text-primary font-normal">Off</span></h2>
            </div>
            <img src={pictur} alt="Camera" className="w-32 h-32 object-contain" />
          </div>
          <div className="bg-white rounded-2xl p-6 flex items-center justify-between shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            <div>
              <p className="text-gray-500 mb-2">Find The Best Watches for You!</p>
              <h3 className="text-primary text-xl font-bold">Smart Watch</h3>
              <h2 className="text-4xl font-bold text-secondary">20% <span className="text-primary font-normal">Off</span></h2>
            </div>
            <img src={picture} alt="Watch" className="w-32 h-32 object-contain" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductOffers;