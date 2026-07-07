'use client';

const ContactPage = () => {
  return (
    <div id="contact">
      <div className="container mx-auto px-6 py-24">
        <h1 className="text-5xl font-bold text-center mb-12">Contact Us</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h2 className="text-3xl font-bold mb-6">Send a Message</h2>
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-lg font-medium">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg px-4 py-3 mt-2 focus:outline-none focus:border-red-600"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-lg font-medium">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg px-4 py-3 mt-2 focus:outline-none focus:border-red-600"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-lg font-medium">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg px-4 py-3 mt-2 focus:outline-none focus:border-red-600"
                ></textarea>
              </div>
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300"
              >
                Submit
              </button>
            </form>
          </div>

          {/* Contact Details */}
          <div>
            <h2 className="text-3xl font-bold mb-6">Showroom Information</h2>
            <div className="space-y-4">
              <p className="text-lg"><strong className="font-bold">Address:</strong> 123 Motorcycle Lane, Motor City, 45678</p>
              <p className="text-lg"><strong className="font-bold">Phone:</strong> (123) 456-7890</p>
              <p className="text-lg"><strong className="font-bold">Email:</strong> contact@reshowroom.com</p>
              <p className="text-lg"><strong className="font-bold">Hours:</strong> Mon-Sat: 9am - 6pm, Sun: Closed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
