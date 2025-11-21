"use client";

import { useSearchParams } from "next/navigation";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Timer
} from "lucide-react";

export default function ResultadoPage() {
  const params = useSearchParams();

  const recommendation = params.get("reco") || "HOLD";
  const confidence = params.get("conf") || "0";
  const trend = params.get("trend") || "—";
  const analysis = params.get("analysis") || "—";
  const risk = params.get("risk") || "—";
  const support = params.get("support") || "—";
  const resistance = params.get("resistance") || "—";
  const entry = params.get("entry") || "—";
  const stop = params.get("stop") || "—";
  const take = params.get("take") || "—";
  const timeframe = params.get("time") || "—";

  // 🔥 Cores automáticas premium
  const getColor = () => {
    if (recommendation === "BUY") return "#00ff85";
    if (recommendation === "SELL") return "#ff3b3b";
    return "#ffd93b"; // HOLD
  };

  const getIcon = () => {
    if (recommendation === "BUY")
      return <ArrowUpCircle size={70} color="#00ff85" />;
    if (recommendation === "SELL")
      return <ArrowDownCircle size={70} color="#ff3b3b" />;
    return <Timer size={70} color="#ffd93b" />;
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "30px",
        background: "radial-gradient(circle at top, #3a0066, #0d0018)",
        color: "white",
        fontFamily: "Inter, sans-serif"
      }}
    >
      {/* Título */}
      <h1
        style={{
          fontSize: "30px",
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: "20px",
          background: "linear-gradient(90deg, #b026ff, #e879f9)",
          WebkitBackgroundClip: "text",
          color: "transparent",
          textShadow: "0 0 12px #b026ff"
        }}
      >
        Resultado da Análise
      </h1>

      {/* Card principal */}
      <div
        style={{
          borderRadius: "20px",
          padding: "25px",
          border: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(255, 255, 255, 0.06)",
          boxShadow: "0 0 20px #b026ff44",
          backdropFilter: "blur(14px)"
        }}
      >
        {/* Ícone e recomendação */}
        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          {getIcon()}

          <h2
            style={{
              marginTop: "15px",
              fontSize: "34px",
              fontWeight: "700",
              color: getColor(),
              textShadow: `0 0 12px ${getColor()}`
            }}
          >
            {recommendation}
          </h2>

          <p style={{ opacity: 0.8, marginTop: 6 }}>
            Confiança da IA: {confidence}%
          </p>
        </div>

        {/* Tendência */}
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ opacity: 0.9, fontSize: "18px" }}>Tendência</h3>
          <p style={{ opacity: 0.75 }}>{trend}</p>
        </div>

        {/* Suporte / Resistência */}
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ opacity: 0.9, fontSize: "18px" }}>Níveis Técnicos</h3>
          <p style={{ opacity: 0.75 }}>
            <b>Suporte:</b> {support}
          </p>
          <p style={{ opacity: 0.75 }}>
            <b>Resistência:</b> {resistance}
          </p>
        </div>

        {/* Risco */}
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ opacity: 0.9, fontSize: "18px" }}>Risco</h3>
          <p style={{ opacity: 0.75 }}>{risk}</p>
        </div>

        {/* Resumo */}
        <div style={{ marginBottom: "25px" }}>
          <h3 style={{ opacity: 0.9, fontSize: "18px" }}>
            Resumo Inteligente
          </h3>
          <p style={{ opacity: 0.75, lineHeight: "1.5" }}>{analysis}</p>
        </div>

        {/* Estratégia */}
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ opacity: 0.9, fontSize: "18px" }}>
            Estratégia Sugerida
          </h3>
          <p style={{ opacity: 0.75 }}>
            <b>Entrada:</b> {entry}
          </p>
          <p style={{ opacity: 0.75 }}>
            <b>Stop:</b> {stop}
          </p>
          <p style={{ opacity: 0.75 }}>
            <b>Take Profit:</b> {take}
          </p>
          <p style={{ opacity: 0.75 }}>
            <b>Prazo:</b> {timeframe}
          </p>
        </div>
      </div>

      {/* Botão voltar */}
      <button
        onClick={() => (window.location.href = "/")}
        style={{
          marginTop: "40px",
          width: "100%",
          padding: "16px",
          borderRadius: "14px",
          fontSize: "18px",
          fontWeight: "600",
          border: "none",
          cursor: "pointer",
          background:
            "linear-gradient(90deg, #b026ff, #6d28d9, #9333ea, #c084fc)",
          boxShadow: "0 0 20px #7c3aedaa",
          color: "white"
        }}
      >
        Nova Análise
      </button>
    </main>
  );
}
