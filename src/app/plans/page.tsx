"use client";

import "./plans.css";

export default function PlansPage() {
  return (
    <main className="plans-container">
      <h1 className="plans-title">Planos Premium 🔥</h1>
      <p className="plans-subtitle">Escolha um plano para continuar usando o TradeVision AI</p>

      <div className="plans-wrapper">

        {/* 🔥 PLANO SEMANAL */}
        <div className="plan-card glow">
          <h2 className="plan-name">Plano Semanal</h2>
          <p className="plan-price">R$ 14,90</p>
          <p className="plan-info">Acesso ilimitado por 7 dias</p>

          <button className="plan-btn">Assinar Semanal</button>
        </div>

        {/* 🔥 PLANO MENSAL — RECOMENDADO */}
        <div className="plan-card glow recommended">
          <div className="badge">Recomendado ⭐</div>

          <h2 className="plan-name">Plano Mensal</h2>
          <p className="plan-price">R$ 29,90</p>
          <p className="plan-info">Melhor custo-benefício</p>

          <button className="plan-btn">Assinar Mensal</button>
        </div>

        {/* 🔥 PLANO 3 MESES */}
        <div className="plan-card glow">
          <h2 className="plan-name">Plano 3 Meses</h2>
          <p className="plan-price">R$ 69,90</p>
          <p className="plan-info">Pague menos por mês</p>

          <button className="plan-btn">Assinar 3 Meses</button>
        </div>

        {/* 🔥 TESTE GRÁTIS (já usado) */}
        <div className="plan-card disabled">
          <h2 className="plan-name">Teste Grátis</h2>
          <p className="plan-price">5 análises</p>

          <button className="plan-btn blocked" disabled>Já utilizado</button>
        </div>

      </div>
    </main>
  );
}
