import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, X } from 'lucide-react';
import { useMemo, useState } from 'react';

type FaqEntry = {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
};

type ChatMessage = {
  id: string;
  role: 'user' | 'bot';
  content: string;
};

const FAQ_ENTRIES: FaqEntry[] = [
  {
    id: 'payment',
    question: 'Comment payer une formation ?',
    answer:
      "Choisissez une formation, ouvrez l'écran de paiement, saisissez votre numéro Mobile Money puis confirmez. Le suivi du statut se fait ensuite depuis votre espace paiements.",
    keywords: ['payer', 'paiement', 'mobile money', 'orange', 'mtn'],
  },
  {
    id: 'attestation',
    question: 'Quand mon attestation est-elle disponible ?',
    answer:
      "Une attestation est disponible après validation du paiement et à la fin de la formation. Si elle existe déjà, vous pouvez la télécharger depuis la page 'Mes attestations'.",
    keywords: ['attestation', 'certificat', 'certification', 'document'],
  },
  {
    id: 'account',
    question: 'Comment créer ou récupérer mon compte ?',
    answer:
      "L'inscription passe par email et code OTP. Si votre session expire, reconnectez-vous depuis la page de connexion pour régénérer un jeton valide.",
    keywords: ['compte', 'connexion', 'login', 'otp', 'inscription', 'session'],
  },
  {
    id: 'support',
    question: 'Que faire en cas de problème ?',
    answer:
      "Commencez par réessayer l'action. Si le problème persiste, relevez le message affiché et contactez l'équipe support avec le contexte de l'opération concernée.",
    keywords: ['erreur', 'probleme', 'support', 'bug', 'incident'],
  },
];

function scoreEntry(input: string, entry: FaqEntry) {
  const normalized = input.toLowerCase();
  return entry.keywords.reduce(
    (score, keyword) => (normalized.includes(keyword) ? score + 1 : score),
    normalized.includes(entry.question.toLowerCase()) ? 2 : 0
  );
}

function buildAnswer(input: string) {
  const ranked = FAQ_ENTRIES
    .map((entry) => ({ entry, score: scoreEntry(input, entry) }))
    .sort((a, b) => b.score - a.score);

  if (!ranked[0] || ranked[0].score === 0) {
    return "Je n'ai pas trouvé de réponse précise. Essayez avec des mots-clés comme paiement, attestation, connexion ou support.";
  }

  return ranked[0].entry.answer;
}

export function FaqChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'bot',
      content:
        "Je peux répondre aux questions fréquentes sur les paiements, attestations et connexions.",
    },
  ]);

  const quickQuestions = useMemo(
    () => FAQ_ENTRIES.map((entry) => entry.question),
    []
  );

  const submitQuestion = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;

    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: 'user', content: trimmed },
      {
        id: crypto.randomUUID(),
        role: 'bot',
        content: buildAnswer(trimmed),
      },
    ]);
    setInput('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-[340px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">FAQ CENTIC</p>
              <p className="text-xs text-slate-300">Réponses rapides</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-slate-800 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="h-[360px] bg-slate-50 px-4 py-3">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={
                    message.role === 'bot'
                      ? 'mr-8 rounded-2xl rounded-tl-md bg-white p-3 text-sm text-slate-700 shadow-sm'
                      : 'ml-8 rounded-2xl rounded-tr-md bg-sky-600 p-3 text-sm text-white'
                  }
                >
                  {message.content}
                </div>
              ))}

              <div className="flex flex-wrap gap-2 pt-2">
                {quickQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs text-slate-700 transition hover:border-sky-500 hover:text-sky-600"
                    onClick={() => submitQuestion(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </ScrollArea>

          <form
            className="flex items-center gap-2 border-t bg-white p-3"
            onSubmit={(event) => {
              event.preventDefault();
              submitQuestion(input);
            }}
          >
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Posez votre question"
              className="border-slate-300"
            />
            <Button type="submit" size="icon" className="bg-sky-600 hover:bg-sky-700">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      ) : (
        <Button
          type="button"
          className="h-14 rounded-full bg-slate-900 px-5 text-white shadow-xl hover:bg-slate-800"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="mr-2 h-5 w-5" />
          FAQ
        </Button>
      )}
    </div>
  );
}
