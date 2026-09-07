// src/pages/About.tsx
import React from 'react';
import { Flower2, Users, Award, Heart, Shield, Truck, Sparkles, Star } from 'lucide-react';

const About: React.FC = () => {
  const features = [
    {
      icon: <Flower2 className="w-8 h-8 text-amber-500" />,
      title: 'Premium Quality',
      description: 'We source the finest flowers from trusted growers worldwide'
    },
    {
      icon: <Users className="w-8 h-8 text-amber-500" />,
      title: 'Expert Team',
      description: 'Our florists have years of experience in floral design'
    },
    {
      icon: <Award className="w-8 h-8 text-amber-500" />,
      title: 'Award Winning',
      description: 'Recognized for excellence in floral arrangements'
    },
    {
      icon: <Heart className="w-8 h-8 text-amber-500" />,
      title: 'Passion for Flowers',
      description: 'We pour our heart into every arrangement'
    }
  ];

  const stats = [
    { value: '10+', label: 'Years Experience' },
    { value: '5K+', label: 'Happy Customers' },
    { value: '100+', label: 'Flower Varieties' },
    { value: '50+', label: 'Team Members' }
  ];

  return (
    <div className="min-h-screen bg-amber-50/30">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-amber-600 to-amber-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About OMA Flowers</h1>
          <p className="text-xl text-amber-100 max-w-2xl mx-auto">
            Bringing beauty and joy to every occasion with our exquisite floral arrangements
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-amber-600">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Story</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                OMA Flowers was founded with a simple mission: to bring the beauty of nature into people's lives. 
                What started as a small flower shop has grown into a beloved brand known for exceptional quality and creativity.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Today, we continue to delight customers with our carefully curated collections, 
                innovative designs, and commitment to sustainability. Every flower tells a story, 
                and we're honored to be part of yours.
              </p>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=600&h=400&fit=crop" 
                alt="Our Story"
                className="rounded-xl shadow-lg w-full h-80 object-cover"
              />
              <div className="absolute -bottom-4 -right-4 bg-amber-500 text-white p-4 rounded-lg shadow-lg">
                <Flower2 className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Why Choose OMA Flowers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-amber-50/50 rounded-xl p-6 text-center hover:shadow-md transition-shadow border border-amber-200/30">
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-6 text-center hover:shadow-md transition-shadow">
                <img 
                  src={`https://ui-avatars.com/api/?name=Florist+${i}&background=amber&color=fff&size=100`}
                  alt={`Team member ${i}`}
                  className="w-24 h-24 rounded-full mx-auto mb-4"
                />
                <h4 className="font-semibold text-gray-800">Florist {i}</h4>
                <p className="text-sm text-amber-600">Senior Florist</p>
                <p className="text-sm text-gray-500 mt-2">Expert in wedding arrangements</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gradient-to-r from-amber-600 to-amber-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Our Values</h2>
          <p className="text-xl text-amber-100 max-w-2xl mx-auto">
            Quality, creativity, sustainability, and customer satisfaction are at the heart of everything we do.
          </p>
          <div className="flex justify-center gap-4 mt-8">
            <div className="bg-white/10 rounded-full px-6 py-2 text-amber-100">Quality</div>
            <div className="bg-white/10 rounded-full px-6 py-2 text-amber-100">Creativity</div>
            <div className="bg-white/10 rounded-full px-6 py-2 text-amber-100">Sustainability</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;