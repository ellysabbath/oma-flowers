// src/pages/Privacy.tsx
import React from 'react';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-amber-50/30 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: July 2026</p>

        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-6 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">1. Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              At OMA Flowers, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you visit our website or use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">2. Information We Collect</h2>
            <p className="text-gray-600 leading-relaxed">We may collect the following types of information:</p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li>Personal identification information (name, email, phone number)</li>
              <li>Shipping and billing addresses</li>
              <li>Payment information (processed securely through our payment gateway)</li>
              <li>Order history and preferences</li>
              <li>Website usage data and analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">3. How We Use Your Information</h2>
            <p className="text-gray-600 leading-relaxed">We use your information for the following purposes:</p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li>Processing and fulfilling your orders</li>
              <li>Communicating with you about orders and updates</li>
              <li>Sending promotional offers and newsletters (with your consent)</li>
              <li>Improving our website and services</li>
              <li>Preventing fraud and ensuring security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">4. Information Sharing</h2>
            <p className="text-gray-600 leading-relaxed">
              We do not sell, trade, or rent your personal information to third parties. We may share your information with:
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li>Service providers who help us operate our business</li>
              <li>Shipping partners to fulfill orders</li>
              <li>Law enforcement when required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">5. Data Security</h2>
            <p className="text-gray-600 leading-relaxed">
              We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">6. Cookies</h2>
            <p className="text-gray-600 leading-relaxed">
              We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookie preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">7. Your Rights</h2>
            <p className="text-gray-600 leading-relaxed">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">8. Changes to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">9. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <div className="mt-2 text-gray-600">
              <p>Email: privacy@omaflowers.com</p>
              <p>Phone: +255 712 345 678</p>
              <p>Address: Dar es Salaam, Tanzania</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;