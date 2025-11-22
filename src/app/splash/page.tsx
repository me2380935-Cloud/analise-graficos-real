"use client";
import "./style.css";

export default function SplashScreen() {
  return (
    <div className="splash-container">
      <div className="splash-glow"></div>

      <div className="logo-wrapper">
        <img src="/icon.svg" alt="Logo" className="logo" />
        <h1 className="splash-title">TradeVision AI</h1>
        <p className="splash-sub">Tecnologia Premium de Mercado</p>
      </div>
    </div>
  );
}
