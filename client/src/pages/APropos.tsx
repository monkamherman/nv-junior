import StatsSection from '@/components/about/StatsSection';
import TeamSection from '@/components/about/TeamSection';
import { motion } from 'framer-motion';
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FaBriefcase, FaGlobeAfrica, FaSchool, FaTrophy } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const APropos: React.FC = () => {
  return (
    <div className="bg-gray-100 pb-16 pt-16">
      <Helmet>
        <title>À Propos - CENTIC</title>
        <meta
          name="description"
          content="Découvrez l'association CENTIC, son histoire, ses objectifs et son impact dans la promotion des NTIC dans la région du Septentrion au Cameroun."
        />
      </Helmet>

      <div className="mx-auto max-w-7xl px-4">
        {/* Section Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center"
        >
          <h1 className="relative mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-center text-4xl font-extrabold leading-tight text-transparent md:text-6xl">
            À Propos
            <span className="mx-auto mt-5 block h-1 w-20 rounded-sm bg-gradient-to-r from-blue-600 to-purple-600"></span>
          </h1>

          <p className="mx-auto mb-12 max-w-2xl text-center text-xl leading-relaxed text-gray-600">
            Découvrez notre engagement pour l'éducation numérique et l'insertion
            professionnelle dans la région du Septentrion
          </p>
        </motion.div>

        {/* Section Statistiques */}
        <StatsSection />

        {/* Section Présentation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 flex flex-col gap-8 md:flex-row"
        >
          <div className="flex-1">
            <div className="mb-4">
              <FaSchool className="text-5xl text-blue-600" />
            </div>
            <h2 className="mb-4 text-3xl font-bold text-gray-800">
              Présentation de l'Association CENTIC
            </h2>
            <p className="text-lg leading-relaxed text-gray-600">
              Le Centre d'Éducation aux Outils de NTIC (CENTIC) est une
              organisation créée dans le but de promouvoir l'accès et
              l'utilisation des Nouvelles Technologies de l'Information et de la
              Communication (NTIC) dans la région du Septentrion, au Cameroun.
              Fondée le 28 juin 2022, CENTIC s'est donné pour mission de combler
              le fossé numérique dans cette partie du pays où les opportunités
              d'insertion professionnelle liées aux technologies numériques
              restent encore sous-exploitées par la jeunesse.
            </p>
          </div>
          <div className="flex-1">
            <img
              src="/logo.jpg"
              alt="Logo CENTIC"
              className="h-full w-full rounded-lg object-cover shadow-lg"
            />
          </div>
        </motion.div>

        {/* Section Objectifs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 flex flex-col-reverse items-center gap-8 md:flex-row"
        >
          <div className="flex-1">
            <img
              src="/img3.jpg"
              alt="Nos Objectifs"
              className="h-full w-full rounded-lg object-cover shadow-lg"
            />
          </div>
          <div className="flex-1">
            <div className="mb-4">
              <FaTrophy className="text-5xl text-blue-600" />
            </div>
            <h2 className="mb-4 text-3xl font-bold text-gray-800">
              Nos Objectifs
            </h2>
            <ul className="space-y-2 text-lg text-gray-600">
              <li>• Renforcer les compétences numériques des jeunes</li>
              <li>• Favoriser l'insertion socio-professionnelle</li>
              <li>
                • Encourager l'autonomisation par les métiers du numérique
              </li>
              <li>• Rendre les jeunes compétitifs à l'international</li>
              <li>• Sensibiliser aux enjeux des NTIC</li>
              <li>• Réduire la fracture numérique</li>
            </ul>
          </div>
        </motion.div>

        {/* Section Impact et Engagements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 flex flex-col gap-8 md:flex-row"
        >
          <div className="flex-1">
            <div className="mb-4">
              <FaGlobeAfrica className="text-5xl text-blue-600" />
            </div>
            <h2 className="mb-4 text-3xl font-bold text-gray-800">
              Notre Impact et Engagements
            </h2>
            <p className="text-lg leading-relaxed text-gray-600">
              Depuis sa création, CENTIC a organisé de nombreuses initiatives
              marquantes, telles que des programmes de formation en
              informatique, des campagnes de sensibilisation, et des événements
              visant à promouvoir l'innovation technologique. Grâce à des
              partenariats stratégiques avec des institutions comme la
              Délégation Régionale des Postes et Télécommunications et
              l'Alliance Française de Maroua, CENTIC a pu étendre son influence
              et renforcer son impact dans l'Extrême-Nord.
            </p>
          </div>
          <div className="flex-1">
            <img
              src="/etudiante.jpg"
              alt="Notre Impact"
              className="h-full w-full rounded-lg object-cover shadow-lg"
            />
          </div>
        </motion.div>

        {/* Section Vision */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 flex flex-col-reverse items-center gap-8 md:flex-row"
        >
          <div className="flex-1">
            <img
              src="/gallerie/1.jpg"
              alt="Notre Vision"
              className="h-full w-full rounded-lg object-cover shadow-lg"
            />
          </div>
          <div className="flex-1">
            <div className="mb-4">
              <FaBriefcase className="text-5xl text-blue-600" />
            </div>
            <h2 className="mb-4 text-3xl font-bold text-gray-800">
              Notre Vision
            </h2>
            <p className="text-lg leading-relaxed text-gray-600">
              Notre vision est de créer un écosystème numérique dynamique dans
              la région du Septentrion, où chaque jeune, quelle que soit son
              origine, a accès aux outils et aux compétences nécessaires pour
              réussir dans l'économie numérique. Nous croyons en un avenir où la
              technologie devient un levier d'autonomisation et de développement
              durable pour les communautés locales.
            </p>
          </div>
        </motion.div>

        {/* Section Équipe */}
        <TeamSection />

        {/* Section CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 p-6 text-center text-white md:p-8">
            <div className="relative z-10 flex flex-col items-center">
              <FaBriefcase className="mb-4 text-6xl text-white" />
              <h2 className="mb-4 text-3xl font-extrabold text-white md:text-5xl">
                Rejoignez Notre Mission
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg font-normal text-white/90 md:text-xl">
                Ensemble, construisons un avenir numérique inclusif pour la
                jeunesse du Septentrion
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/contact"
                  className="rounded-full bg-purple-600 px-6 py-2 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Nous Contacter
                </Link>

                <Link
                  to="/devenir-benevole"
                  className="rounded-full border-2 border-white px-6 py-2 text-lg font-bold text-white transition-all duration-300 hover:bg-white/10"
                >
                  Devenir Bénévole
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default APropos;
