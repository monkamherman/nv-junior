import SectionCard from '@/components/about/SectionCard';
import StatsSection from '@/components/about/StatsSection';
import TeamSection from '@/components/about/TeamSection';
import { Box, Button, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import React from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FaBriefcase,
  FaGlobeAfrica,
  FaSchool,
  FaTrophy,
  FaUsers,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

// Thème personnalisé
const theme = {
  colors: {
    primary: '#1976d2',
    secondary: '#9c27b0',
    success: '#2e7d32',
    info: '#0288d1',
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
    },
    grey: {
      200: '#eeeeee',
      500: '#9e9e9e',
    },
  },
  spacing: (multiplier: number) => `${8 * multiplier}px`,
  breakpoints: {
    up: () => '@media (min-width: 900px)',
    down: () => '@media (max-width: 899px)',
  },
};

const APropos: React.FC = () => {
  const sections = [
    {
      title: "Présentation de l'Association CENTIC",
      icon: <FaSchool style={{ fontSize: 50, color: theme.colors.primary }} />,
      content:
        "Le Centre d'Éducation aux Outils de NTIC (CENTIC) est une organisation créée dans le but de promouvoir l'accès et l'utilisation des Nouvelles Technologies de l'Information et de la Communication (NTIC) dans la région du Septentrion, au Cameroun. Fondée le 28 juin 2022, CENTIC s'est donné pour mission de combler le fossé numérique dans cette partie du pays où les opportunités d'insertion professionnelle liées aux technologies numériques restent encore sous-exploitées par la jeunesse.",
      image: '/logo.jpg',
      reverse: false,
    },
    {
      title: 'Nos Objectifs',
      icon: <FaTrophy style={{ fontSize: 50, color: theme.colors.primary }} />,
      content: [
        'Renforcer les compétences numériques des jeunes',
        "Favoriser l'insertion socio-professionnelle",
        "Encourager l'autonomisation par les métiers du numérique",
        "Rendre les jeunes compétitifs à l'international",
        'Sensibiliser aux enjeux des NTIC',
        'Réduire la fracture numérique',
      ],
      image: '/img3.jpg',
      reverse: true,
    },
    {
      title: 'Notre Impact et Engagements',
      icon: (
        <FaGlobeAfrica style={{ fontSize: 50, color: theme.colors.primary }} />
      ),
      content:
        "Depuis sa création, CENTIC a organisé de nombreuses initiatives marquantes, telles que des programmes de formation en informatique, des campagnes de sensibilisation, et des événements visant à promouvoir l'innovation technologique. Grâce à des partenariats stratégiques avec des institutions comme la Délégation Régionale des Postes et Télécommunications et l'Alliance Française de Maroua, CENTIC a pu étendre son influence et renforcer son impact dans l'Extrême-Nord.",
      image: '/etudiante.jpg',
      reverse: false,
    },

    {
      title: 'Notre Vision',
      icon: <FaUsers style={{ fontSize: 50, color: theme.colors.primary }} />,
      content:
        "Notre vision est de créer un écosystème numérique dynamique dans la région du Septentrion, où chaque jeune, quelle que soit son origine, a accès aux outils et aux compétences nécessaires pour réussir dans l'économie numérique. Nous croyons en un avenir où la technologie devient un levier d'autonomisation et de développement durable pour les communautés locales.",
      image: '/gallerie/1.jpg',
      reverse: true,
    },
  ];

  return (
    <div
      style={{
        paddingTop: theme.spacing(8),
        paddingBottom: theme.spacing(8),
        backgroundColor: theme.colors.background.default,
      }}
    >
      <Helmet>
        <title>À Propos - CENTIC</title>
        <meta
          name="description"
          content="Découvrez l'association CENTIC, son histoire, ses objectifs et son impact dans la promotion des NTIC dans la région du Septentrion au Cameroun."
        />
      </Helmet>

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 16px',
        }}
      >
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography
            variant="h2"
            component="h1"
            align="center"
            gutterBottom
            sx={{
              fontWeight: 800,
              mb: 3,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              lineHeight: 1.2,
              background: `linear-gradient(45deg, ${theme.colors.primary} 30%, ${theme.colors.secondary} 90%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              '&:after': {
                content: '""',
                display: 'block',
                width: '80px',
                height: '4px',
                background: `linear-gradient(45deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                margin: '20px auto 0',
                borderRadius: '2px',
              },
            }}
          ></Typography>

          <p
            style={{
              textAlign: 'center',
              color: theme.colors.text.secondary,
              marginBottom: theme.spacing(8),
              maxWidth: '800px',
              marginLeft: 'auto',
              marginRight: 'auto',
              fontSize: '1.25rem',
              lineHeight: 1.6,
            }}
          >
            Découvrez notre engagement pour l'éducation numérique et l'insertion
            professionnelle dans la région du Septentrion
          </p>
        </motion.div>

        {/* Stats Section */}
        <StatsSection />

        {/* Main Content Sections */}
        {sections.map((section, index) => (
          <SectionCard
            key={index}
            title={section.title}
            content={section.content}
            icon={section.icon}
            image={section.image}
            reverse={section.reverse}
          />
        ))}

        {/* Team Section */}
        <TeamSection />

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Box
            sx={{
              mt: 8,
              p: { xs: 4, md: 6 },
              borderRadius: 4,
              background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`,
              color: 'white',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'url("/images/pattern.png")',
                opacity: 0.1,
                pointerEvents: 'none',
              },
            }}
          >
            <Box position="relative" zIndex={1}>
              <FaBriefcase
                style={{ fontSize: 60, marginBottom: '1rem', color: 'white' }}
              />
              <Typography
                variant="h3"
                component="h2"
                gutterBottom
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  color: 'white',
                }}
              >
                Rejoignez Notre Mission
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  mb: 4,
                  maxWidth: '800px',
                  mx: 'auto',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 400,
                }}
              >
                Ensemble, construisons un avenir numérique inclusif pour la
                jeunesse du Septentrion
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  gap: 3,
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <Button
                  component={Link}
                  to="/contact"
                  variant="contained"
                  color="secondary"
                  size="large"
                  sx={{
                    borderRadius: '50px',
                    px: 4,
                    py: 1.5,
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 24px rgba(0, 0, 0, 0.2)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Nous Contacter
                </Button>

                <Button
                  component={Link}
                  to="/devenir-benevole"
                  variant="outlined"
                  color="inherit"
                  size="large"
                  sx={{
                    borderRadius: '50px',
                    px: 4,
                    py: 1.5,
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    borderWidth: '2px',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderWidth: '2px',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Devenir Bénévole
                </Button>
              </Box>
            </Box>
          </Box>
        </motion.div>
      </div>
    </div>
  );
};

export default APropos;
