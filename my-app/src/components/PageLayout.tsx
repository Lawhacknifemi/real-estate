import Header from './Header';
import Footer from './Footer';

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      {children}
      <Footer />
    </div>
  );
}



