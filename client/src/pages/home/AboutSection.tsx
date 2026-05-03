import { CheckCircle } from 'lucide-react';
import React from 'react';

const AboutSection: React.FC = () => {
  return (
    <section className="grid items-center gap-10 px-6 py-20 md:grid-cols-2 md:px-16">
      {/* Left - Image Section */}
      <div className="relative">
        <img
          src="/gallerie/4.jpg"
          alt="Business professional"
          className="rounded-2xl shadow-lg"
        />
        <img
          src="/img3.jpg"
          alt="Team working"
          className="absolute bottom-[-40px] left-10 w-1/2 rounded-xl border-4 border-white shadow-md"
        />
      </div>

      {/* Right - Content Section */}
      <div className="space-y-6">
        <p className="font-semibold uppercase tracking-wide text-blue-600">
          Qui Nous Sommes
        </p>
        <h2 className="text-3xl font-bold leading-snug md:text-4xl">
          Assurer Votre Réussite Avec des <br /> Solutions IT Fiables
        </h2>
        <p className="leading-relaxed text-gray-600">
          Nous sommes une organisation dédiée à la formation des jeunes dans le
          domaine des technologies de l'information. Notre mission est de
          fournir des compétences pratiques et pertinentes pour préparer la
          prochaine génération de professionnels du numérique.
        </p>

        {/* Features List */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-blue-600" size={20} />
            <span>Conseil Technologique</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="text-blue-600" size={20} />
            <span>Maintenance & Support</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="text-blue-600" size={20} />
            <span>Services Web & Mobile</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="text-blue-600" size={20} />
            <span>Collecte des Besoins</span>
          </div>
        </div>

        {/* CTA + Signature */}
        <div className="mt-6 flex items-center gap-8">
          <button className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700">
            À Propos
          </button>
          {/* <span className="font-signature text-2xl italic">Signature</span> */}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
