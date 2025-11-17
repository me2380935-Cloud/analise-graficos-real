"use client";

import { useState, useRef } from "react";
import { Upload, TrendingUp, TrendingDown, Minus, Activity, Target, BarChart3, AlertCircle, Camera, Monitor, ChevronDown, ChevronUp, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface AnalysisResult {
  recommendation: "BUY" | "SELL" | "HOLD";
  confidence: number;
  trend: string;
  support: string;
  resistance: string;
  indicators: {
    name: string;
    value: string;
    signal: "bullish" | "bearish" | "neutral";
  }[];
  analysis: string;
  riskLevel: "low" | "medium" | "high";
  entryPoint?: string;
  stopLoss?: string;
  takeProfit?: string;
  timeframe?: string;
  marketContext?: string;
}

export default function ChartAnalyzer() {
  const [chartImagePreview, setChartImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [captureMode, setCaptureMode] = useState<"upload" | "screen">("upload");
  const [advancedMode, setAdvancedMode] = useState(false);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);

  const handleChartImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      const fileReader = new FileReader();
      fileReader.onloadend = () => {
        setChartImagePreview(fileReader.result as string);
        setAnalysisResult(null);
        setErrorMessage(null);
      };
      fileReader.readAsDataURL(uploadedFile);
    }
  };

  const startScreenCapture = async () => {
    try {
      const displayMediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      
      setScreenStream(displayMediaStream);
      
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = displayMediaStream;
        screenVideoRef.current.play();
      }
    } catch (error) {
      console.error("Erro ao capturar tela:", error);
      setErrorMessage("Não foi possível capturar a tela. Verifique as permissões do navegador.");
    }
  };

  const captureScreenshot = () => {
    if (screenVideoRef.current) {
      const screenshotCanvas = document.createElement("canvas");
      screenshotCanvas.width = screenVideoRef.current.videoWidth;
      screenshotCanvas.height = screenVideoRef.current.videoHeight;
      const canvasContext = screenshotCanvas.getContext("2d");
      
      if (canvasContext) {
        canvasContext.drawImage(screenVideoRef.current, 0, 0);
        const capturedScreenshot = screenshotCanvas.toDataURL("image/png");
        setChartImagePreview(capturedScreenshot);
        setAnalysisResult(null);
        setErrorMessage(null);
        stopScreenCapture();
      }
    }
  };

  const stopScreenCapture = () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
    }
  };

  const analyzeChart = async () => {
    if (!chartImagePreview) return;

    setIsAnalyzing(true);
    setErrorMessage(null);
    
    try {
      console.log("Iniciando análise do gráfico...");
      
      const apiResponse = await fetch("/api/analyze-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: chartImagePreview }),
      });

      console.log("Status da resposta:", apiResponse.status);

      if (!apiResponse.ok) {
        let errorMessage = `Erro HTTP: ${apiResponse.status}`;
        
        try {
          const errorData = await apiResponse.json();
          if (errorData.error) {
            errorMessage = errorData.error;
            if (errorData.details) {
              errorMessage += ` - ${errorData.details}`;
            }
          }
        } catch (jsonError) {
          console.error("Erro ao fazer parse do erro:", jsonError);
        }
        
        throw new Error(errorMessage);
      }

      const responseText = await apiResponse.text();
      console.log("Resposta recebida (texto):", responseText.substring(0, 200));

      let analysisData;
      try {
        analysisData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Erro ao fazer parse do JSON:", parseError);
        console.error("Resposta completa:", responseText);
        throw new Error("Resposta inválida do servidor. Por favor, tente novamente.");
      }

      if (analysisData.error) {
        throw new Error(analysisData.error);
      }

      console.log("Análise concluída com sucesso:", analysisData);
      setAnalysisResult(analysisData);
      setErrorMessage(null);
    } catch (error) {
      console.error("Erro na análise:", error);
      const errorMsg = error instanceof Error ? error.message : "Erro desconhecido ao analisar o gráfico";
      setErrorMessage(errorMsg);
      setAnalysisResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "BUY": return "from-green-500 to-emerald-600";
      case "SELL": return "from-red-500 to-rose-600";
      default: return "from-yellow-500 to-orange-600";
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case "BUY": return <TrendingUp className="w-8 h-8" />;
      case "SELL": return <TrendingDown className="w-8 h-8" />;
      default: return <Minus className="w-8 h-8" />;
    }
  };

  const getRecommendationText = (recommendation: string) => {
    switch (recommendation) {
      case "BUY": return "COMPRAR";
      case "SELL": return "VENDER";
      default: return "GUARDAR";
    }
  };

  const getRiskLevelText = (level: string) => {
    switch (level) {
      case "low": return "Baixo";
      case "medium": return "Médio";
      case "high": return "Alto";
      default: return level;
    }
  };

  const getSignalText = (signal: string) => {
    switch (signal) {
      case "bullish": return "Alta";
      case "bearish": return "Baixa";
      case "neutral": return "Neutro";
      default: return signal;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">TradeVision AI</h1>
                <p className="text-sm text-slate-400">Análise Inteligente de Mercado</p>
              </div>
            </div>
            
            {/* Advanced Mode Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAdvancedMode(!advancedMode)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              {advancedMode ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Modo Simples
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Modo Avançado
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Error Message */}
        {errorMessage && (
          <Card className="mb-6 p-4 bg-red-500/10 border-red-500/30">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-200 text-sm font-medium mb-1">Erro na Análise</p>
                <p className="text-red-200/80 text-xs leading-relaxed">{errorMessage}</p>
                {errorMessage.includes("OPENAI_API_KEY") && (
                  <p className="text-red-200/80 text-xs leading-relaxed mt-2">
                    💡 Clique no banner laranja acima para configurar sua chave da API OpenAI.
                  </p>
                )}
              </div>
            </div>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card className="p-6 bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-xl font-semibold text-white">Capturar Gráfico</h2>
                </div>
                
                {/* Toggle Capture Mode */}
                <div className="flex gap-2">
                  <Button
                    variant={captureMode === "upload" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setCaptureMode("upload");
                      stopScreenCapture();
                    }}
                    className={captureMode === "upload" ? "bg-cyan-600 hover:bg-cyan-700" : "border-slate-700 text-slate-400"}
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    Upload
                  </Button>
                  <Button
                    variant={captureMode === "screen" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCaptureMode("screen")}
                    className={captureMode === "screen" ? "bg-cyan-600 hover:bg-cyan-700" : "border-slate-700 text-slate-400"}
                  >
                    <Monitor className="w-4 h-4 mr-1" />
                    Tela
                  </Button>
                </div>
              </div>

              {captureMode === "upload" ? (
                <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:border-cyan-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleChartImageUpload}
                    className="hidden"
                    id="chart-upload"
                  />
                  <label htmlFor="chart-upload" className="cursor-pointer">
                    {chartImagePreview ? (
                      <img
                        src={chartImagePreview}
                        alt="Gráfico"
                        className="max-h-96 mx-auto rounded-lg shadow-2xl"
                      />
                    ) : (
                      <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                          <Upload className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <p className="text-lg font-medium text-white">
                            Clique para fazer upload
                          </p>
                          <p className="text-sm text-slate-400 mt-1">
                            PNG, JPG ou print de tela
                          </p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  {!screenStream ? (
                    <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center">
                      {chartImagePreview ? (
                        <img
                          src={chartImagePreview}
                          alt="Captura"
                          className="max-h-96 mx-auto rounded-lg shadow-2xl"
                        />
                      ) : (
                        <div className="space-y-4">
                          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                            <Monitor className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <p className="text-lg font-medium text-white">
                              Captura de Tela
                            </p>
                            <p className="text-sm text-slate-400 mt-1">
                              Tire uma foto da tela do seu computador
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative border-2 border-cyan-500 rounded-lg overflow-hidden">
                      <video
                        ref={screenVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full rounded-lg"
                      />
                      <div className="absolute top-4 right-4 flex gap-2">
                        <Button
                          onClick={captureScreenshot}
                          className="bg-green-600 hover:bg-green-700 shadow-lg"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Capturar
                        </Button>
                        <Button
                          onClick={stopScreenCapture}
                          variant="destructive"
                          className="shadow-lg"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}

                  {!screenStream && !chartImagePreview && (
                    <Button
                      onClick={startScreenCapture}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-6 text-lg shadow-lg shadow-purple-500/20"
                    >
                      <Monitor className="w-5 h-5 mr-2" />
                      Iniciar Captura de Tela
                    </Button>
                  )}
                </div>
              )}

              <Button
                onClick={analyzeChart}
                disabled={!chartImagePreview || isAnalyzing}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-6 text-lg shadow-lg shadow-cyan-500/20"
              >
                {isAnalyzing ? (
                  <>
                    <Activity className="w-5 h-5 mr-2 animate-spin" />
                    Analisando Gráfico...
                  </>
                ) : (
                  <>
                    <Target className="w-5 h-5 mr-2" />
                    Analisar Gráfico
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Results Section */}
          <Card className="p-6 bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            {analysisResult ? (
              <div className="space-y-6">
                {/* Recommendation */}
                <div className={`p-6 rounded-xl bg-gradient-to-br ${getRecommendationColor(analysisResult.recommendation)} shadow-2xl`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm font-medium mb-1">Recomendação</p>
                      <h3 className="text-4xl font-bold text-white">{getRecommendationText(analysisResult.recommendation)}</h3>
                    </div>
                    <div className="text-white">
                      {getRecommendationIcon(analysisResult.recommendation)}
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-white/90 text-sm mb-2">
                      <span>Confiança</span>
                      <span className="font-bold">{analysisResult.confidence}%</span>
                    </div>
                    <Progress value={analysisResult.confidence} className="h-2 bg-white/20" />
                  </div>
                </div>

                {/* Key Levels */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <p className="text-slate-400 text-xs mb-1">Suporte</p>
                    <p className="text-green-400 font-bold text-lg">{analysisResult.support}</p>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <p className="text-slate-400 text-xs mb-1">Resistência</p>
                    <p className="text-red-400 font-bold text-lg">{analysisResult.resistance}</p>
                  </div>
                </div>

                {/* Trend & Risk */}
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Tendência</p>
                    <p className="text-white font-semibold">{analysisResult.trend}</p>
                  </div>
                  <Badge 
                    variant={analysisResult.riskLevel === "high" ? "destructive" : analysisResult.riskLevel === "medium" ? "secondary" : "default"}
                    className="text-xs"
                  >
                    Risco: {getRiskLevelText(analysisResult.riskLevel)}
                  </Badge>
                </div>

                {/* Advanced Mode - Trading Levels */}
                {advancedMode && (analysisResult.entryPoint || analysisResult.stopLoss || analysisResult.takeProfit) && (
                  <div className="space-y-3">
                    <h4 className="text-white font-semibold flex items-center gap-2">
                      <Target className="w-4 h-4 text-cyan-400" />
                      Níveis de Operação
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {analysisResult.entryPoint && (
                        <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                          <p className="text-blue-400 text-xs mb-1">Ponto de Entrada</p>
                          <p className="text-white font-semibold">{analysisResult.entryPoint}</p>
                        </div>
                      )}
                      {analysisResult.stopLoss && (
                        <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                          <p className="text-red-400 text-xs mb-1">Stop Loss</p>
                          <p className="text-white font-semibold">{analysisResult.stopLoss}</p>
                        </div>
                      )}
                      {analysisResult.takeProfit && (
                        <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                          <p className="text-green-400 text-xs mb-1">Take Profit</p>
                          <p className="text-white font-semibold">{analysisResult.takeProfit}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Advanced Mode - Timeframe & Market Context */}
                {advancedMode && (analysisResult.timeframe || analysisResult.marketContext) && (
                  <div className="space-y-3">
                    {analysisResult.timeframe && (
                      <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                        <p className="text-slate-400 text-xs mb-1">Prazo Recomendado</p>
                        <p className="text-white font-medium">{analysisResult.timeframe}</p>
                      </div>
                    )}
                    {analysisResult.marketContext && (
                      <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                        <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                          <Info className="w-4 h-4 text-cyan-400" />
                          Contexto de Mercado
                        </h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{analysisResult.marketContext}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Indicators */}
                <div className="space-y-3">
                  <h4 className="text-white font-semibold flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    Indicadores Técnicos
                  </h4>
                  {analysisResult.indicators.map((indicator, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{indicator.name}</p>
                        {advancedMode && (
                          <p className="text-slate-400 text-xs mt-1">{indicator.value}</p>
                        )}
                      </div>
                      <Badge 
                        variant={indicator.signal === "bullish" ? "default" : indicator.signal === "bearish" ? "destructive" : "secondary"}
                        className="text-xs ml-2"
                      >
                        {getSignalText(indicator.signal)}
                      </Badge>
                    </div>
                  ))}
                </div>

                {/* Analysis */}
                <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                  <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-cyan-400" />
                    Análise Detalhada
                  </h4>
                  <p className="text-slate-300 text-sm leading-relaxed">{analysisResult.analysis}</p>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center py-20">
                <div className="space-y-4">
                  <div className="w-20 h-20 mx-auto bg-slate-800/50 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-10 h-10 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Aguardando Análise
                    </h3>
                    <p className="text-slate-400 text-sm max-w-sm mx-auto">
                      Faça upload ou capture a tela de um gráfico de trading e clique em Analisar para receber recomendações precisas
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <Card className="p-4 bg-slate-900/50 border-slate-800">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm mb-1">Comprar</h3>
                <p className="text-slate-400 text-xs">Sinais de alta confirmados com múltiplos indicadores positivos</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-slate-900/50 border-slate-800">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm mb-1">Vender</h3>
                <p className="text-slate-400 text-xs">Sinais de baixa confirmados com indicadores negativos</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-slate-900/50 border-slate-800">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Minus className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm mb-1">Guardar</h3>
                <p className="text-slate-400 text-xs">Sinais mistos ou consolidação - aguardar confirmação</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Disclaimer */}
        <Card className="mt-6 p-4 bg-yellow-500/10 border-yellow-500/30">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-200 text-sm font-medium mb-1">Aviso Importante</p>
              <p className="text-yellow-200/80 text-xs leading-relaxed">
                Esta análise é baseada em inteligência artificial e não constitui aconselhamento financeiro. 
                Trading envolve riscos significativos. Sempre faça sua própria pesquisa e consulte profissionais qualificados antes de tomar decisões de investimento.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
