import { useEffect, useState } from "react";

export default function useAutoTranslate(targetLang: string) {
  const [detectedLang,] = useState<string>("");

  useEffect(() => {
    const detectAndTranslate = async (text: string) => {
      try {
        const API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;
        
        // Étape 1 : Détection de la langue
        const detectionResponse = await fetch(
          `https://translation.googleapis.com/language/translate/v2/detect?key=${API_KEY}&q=${encodeURIComponent(text)}`
        );

        const detectionData = await detectionResponse.json();
        const sourceLang = detectionData.data?.detections?.[0]?.[0]?.language || "fr";
        
        // Étape 2 : Traduction si nécessaire
        if (sourceLang === targetLang) return text;

        const translationResponse = await fetch(
          `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              q: [text],
              source: sourceLang,
              target: targetLang,
              format: "text",
            }),
          }
        );

        const translationData = await translationResponse.json();
        return translationData.data?.translations?.[0]?.translatedText || text;
      } catch (error) {
        console.error("Erreur de traduction :", error);
        return text;
      }
    };

    const translateElements = async () => {
      const elements = document.querySelectorAll("[data-auto-translate]");
      
      for (const el of elements) {
        if (el.textContent) {
          const translatedText = await detectAndTranslate(el.textContent);
          el.textContent = translatedText;
        }
      }
    };

    translateElements();
  }, [targetLang]);

  return detectedLang;
}