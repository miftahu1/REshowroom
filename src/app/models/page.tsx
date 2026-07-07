import SectionPageShell from '../components/SectionPageShell';

export const metadata = {
  title: 'Models | Royal Enfield',
  description: 'Explore the Royal Enfield lineup with a premium, full-page showcase.',
};

export default function ModelsPage() {
  return (
    <SectionPageShell
      eyebrow="Curated collection"
      title="Discover the motorcycle that matches your identity."
      description="From city-friendly commuters to weekend adventurers, our showroom brings together modern engineering and timeless Royal Enfield character."
      highlights={['Factory warranty', 'Flexible finance', 'Trade-in support']}
      stats={[
        { value: '15+', label: 'Motorcycles' },
        { value: '0% EMI', label: 'Flexible plans' },
        { value: '24/7', label: 'Service support' },
        { value: '4.9★', label: 'Owner rating' },
      ]}
      featureItems={[
        { title: 'Hunter 350', body: 'A nimble city icon with a sharp edge and effortless style.' },
        { title: 'Classic 350', body: 'A timeless road companion with unmistakable presence.' },
        { title: 'Himalayan', body: 'Built for rough terrain and long-distance confidence.' },
      ]}
      primaryHref="/test-ride"
      primaryLabel="Book a test ride"
      secondaryHref="/"
      secondaryLabel="Visit home"
      accentLabel="Featured lineup"
    />
  );
}
