"use client";

import { useState } from "react";
import { ArrowUp, ArrowDown, Minus, Upload } from "lucide-react";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  // Upload handler
  const handleUpload = (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Analisar gráfico
  const analyzeChart = async () => {
    if (!image) {
      alert("Envie um gráfico primeiro!");
      return;
    }

    setLoading(true);
    setAnalysis(null);

    try {
      const resp = await fetch("/api/analyze-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });

      const data = await resp.json();

      if (data.error) {
        alert("Erro: " + data.error);
      } else {
        setAnalysis(data);
      }
    } catch (err) {
      alert("Erro ao analisar gráfico.");
    }

    setLoading(false);
  };

  const getRecommendationColor = (rec: string) => {
    if (rec === "BUY") return "#00ff9d";
    if (rec === "SELL") return "#ff4f4f";
    return "#4fb4ff";
  };

  const getRecommendationIcon = (rec: string) => {
    if (rec === "BUY") return <ArrowUp size={26} color="#00ff9d" />;
    if (rec === "SELL") return <ArrowDown size={26} color="#ff4f4f" />;
    return <Minus size={26} color="#4fb4ff" />;
  };

  return (
    <main className="page-container">
      {/* HEADER */}
      <div className="card header-card">
        <div className="header-left">
          <div className="app-logo">📊</div>

          <div className="header-text">
            <h1>TradeVision AI</h1>
            <p>Análise Inteligente de Mercado</p>
          </div>
        </div>

        <button className="modo-btn">Modo</button>
      </div>

      {/* CAPTURAR GRÁFICO */}
      <div className="card main-card">
        <div className="card-header">
          <div>
            <h2>Capturar</h2>
            <h2>Gráfico</h2>
          </div>

          <div className="action-buttons">
            <label className="small-btn">
              Upload
              <input type="file" accept="image/*" hidden onChange={handleUpload} />
            </label>

            <label className="small-btn">
              Tela
              <input type="file" accept="image/*" capture="environment" hidden onChange={handleUpload} />
            </label>
          </div>
        </div>

        {/* ÁREA DE UPLOAD */}
        <div className="upload-area">
          <div className="upload-icon">
            <Upload size={42} color="white" />
          </div>

          <p className="upload-text">
            {image ? "Imagem carregada!" : "Clique para fazer upload"}
          </p>
          <p className="upload-sub">PNG, JPG ou print de tela</p>

          {image && (
            <img src={image} alt="preview" className="preview-img" />
          )}
        </div>

        {/* BOTÃO ANALISAR */}
        <button className="analisar-btn" onClick={analyzeChart}>
          {loading ? "Analisando..." : "Analisar Gráfico"}
        </button>

        {/* RESULTADO PREMIUM */}
        {analysis && (
          <div className="resultado-card">
            {/* RECOMENDAÇÃO */}
            <div
              className="rec-box"
              style={{ borderColor: getRecommendationColor(analysis.recommendation) }}
            >
              <div className="rec-left">
                {getRecommendationIcon(analysis.recommendation)}
                <div>
                  <p className="rec-label">Recomendação</p>
                  <p
                    className="rec-value"
                    style={{ color: getRecommendationColor(analysis.recommendation) }}
                  >
                    {analysis.recommendation}
                  </p>
                </div>
              </div>

              <div className="confidence">
                <p>Confiança</p>
                <div className="bar-bg">
                  <div
                    className="bar-fill"
                    style={{ width: `${analysis.confidence}%` }}
                  ></div>
                </div>
                <p className="conf-value">{analysis.confidence}%</p>
              </div>
            </div>

            {/* TENDÊNCIA */}
            <div className="info-row">
              <p><b>Tendência:</b> {analysis.trend}</p>
              <p><b>Risco:</b> {analysis.riskLevel}</p>
            </div>

            {/* SUPORTE / RESISTÊNCIA */}
            <div className="info-row">
              <p><b>Suporte:</b> {analysis.support}</p>
              <p><b>Resistência:</b> {analysis.resistance}</p>
            </div>

            {/* INDICADORES */}
            <div className="indicadores-block">
              <h4>Indicadores Técnicos</h4>

              {analysis.indicators?.map((i: any, index: number) => (
                <div key={index} className="ind-row">
                  <p><b>{i.name}:</b> {i.value}</p>
                  <span
                    className={`ind-${i.signal}`}
                  >
                    {i.signal}
                  </span>
                </div>
              ))}
            </div>

            {/* RESUMO */}
            <div className="analysis-block">
              <h4>Resumo Inteligente</h4>
              <p>{analysis.analysis}</p>
            </div>

            {/* ESTRATÉGIA */}
            <div className="info-row">
              <p><b>Entrada:</b> {analysis.entryPoint}</p>
              <p><b>Stop:</b> {analysis.stopLoss}</p>
            </div>

            <div className="info-row">
              <p><b>Take Profit:</b> {analysis.takeProfit}</p>
              <p><b>Prazo:</b> {analysis.timeframe}</p>
            </div>

            {analysis.marketContext && (
              <div className="analysis-block">
                <h4>Contexto do Mercado</h4>
                <p>{analysis.marketContext}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}