import { PaiementHistory } from '@/features/paiements/components/PaiementHistory';

export function PaymentsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Paiements</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <PaiementHistory />
        </div>
      </div>
    </div>
  );
}
