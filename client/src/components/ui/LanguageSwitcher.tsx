import { useState, useEffect } from "react"
import useAutoTranslate from "../../hooks/useAutoTranslate"

function LanguageSelector() {
  const [lang, setLang] = useState(localStorage.getItem("lang") || "fr") 

  // Appliquer la traduction automatique
  useAutoTranslate(lang)
  
  useEffect(() => {
    localStorage.setItem("lang", lang) // Sauvegarde la langue pour la persistance
  }, [lang])

  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value)}
      className="p-2 bg-transparent outline-none dark:bg-dark"
    >
      <option value="fr" className="bg-transparent">🇫🇷</option>
      <option value="en" className="bg-transparent">🇬🇧</option>
      <option value="es" className="bg-transparent">🇪🇸</option>
    </select>
  )
}

export default LanguageSelector
