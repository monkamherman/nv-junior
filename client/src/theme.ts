import type { MantineThemeOverride } from '@mantine/core';

export const theme: MantineThemeOverride = {
  // Couleurs principales
  colors: {
    // Vous pouvez personnaliser les couleurs ici
    // Exemple avec la couleur bleue par défaut de Mantine
    blue: [
      '#e6f7ff',
      '#b3e0ff',
      '#80c9ff',
      '#4db2ff',
      '#1a9bff',
      '#0082e6',
      '#0066b3',
      '#004d80',
      '#00334d',
      '#001a1a',
    ],
  },

  // Police par défaut
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',

  // Taille de police par défaut
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
  },

  // Espacement
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },

  // Rayon des coins (bordure arrondie)
  radius: {
    xs: '2px',
    sm: '4px',
    md: '8px',
    lg: '16px',
    xl: '32px',
  },

  // Points de rupture pour le responsive
  breakpoints: {
    xs: '36em', // 576px
    sm: '48em', // 768px
    md: '62em', // 992px
    lg: '75em', // 1200px
    xl: '88em', // 1408px
  },

  // Autres options de thème
  primaryColor: 'red',
  primaryShade: 6,

  // Personnalisation des composants
  components: {
    // Exemple de personnalisation du bouton
    Button: {
      defaultProps: {
        size: 'md',
        radius: 'md',
      },
    },
    // Vous pouvez ajouter d'autres composants ici
  },

  // Autres propriétés globales
  other: {
    // Vous pouvez ajouter des propriétés personnalisées ici
    // qui seront accessibles via le hook useMantineTheme()
  },
};

export default theme;
