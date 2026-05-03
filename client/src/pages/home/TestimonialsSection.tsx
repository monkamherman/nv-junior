import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';
import { Carousel } from '@/components/ui/carousel';

const testimonials = [
  {
    name: 'Marie Dupont',
    role: 'Étudiante en Développement Web',
    content: 'Les formations dispensées m\'ont permis d\'acquérir des compétences solides en programmation et de réaliser mes projets personnels avec succès.',
    image: '/avatar1.jpg'
  },
  {
    name: 'Jean Martin',
    role: 'Développeur Junior',
    content: 'Grâce à ce programme, j\'ai pu intégrer une entreprise tech et contribuer à des projets innovants.',
    image: '/avatar2.jpg'
  },
  {
    name: 'Sophie Leroy',
    role: 'Designer UX/UI',
    content: 'L\'approche pratique et les conseils personnalisés m\'ont aidée à perfectionner mes compétences en design.',
    image: '/avatar3.jpg'
  }
];

const TestimonialsSection: React.FC = () => {
  const testimonialItems = testimonials.map((testimonial, index) => (
    <Card key={index} className="mx-auto max-w-lg">
      <CardContent className="p-6 text-center">
        <Quote className="mx-auto mb-4 h-8 w-8 text-primary" />
        <p className="mb-4 text-lg italic text-muted-foreground">
          "{testimonial.content}"
        </p>
        <div className="flex items-center justify-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            {testimonial.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="font-semibold">{testimonial.name}</p>
            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  ));

  return (
    <section className="bg-muted/20 px-4 py-16">
      <div className="mx-auto max-w-7xl text-center">
        <h2 className="mb-12 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-4xl font-bold text-transparent">
          Témoignages
        </h2>
        <Carousel items={testimonialItems} />
      </div>
    </section>
  );
};

export default TestimonialsSection;
