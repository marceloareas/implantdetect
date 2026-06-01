import { Link } from "react-router-dom";
import {
  Upload,
  Search,
  ShieldCheck,
  ArrowRight,
  Cpu,
  BarChart3,
  Users,
} from "lucide-react";
import Button from "../components/ui/Button";

const features = [
  {
    icon: Upload,
    title: "Upload em segundos",
    description:
      "Arraste e solte radiografias periapicais (JPG, JPEG ou PNG) e inicie a análise sem configuração técnica.",
  },
  {
    icon: Cpu,
    title: "Modelo treinado para implantodontia",
    description:
      "A detecção é feita com YOLOv11 ajustado para reconhecer implantes dentários em exames periapicais reais.",
  },
  {
    icon: Search,
    title: "Detecção visual imediata",
    description:
      "Veja bounding boxes sobre o Raio X com nível de confiança por implante, facilitando a validação clínica.",
  },
  {
    icon: BarChart3,
    title: "Relatório técnico por detecção",
    description:
      "Cada resultado inclui classe prevista, score de confiança e coordenadas para rastreabilidade da análise.",
  },
  {
    icon: ShieldCheck,
    title: "Proteção de dados clínicos",
    description:
      "Imagens e informações ficam protegidas por autenticação e controle de acesso por perfil de usuário.",
  },
  {
    icon: Users,
    title: "Fluxo para cada perfil",
    description:
      "Pacientes, especialistas e administradores utilizam a mesma plataforma com permissões adequadas a cada função.",
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent-400 rounded-full filter blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-primary-300 rounded-full filter blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Detecção de Implantes Dentários com{" "}
              <span className="text-accent-300">Inteligência Artificial</span>
            </h1>

            <p className="text-lg sm:text-xl text-primary-100 mb-8 leading-relaxed max-w-2xl">
              O ImplantDetect utiliza aprendizado de máquina para identificar e
              classificar implantes dentários em radiografias periapicais,
              auxiliando profissionais e pacientes no diagnóstico.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button variant="accent" size="xl" icon={ArrowRight}>
                  Começar Agora
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  variant="ghost"
                  size="xl"
                  className="text-white! border-2 border-white/30 hover:bg-white!/10"
                >
                  Já tenho conta
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#f9fafb"
            />
          </svg>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Como funciona
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Uma plataforma completa para identificação de implantes dentários,
              do upload à análise dos resultados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary-100 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-linear-to-r from-primary-600 to-accent-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Pronto para começar?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Crie sua conta gratuitamente e comece a analisar radiografias com
            inteligência artificial.
          </p>
          <Link to="/register">
            <Button
              variant="ghost"
              size="xl"
              className="bg-white! text-primary-700! hover:bg-gray-50!"
              icon={ArrowRight}
            >
              Criar Conta Gratuita
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;
