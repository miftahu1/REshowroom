'use client';

const AboutPage = () => {
  return (
    <div id="about">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl font-bold mb-4">About Royal Enfield</h1>
        <p className="text-xl">
          Discover the legacy of the oldest global motorcycle brand in continuous production.
        </p>
      </div>

      {/* History Section */}
      <div className="bg-gray-800 py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold mb-8 text-center">Our Storied History</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-lg mb-4">
                Made like a gun, since 1901. Royal Enfield is an Indian multinational motorcycle manufacturing company headquartered in Chennai, Tamil Nadu, India.
              </p>
              <p className="text-lg">
                The Royal Enfield brand, including its original English heritage, is the oldest global motorcycle brand in continuous production.
              </p>
            </div>
            <div>
              <img
                src="/assets/images/workshop.png"
                alt="Historic Royal Enfield"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Craftsmanship Section */}
      <div className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold mb-8 text-center">Unmatched Craftsmanship</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src="/assets/images/showroom.png"
              alt="Royal Enfield Craftsmanship"
              className="rounded-lg shadow-xl"
            />
          </div>
          <div>
            <p className="text-lg mb-4">
              Every Royal Enfield motorcycle is a blend of art and engineering. It is the product of a creative and iterative process that combines the skill of our craftsmen with the latest in technology.
            </p>
            <p className="text-lg">
              From the gleam of the chrome to the distinctive thump of the engine, each detail is a testament to our commitment to pure motorcycling.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
