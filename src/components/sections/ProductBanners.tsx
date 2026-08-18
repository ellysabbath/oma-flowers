import React from 'react';
import Button from '../common/Button';
import pict from '../../assets/pict.jpg';
import picture from '../../assets/picture.jpg';

const ProductBanners: React.FC = () => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative overflow-hidden rounded-2xl group cursor-pointer">
            <img src={pict} alt="Banner" className="w-full h-64 object-cover group-hover:scale-105 transition-transform" />
            <div className="absolute inset-0 bg-white/50 flex flex-col justify-center p-8">
              <h3 className="text-3xl font-bold text-primary">EOS Rebel <br /><span className="text-gray-800">T7i Kit</span></h3>
              <p className="text-xl text-gray-600 mt-2">$899.99</p>
              <Button variant="primary" className="text-sm py-2 px-6 w-auto mt-4">Shop Now</Button>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl group cursor-pointer">
            <img src={picture} alt="Banner" className="w-full h-64 object-cover group-hover:scale-105 transition-transform" />
            <div className="absolute inset-0 bg-orange-500/50 flex flex-col justify-center items-center p-8">
              <h2 className="text-5xl font-bold text-white">SALE</h2>
              <h4 className="text-2xl text-white mt-2">Get UP To 50% Off</h4>
              <Button variant="secondary" className="text-sm py-2 px-6 w-auto mt-4">Shop Now</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductBanners;