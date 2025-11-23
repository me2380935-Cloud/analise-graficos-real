"use client";
import "./home.css";

import { useState, useEffect } from "react";
import { Upload } from "lucide-react";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [limit, setLimit] = useState<number | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const MAX_LIMIT = 5;

  // ==== Verifica limite no backend ====
  useEffect(() => {
    async function loadLimit() {
      try {
        const resp = await fetch("/api/use-analysis", { method: "GET" });
        const data = await resp.json();
        setLimit(data.used || 0);

        if (data.used >= MAX_LIMIT) {
          setShowPopup(true);
        }
      } catch (err) {
        console.log("Erro ao carregar limite");
      }
    }
    loadLimit();
  }, []);

  // ==== Upload ====
  const handleUpload = (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  // ==== ANALISAR GRÁFICO ====
  const analyzeChart = async () => {
    if (!image) {
      alert("Envie um gráfico primeiro!");
      return;
    }

    if (limit !== null && limit >= MAX_LIMIT) {
      setShowPopup(true);
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
        // Conta uso no Supabase
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

      {/* CARD PRINCIPAL */}
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

          {image && <img src={image} alt="preview" className="preview-img" />}
        </div>

        {/* BOTÃO ANALISAR */}
        <button
          className="analisar-btn"
          onClick={analyzeChart}
          disabled={limit !== null && limit >= MAX_LIMIT}
          style={{
            opacity: limit !== null && limit >= MAX_LIMIT ? 0.5 : 1,
            cursor: limit !== null && limit >= MAX_LIMIT ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Analisando..." : limit >= MAX_LIMIT ? "Limite atingido" : "Analisar Gráfico"}
        </button>
      </div>

      {/* POPUP PREMIUM */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>Limite atingido</h2>
            <p>Você usou suas 5 análises grátis.</p>
            <p>Escolha um plano para continuar:</p>

            <button className="plan-btn">Plano Semanal</button>
            <button className="plan-btn">Plano Mensal</button>
            <button className="plan-btn">Plano 3 Meses</button>

            <button className="popup-close" onClick={() => setShowPopup(false)}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}