"use client";

import "./home.css";
import { useRouter } from "next/navigation";
import { Upload, Camera, Save, Play } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  const goToAnalyze = () => router.push("/home"); // mantém /home como rota funcional
  const goToResult = () => router.push("/result-test");

  return (
    <main className="home-root">
      <header className="home-header">
        <div className="brand">
          <div className="brand-icon">📊</div>
          <div className="brand-text">
            <h1>TradeVision AI</h1>
            <p>Análise Inteligente de Mercado</p>
          </div>
        </div>

        <div className="header-actions">
          <button className="mode-btn">Modo</button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-left">
          <h2 className="hero-title">Capture — Analise — Decida</h2>
          <p className="hero-sub">
            Faça upload ou tire uma foto do gráfico. Receba uma análise premium com
            recomendação, confiança e estratégia.
          </p>

          <div className="hero-actions">
            <label className="btn btn-outline">
              <Upload size={18} />
              <span>Upload</span>
              <input type="file" accept="image/*" hidden />
            </label>

            <label className="btn btn-outline">
              <Camera size={18} />
              <span>Tirar Foto</span>
              <input type="file" accept="image/*" capture="environment" hidden />
            </label>

            <button className="btn btn-primary" onClick={goToAnalyze}>
              <Play size={18} />
              <span>Analisar Gráfico</span>
            </button>
          </div>

          <div className="features">
            <div className="feature">
              <strong>Tendência</strong>
              <span>Alta / Baixa / Lateral</span>
            </div>
            <div className="feature">
              <strong>Indicadores</strong>
              <span>RSI, MACD, Médias</span>
            </div>
            <div className="feature">
              <strong>Confiança</strong>
              <span>Score %</span>
            </div>
          </div>
        </div>

        <div className="hero-right">
          {/* imagem de referência (transforme o caminho local em URL no deploy) */}
          <div className="mockup-card">
            <img
              src="/mnt/data/355717B9-F8B6-4845-B372-4D91C5A067F7.jpeg"
              alt="mockup"
              className="mockup-img"
            />
            <div className="mockup-overlay">
              <div className="mockup-glow" />
              <div className="mockup-info">
                <p className="mini-title">Preview do Gráfico</p>
                <div className="mini-actions">
                  <button className="mini-btn green">Compra</button>
                  <button className="mini-btn red">Venda</button>
                  <button className="mini-btn yellow">Salvar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cards">
        <div className="card">
          <h3>Resumo Inteligente</h3>
          <p>Resumo rápido da análise e pontos principais, otimizado para decisões rápidas.</p>
        </div>

        <div className="card">
          <h3>Suporte & Resistência</h3>
          <p>Níveis calculados automaticamente com confiança e sinais técnicos.</p>
        </div>

        <div className="card">
          <h3>Estratégias</h3>
          <p>Entrada, stop loss e take profit sugeridos com timeframe recomendado.</p>
        </div>
      </section>

      <footer className="home-footer">
        <p>© TradeVision AI • Desenvolvido por você</p>
      </footer>
    </main>
  );
}