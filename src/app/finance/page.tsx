import SectionPageShell from '../components/SectionPageShell';

export const metadata = {
  title: 'Finance | Royal Enfield',
  description: 'Explore premium finance options for owning your Royal Enfield comfortably.',
};

export default function FinancePage() {
  return (
    <SectionPageShell
      eyebrow="Flexible ownership"
      title="Make your next ride easier with structured finance support."
      description="Whether you are buying your first Royal Enfield or upgrading your garage, our finance guidance keeps the process simple, transparent, and efficient."
      highlights={['Competitive rates', 'Quick approval', 'Flexible tenure']}
      stats={[
        { value: '0%', label: 'Intro EMI offers' },
        { value: '36m', label: 'Flexible tenure' },
        { value: 'Fast', label: 'Approval flow' },
        { value: 'All major', label: 'Finance partners' },
      ]}
      featureItems={[
        { title: 'Tailored plans', body: 'Choose a repayment structure aligned with your budget and lifestyle.' },
        { title: 'Clear guidance', body: 'We walk you through each step so the experience stays stress-free.' },
        { title: 'Trade-in options', body: 'Bring your current bike in and let us help with a smarter upgrade plan.' },
      ]}
      primaryHref="/test-ride"
      primaryLabel="Explore finance"
      secondaryHref="/"
      secondaryLabel="Back to home"
      accentLabel="Finance options"
    />
  );
}
