'use client';

const ServicesPage = () => {
  return (
    <div id="services">
      <div className="container mx-auto px-6 py-24">
        <h1 className="text-5xl font-bold text-center mb-12">Our Services</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Service Card 1 */}
          <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center">
            <h2 className="text-3xl font-bold mb-4">Expert Maintenance</h2>
            <p className="text-lg">
              Our certified technicians provide top-notch service to keep your Royal Enfield running smoothly for years to come.
            </p>
          </div>

          {/* Service Card 2 */}
          <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center">
            <h2 className="text-3xl font-bold mb-4">Genuine Parts</h2>
            <p className="text-lg">
              We use only genuine Royal Enfield parts to ensure the best performance and longevity of your motorcycle.
            </p>
          </div>

          {/* Service Card 3 */}
          <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center">
            <h2 className="text-3xl font-bold mb-4">Custom Accessories</h2>
            <p className="text-lg">
              Personalize your ride with a wide range of official accessories, all designed to perfectly fit your bike.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
