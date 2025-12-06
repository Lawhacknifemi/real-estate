'use client';

interface ShareButtonsProps {
  url: string;
  title: string;
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const shareUrl = typeof window !== 'undefined' ? window.location.href : url;
  const shareText = `Check out ${title}`;

  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;

  return (
    <div className="pt-4 border-t border-gray-200">
      <p className="text-sm text-gray-600 mb-2">Share this listing</p>
      <div className="flex gap-3">
        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded text-center hover:bg-blue-700 transition-colors text-sm"
        >
          Facebook
        </a>
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-teal-400 text-white py-2 px-4 rounded text-center hover:bg-teal-500 transition-colors text-sm"
        >
          Twitter
        </a>
      </div>
    </div>
  );
}



