import './globals.css';
import type { Metadata } from 'next';
import SectionPageShell from '@/components/SectionPageShell';

export const metadata: Metadata = {
  title: 'Royal Enfield Showroom - Funshine Getaways pvt ltd',
  description: 'Authorised Royal Enfield dealership in Sivasagar. Discover the latest models, book a test ride, and experience the thrill of riding.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" 
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" 
          crossOrigin="anonymous" 
          referrerPolicy="no-referrer" 
        />
      </head>
      <body>
        <SectionPageShell>{children}</SectionPageShell>
      </body>
    </html>
  );
}
