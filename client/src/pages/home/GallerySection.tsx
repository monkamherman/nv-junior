import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Images, ZoomIn } from 'lucide-react';
import React, { useState } from 'react';
import { Carousel } from '../../components/ui/carousel';

// Configuration des images de la galerie
const galleryImages = [
  { id: 1, src: '/gallerie/1.jpg', alt: 'Image 1', category: 'Événement' },
  { id: 2, src: '/gallerie/2.jpg', alt: 'Image 2', category: 'Formation' },
  { id: 3, src: '/gallerie/3.jpg', alt: 'Image 3', category: 'Événement' },
  { id: 4, src: '/gallerie/4.jpg', alt: 'Image 4', category: 'Projet' },
  { id: 5, src: '/gallerie/5.jpg', alt: 'Image 5', category: 'Formation' },
  { id: 6, src: '/gallerie/6.jpg', alt: 'Image 6', category: 'Événement' },
  { id: 7, src: '/gallerie/7.jpg', alt: 'Image 7', category: 'Projet' },
  { id: 8, src: '/gallerie/8.jpg', alt: 'Image 8', category: 'Formation' },
  { id: 9, src: '/gallerie/9.jpg', alt: 'Image 9', category: 'Événement' },
];

const GallerySection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');

  // Filtrer les images par catégorie
  const filteredImages =
    selectedCategory === 'Tous'
      ? galleryImages
      : galleryImages.filter((img) => img.category === selectedCategory);

  // Obtenir les catégories uniques
  const categories = [
    'Tous',
    ...Array.from(new Set(galleryImages.map((img) => img.category))),
  ];

  const galleryItems = filteredImages.map((image) => (
    <Dialog key={image.id}>
      <DialogTrigger asChild>
        <Card className="group cursor-pointer overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <CardContent className="relative p-0">
            <div className="aspect-square overflow-hidden bg-muted">
              <img
                src={image.src}
                alt={image.alt}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
            </div>

            {/* Overlay avec informations */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{image.alt}</span>
                  <ZoomIn className="h-4 w-4" />
                </div>
                <Badge variant="secondary" className="mt-2 text-xs">
                  {image.category}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      {/* Dialog pour l'affichage en plein écran */}
      <DialogContent className="w-full max-w-4xl bg-background/95 p-0 backdrop-blur-sm">
        <div className="relative">
          <img
            src={image.src}
            alt={image.alt}
            className="h-auto max-h-[80vh] w-full object-contain"
          />
          <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-black/80 p-3 backdrop-blur-sm">
            <div className="flex items-center justify-between text-white">
              <span className="font-medium">{image.alt}</span>
              <Badge variant="secondary">{image.category}</Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  ));

  return (
    <section className="bg-gradient-to-b from-background to-muted/20 px-4 py-16">
      <div className="mx-auto max-w-7xl">
        {/* En-tête de la section */}
        <div className="mb-12 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Images className="h-8 w-8 text-primary" />
            <h2 className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-4xl font-bold text-transparent">
              Galerie
            </h2>
          </div>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Découvrez nos moments forts, formations et réalisations à travers
            notre galerie photo
          </p>
        </div>

        {/* Filtres par catégorie */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? 'default' : 'secondary'}
              className="cursor-pointer px-4 py-2 text-sm font-medium transition-all hover:scale-105"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Carrousel de la galerie */}
        <Carousel items={galleryItems} itemsPerSlide={3} />

        {/* Message si aucune image */}
        {filteredImages.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-lg text-muted-foreground">
              Aucune image trouvée dans la catégorie "{selectedCategory}"
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default GallerySection;
