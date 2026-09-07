// src/pages/Blog.tsx
import React, { useState } from 'react';
import { Calendar, User, Tag, ArrowRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  author: string;
  category: string;
  readTime: string;
}

const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: '10 Tips for Keeping Your Flowers Fresh Longer',
    excerpt: 'Learn the best practices for extending the life of your cut flowers and keeping them beautiful for days.',
    image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=600&h=400&fit=crop',
    date: 'July 15, 2026',
    author: 'Jane Smith',
    category: 'Flower Care',
    readTime: '5 min read'
  },
  {
    id: 2,
    title: 'The Ultimate Guide to Wedding Flower Arrangements',
    excerpt: 'From bouquets to centerpieces, discover everything you need to know about wedding flower design.',
    image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=600&h=400&fit=crop',
    date: 'July 10, 2026',
    author: 'John Doe',
    category: 'Weddings',
    readTime: '8 min read'
  },
  {
    id: 3,
    title: 'Seasonal Flowers: What to Plant in Each Season',
    excerpt: 'A comprehensive guide to seasonal flowers and when to plant them for the best results.',
    image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=600&h=400&fit=crop',
    date: 'July 5, 2026',
    author: 'Sarah Johnson',
    category: 'Gardening',
    readTime: '6 min read'
  },
  {
    id: 4,
    title: 'The Language of Flowers: What Different Flowers Mean',
    excerpt: 'Discover the hidden meanings behind different flowers and how to choose the perfect bouquet.',
    image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=600&h=400&fit=crop',
    date: 'June 28, 2026',
    author: 'Jane Smith',
    category: 'Flower Meanings',
    readTime: '4 min read'
  },
  {
    id: 5,
    title: '5 Creative Ways to Decorate Your Home with Flowers',
    excerpt: 'Transform your living space with these creative and affordable flower decoration ideas.',
    image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=600&h=400&fit=crop',
    date: 'June 20, 2026',
    author: 'Mike Brown',
    category: 'Home Decor',
    readTime: '7 min read'
  },
  {
    id: 6,
    title: 'How to Start a Flower Garden: A Beginner\'s Guide',
    excerpt: 'Everything you need to know to start your own beautiful flower garden from scratch.',
    image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=600&h=400&fit=crop',
    date: 'June 15, 2026',
    author: 'Sarah Johnson',
    category: 'Gardening',
    readTime: '10 min read'
  }
];

const categories = ['All', 'Flower Care', 'Weddings', 'Gardening', 'Flower Meanings', 'Home Decor'];

const Blog: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-amber-50/30 py-12">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Our Blog</h1>
          <p className="text-gray-600 mt-2">Read the latest articles and tips about flowers</p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search blog posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-amber-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-amber-50 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No blog posts found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <article key={post.id} className="bg-white rounded-xl shadow-sm border border-amber-200/30 overflow-hidden hover:shadow-md transition-shadow group">
                <div className="relative overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <User size={14} />
                      {post.author}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-amber-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{post.excerpt}</p>
                  <Link
                    to={`/blog/${post.id}`}
                    className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 font-medium text-sm transition-colors"
                  >
                    Read More <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;