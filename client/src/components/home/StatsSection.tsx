import { motion } from 'framer-motion';
import { Globe, GraduationCap, Trophy, Users } from 'lucide-react';
import React from 'react';

const stats = [
  {
    icon: <GraduationCap size={50} />,
    value: '500+',
    label: 'Jeunes formés',
  },
  {
    icon: <Users size={50} />,
    value: '20+',
    label: 'Communautés touchées',
  },
  {
    icon: <Trophy size={50} />,
    value: '15',
    label: 'Projets réalisés',
  },
  {
    icon: <Globe size={50} />,
    value: '10',
    label: 'Partenariats',
  },
];

const StatsSection: React.FC = () => {
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
    <section className="relative mb-8 overflow-hidden py-16">
      <div
        className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600"
        style={{
          backgroundImage: 'url("/font.jpeg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.1,
        }}
      />

      <div className="container relative z-10 mx-auto px-4">
        <h2 className="mb-12 text-center text-4xl font-bold text-white">
          Notre Impact en Chiffres
        </h2>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={index}
              className="text-center"
            >
              <div className="h-full rounded-lg bg-white/10 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:transform hover:shadow-xl">
                <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-white">
                  {stat.icon}
                </div>
                <div className="mb-2 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-3xl font-black text-transparent md:text-4xl">
                  {stat.value}
                </div>
                <div className="text-lg font-semibold text-white/90">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
