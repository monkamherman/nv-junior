import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaLinkedin, FaYoutube, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* À propos */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <img src="/logo.jpg" alt="CENTIC Logo" className="h-10 w-10 mr-2 rounded" />
              CENTIC
            </h3>
            <p className="text-gray-300 mb-4">
              Centre d'Éducation aux Outils de NTIC, œuvrant pour la formation des jeunes aux métiers du numérique dans la région du Septentrion au Cameroun.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaLinkedin size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaYoutube size={20} />
              </a>
            </div>
          </div>

          {/* Liens rapides */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Accueil</Link></li>
              <li><Link to="/a-propos" className="text-gray-300 hover:text-white transition-colors">À propos</Link></li>
              <li><Link to="/formations" className="text-gray-300 hover:text-white transition-colors">Formations</Link></li>
              <li><Link to="/actualites" className="text-gray-300 hover:text-white transition-colors">Actualités</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Contactez-nous</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FaMapMarkerAlt className="mt-1 mr-2 text-primary-400" />
                <span className="text-gray-300">Maroua, Région de l'Extrême-Nord, Cameroun</span>
              </li>
              <li className="flex items-center">
                <FaPhone className="mr-2 text-primary-400" />
                <a href="tel:+237690000000" className="text-gray-300 hover:text-white transition-colors">+237 6 90 00 00 00</a>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="mr-2 text-primary-400" />
                <a href="mailto:contact@centic-cm.org" className="text-gray-300 hover:text-white transition-colors">contact@centic-cm.org</a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <p className="text-gray-300 mb-4">Inscrivez-vous à notre newsletter pour recevoir nos dernières actualités.</p>
            <form className="flex flex-col space-y-2">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                S'abonner
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-6 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} CENTIC. Tous droits réservés.
            </p>
            <div className="flex space-x-6">
              <Link to="/mentions-legales" className="text-gray-400 hover:text-white text-sm transition-colors">
                Mentions légales
              </Link>
              <Link to="/politique-confidentialite" className="text-gray-400 hover:text-white text-sm transition-colors">
                Politique de confidentialité
              </Link>
              <Link to="/conditions-utilisation" className="text-gray-400 hover:text-white text-sm transition-colors">
                Conditions d'utilisation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
