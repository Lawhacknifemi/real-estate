'use client';

import PageLayout from '@/components/PageLayout';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getBlogById, Blog } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

export default function BlogDetailPage() {
  const params = useParams();
  const blogId = params?.id as string;
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!blogId) return;
    
    async function fetchBlog() {
      setLoading(true);
      try {
        const data = await getBlogById(blogId);
        setBlog(data);
      } catch (error) {
        console.error('Error fetching blog:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchBlog();
  }, [blogId]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading blog...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!blog) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Blog Not Found</h2>
            <Link
              href="/industry-insights"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Industry Insights
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Featured Image */}
      {blog.featured_image_url && (
        <section className="relative h-[400px] w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={blog.featured_image_url}
            alt={blog.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </section>
      )}

      {/* Blog Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Link
                href="/industry-insights"
                className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2 mb-4"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Industry Insights
              </Link>
              
              {blog.category && (
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium inline-block mb-4">
                  {blog.category}
                </span>
              )}
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{blog.title}</h1>
              
              <div className="flex items-center gap-4 text-gray-600 mb-6">
                {blog.author && <span>By {blog.author}</span>}
                {blog.date_published && (
                  <span>• {formatDate(blog.date_published)}</span>
                )}
                <span>• {blog.views || 0} views</span>
              </div>
            </div>

            {/* Blog Content */}
            <div 
              className="prose prose-lg max-w-none mb-12"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Share Section */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Share this article</h3>
              <div className="flex gap-4">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  Twitter
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  LinkedIn
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  Facebook
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}

