import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">LIST FLEX SPACE</h3>
            <p className="text-gray-400 text-sm">
              Your next flexible space opportunity
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/listings" className="hover:text-white transition-colors">
                  Listings
                </Link>
              </li>
              <li>
                <Link href="/submit-property" className="hover:text-white transition-colors">
                  Submit Property
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/industry-insights" className="hover:text-white transition-colors">
                  Industry Insights
                </Link>
              </li>
              <li>
                <Link href="/vendors" className="hover:text-white transition-colors">
                  Vendors
                </Link>
              </li>
              {/* Advertise link hidden - will be implemented later */}
              {/* <li>
                <Link href="/advertise" className="hover:text-white transition-colors">
                  Advertise
                </Link>
              </li> */}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <p className="text-sm text-gray-400">
              Sales/Support: <a href="tel:313-484-4670" className="hover:text-white transition-colors">313-484-4670</a>
            </p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} LIST FLEX SPACE. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}



