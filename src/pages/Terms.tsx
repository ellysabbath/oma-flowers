// src/pages/Terms.tsx
import React from 'react';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-amber-50/30 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Terms & Conditions</h1>
        <p className="text-gray-500 mb-8">Last updated: July 2026</p>

        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-6 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">1. Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              Welcome to OMA Flowers. By using our website and services, you agree to comply with and be bound by the following terms and conditions. Please read them carefully before making any purchase or using our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">2. Account Registration</h2>
            <p className="text-gray-600 leading-relaxed">
              To access certain features of our website, you may be required to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li>You must provide accurate and complete information</li>
              <li>You are responsible for all activities under your account</li>
              <li>We reserve the right to terminate accounts at our discretion</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">3. Orders and Payments</h2>
            <p className="text-gray-600 leading-relaxed">
              All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order for any reason at any time.
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li>Prices are subject to change without notice</li>
              <li>Payment must be made in full before order processing</li>
              <li>We accept various payment methods as displayed on our website</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">4. Shipping and Delivery</h2>
            <p className="text-gray-600 leading-relaxed">
              We strive to deliver your orders in a timely manner. Shipping times and costs are displayed at checkout.
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li>Delivery times are estimates and not guaranteed</li>
              <li>We are not responsible for delays caused by external factors</li>
              <li>Please ensure accurate shipping information is provided</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">5. Returns and Refunds</h2>
            <p className="text-gray-600 leading-relaxed">
              We want you to be completely satisfied with your purchase. If you are not satisfied, please contact us within 30 days of receiving your order.
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li>Products must be returned in their original condition</li>
              <li>Refunds will be processed to the original payment method</li>
              <li>Shipping costs are non-refundable unless the return is due to our error</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">6. Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed">
              All content on this website, including images, text, logos, and designs, is the property of OMA Flowers and is protected by intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">7. Privacy Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">8. Contact Information</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions about these terms and conditions, please contact us at:
            </p>
            <div className="mt-2 text-gray-600">
              <p>Email: info@omaflowers.com</p>
              <p>Phone: +255 712 345 678</p>
              <p>Address: Dar es Salaam, Tanzania</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;