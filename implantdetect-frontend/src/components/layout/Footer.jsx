import { Github } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-linear-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">🦷</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              Implant<span className="text-primary-600">Detect</span>
            </span>
          </div>
          <a
            href="https://github.com/marceloareas/implantdetect"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
