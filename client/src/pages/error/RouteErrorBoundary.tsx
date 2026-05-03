import { getErrorMessage } from '@/lib/errors';
import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';

export default function RouteErrorBoundary() {
  const error = useRouteError();

  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : 'Une erreur est survenue';

  const description = isRouteErrorResponse(error)
    ? error.data?.message || "La page demandée n'a pas pu être chargée."
    : getErrorMessage(error, "La page demandée n'a pas pu être chargée.");

  return (
    <section className="container flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="max-w-xl space-y-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
          Incident client
        </p>
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">{title}</h1>
          <p className="text-base text-muted-foreground md:text-lg">{description}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Recharger
          </button>
          <Link
            to="/"
            className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-accent"
          >
            Retour a l'accueil
          </Link>
        </div>
      </div>
    </section>
  );
}
