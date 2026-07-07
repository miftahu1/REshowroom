'use client'

export const metadata = {
  title: 'Contact | Royal Enfield',
  description: 'Reach out to the Royal Enfield showroom for test rides, service, and support.',
};

export default function ContactPage() {
  return (
    <section id="contact" aria-labelledby="contact-title" style={{paddingTop: '120px', paddingBottom: '120px'}}>
        <div className="section-header">
          <span className="section-tag">Find Us</span>
          <h2 className="section-title" id="contact-title">Visit the Showroom</h2>
          <p className="section-subtitle">Open 7 days a week. Come breathe in the machines.</p>
        </div>
        <div className="contact-layout">
          <div className="contact-info">
            <p>Our showroom is located in the heart of the city, easily accessible and equipped with the complete
              Royal Enfield experience — from models and accessories to finance and servicing.</p>
            <div className="contact-item">
              <div className="contact-icon"><i className="fa-solid fa-location-dot"></i></div>
              <div className="contact-item-body">
                <h4>Showroom Address</h4>
                <p>42, Rajpur Road, Sector 14<br />Gurugram, Haryana - 122001</p>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon"><i className="fa-solid fa-phone"></i></div>
              <div className="contact-item-body">
                <h4>Sales &amp; Enquiries</h4>
                <a href="tel:+911244567890">+91 124 456 7890</a><br />
                <a href="tel:+919876543210">+91 98765 43210</a>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon"><i className="fa-solid fa-clock"></i></div>
              <div className="contact-item-body">
                <h4>Showroom Hours</h4>
                <p>Mon – Sat: 9:00 AM – 8:00 PM<br />Sunday: 10:00 AM – 6:00 PM</p>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon"><i className="fa-solid fa-envelope"></i></div>
              <div className="contact-item-body">
                <h4>Email Us</h4>
                <a href="mailto:hello@re-amguri.in">hello@re-amguri.in</a>
              </div>
            </div>
            <div className="contact-socials">
              <a href="#" className="social-btn" aria-label="Facebook"><i className="fa-brands fa-facebook-f"></i></a>
              <a href="#" className="social-btn" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a>
              <a href="#" className="social-btn" aria-label="YouTube"><i className="fa-brands fa-youtube"></i></a>
              <a href="#" className="social-btn" aria-label="WhatsApp"><i className="fa-brands fa-whatsapp"></i></a>
            </div>
          </div>
          <div className="contact-map">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3507.2!2d77.043!3d28.451!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDI3JzAzLjYiTiA3N8KwMDInMzQuOCJF!5e0!3m2!1sen!2sin!4v1"
              allowFullScreen={true} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              title="Royal Enfield Dealership Location"></iframe>
            <div className="map-overlay-badge">
              <i className="fa-solid fa-location-dot"></i> Royal Enfield Gurugram
            </div>
          </div>
        </div>
      </section>
  );
}
