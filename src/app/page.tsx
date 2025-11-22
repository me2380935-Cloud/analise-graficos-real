"use client";
import "./home.css";
import { useState } from "react";
import { Upload } from "lucide-react";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = (e: any) => {
    const file = e.target.files?.[0];
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
    } catch (e) {
      alert("Erro ao analisar.");
    }

    setLoading(false);
  };

  return (
    <main className="home-container">

      {/* LOGO / HEADER */}
      <div className="home-header fade-in">
        <h1 className="brand-title">TradeVision AI</h1>
        <p className="brand-sub">Análise Inteligente de Mercado</p>
      </div>

      {/* CARD PRINCIPAL */}
      <div className="card neon-card float-up">

        <h2 className="card-title">Enviar Gráfico</h2>
        <p className="card-sub">PNG, JPG ou Print de Tela</p>

        {/* UPLOAD */}
        <label className="upload-box glow-pulse">
          <Upload size={42} color="#ffffff" />
          <p className="upload-text">
            {image ? "Imagem carregada!" : "Toque para enviar"}
          </p>

          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleUpload}
          />
        </label>

        {/* PREVIEW DA IMAGEM */}
        {image && (
          <img src={image} alt="preview" className="preview-image fade-in" />
        )}

        {/* BOTÃO ANALISAR */}
        <button
          className="analyze-btn neon-button glow-pulse"
          onClick={analyzeChart}
        >
          {loading ? "Analisando..." : "Analisar Gráfico"}
        </button>

      </div>
    </main>
  );
}