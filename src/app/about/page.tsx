import SectionPageShell from '../components/SectionPageShell';

export const metadata = {
  title: 'About | Royal Enfield',
  description: 'Learn about the Royal Enfield experience and the craftsmanship behind every ride.',
};

export default function AboutPage() {
  return (
    <SectionPageShell
      eyebrow="Our story"
      title="Crafted for riders who value legend, detail, and freedom."
      description="For years, we have helped riders find motorcycles that feel personal, purposeful, and built to last. Every experience is guided by expertise and genuine care."
      highlights={['Authorised dealership', 'Expert guidance', 'Premium after-sales care']}
      stats={[
        { value: '20+', label: 'Years of experience' },
        { value: '100%', label: 'Genuine parts' },
        { value: '5k+', label: 'Happy riders' },
        { value: '98%', label: 'Repeat visits' },
      ]}
      featureItems={[
        { title: 'Bespoke consultation', body: 'We help you choose the right motorcycle for your road, routine, and style.' },
        { title: 'Signature service', body: 'Routine service and premium care are handled with precision and speed.' },
        { title: 'Community-driven', body: 'We build lasting relationships around every ride, event, and milestone.' },
      ]}
      primaryHref="/contact"
      primaryLabel="Visit the showroom"
      secondaryHref="/"
      secondaryLabel="Back to home"
      accentLabel="Why riders trust us"
    />
  );
}
