
import './globals.css';

export default function Home() {
  return (
    <>
      <div id="scroll-progress" aria-hidden="true"></div>
      <nav id="navbar">
        <a href="#hero" className="nav-logo" aria-label="Royal Enfield Home">
          <span className="logo-brand">Royal Enfield</span>
          <span className="logo-sub">Authorized Dealership</span>
        </a>
        <ul className="nav-links">
          <li><a href="#models">Models</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#emi">Finance</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <a href="#test-ride" className="nav-cta">Book Test Ride</a>
        <button className="nav-hamburger" aria-label="Toggle menu" id="hamburger">
          <span></span><span></span><span></span>
        </button>
      </nav>
      <div className="mobile-menu" id="mobile-menu">
        <a href="#models">Models</a>
        <a href="#about">About</a>
        <a href="#services">Services</a>
        <a href="#test-ride">Test Ride</a>
        <a href="#emi">Finance</a>
        <a href="#contact">Contact</a>
      </div>
      <section id="hero" aria-label="Hero">
        <canvas id="hero-canvas" aria-hidden="true"></canvas>
        <div className="hero-bg-grad" aria-hidden="true"></div>
        <div className="hero-spotlight" aria-hidden="true"></div>
        <div className="hero-bike-wrap" aria-hidden="true">
          <img id="hero-bike" src="/assets/images/hunter350.png" alt="Royal Enfield Hunter 350 — hero showcase" loading="eager" />
          <div className="hero-bike-shadow"></div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            Authorized Dealership &nbsp;|&nbsp; Est. 2005
          </div>
          <h1 className="hero-headline">
            Pure <span className="gold-text">Motorcycling.</span><br />
            Timeless Legacy.
          </h1>
          <p className="hero-sub">Feel the thunder &nbsp;·&nbsp; Own the road</p>
          <p className="hero-desc">
            Step into a world where machines are more than metal — they are a statement of character. Explore our
            full range of Royal Enfield motorcycles at your trusted authorized dealership.
          </p>
          <div className="hero-cta">
            <a href="#models" className="btn-primary">
              <i className="fa-solid fa-motorcycle"></i> Explore Models
            </a>
            <a href="#test-ride" className="btn-outline">
              <i className="fa-regular fa-calendar-check"></i> Book a Test Ride
            </a>
          </div>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-num">15+</div>
            <div className="hero-stat-label">Models<br />Available</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-num">5K+</div>
            <div className="hero-stat-label">Happy<br />Riders</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-num">18yr</div>
            <div className="hero-stat-label">Authorized<br />Partner</div>
          </div>
        </div>
        <div className="hero-scroll-indicator" aria-hidden="true">
          <span className="scroll-label">Scroll</span>
          <span className="scroll-line"></span>
        </div>
      </section>
      <section id="models" aria-labelledby="models-title">
        <div className="section-header">
          <span className="section-tag">Our Fleet</span>
          <h2 className="section-title" id="models-title">Featured Models</h2>
          <p className="section-subtitle">Each machine handcrafted to inspire — discover the motorcycle that speaks your
            language.</p>
        </div>
        <div className="models-grid">
          <article className="model-card" id="hunter-card" role="article">
            <div className="model-card-img">
              <img src="/assets/images/hunter350.png" alt="Royal Enfield Hunter 350" loading="eager" />
              <span className="model-card-badge">Urban</span>
            </div>
            <div className="model-card-body">
              <h3 className="model-card-name">Hunter 350</h3>
              <p className="model-card-engine">349cc · Single-Cylinder · J-Series</p>
              <div className="model-card-specs">
                <div className="model-spec">
                  <span className="model-spec-val">20.2</span>
                  <span className="model-spec-label">BHP</span>
                </div>
                <div className="model-spec">
                  <span className="model-spec-val">27</span>
                  <span className="model-spec-label">Nm Torque</span>
                </div>
                <div className="model-spec">
                  <span className="model-spec-val">181</span>
                  <span className="model-spec-label">KG Kerb</span>
                </div>
              </div>
              <div className="model-card-footer">
                <div className="model-price">₹1.50 L <span>onwards</span></div>
                <button className="model-explore-btn">Explore <i className="fa-solid fa-arrow-right"></i></button>
              </div>
            </div>
          </article>
          <article className="model-card" role="article">
            <div className="model-card-img">
              <img src="/assets/images/classic_350.png" alt="Royal Enfield Classic 350" loading="lazy" />
              <span className="model-card-badge">Bestseller</span>
            </div>
            <div className="model-card-body">
              <h3 className="model-card-name">Classic 350</h3>
              <p className="model-card-engine">349cc · Single-Cylinder · Air-Cooled</p>
              <div className="model-card-specs">
                <div className="model-spec">
                  <span className="model-spec-val">20.2</span>
                  <span className="model-spec-label">BHP</span>
                </div>
                <div className="model-spec">
                  <span className="model-spec-val">27</span>
                  <span className="model-spec-label">Nm Torque</span>
                </div>
                <div className="model-spec">
                  <span className="model-spec-val">195</span>
                  <span className="model-spec-label">KG Kerb</span>
                </div>
              </div>
              <div className="model-card-footer">
                <div className="model-price">₹1.93 L <span>onwards</span></div>
                <button className="model-explore-btn">Explore <i className="fa-solid fa-arrow-right"></i></button>
              </div>
            </div>
          </article>
          <article className="model-card" role="article">
            <div className="model-card-img">
              <img src="/assets/images/himalayan.png" alt="Royal Enfield Himalayan" loading="lazy" />
              <span className="model-card-badge">Adventure</span>
            </div>
            <div className="model-card-body">
              <h3 className="model-card-name">Himalayan</h3>
              <p className="model-card-engine">411cc · Single-Cylinder · Fuel Injected</p>
              <div className="model-card-specs">
                <div className="model-spec">
                  <span className="model-spec-val">24.3</span>
                  <span className="model-spec-label">BHP</span>
                </div>
                <div className="model-spec">
                  <span className="model-spec-val">32</span>
                  <span className="model-spec-label">Nm Torque</span>
                </div>
                <div className="model-spec">
                  <span className="model-spec-val">199</span>
                  <span className="model-spec-label">KG Kerb</span>
                </div>
              </div>
              <div className="model-card-footer">
                <div className="model-price">₹2.69 L <span>onwards</span></div>
                <button className="model-explore-btn">Explore <i className="fa-solid fa-arrow-right"></i></button>
              </div>
            </div>
          </article>
          <article className="model-card" role="article">
            <div className="model-card-img">
              <img src="/assets/images/meteor_350.png" alt="Royal Enfield Meteor 350" loading="lazy" />
              <span className="model-card-badge">Cruiser</span>
            </div>
            <div className="model-card-body">
              <h3 className="model-card-name">Meteor 350</h3>
              <p className="model-card-engine">349cc · Single-Cylinder · SOHC</p>
              <div className="model-card-specs">
                <div className="model-spec">
                  <span className="model-spec-val">20.2</span>
                  <span className="model-spec-label">BHP</span>
                </div>
                <div className="model-spec">
                  <span className="model-spec-val">27</span>
                  <span className="model-spec-label">Nm Torque</span>
                </div>
                <div className="model-spec">
                  <span className="model-spec-val">191</span>
                  <span className="model-spec-label">KG Kerb</span>
                </div>
              </div>
              <div className="model-card-footer">
                <div className="model-price">₹2.09 L <span>onwards</span></div>
                <button className="model-explore-btn">Explore <i className="fa-solid fa-arrow-right"></i></button>
              </div>
            </div>
          </article>
          <article className="model-card" role="article">
            <div className="model-card-img">
              <img src="/assets/images/meteor_350.png" alt="Royal Enfield Bullet 350" loading="lazy" style={{filter: 'sepia(0.3) contrast(1.1)'}} />
              <span className="model-card-badge">Iconic</span>
            </div>
            <div className="model-card-body">
              <h3 className="model-card-name">Bullet 350</h3>
              <p className="model-card-engine">349cc · Single-Cylinder · J-Series</p>
              <div className="model-card-specs">
                <div className="model-spec">
                  <span className="model-spec-val">20.4</span>
                  <span className="model-spec-label">BHP</span>
                </div>
                <div className="model-spec">
                  <span className="model-spec-val">27</span>
                  <span className="model-spec-label">Nm Torque</span>
                </div>
                <div className="model-spec">
                  <span className="model-spec-val">195</span>
                  <span className="model-spec-label">KG Kerb</span>
                </div>
              </div>
              <div className="model-card-footer">
                <div className="model-price">₹1.74 L <span>onwards</span></div>
                <button className="model-explore-btn">Explore <i className="fa-solid fa-arrow-right"></i></button>
              </div>
            </div>
          </article>
          <article className="model-card" role="article">
            <div className="model-card-img">
              <img src="/assets/images/himalayan.png" alt="Royal Enfield Super Meteor 650" loading="lazy" style={{filter: 'brightness(0.8) saturate(0.6)'}} />
              <span className="model-card-badge">650 Twin</span>
            </div>
            <div className="model-card-body">
              <h3 className="model-card-name">Super Meteor 650</h3>
              <p className="model-card-engine">648cc · Parallel Twin · Fuel Injected</p>
              <div className="model-card-specs">
                <div className="model-spec">
                  <span className="model-spec-val">47</span>
                  <span className="model-spec-label">BHP</span>
                </div>
                <div className="model-spec">
                  <span className="model-spec-val">52.3</span>
                  <span className="model-spec-label">Nm Torque</span>
                </div>
                <div className="model-spec">
                  <span className="model-spec-val">241</span>
                  <span className="model-spec-label">KG Kerb</span>
                </div>
              </div>
              <div className="model-card-footer">
                <div className="model-price">₹3.49 L <span>onwards</span></div>
                <button className="model-explore-btn">Explore <i className="fa-solid fa-arrow-right"></i></button>
              </div>
            </div>
          </article>
        </div>
      </section>
      <section id="about" aria-labelledby="about-title">
        <div className="about-grid">
          <div className="about-image-wrap">
            <span className="about-frame" aria-hidden="true"></span>
            <img className="about-image-main" src="/assets/images/showroom.png" alt="Royal Enfield showroom interior" loading="lazy" />
            <div className="about-image-accent">
              <span className="accent-num">18</span>
              <span className="accent-label">Years of Pure Legacy</span>
            </div>
          </div>
          <div className="about-content">
            <span className="section-tag">Our Story</span>
            <h2 className="section-title" id="about-title">Where Passion<br />Meets Purpose</h2>
            <p>We are more than a dealership — we are custodians of a century-old legacy. Established in 2005, we
              have grown to become one of the most trusted Royal Enfield authorized dealerships, serving thousands
              of riders across the region.</p>
            <p>Our state-of-the-art showroom spans over 10,000 sq. ft., featuring the complete Royal Enfield lineup
              alongside expert consultation, authentic accessories, and a world-className service centre.</p>
            <p>Every person who walks through our doors is welcomed into the Royal Enfield brotherhood — a community
              bound not by horsepower alone, but by the spirit of adventure.</p>
            <div className="about-stats">
              <div className="about-stat">
                <div className="about-stat-num" data-count="5000" data-suffix="+">0</div>
                <div className="about-stat-label">Happy Riders</div>
              </div>
              <div className="about-stat">
                <div className="about-stat-num" data-count="18" data-suffix=" Yrs">0</div>
                <div className="about-stat-label">In Business</div>
              </div>
              <div className="about-stat">
                <div className="about-stat-num" data-count="30" data-suffix="+">0</div>
                <div className="about-stat-label">Expert Staff</div>
              </div>
            </div>
            <a href="#test-ride" className="btn-primary">
              <i className="fa-solid fa-route"></i> Book Your Ride
            </a>
          </div>
        </div>
      </section>
      <section id="services" aria-labelledby="services-title">
        <div className="services-layout">
          <div className="services-image">
            <img src="/assets/images/workshop.png" alt="Royal Enfield authorized service workshop" loading="lazy" />
            <div className="services-image-overlay">
              <h4><i className="fa-solid fa-shield-halved"></i> &nbsp;100% Genuine Parts</h4>
              <p>Only authentic Royal Enfield spare parts and accessories — sourced directly from the factory,
                with full warranty.</p>
            </div>
          </div>
          <div>
            <span className="section-tag">Expert Care</span>
            <h2 className="section-title" id="services-title">Services &amp;<br />Genuine Parts</h2>
            <p className="section-subtitle" style={{textAlign: 'left',maxWidth:'100%',margin:'16px 0 36px'}}>Your Royal
              Enfield deserves nothing but the best. Our certified technicians and authorised service centre keep
              your machine in peak condition.</p>
            <div className="services-grid">
              <div className="service-card">
                <div className="service-icon"><i className="fa-solid fa-wrench"></i></div>
                <h4>Expert Servicing</h4>
                <p>Scheduled maintenance by RE-certified technicians using precision tools and diagnostics.</p>
              </div>
              <div className="service-card">
                <div className="service-icon"><i className="fa-solid fa-gear"></i></div>
                <h4>Genuine Parts</h4>
                <p>OEM spare parts with factory warranty. No counterfeits, no compromises.</p>
              </div>
              <div className="service-card">
                <div className="service-icon"><i className="fa-solid fa-road"></i></div>
                <h4>Roadside Assistance</h4>
                <p>24×7 emergency support wherever the road takes you. One call away.</p>
              </div>
              <div className="service-card">
                <div className="service-icon"><i className="fa-solid fa-file-contract"></i></div>
                <h4>AMC Plans</h4>
                <p>Annual Maintenance Contracts that give you peace of mind and predictable costs.</p>
              </div>
              <div className="service-card">
                <div className="service-icon"><i className="fa-solid fa-shield"></i></div>
                <h4>Insurance Renewal</h4>
                <p>Hassle-free insurance renewal and claim assistance through our in-house desk.</p>
              </div>
              <div className="service-card">
                <div className="service-icon"><i className="fa-solid fa-spray-can-sparkles"></i></div>
                <h4>Custom Accessories</h4>
                <p>Personalise your ride with official Royal Enfield accessories and custom fitment.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="test-ride" aria-labelledby="test-ride-title">
        <div className="test-ride-layout">
          <div className="test-ride-info">
            <span className="section-tag">Experience It</span>
            <h2 className="section-title" id="test-ride-title">Book a<br />Test Ride</h2>
            <p>Words can't describe the thrum of a Royal Enfield engine beneath you. Fill in the form and one of our
              brand specialists will reach out to schedule your personal test ride experience.</p>
            <div className="test-ride-perks">
              <div className="perk-item"><i className="fa-solid fa-check"></i> No commitment required</div>
              <div className="perk-item"><i className="fa-solid fa-check"></i> Personal riding expert assigned</div>
              <div className="perk-item"><i className="fa-solid fa-check"></i> Rides available 7 days a week</div>
              <div className="perk-item"><i className="fa-solid fa-check"></i> Full model range available</div>
            </div>
          </div>
          <div className="test-ride-form glass-card">
            <h3 className="form-title">Reserve Your Slot</h3>
            <form id="booking-form" noValidate>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="f-name">Full Name</label>
                  <input type="text" id="f-name" name="name" placeholder="Rajiv Mehta" required />
                </div>
                <div className="form-group">
                  <label htmlFor="f-phone">Phone Number</label>
                  <input type="tel" id="f-phone" name="phone" placeholder="+91 98765 43210" required />
                </div>
                <div className="form-group">
                  <label htmlFor="f-email">Email Address</label>
                  <input type="email" id="f-email" name="email" placeholder="rajiv@mail.com" />
                </div>
                <div className="form-group">
                  <label htmlFor="f-model">Preferred Model</label>
                  <select id="f-model" name="model" required>
                    <option value="" disabled selected>Select a model</option>
                    <option>Classic 350</option>
                    <option>Himalayan</option>
                    <option>Meteor 350</option>
                    <option>Hunter 350</option>
                    <option>Bullet 350</option>
                    <option>Super Meteor 650</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="f-date">Preferred Date</label>
                  <input type="date" id="f-date" name="date" />
                </div>
                <div className="form-group">
                  <label htmlFor="f-city">Your City</label>
                  <input type="text" id="f-city" name="city" placeholder="Mumbai" />
                </div>
                <div className="form-group full">
                  <label htmlFor="f-msg">Message (Optional)</label>
                  <textarea id="f-msg" name="message" placeholder="Any specific queries or requirements..."></textarea>
                </div>
              </div>
              <button type="submit" className="form-submit">
                <i className="fa-solid fa-paper-plane"></i> &nbsp; Submit Request
              </button>
            </form>
            <div className="form-success" aria-live="polite">
              <i className="fa-solid fa-circle-check"></i>
              <h3>Request Received!</h3>
              <p>Our team will contact you within 24 hours to confirm your test ride slot. Thank you for choosing
                Royal Enfield.</p>
            </div>
          </div>
        </div>
      </section>
      <section id="emi" aria-labelledby="emi-title">
        <div className="emi-layout">
          <div className="section-header">
            <span className="section-tag">Easy Finance</span>
            <h2 className="section-title" id="emi-title">Calculate Your EMI</h2>
            <p className="section-subtitle">Custom financing options starting at 8.5% p.a. with flexible tenure up to 60
              months. Low down payment, fast approval.</p>
          </div>
          <div className="emi-calculator glass-card">
            <div className="emi-sliders">
              <div className="emi-slider-group">
                <div className="emi-slider-header">
                  <span className="emi-slider-label">Loan Amount</span>
                  <span className="emi-slider-value" id="loan-display">₹1.5L</span>
                </div>
                <input type="range" id="loan-amount" min="50000" max="700000" step="5000" value="150000" aria-label="Loan Amount" />
              </div>
              <div className="emi-slider-group">
                <div className="emi-slider-header">
                  <span className="emi-slider-label">Loan Tenure</span>
                  <span className="emi-slider-value" id="tenure-display">36 mo</span>
                </div>
                <input type="range" id="loan-tenure" min="12" max="60" step="6" value="36" aria-label="Loan Tenure" />
              </div>
              <div className="emi-slider-group">
                <div className="emi-slider-header">
                  <span className="emi-slider-label">Interest Rate (p.a.)</span>
                  <span className="emi-slider-value" id="rate-display">9.0%</span>
                </div>
                <input type="range" id="loan-rate" min="8.5" max="16" step="0.1" value="9.0" aria-label="Interest Rate" />
              </div>
            </div>
            <div className="emi-result">
              <div className="emi-result-label">Monthly EMI</div>
              <div className="emi-result-amount" id="emi-display">₹4,770</div>
              <div className="emi-result-sub">Estimated — subject to credit approval</div>
              <div className="emi-breakdown">
                <div className="emi-break-item">
                  <div className="emi-break-val" id="total-display">₹171K</div>
                  <div className="emi-break-label">Total Amount</div>
                </div>
                <div className="emi-break-item">
                  <div className="emi-break-val" id="interest-display">₹21K</div>
                  <div className="emi-break-label">Interest Payable</div>
                </div>
                <div className="emi-break-item">
                  <div className="emi-break-val">Instant</div>
                  <div className="emi-break-label">Approval</div>
                </div>
              </div>
            </div>
            <div style={{textAlign: 'center',marginTop:'36px'}}>
              <a href="#test-ride" className="btn-primary">
                <i className="fa-solid fa-indian-rupee-sign"></i> Apply for Finance
              </a>
            </div>
          </div>
        </div>
      </section>
      <section id="testimonials" aria-labelledby="testimonials-title">
        <div className="section-header">
          <span className="section-tag">Voices of the Road</span>
          <h2 className="section-title" id="testimonials-title">What Our Riders Say</h2>
          <p className="section-subtitle">Over 5,000 motorcycles delivered. Here's what the brotherhood has to say.</p>
        </div>
        <div className="testimonials-track-wrap">
          <div className="testimonials-track" id="testimonials-track">
            <div className="testimonial-card">
              <div className="testimonial-quote">"</div>
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">Walked in looking for a Himalayan and walked out with a smile that
                hasn't left since. The team here truly understands riders. The test ride experience was
                absolutely phenomenal — no pressure, pure passion.</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">AM</div>
                <div>
                  <div className="testimonial-name">Arjun Mehta</div>
                  <div className="testimonial-city">Mumbai, MH · Himalayan Owner</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-quote">"</div>
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">My Classic 350 is the best purchase I've ever made. The dealership team
                was knowledgeable, honest, and made the whole process seamless. Delivery was on time and the
                bike was spotless.</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">PK</div>
                <div>
                  <div className="testimonial-name">Priya Krishanan</div>
                  <div className="testimonial-city">Bangalore, KA · Classic 350 Owner</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-quote">"</div>
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">The service center here is outstanding. Transparent pricing, quick
                turnaround, and the bike always comes back feeling brand new. I won't trust any other workshop
                with my Meteor 350.</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">RV</div>
                <div>
                  <div className="testimonial-name">Rohit Varma</div>
                  <div className="testimonial-city">Hyderabad, TS · Meteor 350 Owner</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-quote">"</div>
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">Finance was sorted in under 2 hours and I was riding my new Hunter 350
                the same week. The staff guided me through every option patiently. This is how luxury bike
                buying should feel.</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">SK</div>
                <div>
                  <div className="testimonial-name">Sameer Khanna</div>
                  <div className="testimonial-city">Delhi, DL · Hunter 350 Owner</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-quote">"</div>
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">Bought my Super Meteor 650 six months ago — it's a beast. The
                dealership's showroom experience is as premium as the bike itself. Highly recommend to every
                Royal Enfield enthusiast.</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">NC</div>
                <div>
                  <div className="testimonial-name">Nishant Chawla</div>
                  <div className="testimonial-city">Pune, MH · Super Meteor 650 Owner</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="testimonials-dots">
          <button className="dot active" aria-label="Testimonial 1"></button>
          <button className="dot" aria-label="Testimonial 2"></button>
          <button className="dot" aria-label="Testimonial 3"></button>
          <button className="dot" aria-label="Testimonial 4"></button>
          <button className="dot" aria-label="Testimonial 5"></button>
        </div>
      </section>
      <section id="contact" aria-labelledby="contact-title">
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
                <a href="mailto:hello@re-gurugram.in">hello@re-gurugram.in</a>
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
              allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              title="Royal Enfield Dealership Location"></iframe>
            <div className="map-overlay-badge">
              <i className="fa-solid fa-location-dot"></i> Royal Enfield Gurugram
            </div>
          </div>
        </div>
      </section>
      <footer>
        <div className="footer-main">
          <div className="footer-brand footer-col">
            <span className="logo-brand">Royal Enfield</span>
            <span className="logo-sub">Authorized Dealership · Est. 2005</span>
            <p>Your trusted home for Royal Enfield motorcycles, genuine parts, expert service, and easy finance —
              all under one roof.</p>
            <div className="contact-socials">
              <a href="#" className="social-btn" aria-label="Facebook"><i className="fa-brands fa-facebook-f"></i></a>
              <a href="#" className="social-btn" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a>
              <a href="#" className="social-btn" aria-label="YouTube"><i className="fa-brands fa-youtube"></i></a>
              <a href="#" className="social-btn" aria-label="WhatsApp"><i className="fa-brands fa-whatsapp"></i></a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Models</h4>
            <ul>
              <li><a href="#models">Classic 350</a></li>
              <li><a href="#models">Himalayan</a></li>
              <li><a href="#models">Meteor 350</a></li>
              <li><a href="#models">Hunter 350</a></li>
              <li><a href="#models">Bullet 350</a></li>
              <li><a href="#models">Super Meteor 650</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Dealership</h4>
            <ul>
              <li><a href="#about">About Us</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#services">Genuine Parts</a></li>
              <li><a href="#emi">Finance</a></li>
              <li><a href="#test-ride">Book Test Ride</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li><a href="tel:+911244567890">+91 124 456 7890</a></li>
              <li><a href="mailto:hello@re-gurugram.in">hello@re-gurugram.in</a></li>
              <li><a href="#contact">42, Rajpur Road, Gurugram</a></li>
            </ul>
            <div style={{marginTop:'20px'}}>
              <a href="#test-ride" className="btn-primary" style={{padding:'10px 20px',fontSize:'0.78rem'}}>Book Test
                Ride</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-copy">© 2024 Royal Enfield Gurugram. All rights reserved. An Authorized Royal Enfield
            Dealership.</p>
          <div className="footer-legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </footer>
    </>
  )
}
