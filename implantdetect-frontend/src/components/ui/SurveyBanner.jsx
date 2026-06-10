import { ClipboardList, AlertTriangle } from "lucide-react";

const showSurvey = import.meta.env.VITE_SHOW_SURVEY === "true";
const surveyUrl = import.meta.env.VITE_SURVEY_URL;

const SurveyBanner = () => {
  if (!showSurvey || !surveyUrl) return null;

  return (
    <div className="mb-8 rounded-xl border border-primary-200 bg-gradient-to-r from-primary-50 to-accent-50 p-5 shadow-sm animate-fade-in">
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-11 h-11 rounded-full bg-primary-100 hidden sm:flex items-center justify-center">
          <ClipboardList className="h-5 w-5 text-primary-600" />
        </div>

        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900">
            Obrigado por experimentar o ImplantDetect! 🙌
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Esta é uma versão em fase de testes e queremos saber sua experiência
            usando a plataforma. A pesquisa é anônima e leva menos de 5 minutos.
          </p>

          <div className="flex items-start gap-2 mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              A base de implantes ainda é pequena, então a detecção funciona de
              forma limitada por enquanto.
            </p>
          </div>

          <a
            href={surveyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-3 px-4 py-2 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
          >
            <ClipboardList className="h-4 w-4" />
            Responder a pesquisa
          </a>
        </div>
      </div>
    </div>
  );
};

export default SurveyBanner;
