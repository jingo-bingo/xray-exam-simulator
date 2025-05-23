
import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Workflow from '@/components/Workflow';
import CallToAction from '@/components/CallToAction';
import Footer from '@/components/Footer';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-medical-light text-medical-dark">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Workflow />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
