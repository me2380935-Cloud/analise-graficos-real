"use client";

import "./animations.css";
import { useSearchParams } from "next/navigation";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Minus,
} from "lucide-react";

export default function ResultContent() {
  const params = useSearchParams();

  const recommendation = params.get("reco") || "HOLD";
  const confidence = params.get("conf") || "0";
  const trend = params.get("trend") || "--";
  const analysis = params.get("analysis") || "--";
  const risk = params.get("risk") || "--";
  const support = params.get("support") || "--";
  const resistance = params.get("resistance") || "--";
  const entry = params.get("entry") || "--";
  const stop = params.get("stop") || "--";
  const take = params.get("take") || "--";
  const time = params.get("time") || "--";

  const getColor = () => {
    if (recommendation === "BUY") return "#00ff9d";
    if (recommendation === "SELL") return "#ff4f4f";
    return "#ffd93b";
  };

  const getIcon = () => {
    if (recommendation === "BUY")
      return <ArrowUpCircle size={42} style={{ color: getColor() }} className="pulse" />;
    if (recommendation === "SELL")
      return <ArrowDownCircle size={42} style={{ color: getColor() }} className="pulse" />;
    return <Minus size={42} style={{ color: getColor() }} className="pulse" />;
  };

  return (
    <main className="premium-bg fade-in"
      style={{
        minHeight: "100vh",
        padding: "35px",
        color: "white",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* TÍTULO */}
      <h1 className="title-glow">Resultado Premium 🔥</h1>

      {/* CARD PRINCIPAL */}
      <div
        className="premium-card scale-in"
        style={{
          border: `2px solid ${getColor()}`,
          padding: "22px",
          borderRadius: "18px",
          marginBottom: "32px",
        }}
      >
        {/* ÍCONE */}
        <div style={{ marginBottom: "12px" }}>
          {getIcon()}
        </div>

        <h2 style={{ fontSize: "22px", marginBottom: "8px" }}>Recomendação</h2>

        <p
          className="pulse"
          style={{
            fontSize: "35px",
            color: getColor(),
            fontWeight: "bold",
            marginBottom: "10px",
          }}
        >
          {recommendation}
        </p>

        {/* CONFIDENCE BAR */}
        <p><b>Confiança:</b> {confidence}%</p>
      </div>

      {/* DADOS DO MERCADO */}
      <div className="fade-in" style={{ marginBottom: "15px" }}>
        <p><b>Tendência:</b> {trend}</p>
        <p><b>Risco:</b> {risk}</p>
        <p><b>Suporte:</b> {support}</p>
        <p><b>Resistência:</b> {resistance}</p>
        <p><b>Ponto de Entrada:</b> {entry}</p>
        <p><b>Stop Loss:</b> {stop}</p>
        <p><b>Take Profit:</b> {take}</p>
        <p><b>Timeframe:</b> {time}</p>
      </div>

      {/* RESUMO INTELIGENTE */}
      <div className="slide-up" style={{ marginTop: "25px" }}>
        <h3 style={{ marginBottom: "10px", fontSize: "20px" }}>Resumo Inteligente</h3>
        <p style={{ lineHeight: "1.6", opacity: 0.95 }}>
          {analysis}
        </p>
      </div>
    </main>
  );
}