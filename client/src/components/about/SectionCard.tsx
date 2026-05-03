import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import React from 'react';

interface SectionCardProps {
  title: string;
  content: string | string[] | { [key: string]: string };
  icon: React.ReactNode;
  image: string;
  reverse?: boolean;
  children?: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  content,
  icon,
  image,
  reverse = false,
  children,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const fadeIn = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      style={{ marginBottom: '4rem' }}
    >
      <Card
        elevation={4}
        sx={{
          borderRadius: 4,
          overflow: 'hidden',
          backgroundColor: theme.palette.background.paper,
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
          },
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        }}
      >
        <Grid
          container
          direction={reverse && !isMobile ? 'row-reverse' : 'row'}
        >
          <Grid item xs={12} md={6}>
            <Box
              component="div"
              sx={{
                width: '100%',
                height: '100%',
                minHeight: '400px',
                background: `url(${image}) center/cover no-repeat`,
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                textAlign: 'center',
                p: 4,
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  p: 3,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="h4"
                  component="h3"
                  sx={{ color: 'white', mb: 2 }}
                >
                  {title}
                </Typography>
                <Box sx={{ mb: 2 }}>{icon}</Box>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <CardContent
              sx={{
                p: 5,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              {Array.isArray(content) ? (
                <Box component="ul" sx={{ pl: 2, mt: 2 }}>
                  {content.map((item, i) => (
                    <Box
                      key={i}
                      component="li"
                      sx={{
                        mb: 1.5,
                        display: 'flex',
                        alignItems: 'flex-start',
                        '&:before': {
                          content: '"•"',
                          color: theme.palette.primary.main,
                          fontWeight: 'bold',
                          display: 'inline-block',
                          width: '1em',
                          ml: -1,
                        },
                      }}
                    >
                      <Typography variant="body1" color="text.primary">
                        {item}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : typeof content === 'object' && content !== null ? (
                <Box sx={{ mt: 2 }}>
                  {Object.entries(content).map(([key, value]) => (
                    <Box key={key} sx={{ mb: 2 }}>
                      <Typography
                        variant="h6"
                        component="h4"
                        sx={{
                          fontWeight: 600,
                          mb: 0.5,
                          color: theme.palette.primary.main,
                        }}
                      >
                        {value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body1" color="text.primary" paragraph>
                  {content}
                </Typography>
              )}
              {children}
            </CardContent>
          </Grid>
        </Grid>
      </Card>
    </motion.div>
  );
};

export default SectionCard;
