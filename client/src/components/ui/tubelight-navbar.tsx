import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

interface NavBarProps {
  items: NavItem[];
  className?: string;
}

export function NavBar({ items, className }: NavBarProps) {
  const location = useLocation();

  const activeTab =
    items.find((item) => location.pathname === item.url)?.name || items[0].name;

  return (
    <div
      className={cn(
        'fixed bottom-0 left-1/2 z-50 mb-6 -translate-x-1/2 sm:top-0 sm:pt-6',
        className
      )}
    >
      <div className="flex items-center gap-3 rounded-full border border-border bg-background/5 px-1 py-1 shadow-lg backdrop-blur-lg">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;

          return (
            <Link
              key={item.name}
              to={item.url}
              className={cn(
                'relative cursor-pointer rounded-full px-6 py-2 text-sm font-semibold transition-colors',
                'text-foreground/80 hover:text-primary',
                isActive && 'bg-muted text-primary'
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 -z-10 w-full rounded-full bg-primary/5"
                  initial={false}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 h-1 w-8 -translate-x-1/2 rounded-t-full bg-primary">
                    <div className="absolute -left-2 -top-2 h-6 w-12 rounded-full bg-primary/20 blur-md" />
                    <div className="absolute -top-1 h-6 w-8 rounded-full bg-primary/20 blur-md" />
                    <div className="absolute left-2 top-0 h-4 w-4 rounded-full bg-primary/20 blur-sm" />
                  </div>
                </motion.div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
