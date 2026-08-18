import React from 'react';
import { RefreshCw, Truck, Headphones, CreditCard, Lock, Globe } from 'lucide-react';

const iconMap = {
  RefreshCw,
  Truck,
  Headphones,
  CreditCard,
  Lock,
  Globe
};

interface Service {
  icon: keyof typeof iconMap;
  title: string;
  desc: string;
}

interface ServicesProps {
  services: Service[];
}

const Services: React.FC<ServicesProps> = ({ services }) => {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {services.map((service, idx) => {
            const IconComponent = iconMap[service.icon];
            return (
              <div key={idx} className="text-center p-4 hover:shadow-lg rounded-lg transition-shadow">
                <IconComponent className="text-primary mx-auto mb-3" size={32} />
                <h4 className="font-semibold text-sm uppercase">{service.title}</h4>
                <p className="text-xs text-gray-500 mt-1">{service.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;