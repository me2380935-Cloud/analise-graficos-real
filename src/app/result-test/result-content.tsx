"use client";

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
      style={{
        minHeight: "100vh",
        padding: "30px",
        background: "radial-gradient(circle at top, #1a0033, #000)",
        color: "white",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "28px",
          fontWeight: "bold",
          marginBottom: "20px",
          textShadow: "0 0 15px #a855f7",
        }}
      >
        Resultado Premium 🔥
      </h1>

      <div
        style={{
          border: `2px solid ${getColor()}`,
          padding: "20px",
          borderRadius: "15px",
          marginBottom: "25px",
          background: "rgba(255,255,255,0.05)",
        }}
      >
        <h2 style={{ fontSize: "22px", marginBottom: "10px" }}>Recomendação</h2>

        <p style={{ fontSize: "30px", color: getColor(), fontWeight: "bold" }}>
          {recommendation}
        </p>

        <p style={{ marginTop: "10px" }}>
          Confiança: <b>{confidence}%</b>
        </p>
      </div>

      <p><b>Tendência:</b> {trend}</p>
      <p><b>Risco:</b> {risk}</p>
      <p><b>Suporte:</b> {support}</p>
      <p><b>Resistência:</b> {resistance}</p>
      <p><b>Entrada:</b> {entry}</p>
      <p><b>Stop:</b> {stop}</p>
      <p><b>Take Profit:</b> {take}</p>
      <p><b>Prazo:</b> {time}</p>

      <div style={{ marginTop: "20px" }}>
        <h3 style={{ marginBottom: "10px" }}>Resumo Inteligente</h3>
        <p>{analysis}</p>
      </div>
    </main>
  );
}
