'use client';

import PageLayout from '@/components/PageLayout';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getAllBlogs, Blog } from '@/lib/api';

export default function IndustryInsightsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const categories = ['All', 'Market Trends', 'Operations', 'Investment', 'Technology'];

  useEffect(() => {
    async function fetchBlogs() {
      setLoading(true);
      try {
        const result = await getAllBlogs(selectedCategory === 'All' ? undefined : selectedCategory, currentPage);
        setBlogs(result.blogs);
        setTotalPages(result.pages);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, [selectedCategory, currentPage]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-teal-500 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Industry Insights</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Stay informed with the latest news, trends, and insights from the flex space industry
          </p>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-8 bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentPage(1);
                }}
                className={`px-6 py-2 rounded-full border-2 transition-colors font-medium ${
                  selectedCategory === category
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Insights Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading insights...</p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg mb-4">No blog posts found.</p>
              <p className="text-gray-500 text-sm">Check back later for new insights!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {blogs.map((blog) => (
                  <Link
                    key={blog.id}
                    href={`/industry-insights/${blog.id}`}
                    className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 transition-colors group"
                  >
                    <div className="relative h-48 w-full overflow-hidden">
                      {blog.featured_image_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={blog.featured_image_url}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop';
                          }}
                        />
                      ) : (
                        <Image
                          src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop"
                          alt={blog.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                      {blog.category && (
                        <div className="absolute top-4 left-4">
                          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                            {blog.category}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <p className="text-sm text-gray-500 mb-2">
                        {formatDate(blog.date_published || blog.date_created)} {blog.author && `• ${blog.author}`}
                      </p>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                        {blog.title}
                      </h3>
                      <p className="text-gray-600 mb-4">{blog.excerpt}</p>
                      <span className="text-blue-600 font-medium inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                        Read More
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Stay Updated</h2>
            <p className="text-lg text-gray-700 mb-8">
              Subscribe to our newsletter and get the latest industry insights delivered to your inbox
            </p>
            <form className="flex gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}



