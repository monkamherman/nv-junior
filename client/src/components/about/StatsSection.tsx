import { Box, Typography, useTheme } from '@mui/material';
import Grid from '@mui/material/Grid';
import { motion } from 'framer-motion';
import React from 'react';
import { FaGlobe, FaSchool, FaTrophy, FaUsers } from 'react-icons/fa';

const stats = [
  {
    icon: <FaSchool size={50} />,
    value: '500+',
    label: 'Jeunes formés',
    color: 'primary.main',
  },
  {
    icon: <FaUsers size={50} />,
    value: '20+',
    label: 'Communautés touchées',
    color: 'secondary.main',
  },
  {
    icon: <FaTrophy size={50} />,
    value: '15',
    label: 'Projets réalisés',
    color: 'success.main',
  },
  {
    icon: <FaGlobe size={50} />,
    value: '10',
    label: 'Partenariats',
    color: 'info.main',
  },
];

const StatsSection: React.FC = () => {
  const theme = useTheme();

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
    <Box
      sx={{
        py: 8,
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        color: 'white',
        borderRadius: 4,
        mb: 8,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("/font.jpeg")',
          opacity: 0.1,
          pointerEvents: 'none',
        },
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Typography
          variant="h3"
          component="h2"
          align="center"
          sx={{
            fontWeight: 700,
            mb: 6,
            color: 'white',
          }}
        >
          Notre Impact en Chiffres
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {stats.map((stat, index) => (
            <Grid item="true" xs={6} sm={6} md={3} key={stat.label}>
              <motion.div
                variants={fadeIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={index}
              >
                <Box
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 4,
                    p: 3,
                    height: '100%',
                    textAlign: 'center',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      mb: 2,
                      color: 'white',
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography
                    variant="h2"
                    component="div"
                    sx={{
                      fontWeight: 800,
                      mb: 1,
                      fontSize: { xs: '2.5rem', sm: '3rem' },
                      background: 'linear-gradient(to right, #fff, #e0e0e0)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)' }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default StatsSection;
