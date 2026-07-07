import SectionPageShell from '../components/SectionPageShell';

export const metadata = {
  title: 'Test Ride | Royal Enfield',
  description: 'Book a Royal Enfield test ride and experience the ride in person.',
};

export default function TestRidePage() {
  return (
    <SectionPageShell
      eyebrow="Try before you commit"
      title="Feel the torque, balance, and presence of a Royal Enfield first hand."
      description="Schedule a personal test ride and let our team guide you through the model that fits your style and riding goals."
      highlights={['Guided ride', 'Model selection', 'Flexible timing']}
      stats={[
        { value: '30 min', label: 'Ride slots' },
        { value: 'Any day', label: 'Availability' },
        { value: 'Live', label: 'Expert guide' },
        { value: 'Premium', label: 'Safety briefing' },
      ]}
      featureItems={[
        { title: 'Personalized route', body: 'Choose a route that matches your comfort level and preferred riding experience.' },
        { title: 'Expert guidance', body: 'Our team will help you compare models and find the best fit.' },
        { title: 'Booking support', body: 'We make the process simple, quick, and stress-free from start to finish.' },
      ]}
      primaryHref="/contact"
      primaryLabel="Reserve your slot"
      secondaryHref="/"
      secondaryLabel="Back to home"
      accentLabel="Test ride experience"
    />
  );
}
