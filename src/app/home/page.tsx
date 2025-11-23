"use client";
import "./home.css";

import { useState, useEffect } from "react";
import { Upload } from "lucide-react";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [used, setUsed] = useState(0);
  const [limitReached, setLimitReached] = useState(false);
  const [showPlans, setShowPlans] = useState(false);

  // 🔥 CHECK LIMIT on page load
  useEffect(() => {
    async function loadLimit() {
      try {
        const res = await fetch("/api/check-limit");
        const data = await res.json();

        if (data.error) return;

        setUsed(data.used);
        setLimitReached(data.used >= 5);
      } catch (e) {
        console.log("Erro ao verificar limite");
      }
    }

    loadLimit();
  }, []);

  // Upload handler
  const handleUpload = (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  // 🔥 ANALISAR + CONTAR USO
  const analyzeChart = async () => {
    if (limitReached) {
      setShowPlans(true);
      return;
    }

    if (!image) {
      alert("Envie um gráfico primeiro!");
      return;
    }

    setLoading(true);

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
        // 🔥 Registrar análise usada
        await fetch("/api/use-analysis", { method: "POST" });

        const params = new URLSearchParams({
          reco: data.recommendation || "",
          conf: String(data.confidence || ""),
          trend: data.trend || "",
          analysis: data.analysis || "",
          risk: data.riskLevel || "",
          support: data.support || "",
          resistance: data.resistance || "",
          entry: data.entryPoint || "",
          stop: data.stopLoss || "",
          take: data.takeProfit || "",
          time: data.timeframe || "",
        });

        window.location.href = `/result-test?${params.toString()}`;
      }
    } catch (err) {
      alert("Erro ao analisar gráfico.");
    }

    setLoading(false);
  };

  return (
    <main className="page-container">
      {/* POP-UP PREMIUM */}
      {showPlans && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>Limite atingido 🔥</h2>
            <p>Você usou suas 5 análises gratuitas.</p>

            <h3>Escolha um plano</h3>

            <button className="plan-btn">🔹 Semanal – R$ 9,90</button>
            <button className="plan-btn">🔹 Mensal – R$ 19,90</button>
            <button className="plan-btn">🔹 Trimestral – R$ 39,90</button>

            <button className="popup-close" onClick={() => setShowPlans(false)}>
              Voltar
            </button>
          </div>
        </div>
      )}

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

      {/* MAIN CARD */}
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

        {/* UPLOAD */}
        <div className="upload-area">
          <div className="upload-icon">
            <Upload size={42} color="white" />
          </div>

          <p className="upload-text">
            {image ? "Imagem carregada!" : "Clique para fazer upload"}
          </p>

          <p className="upload-sub">PNG, JPG ou print de tela</p>

          {image && <img src={image} alt="preview" className="preview-img" />}
        </div>

        {/* BOTÃO ANALISAR */}
        <button
          className="analisar-btn"
          onClick={analyzeChart}
          disabled={limitReached}
          style={{ opacity: limitReached ? 0.5 : 1 }}
        >
          {limitReached
            ? "Limite de análises atingido"
            : loading
            ? "Analisando..."
            : "Analisar Gráfico"}
        </button>

        {/* Mostra tentativas restantes */}
        <p style={{ marginTop: 10, textAlign: "center", opacity: 0.7 }}>
          Você usou {used} / 5 análises gratuitas
        </p>
      </div>
    </main>
  );
}