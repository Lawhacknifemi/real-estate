import Link from 'next/link';

export default function IndustryInsights() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center mb-8">
          <div className="flex-1 h-px bg-gray-300"></div>
          <h2 className="text-3xl font-bold text-gray-900 px-6">INDUSTRY INSIGHTS</h2>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>
        {/* Content preview */}
        <div className="text-center mt-8 max-w-2xl mx-auto">
          <p className="text-gray-600 mb-6">
            Stay informed with the latest news, trends, and insights from the flex space industry.
          </p>
          <Link
            href="/industry-insights"
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            View All Insights →
          </Link>
        </div>
      </div>
    </section>
  );
}

