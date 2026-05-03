import { motion } from 'framer-motion';
import { Linkedin, Twitter } from 'lucide-react';
import React from 'react';

const teamMembers = [
  {
    name: 'FALANG MOUYEBE Emmanuel',
    role: 'Président Fondateur',
    bio: 'Fondateur et visionnaire de CENTIC, expert en organisation et développement institutionnel.',
    image: '/logo.jpg',
  },
  {
    name: 'Banfack Ngueisop Arcel',
    role: 'Cellule Communication et Partenariats',
    bio: 'Responsable de la communication externe et des partenariats stratégiques de CENTIC.',
    image: '/logo.jpg',
  },
  {
    name: 'Secrétaire Général',
    role: 'Administration et Coordination',
    bio: 'Charge de la coordination administrative et de la gestion interne des opérations.',
    image: '/logo.jpg',
  },
  {
    name: 'Trésorier',
    role: 'Gestion Financière',
    bio: 'Responsable de la gestion financière et du budget des projets de formation.',
    image: '/logo.jpg',
  },
];

const TeamSection: React.FC = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
      },
    }),
  };

  return (
    <section className="mb-8 py-16">
      <h2 className="mb-12 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-center text-4xl font-bold text-transparent">
        Notre Équipe
      </h2>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {teamMembers.map((member, index) => (
          <motion.div
            key={member.name}
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={index}
            className="h-full"
          >
            <div className="flex h-full flex-col items-center rounded-lg bg-white p-6 text-center transition-all duration-300 hover:-translate-y-2 hover:transform hover:shadow-xl">
              <img
                src={member.image}
                alt={member.name}
                className="mb-4 h-32 w-32 rounded-full border-4 border-blue-600 transition-transform duration-300 hover:scale-105"
              />
              <h3 className="mb-2 text-xl font-bold">{member.name}</h3>
              <p className="mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-semibold text-blue-600 text-transparent">
                {member.role}
              </p>
              <p className="mb-4 text-gray-600">{member.bio}</p>

              <div className="mt-auto flex gap-3 pt-4">
                <a
                  href="#"
                  aria-label={`LinkedIn de ${member.name}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-all duration-300 hover:-translate-y-1 hover:transform hover:bg-blue-600 hover:text-white"
                >
                  <Linkedin size={16} />
                </a>
                <a
                  href="#"
                  aria-label={`Twitter de ${member.name}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-400 transition-all duration-300 hover:-translate-y-1 hover:transform hover:bg-blue-400 hover:text-white"
                >
                  <Twitter size={16} />
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default TeamSection;
