import React from 'react';
import Button from '../common/Button';
import pic from '../../assets/pic.jpg';
import pict from '../../assets/pict.jpg';

const Hero: React.FC = () => {
  return (
    <section className="bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white rounded-2xl p-8 shadow-lg">
              <div>
                <span className="text-primary font-semibold tracking-wider">SAVE UP TO A $400</span>
                <h1 className="text-4xl font-bold mt-4 mb-4">On Selected Laptops & Desktop Or Smartphone</h1>
                <p className="text-gray-600 mb-6">Terms and Condition Apply</p>
                <Button variant="primary">Shop Now</Button>
              </div>
              <div>
                <img src={pic} alt="Product" className="w-full h-64 object-contain" />
              </div>
            </div>
          </div>
          <div className="lg:col-span-1 relative overflow-hidden rounded-2xl">
            <img src={pict} alt="Special Offer" className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4">
              <span className="bg-primary text-white px-4 py-1 rounded-full text-sm">Save $48.00</span>
              <p className="text-primary font-bold mt-2">Special Offer</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
              <p className="text-sm">SmartPhone</p>
              <h3 className="text-xl font-bold">Apple iPad Mini G2356</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="line-through text-gray-400">$1,250.00</span>
                <span className="text-primary font-bold">$1,050.00</span>
              </div>
              <Button variant="primary" className="text-sm mt-3 py-2 px-4">Add To Cart</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;