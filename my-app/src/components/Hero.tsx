'use client';

import SearchBar from './SearchBar';

export default function Hero() {
  return (
    <section className="relative h-[600px] w-full overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/backgroundimage.png')",
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
        <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center max-w-4xl px-4">
          Search flex space properties for sale and lease
        </h2>
        
        {/* Search Bar */}
        <SearchBar 
          placeholder="Search our properties" 
          showAdvanced={true}
        />
      </div>
    </section>
  );
}

