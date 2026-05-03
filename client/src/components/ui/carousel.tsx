import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface CarouselProps {
  items: React.ReactNode[];
  autoPlay?: boolean;
  interval?: number;
  className?: string;
  itemsPerSlide?: number;
}

export function Carousel({
  items,
  autoPlay = true,
  interval = 5000,
  className,
  itemsPerSlide = 1,
}: CarouselProps) {
  const [current, setCurrent] = useState(0);

  const slides = [];
  for (let i = 0; i < items.length; i += itemsPerSlide) {
    slides.push(items.slice(i, i + itemsPerSlide));
  }

  useEffect(() => {
    if (autoPlay && slides.length > 1) {
      const timer = setInterval(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
      }, interval);
      return () => clearInterval(timer);
    }
  }, [autoPlay, interval, slides.length]);

  const next = () => setCurrent((current + 1) % slides.length);
  const prev = () => setCurrent((current - 1 + slides.length) % slides.length);

  if (slides.length === 0) return null;

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <div className="flex w-full justify-center gap-4">
            {slides[current].map((item, index) => (
              <div key={index} className="flex-1">
                {item}
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {slides.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
            onClick={prev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
            onClick={next}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === current ? 'bg-primary' : 'bg-muted'
                }`}
                onClick={() => setCurrent(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
