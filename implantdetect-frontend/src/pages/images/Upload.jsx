import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload as UploadIcon,
  FileImage,
  X,
  AlertCircle,
  Tag,
  ChevronDown,
} from "lucide-react";

import ImageService from "../../state/services/imageService";
import LabelService from "../../state/services/labelService";
import { imageFormSchema } from "../../utils/imageFormValidation";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import Card from "../../components/ui/Card";

const Upload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [labels, setLabels] = useState([]);
  const [labelsLoading, setLabelsLoading] = useState(true);
  const [labelsOpen, setLabelsOpen] = useState(true);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    LabelService.getLabels()
      .then((data) => {
        if (active) setLabels(data);
      })
      .catch(() => {
        if (active) setLabels([]);
      })
      .finally(() => {
        if (active) setLabelsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setError("");

    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFile(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = () => setDragOver(false);

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await imageFormSchema.validate({ file }, { abortEarly: false });
      const formData = new FormData();
      formData.append("image", file);
      const response = await ImageService.upload(formData);

      if (response?.process_id) {
        navigate(`/process/${response.process_id}/results`);
      } else {
        setError("Processo criado, mas não foi possível obter o ID.");
      }
    } catch (err) {
      if (err?.inner) {
        setError(err.inner.map((e) => e.message).join(". "));
      } else if (err?.message) {
        setError(err.message);
      } else if (err?.detail) {
        setError(err.detail);
      } else if (typeof err === "string") {
        setError(err);
      } else {
        setError("Erro inesperado ao enviar imagem.");
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Upload de Raio X</h1>
        <p className="text-gray-500 mt-2">
          Envie uma imagem de radiografia periapical para análise por
          inteligência artificial.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
              ${
                dragOver
                  ? "border-primary-500 bg-primary-50"
                  : file
                    ? "border-green-300 bg-green-50"
                    : "border-gray-300 hover:border-primary-400 hover:bg-gray-50"
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={(e) => handleFile(e.target.files[0])}
              className="hidden"
            />

            {file ? (
              <div className="space-y-4">
                {preview && (
                  <div className="relative inline-block">
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-64 rounded-lg shadow-md mx-auto"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                      }}
                      className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-md"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <div className="flex items-center justify-center gap-2 text-green-700">
                  <FileImage className="h-5 w-5" />
                  <span className="font-medium">{file.name}</span>
                  <span className="text-sm text-green-500">
                    ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <UploadIcon className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-gray-700 font-medium">
                    Arraste e solte sua imagem aqui
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    ou clique para selecionar um arquivo
                  </p>
                </div>
                <p className="text-xs text-gray-400">
                  Formatos suportados: JPG, JPEG, PNG • Máximo: 15MB
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4">
              <Alert variant="error" title="Erro no envio">
                {error}
              </Alert>
            </div>
          )}

          <div className="mt-6">
            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={loading}
              disabled={!file}
              icon={UploadIcon}
            >
              {loading ? "Processando..." : "Enviar para Análise"}
            </Button>
          </div>
        </form>
      </Card>

      <div className="mt-6 bg-blue-50 rounded-xl p-5 border border-blue-100">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Dicas para melhores resultados:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-600">
              <li>Utilize radiografias periapicais de boa qualidade</li>
              <li>Certifique-se de que a imagem está nítida e bem iluminada</li>
              <li>Formatos JPG e PNG são recomendados</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setLabelsOpen((open) => !open)}
          aria-expanded={labelsOpen}
          className="w-full flex items-center justify-between gap-2 p-5 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary-500" />
            <h2 className="font-medium text-gray-900">Implantes disponíveis</h2>
            {!labelsLoading && labels.length > 0 && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                {labels.length}
              </span>
            )}
          </div>
          <ChevronDown
            className={`h-5 w-5 text-gray-400 shrink-0 transition-transform duration-200 ${
              labelsOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {labelsOpen && (
          <div className="px-5 pb-5">
            {labelsLoading ? (
              <p className="text-sm text-gray-500">Carregando implantes...</p>
            ) : labels.length === 0 ? (
              <p className="text-sm text-gray-500">
                Nenhum implante disponível no momento.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {labels.map((label) => (
                  <span
                    key={label.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-50 text-primary-700 border border-primary-100"
                  >
                    {label.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;
