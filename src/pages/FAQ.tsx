// src/pages/FAQ.tsx
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    id: 1,
    category: 'Orders',
    question: 'How do I place an order?',
    answer: 'You can place an order by browsing our products, selecting your desired items, and proceeding to checkout. You will need to provide your shipping information and payment details to complete the order.'
  },
  {
    id: 2,
    category: 'Orders',
    question: 'Can I modify or cancel my order?',
    answer: 'Orders can be modified or cancelled within 24 hours of placement. Please contact our customer support team immediately for assistance with your order modifications.'
  },
  {
    id: 3,
    category: 'Shipping',
    question: 'What are the shipping options?',
    answer: 'We offer standard and express shipping options. Standard shipping takes 3-5 business days, while express shipping delivers within 1-2 business days. Free shipping is available on orders over TSh 100,000.'
  },
  {
    id: 4,
    category: 'Shipping',
    question: 'Do you deliver internationally?',
    answer: 'Currently, we deliver within Tanzania, Kenya, and Uganda. We are working on expanding our delivery network to other countries in the region.'
  },
  {
    id: 5,
    category: 'Products',
    question: 'How fresh are the flowers?',
    answer: 'Our flowers are sourced fresh daily from premium growers. We ensure that all flowers are delivered at their peak freshness with proper care and handling.'
  },
  {
    id: 6,
    category: 'Products',
    question: 'Do you offer custom arrangements?',
    answer: 'Yes! We offer custom floral arrangements for weddings, events, and special occasions. Please contact our design team to discuss your specific requirements.'
  },
  {
    id: 7,
    category: 'Payments',
    question: 'What payment methods do you accept?',
    answer: 'We accept various payment methods including credit/debit cards, mobile money, and bank transfers. All payments are processed securely through our payment gateway.'
  },
  {
    id: 8,
    category: 'Payments',
    question: 'Is my payment secure?',
    answer: 'Yes, all transactions are encrypted and processed through secure payment gateways. We do not store any payment information on our servers.'
  },
  {
    id: 9,
    category: 'Returns',
    question: 'What is your return policy?',
    answer: 'We offer a 30-day return policy for damaged or unsatisfactory products. Please contact our customer service team to initiate a return or exchange.'
  },
  {
    id: 10,
    category: 'Returns',
    question: 'How do I return a product?',
    answer: 'To return a product, please contact our customer service team with your order number and the reason for return. We will guide you through the return process.'
  }
];

const FAQ: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [openItems, setOpenItems] = useState<number[]>([]);

  const categories = ['All', ...new Set(faqs.map(faq => faq.category))];

  const toggleItem = (id: number) => {
    setOpenItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-amber-50/30 py-12">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Frequently Asked Questions</h1>
          <p className="text-gray-600 mt-2">Find answers to common questions about our products and services</p>
        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category
                  ? 'bg-amber-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-amber-50 border border-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="max-w-3xl mx-auto space-y-3">
          {filteredFaqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white rounded-xl shadow-sm border border-amber-200/30 overflow-hidden"
            >
              <button
                onClick={() => toggleItem(faq.id)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-amber-50/30 transition-colors"
              >
                <span className="font-medium text-gray-800">{faq.question}</span>
                {openItems.includes(faq.id) ? (
                  <ChevronUp className="w-5 h-5 text-amber-500 flex-shrink-0 ml-4" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-amber-500 flex-shrink-0 ml-4" />
                )}
              </button>
              {openItems.includes(faq.id) && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  <span className="inline-block mt-2 text-xs text-amber-500 bg-amber-50 px-2 py-1 rounded-full">
                    {faq.category}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredFaqs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No FAQs found matching your search.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setActiveCategory('All');
              }}
              className="mt-4 text-amber-600 hover:text-amber-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Still Have Questions */}
        <div className="mt-12 text-center bg-white rounded-xl shadow-sm border border-amber-200/30 p-8 max-w-2xl mx-auto">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Still Have Questions?</h3>
          <p className="text-gray-600 mb-4">Contact our support team for personalized assistance</p>
          <a
            href="/contact"
            className="inline-block px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQ;