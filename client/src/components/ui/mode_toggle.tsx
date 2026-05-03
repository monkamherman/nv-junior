import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  // Fonction pour basculer entre les thèmes
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };
  return (
    <Button variant="outline" size="icon" className="dark:shadow-dark-mode shadow-light " onClick={toggleTheme}>
      {/* Icône du soleil en mode clair */}
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:scale-0 dark:-rotate-90" />
      {/* Icône de la lune en mode sombre */}
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:scale-100 dark:rotate-0" />
    </Button>
  );
}