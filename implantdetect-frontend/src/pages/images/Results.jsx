import { useEffect, useState, useRef, useCallback, Fragment } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Clock,
  Loader2,
  XCircle,
} from "lucide-react";

import ImageService from "../../state/services/imageService";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Alert from "../../components/ui/Alert";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";

const COLORS = [
  { stroke: "#22c55e", bg: "bg-green-500", label: "green" },
  { stroke: "#ef4444", bg: "bg-red-500", label: "red" },
  { stroke: "#3b82f6", bg: "bg-blue-500", label: "blue" },
  { stroke: "#eab308", bg: "bg-yellow-500", label: "amber" },
  { stroke: "#a855f7", bg: "bg-purple-500", label: "purple" },
  { stroke: "#06b6d4", bg: "bg-cyan-500", label: "teal" },
];

const POLLING_BASE_INTERVAL_MS = 2000;
const POLLING_MAX_INTERVAL_MS = 30000;
const POLLING_MAX_ELAPSED_MS = 5 * 60 * 1000; // 5 minutos
const TERMINAL_STATUSES = ["Concluído", "Falhou", "Cancelado"];

const getColor = (index) => COLORS[index % COLORS.length];

const isValidResult = (result) => {
  if (result.message) return false;
  if (result.class_name === "Classe None" || !result.class_name) return false;
  if (result.bb_x1_center == null || result.bb_y1_center == null) return false;
  return true;
};

