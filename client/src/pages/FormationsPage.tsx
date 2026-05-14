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

interface FormationTrainer {
  id?: string;
  nom: string;
  prenom: string;
  email?: string | null;
  qualificationProfessionnelle?: string;
  bio?: string | null;
}

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
  formateurs: FormationTrainer[];
  categorie: string;
  niveau: string;
  prerequis: string[];
  objectifs: string[];
  image?: string;
}

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

        <div className="mb-4 text-sm text-slate-600">
          {formation.formateurs?.length
            ? formation.formateurs
                .map((formateur) => `${formateur.prenom} ${formateur.nom}`)
                .join(', ')
            : 'Formateur à déterminer'}
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

const FormationDetail: React.FC<{
  formation: Formation;
  onBack: () => void;
}> = ({ formation, onBack }) => {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
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
        <div className="space-y-6 md:col-span-2">
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

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Formateurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formation.formateurs?.length ? (
                  formation.formateurs.map((formateur, index) => (
                    <div
                      key={formateur.id || `${formateur.nom}-${index}`}
                      className="rounded-lg border p-4"
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 font-bold text-white">
                          {`${formateur.prenom?.[0] || ''}${formateur.nom?.[0] || ''}` ||
                            '?'}
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {formateur.prenom} {formateur.nom}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formateur.email || 'Email non disponible'}
                          </p>
                        </div>
                      </div>
                      {formateur.qualificationProfessionnelle && (
                        <p className="text-sm font-medium text-slate-700">
                          {formateur.qualificationProfessionnelle}
                        </p>
                      )}
                      {formateur.bio && (
                        <p className="mt-2 text-sm text-slate-600">
                          {formateur.bio}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">
                    Formateurs à déterminer
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4 text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {formation.prix.toLocaleString('fr-FR')} FCFA
                </div>
                <p className="text-sm text-gray-500">
                  Accès illimité à la formation
                </p>

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
      const formationsData = await getAllFormations();
      setFormations(formationsData);

      if (id) {
        const formation = formationsData.find((f: Formation) => f.id === id);
        if (formation) {
          setSelectedFormation(formation);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des formations:', error);
      const mockFormations: Formation[] = [
        {
          id: '1',
          titre: 'Développement Web Complet',
          description:
            'Devenez développeur web complet en apprenant HTML, CSS, JavaScript, React et Node.js.',
          contenu: `Cette formation complète vous permettra de maîtriser le développement web moderne.`,
          prix: 150000,
          duree: 120,
          dateDebut: '2024-01-15',
          dateFin: '2024-04-15',
          statut: 'OUVERTE',
          formateurs: [
            {
              nom: 'Doe',
              prenom: 'John',
              email: 'john.doe@example.com',
              qualificationProfessionnelle:
                'Architecte logiciel et formateur full-stack',
            },
          ],
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
          formateurs: [
            {
              nom: 'Smith',
              prenom: 'Jane',
              email: 'jane.smith@example.com',
              qualificationProfessionnelle: 'Data scientist et consultante IA',
            },
            {
              nom: 'Brown',
              prenom: 'Alex',
              email: 'alex.brown@example.com',
              qualificationProfessionnelle: 'Ingénieur machine learning',
            },
          ],
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

  const handleBackToList = () => {
    setSelectedFormation(null);
    navigate('/formations');
  };

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

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            Nos formations
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-gray-600">
            Découvrez nos programmes de formation conçus pour développer vos
            compétences professionnelles.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {formations.map((formation) => (
            <FormationCard
              key={formation.id}
              formation={formation}
              onSelect={handleFormationSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
