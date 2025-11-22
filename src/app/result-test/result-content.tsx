"use client";

import "./animations.css";
import { useSearchParams } from "next/navigation";
import { ArrowUpCircle, ArrowDownCircle, MinusCircle } from "lucide-react";

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
      return <ArrowUpCircle size={55} color="#00ff9d" className="icon-pulse" />;
    if (recommendation === "SELL")
      return <ArrowDownCircle size={55} color="#ff4f4f" className="icon-pulse" />;
    return <MinusCircle size={55} color="#ffd93b" className="icon-pulse" />;
  };

  return (
    <main className="premium-page">
      <h1 className="premium-title glow-text">Resultado Premium 🔥</h1>

      {/* BLOCO DE RECOMENDAÇÃO - Glow Dinâmico + Fumaça */}
      <div className="recommendation-card glow-dynamic">

        {/* Fumaça */}
        <div className="smoke"></div>

        <div className="rec-icon">{getIcon()}</div>

        <h2 className="rec-title">Recomendação</h2>

        <p className="rec-value" style={{ color: getColor() }}>
          {recommendation}
        </p>

        <p className="rec-confidence">
          Confiança: <b>{confidence}%</b>
        </p>
      </div>

      {/* DEMAIS INFO */}
      <div className="info-container fade-in">
        <p><b>Tendência:</b> {trend}</p>
        <p><b>Risco:</b> {risk}</p>
        <p><b>Suporte:</b> {support}</p>
        <p><b>Resistência:</b> {resistance}</p>
        <p><b>Entrada:</b> {entry}</p>
        <p><b>Stop:</b> {stop}</p>
        <p><b>Take Profit:</b> {take}</p>
        <p><b>Prazo:</b> {time}</p>
      </div>

      <div className="analysis-box slide-up">
        <h3>Resumo Inteligente</h3>
        <p>{analysis}</p>
      </div>
    </main>
  );
}