"use client";

import "./animations.css";
import { useSearchParams } from "next/navigation";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Timer,
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

  return (
    <main
      className="premium-bg fade-in"
      style={{
        minHeight: "100vh",
        padding: "30px",
        color: "white",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h1 className="title-glow">
        Resultado Premium 🔥
      </h1>

      {/* CARD DE RECOMENDAÇÃO */}
      <div
        className="premium-card scale-in"
        style={{
          border: `2px solid ${getColor()}`,
          padding: "20px",
          borderRadius: "15px",
          marginBottom: "25px",
        }}
      >
        <h2 style={{ fontSize: "22px", marginBottom: "10px" }}>Recomendação</h2>

        <p
          className="pulse"
          style={{
            fontSize: "30px",
            color: getColor(),
            fontWeight: "bold",
          }}
        >
          {recommendation}
        </p>

        <p style={{ marginTop: "10px" }}>
          Confiança: <b>{confidence}%</b>
        </p>
      </div>

      {/* DADOS */}
      <p><b>Tendência:</b> {trend}</p>
      <p><b>Risco:</b> {risk}</p>
      <p><b>Suporte:</b> {support}</p>
      <p><b>Resistência:</b> {resistance}</p>
      <p><b>Entrada:</b> {entry}</p>
      <p><b>Stop:</b> {stop}</p>
      <p><b>Take Profit:</b> {take}</p>
      <p><b>Prazo:</b> {time}</p>

      {/* RESUMO FINAL */}
      <div className="slide-up" style={{ marginTop: "20px" }}>
        <h3 style={{ marginBottom: "10px" }}>Resumo Inteligente</h3>
        <p>{analysis}</p>
      </div>
    </main>
  );
}