const ImageResults = () => {
  const { process_id } = useParams();
  const [results, setResults] = useState([]);
  const [processStatus, setProcessStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [hoveredBox, setHoveredBox] = useState(null);
  const [visibleBoxes, setVisibleBoxes] = useState(new Set());
  const [imageDimensions, setImageDimensions] = useState(null);
  const [renderedImageRect, setRenderedImageRect] = useState(null);
  const imageRef = useRef(null);
  const pollingRef = useRef(null);
  const pollingIntervalRef = useRef(POLLING_BASE_INTERVAL_MS);
  const pollingElapsedRef = useRef(0);
  const imageUrlLoadedRef = useRef(false);

  useEffect(() => {
    const img = imageRef.current;
    if (!img) return;
    const observer = new ResizeObserver(() => {
      setRenderedImageRect({
        width: img.offsetWidth,
        height: img.offsetHeight,
      });
    });
    observer.observe(img);
    return () => observer.disconnect();
  }, [imageUrl]);

  const isTerminal = (statusName) => TERMINAL_STATUSES.includes(statusName);

  const fetchProcess = useCallback(async () => {
    try {
      const proc = await ImageService.getProcess(process_id);
      setProcessStatus(proc?.status_name ?? null);
      if (proc?.image_url && !imageUrlLoadedRef.current) {
        imageUrlLoadedRef.current = true;
        const blobUrl = await ImageService.getImageBlob(proc.image_url);
        setImageUrl(blobUrl);
      }
      return proc?.status_name ?? null;
    } catch {
      return null;
    }
  }, [process_id]);

  const fetchResults = useCallback(async () => {
    try {
      const data = await ImageService.getProcessResults(process_id);
      setResults(data);
      if (data?.length > 0) {
        const valid = data.filter(isValidResult);
        setVisibleBoxes(new Set(valid.map((_, idx) => idx)));
      }
    } catch (err) {
      setError(
        "Erro ao buscar resultados: " + (err.message || "Erro desconhecido"),
      );
    }
  }, [process_id]);

  const stopPolling = () => {
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError("");

      const statusName = await fetchProcess();

      if (statusName && isTerminal(statusName)) {
        await fetchResults();
        setLoading(false);
        return;
      }

      setLoading(false);

      // Polling com backoff exponencial e timeout máximo
      pollingIntervalRef.current = POLLING_BASE_INTERVAL_MS;
      pollingElapsedRef.current = 0;

      const poll = async () => {
        const newStatus = await fetchProcess();
        if (newStatus && isTerminal(newStatus)) {
          stopPolling();
          await fetchResults();
          return;
        }

        pollingElapsedRef.current += pollingIntervalRef.current;
        if (pollingElapsedRef.current >= POLLING_MAX_ELAPSED_MS) {
          stopPolling();
          setError(
            "Timeout: o processamento demorou mais do que o esperado. Verifique o histórico mais tarde.",
          );
          return;
        }

        pollingIntervalRef.current = Math.min(
          pollingIntervalRef.current * 1.5,
          POLLING_MAX_INTERVAL_MS,
        );
        pollingRef.current = setTimeout(poll, pollingIntervalRef.current);
      };

      pollingRef.current = setTimeout(poll, pollingIntervalRef.current);
    };

    init();
    return () => {
      stopPolling();
      imageUrlLoadedRef.current = false;
      setImageUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [process_id, fetchProcess, fetchResults]);

  const toggleRow = (index) =>
    setExpandedRow(expandedRow === index ? null : index);
  const toggleBoxVisibility = (index) => {
    setVisibleBoxes((prev) => {
      const newSet = new Set(prev);
      newSet.has(index) ? newSet.delete(index) : newSet.add(index);
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-500 mt-4">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Alert variant="error" title="Erro">
          {error}
        </Alert>
      </div>
    );
  }

  // Process is still pending or running — show waiting screen
  if (processStatus && !isTerminal(processStatus)) {
    const isPending = processStatus === "Pendente";
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="mb-6">
          <Link
            to="/images/history"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar ao histórico
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Resultados da Análise
          </h1>
          <p className="text-gray-500 mt-1">Processo #{process_id}</p>
        </div>

        <Card className="text-center py-16">
          <div className="flex flex-col items-center gap-4">
            {isPending ? (
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center">
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {isPending ? "Análise na fila" : "Análise em andamento"}
              </h3>
              <p className="text-gray-500 mt-1 text-sm">
                {isPending
                  ? "Sua imagem está aguardando processamento."
                  : "Sua imagem está sendo analisada pela IA."}
              </p>
              <p className="text-gray-400 mt-3 text-xs">
                Esta página atualiza automaticamente...
              </p>
            </div>
            <Badge color={isPending ? "amber" : "blue"} dot>
              {processStatus}
            </Badge>
          </div>
        </Card>
      </div>
    );
  }

  // Process failed or canceled
  if (processStatus === "Falhou" || processStatus === "Cancelado") {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="mb-6">
          <Link
            to="/images/history"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar ao histórico
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Resultados da Análise
          </h1>
          <p className="text-gray-500 mt-1">Processo #{process_id}</p>
        </div>
        <Card className="text-center py-16">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {processStatus === "Falhou"
              ? "Análise falhou"
              : "Análise cancelada"}
          </h3>
          <p className="text-gray-500 text-sm">
            {processStatus === "Falhou"
              ? "Ocorreu um erro durante o processamento da imagem."
              : "Este processo foi cancelado."}
          </p>
        </Card>
      </div>
    );
  }

  const validResults = results.filter(isValidResult);
  const hasNoDetections = results.length > 0 && validResults.length === 0;
  const errorMessage = results.find((r) => r.message)?.message;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            to="/images/history"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar ao histórico
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Resultados da Análise
          </h1>
          <p className="text-gray-500 mt-1">Processo #{process_id}</p>
        </div>
        <div className="flex items-center gap-2">
          {validResults.length > 0 ? (
            <Badge color="green" dot>
              {validResults.length} implante(s) detectado(s)
            </Badge>
          ) : (
            <Badge color="amber" dot>
              Nenhuma detecção
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card padding={false} className="overflow-hidden">
            {imageUrl && (
              <div className="bg-gray-900 flex items-center justify-center">
                <div
                  className="relative"
                  style={
                    renderedImageRect
                      ? {
                          width: renderedImageRect.width,
                          height: renderedImageRect.height,
                        }
                      : {}
                  }
                >
                  <img
                    ref={imageRef}
                    src={imageUrl}
                    alt="Radiografia"
                    onLoad={(e) => {
                      setImageDimensions({
                        width: e.currentTarget.naturalWidth,
                        height: e.currentTarget.naturalHeight,
                      });
                      setRenderedImageRect({
                        width: e.currentTarget.offsetWidth,
                        height: e.currentTarget.offsetHeight,
                      });
                    }}
                    className="block max-w-full h-auto"
                    style={{ maxHeight: "600px" }}
                  />
                  {imageDimensions &&
                    renderedImageRect &&
                    validResults.map((result, idx) => {
                      if (!visibleBoxes.has(idx)) return null;
                      const color = getColor(idx);
                      const points = `${result.bb_x1_center},${result.bb_y1_center} ${result.bb_x2_center},${result.bb_y2_center} ${result.bb_x3_center},${result.bb_y3_center} ${result.bb_x4_center},${result.bb_y4_center}`;
                      return (
                        <svg
                          key={idx}
                          className="absolute inset-0 w-full h-full pointer-events-none"
                          viewBox={`0 0 ${imageDimensions.width} ${imageDimensions.height}`}
                          preserveAspectRatio="none"
                        >
                          <polygon
                            points={points}
                            fill="none"
                            stroke={color.stroke}
                            strokeWidth="4"
                            opacity={hoveredBox === idx ? 1 : 0.7}
                            className="transition-opacity duration-200"
                          />
                        </svg>
                      );
                    })}
                </div>
              </div>
            )}

            {hasNoDetections && (
              <div className="p-6">
                <Alert variant="warning" title="Nenhum implante detectado">
                  {errorMessage ||
                    "Não foram encontrados implantes na imagem processada."}
                </Alert>
              </div>
            )}

            {results.length === 0 && (
              <div className="p-6">
                <Alert variant="info">
                  Nenhum resultado disponível para este processo.
                </Alert>
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <Card.Header>
              <Card.Title>Detecções</Card.Title>
              <Card.Description>
                Clique para ver detalhes de cada implante
              </Card.Description>
            </Card.Header>

            {validResults.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                Nenhuma detecção para exibir.
              </p>
            ) : (
              <div className="space-y-3">
                {validResults.map((result, idx) => {
                  const color = getColor(idx);
                  const isExpanded = expandedRow === idx;

                  return (
                    <div
                      key={idx}
                      className={`rounded-lg border transition-all duration-200 ${
                        hoveredBox === idx
                          ? "border-primary-300 bg-primary-50/50"
                          : "border-gray-100"
                      }`}
                      onMouseEnter={() => setHoveredBox(idx)}
                      onMouseLeave={() => setHoveredBox(null)}
                    >
                      <div className="flex items-center gap-3 p-3">
                        <button
                          onClick={() => toggleBoxVisibility(idx)}
                          className="shrink-0 text-gray-400 hover:text-gray-600"
                          title={visibleBoxes.has(idx) ? "Ocultar" : "Mostrar"}
                        >
                          {visibleBoxes.has(idx) ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </button>

                        <div
                          className={`w-3 h-3 rounded-full shrink-0 ${color.bg}`}
                        />

                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-semibold text-gray-900 truncate"
                            title={result.class_name}
                          >
                            {result.class_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Confiança: {(result.confidence * 100).toFixed(1)}%
                          </p>
                        </div>

                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden shrink-0">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${result.confidence * 100}%`,
                              backgroundColor: color.stroke,
                            }}
                          />
                        </div>

                        <button
                          onClick={() => toggleRow(idx)}
                          className="text-gray-400 hover:text-gray-600 shrink-0"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="px-3 pb-3 border-t border-gray-100 pt-3 animate-fade-in">
                          <p className="text-xs font-medium text-gray-500 mb-2">
                            Bounding Box (OBB):
                          </p>
                          <div className="grid grid-cols-2 gap-1.5 text-xs font-mono text-gray-600">
                            <div className="bg-gray-50 rounded px-2 py-1">
                              P1: ({result.bb_x1_center?.toFixed(1)},{" "}
                              {result.bb_y1_center?.toFixed(1)})
                            </div>
                            <div className="bg-gray-50 rounded px-2 py-1">
                              P2: ({result.bb_x2_center?.toFixed(1)},{" "}
                              {result.bb_y2_center?.toFixed(1)})
                            </div>
                            <div className="bg-gray-50 rounded px-2 py-1">
                              P3: ({result.bb_x3_center?.toFixed(1)},{" "}
                              {result.bb_y3_center?.toFixed(1)})
                            </div>
                            <div className="bg-gray-50 rounded px-2 py-1">
                              P4: ({result.bb_x4_center?.toFixed(1)},{" "}
                              {result.bb_y4_center?.toFixed(1)})
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ImageResults;
