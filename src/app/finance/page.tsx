'use client';

const FinancePage = () => {
  return (
    <div id="emi">
      <div className="container mx-auto px-6 py-24">
        <h1 className="text-5xl font-bold text-center mb-12">Finance & EMI</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* EMI Calculator */}
          <div>
            <h2 className="text-3xl font-bold mb-6">EMI Calculator</h2>
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl">
              {/* Amount */}
              <div className="mb-6">
                <label htmlFor="amount" className="block text-lg font-medium mb-2">Loan Amount</label>
                <input type="range" id="amount" name="amount" min="50000" max="1000000" step="10000" className="w-full" />
              </div>

              {/* Tenure */}
              <div className="mb-6">
                <label htmlFor="tenure" className="block text-lg font-medium mb-2">Loan Tenure (Months)</label>
                <input type="range" id="tenure" name="tenure" min="6" max="60" step="6" className="w-full" />
              </div>

              {/* Interest Rate */}
              <div className="mb-6">
                <label htmlFor="interest" className="block text-lg font-medium mb-2">Interest Rate (%)</label>
                <input type="range" id="interest" name="interest" min="8" max="15" step="0.5" className="w-full" />
              </div>

              <div className="text-center mt-8">
                <h3 className="text-2xl font-bold">Your Monthly EMI</h3>
                <p className="text-4xl font-bold text-red-600 mt-2">₹5,645</p>
              </div>
            </div>
          </div>

          {/* Finance Options */}
          <div>
            <h2 className="text-3xl font-bold mb-6">Flexible Finance Options</h2>
            <p className="text-lg mb-4">
              We offer a range of flexible and transparent finance options to help you own your dream Royal Enfield. Our partnerships with leading banks and financial institutions ensure you get the best rates and terms.
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Low down payment options</li>
              <li>Competitive interest rates</li>
              <li>Quick and hassle-free loan processing</li>
              <li>Customizable tenure from 6 to 60 months</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancePage;
