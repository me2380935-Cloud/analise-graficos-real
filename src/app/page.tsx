"use client";

import { Upload } from "lucide-react";

export default function Home() {
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

      {/* CARD CAPTURAR GRÁFICO */}
      <div className="card main-card">
        <div className="card-header">
          <div>
            <h2>Capturar</h2>
            <h2>Gráfico</h2>
          </div>

          <div className="action-buttons">
            <button className="small-btn">Upload</button>
            <button className="small-btn">Tela</button>
          </div>
        </div>

        {/* ÁREA DE UPLOAD */}
        <div className="upload-area">
          <div className="upload-icon">
            <Upload size={42} color="white" />
          </div>

          <p className="upload-text">Clique para fazer upload</p>
          <p className="upload-sub">PNG, JPG ou print de tela</p>
        </div>

        {/* BOTÃO ANALISAR */}
        <button className="analisar-btn">Analisar Gráfico</button>
      </div>
    </main>
  );
}

