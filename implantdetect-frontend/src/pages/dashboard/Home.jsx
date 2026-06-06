import { Link } from "react-router-dom";
import { Upload, History, ArrowRight } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import Card from "../../components/ui/Card";

const quickActions = [
  {
    icon: Upload,
    title: "Enviar Raio X",
    description: "Faça upload de uma nova imagem para análise.",
    to: "/images/upload",
    color: "bg-primary-50 text-primary-600",
  },
  {
    icon: History,
    title: "Histórico",
    description: "Veja todas as suas análises anteriores.",
    to: "/images/history",
    color: "bg-accent-50 text-accent-600",
  },
];

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">
          Olá{user?.username ? `, ${user.username}` : ""}! 👋
        </h1>
        <p className="text-gray-500 mt-2 text-lg">
          Bem-vindo ao ImplantDetect. O que deseja fazer hoje?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quickActions.map((action, index) => (
          <Link key={index} to={action.to}>
            <Card hover className="h-full group">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${action.color}`}
              >
                <action.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                {action.title}
              </h3>
              <p className="text-gray-500 text-sm mb-4">{action.description}</p>
              <div className="flex items-center text-primary-600 text-sm font-medium">
                Acessar{" "}
                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;
