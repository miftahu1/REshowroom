
export const metadata = {
  title: 'Finance | Royal Enfield',
  description: 'Explore premium finance options for owning your Royal Enfield comfortably.',
};

const FinancePage = () => {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto px-6 py-24">
        <h1 className="text-5xl font-bold text-center mb-12">Finance Your Ride</h1>
        <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-lg shadow-xl">
          <h2 className="text-3xl font-bold mb-6">Easy & Flexible Loan Options</h2>
          <p className="text-lg mb-8">
            Owning a Royal Enfield is easier than ever with our tailored finance plans. We partner with leading financial institutions to offer you competitive rates and flexible repayment terms.
          </p>

          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-lg font-medium">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg px-4 py-3 mt-2 focus:outline-none focus:border-red-600"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-lg font-medium">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg px-4 py-3 mt-2 focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-lg font-medium">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg px-4 py-3 mt-2 focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label htmlFor="model" className="block text-lg font-medium">Select Model</label>
              <select
                id="model"
                name="model"
                className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg px-4 py-3 mt-2 focus:outline-none focus:border-red-600"
              >
                <option>Classic 350</option>
                <option>Meteor 350</option>
                <option>Himalayan</option>
                <option>Interceptor 650</option>
                <option>Continental GT 650</option>
              </select>
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300"
              >
                Apply for Loan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FinancePage;
