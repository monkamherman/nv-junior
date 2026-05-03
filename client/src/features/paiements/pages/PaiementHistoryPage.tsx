import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PaiementHistory } from '../components/PaiementHistory';

export default function PaiementHistoryPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Historique des paiements</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <PaiementHistory />
        </div>
      </div>
    </div>
  );
}
