"use client";
import "./home.css";

import { useState } from "react";
import { Upload } from "lucide-react";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const analyzeChart = async () => {
    if (!image) {
      alert("Envie um gráfico primeiro!");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Verifica limite de análises do usuário
      const limitResp = await fetch("/api/check-limit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const limitData = await limitResp.json();

      if (limitData.error) {
        alert(limitData.error);
        setLoading(false);
        return;
      }

      // 2️⃣ Se o limite acabou, manda para a página de planos
      if (limitData.allowed === false) {
        window.location.href = "/plans";
        return;
      }

      // 3️⃣ Analisar gráfico normalmente
      const resp = await fetch("/api/analyze-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });

      const data = await resp.json();

      if (data.error) {
        alert("Erro: " + data.error);
      } else {
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
      
      {/* ====== HEADER ====== */}
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

      {/* ====== CARD PRINCIPAL ====== */}
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
              <input
                type="file"
                accept="image/*"
                capture="environment"
                hidden
                onChange={handleUpload}
              />
            </label>
          </div>
        </div>

        {/* ====== ÁREA DE UPLOAD ====== */}
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

        {/* ====== BOTÃO ANALISAR ====== */}
        <button className="analisar-btn" onClick={analyzeChart}>
          {loading ? "Analisando..." : "Analisar Gráfico"}
        </button>
      </div>
    </main>
  );
}