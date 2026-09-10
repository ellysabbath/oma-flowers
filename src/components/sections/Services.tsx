// src/components/sections/Services.tsx
import React from 'react';
import { Truck, ShieldCheck, RefreshCw, Headphones } from 'lucide-react';

interface Service {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const DEFAULT_SERVICES: Service[] = [
  {
    icon: <Truck size={28} />,
    title: 'Free Delivery',
    description: 'Free shipping on orders over TSh 100,000',
  },
  {
    icon: <ShieldCheck size={28} />,
    title: 'Secure Payment',
    description: 'Your payment details are always protected',
  },
  {
    icon: <RefreshCw size={28} />,
    title: 'Easy Returns',
    description: '30-day return policy on all orders',
  },
  {
    icon: <Headphones size={28} />,
    title: '24/7 Support',
    description: 'We are here to help, any time of day',
  },
];

interface ServicesProps {
  services?: Service[];
}

const Services: React.FC<ServicesProps> = ({
  services = DEFAULT_SERVICES,
}) => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl p-6 shadow-sm border border-amber-200/30 hover:shadow-md transition-shadow text-center"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-50 text-amber-600 mb-4">
                {service.icon}
              </div>
              <h3 className="font-semibold text-gray-800">
                {service.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;