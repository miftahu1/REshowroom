import SectionPageShell from '../components/SectionPageShell';

export const metadata = {
  title: 'Services | Royal Enfield',
  description: 'See the service, support, and ownership perks available at our showroom.',
};

export default function ServicesPage() {
  return (
    <SectionPageShell
      eyebrow="Ownership support"
      title="Service that feels as premium as the motorcycles themselves."
      description="From routine maintenance to custom care plans, every service visit is designed to keep your ride dependable and refined."
      highlights={['Express service', 'Genuine parts', 'Custom care plans']}
      stats={[
        { value: '1-day', label: 'Express service' },
        { value: '100%', label: 'Genuine parts' },
        { value: '3x', label: 'Faster turnaround' },
        { value: 'All models', label: 'Covered' },
      ]}
      featureItems={[
        { title: 'Scheduled servicing', body: 'Maintain peak performance with expert care plans tailored to your model.' },
        { title: 'Accessory styling', body: 'Upgrade your ride with premium accessories and performance touches.' },
        { title: 'Roadside confidence', body: 'We help riders stay supported before, during, and after every journey.' },
      ]}
      primaryHref="/contact"
      primaryLabel="Request service"
      secondaryHref="/"
      secondaryLabel="Back to home"
      accentLabel="Service experience"
    />
  );
}
