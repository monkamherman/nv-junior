// import SEO from '@/components/ui/SEO'
import React from 'react';
import AboutSection from './AboutSection';
import GallerySection from './GallerySection';
import Hero from './Hero';
import ServicesSection from './ServicesSection';

const Home: React.FC = () => {
  return (
    <>
      {/* Seo compoments */}
      {/* <SEO
                title='Welcome to iPhone Store Cameroon - Your Trusted Apple Partner'
                description='Explore the latest iPhones and accessories at unbeatable prices. Enjoy a seamless shopping experience on our modern e-commerce platform.'
            /> */}

      <Hero />
      {/* <PaymentDialog
        open={true}
        onOpenChange={() => {}}
        onPaymentSubmit={async (data) => {
          // Logique de traitement du paiement
          console.log('Détails du paiement:', data);
          // Ici, vous pourriez appeler une API pour traiter le paiement
          // Par exemple :
          // await processPayment(data);
        }}
      /> */}

      <AboutSection />

      <GallerySection />
      {/* <StatsSection /> */}

      {/* <TeamSection /> */}

      <ServicesSection />
    </>
  );
};

export default Home;
