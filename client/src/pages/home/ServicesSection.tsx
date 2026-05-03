import { Database, Headset, Smartphone } from 'lucide-react';
import React from 'react';

type Service = {
  title: string;
  description: string;
  icon: React.ReactNode;
  image: string;
  link: string;
};

const services: Service[] = [
  {
    title: 'Sécurité des Bases de Données',
    description:
      'Affinons les designs et le contenu que vous utilisez pour fournir des solutions numériques.',
    icon: <Database className="h-6 w-6 text-blue-600" />,
    image: '/img1.jpg', // à remplacer par ton image
    link: '#',
  },
  {
    title: 'Conseil IT',
    description:
      "Conseils professionnels sur l'infrastructure et l'intégration des systèmes.",
    icon: <Headset className="h-6 w-6 text-blue-600" />,
    image: '/gallerie/3.jpg',
    link: '#',
  },
  {
    title: "Développement d'Applications",
    description:
      'Nous créons des applications web et mobiles évolutives pour les entreprises modernes.',
    icon: <Smartphone className="h-6 w-6 text-blue-600" />,
    image: '/gallerie/2.jpg',
    link: '#',
  },
];

const ServicesSection: React.FC = () => {
  return (
    <section className="bg-gray-900 px-6 py-20 text-white md:px-16">
      {/* Section header */}
      <div className="mb-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-400">
          Services IT que Nous Offrons
        </p>
        <h2 className="text-3xl font-bold md:text-4xl">
          Services IT Exclusifs
        </h2>
      </div>

      {/* Services cards */}
      <div className="grid gap-8 md:grid-cols-3">
        {services.map((service, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl bg-white text-gray-900 shadow-lg transition hover:shadow-2xl"
          >
            {/* Image */}
            <div className="relative">
              <img
                src={service.image}
                alt={service.title}
                className="h-48 w-full object-cover"
              />
              <div className="absolute left-4 top-4 rounded-lg bg-white p-2 shadow">
                {service.icon}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="mb-2 text-xl font-semibold">{service.title}</h3>
              <p className="mb-4 text-gray-600">{service.description}</p>
              <a
                href={service.link}
                className="font-medium text-blue-600 hover:underline"
              >
                Lire Plus →
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ServicesSection;
