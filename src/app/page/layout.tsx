import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Royal Enfield Dealership',
  description: 'Cinematic GSAP-powered landing page for a premium Royal Enfield dealership.',
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>{children}</>
  );
}
