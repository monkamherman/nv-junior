import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AttestationButton } from '@/features/attestations/components/AttestationButton';
import { getAllFormations } from '@/features/formations/api/formations';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  AlertCircle,
  Calendar,
  ChevronLeft,
  Clock,
  DollarSign,
  Users,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Types
interface Formation {
  id: string;
  titre: string;
  description: string;
  contenu: string;
  prix: number;
  duree: number;
  dateDebut: string;
  dateFin: string;
  statut: string;
  formateur: {
    nom: string;
    prenom: string;
    email: string;
  };
  categorie: string;
  niveau: string;
  prerequis: string[];
  objectifs: string[];
  image?: string;
}

// Composant FormationCard pour l'affichage en grille
const FormationCard: React.FC<{
  formation: Formation;
  onSelect: (formation: Formation) => void;
}> = ({ formation, onSelect }) => {
  return (
    <Card className="group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative overflow-hidden rounded-t-lg">
        {formation.image ? (
          <img
            src={formation.image}
            alt={formation.titre}
            className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
            <div className="p-4 text-center text-white">
              <h3 className="mb-2 text-xl font-bold">{formation.titre}</h3>
              <p className="text-sm opacity-90">{formation.categorie}</p>
            </div>
          </div>
        )}
        <div className="absolute right-2 top-2">
          <Badge
            variant={formation.statut === 'OUVERTE' ? 'default' : 'secondary'}
          >
            {formation.statut === 'OUVERTE' ? 'Ouverte' : formation.statut}
          </Badge>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="mb-2 line-clamp-2 text-xl font-semibold">
            {formation.titre}
          </h3>
          <p className="line-clamp-3 text-sm text-gray-600">
            {formation.description}
          </p>
        </div>

        <div className="mb-4 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>{formation.duree}h</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={16} />
            <span>{formation.niveau}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-lg font-bold text-blue-600">
            <DollarSign size={20} />
            <span>{formation.prix.toLocaleString('fr-FR')} FCFA</span>
          </div>
          <Button
            onClick={() => onSelect(formation)}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            Voir plus
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Composant FormationDetail pour les détails complets
const FormationDetail: React.FC<{
  formation: Formation;
  onBack: () => void;
}> = ({ formation, onBack }) => {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ChevronLeft size={20} />
          Retour aux formations
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Contenu principal */}
        <div className="space-y-6 md:col-span-2">
          {/* Image et titre */}
          <Card>
            <div className="relative overflow-hidden rounded-t-lg">
              {formation.image ? (
                <img
                  src={formation.image}
                  alt={formation.titre}
                  className="h-64 w-full object-cover"
                />
              ) : (
                <div className="flex h-64 w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                  <div className="p-4 text-center text-white">
                    <h2 className="mb-2 text-3xl font-bold">
                      {formation.titre}
                    </h2>
                    <p className="text-lg opacity-90">{formation.categorie}</p>
                  </div>
                </div>
              )}
              <div className="absolute right-4 top-4">
                <Badge
                  variant={
                    formation.statut === 'OUVERTE' ? 'default' : 'secondary'
                  }
                >
                  {formation.statut === 'OUVERTE'
                    ? 'Ouverte'
                    : formation.statut}
                </Badge>
              </div>
            </div>

            <CardContent className="p-6">
              <h1 className="mb-4 text-3xl font-bold">{formation.titre}</h1>
              <p className="mb-6 leading-relaxed text-gray-600">
                {formation.description}
              </p>

              <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="flex items-center gap-2">
                  <Clock className="text-blue-600" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Durée</p>
                    <p className="font-semibold">{formation.duree} heures</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="text-blue-600" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Début</p>
                    <p className="font-semibold">
                      {format(new Date(formation.dateDebut), 'dd MMM yyyy', {
                        locale: fr,
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="text-blue-600" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Niveau</p>
                    <p className="font-semibold">{formation.niveau}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="text-blue-600" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Prix</p>
                    <p className="font-semibold">
                      {formation.prix.toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contenu détaillé */}
          <Card>
            <CardHeader>
              <CardTitle>Contenu de la formation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap leading-relaxed">
                  {formation.contenu}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Objectifs */}
          {formation.objectifs && formation.objectifs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Objectifs de la formation</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {formation.objectifs.map((objectif, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-600"></div>
                      <span>{objectif}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Prérequis */}
          {formation.prerequis && formation.prerequis.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Prérequis</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {formation.prerequis.map((prerequi, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-orange-500"></div>
                      <span>{prerequi}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Formateur */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Formateur
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-2xl font-bold text-white">
                  {formation.formateur
                    ? `${formation.formateur.prenom?.[0] || ''}${formation.formateur.nom?.[0] || ''}`
                    : '?'}
                </div>
                <h3 className="font-semibold">
                  {formation.formateur
                    ? `${formation.formateur.prenom || ''} ${formation.formateur.nom || ''}`
                    : 'Formateur à déterminer'}
                </h3>
                <p className="mb-2 text-sm text-gray-500">
                  {formation.formateur?.email || 'Email non disponible'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4 text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {formation.prix.toLocaleString('fr-FR')} FCFA
                </div>
                <p className="text-sm text-gray-500">
                  Accès illimité à la formation
                </p>

                {/* Intégrer le bouton d'attestation ici */}
                <AttestationButton
                  formationId={formation.id}
                  formationPrix={formation.prix}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                />

                <div className="space-y-1 text-xs text-gray-500">
                  <p>• Accès immédiat après paiement</p>
                  <p>• Attestation de fin de formation</p>
                  <p>• Support technique inclus</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Page principale
export default function FormationsPage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { id } = useParams();

  const loadFormations = useCallback(async () => {
    try {
      setLoading(true);

      // Récupérer les données en temps réel depuis l'API
      const formationsData = await getAllFormations();

      setFormations(formationsData);

      // Si un ID est spécifié, charger cette formation
      if (id) {
        const formation = formationsData.find((f: Formation) => f.id === id);
        if (formation) {
          setSelectedFormation(formation);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des formations:', error);
      // En cas d'erreur API, utiliser les données mockées
      const mockFormations: Formation[] = [
        {
          id: '1',
          titre: 'Développement Web Complet',
          description:
            'Devenez développeur web complet en apprenant HTML, CSS, JavaScript, React et Node.js.',
          contenu: `Cette formation complète vous permettra de maîtriser le développement web moderne.

Module 1: HTML & CSS Fundamentals
- Structure sémantique HTML5
- Design responsive avec CSS Grid et Flexbox
- Animations et transitions CSS

Module 2: JavaScript Avancé
- Concepts avancés de JavaScript
- Manipulation du DOM
- API et fetch
- Programmation asynchrone

Module 3: React & Frontend
- Composants et hooks
- State management
- Routing avec React Router
- Redux Toolkit

Module 4: Backend avec Node.js
- Express.js
- Bases de données SQL et NoSQL
- API REST
- Authentification JWT

Module 5: Projet Final
- Création d'une application complète
- Déploiement
- Best practices`,
          prix: 150000,
          duree: 120,
          dateDebut: '2024-01-15',
          dateFin: '2024-04-15',
          statut: 'OUVERTE',
          formateur: {
            nom: 'Doe',
            prenom: 'John',
            email: 'john.doe@example.com',
          },
          categorie: 'Développement',
          niveau: 'Intermédiaire',
          prerequis: [
            'Connaissances de base en programmation',
            'Ordinateur avec connexion internet',
            'Motivation et engagement',
          ],
          objectifs: [
            'Maîtriser les technologies web modernes',
            'Créer des applications web complètes',
            'Déployer des projets en production',
            'Préparer un portfolio professionnel',
          ],
        },
        {
          id: '2',
          titre: "Introduction à l'IA et Machine Learning",
          description:
            "Découvrez les fondamentaux de l'intelligence artificielle et du machine learning.",
          contenu: "Une introduction complète aux concepts d'IA et de ML...",
          prix: 200000,
          duree: 80,
          dateDebut: '2024-02-01',
          dateFin: '2024-03-15',
          statut: 'OUVERTE',
          formateur: {
            nom: 'Smith',
            prenom: 'Jane',
            email: 'jane.smith@example.com',
          },
          categorie: 'Intelligence Artificielle',
          niveau: 'Débutant',
          prerequis: ['Mathématiques de base', 'Logique de programmation'],
          objectifs: [
            "Comprendre les concepts d'IA",
            'Implémenter des algorithmes ML simples',
          ],
        },
      ];

      setFormations(mockFormations);
      setError(
        'Mode démonstration - API non disponible. Les données affichées sont des exemples.'
      );

      if (id) {
        const formation = mockFormations.find((f) => f.id === id);
        if (formation) {
          setSelectedFormation(formation);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadFormations();
  }, [loadFormations]);

  const handleFormationSelect = (formation: Formation) => {
    setSelectedFormation(formation);
    navigate(`/formations/${formation.id}`);
  };

  // ...
  const handleBackToList = () => {
    setSelectedFormation(null);
    navigate('/formations');
  };

  // Afficher un avertissement si on est en mode démo, mais continuer d'afficher les formations
  const showDemoWarning = error && error.includes('Mode démonstration');

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-lg">Chargement des formations...</p>
        </div>
      </div>
    );
  }

  // Si erreur critique (pas mode démo), afficher l'erreur
  if (error && !showDemoWarning) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-600">{error}</p>
          <Button onClick={loadFormations}>Réessayer</Button>
        </div>
      </div>
    );
  }

  if (selectedFormation) {
    return (
      <FormationDetail
        formation={selectedFormation}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Avertissement mode démo */}
      {showDemoWarning && (
        <div className="border-b border-yellow-200 bg-yellow-50">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold text-gray-900">
              Nos Formations
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-gray-600">
              Découvrez nos formations de qualité pour développer vos
              compétences et atteindre vos objectifs professionnels
            </p>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {formations.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg text-gray-500">
              Aucune formation disponible pour le moment.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {formations.map((formation) => (
              <FormationCard
                key={formation.id}
                formation={formation}
                onSelect={handleFormationSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
