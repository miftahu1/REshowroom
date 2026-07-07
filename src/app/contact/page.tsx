import SectionPageShell from '../components/SectionPageShell';

export const metadata = {
  title: 'Contact | Royal Enfield',
  description: 'Reach out to the Royal Enfield showroom for test rides, service, and support.',
};

export default function ContactPage() {
  return (
    <SectionPageShell
      eyebrow="Visit us"
      title="Let’s make your next ride feel effortless from the first hello."
      description="Stop by the showroom for a closer look at the latest Royal Enfield motorcycles, service support, and concierge guidance."
      highlights={['Showroom visits', 'Live bike inspection', 'Quick response']}
      stats={[
        { value: 'Mon-Sat', label: 'Open hours' },
        { value: 'Same day', label: 'Follow-up' },
        { value: 'Live', label: 'Demo support' },
        { value: 'Any model', label: 'Consultation' },
      ]}
      featureItems={[
        { title: 'Location', body: 'Visit our showroom to experience the full Royal Enfield lineup in person.' },
        { title: 'Appointments', body: 'Book a visit for a test ride, finance discussion, or service request.' },
        { title: 'Support', body: 'Our team is ready to assist with ownership, accessories, and ongoing care.' },
      ]}
      primaryHref="/test-ride"
      primaryLabel="Schedule a visit"
      secondaryHref="/"
      secondaryLabel="Back to home"
      accentLabel="Showroom experience"
    />
  );
}
