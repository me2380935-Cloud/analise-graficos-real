 "use client";

import "./plans.css";

export default function PlansPage() {
  const choosePlan = (plan: string) => {
    alert("Plano escolhido: " + plan);
    // Depois colocamos o checkout real (Stripe, MercadoPago, etc)
  };

  return (
    <main className="plans-container">

      {/* TÍTULO */}
      <h1 className="plans-title">Escolha Seu Plano</h1>
      <p className="plans-subtitle">
        Suas 5 análises grátis acabaram. Continue utilizando a IA sem limites!
      </p>

      {/* CARD 1 — SEMANAL */}
      <div className="plan-card">
        <h2>Plano Semanal</h2>
        <p className="plan-price">R$ 14,90</p>
        <ul className="plan-list">
          <li>Acesso ilimitado</li>
          <li>Análises rápidas</li>
          <li>Atualizações automáticas</li>
        </ul>
        <button className="plan-btn" onClick={() => choosePlan("weekly")}>
          Assinar Semanal
        </button>
      </div>

      {/* CARD 2 — MENSAL */}
      <div className="plan-card">
        <h2>Plano Mensal</h2>
        <p className="plan-price">R$ 29,90</p>
        <ul className="plan-list">
          <li>Acesso ilimitado</li>
          <li>Suporte Prioritário</li>
          <li>Melhor custo benefício</li>
        </ul>
        <button className="plan-btn" onClick={() => choosePlan("monthly")}>
          Assinar Mensal
        </button>
      </div>

      {/* CARD 3 — TRIMESTRAL */}
      <div className="plan-card">
        <h2>Plano 3 Meses</h2>
        <p className="plan-price">R$ 69,90</p>
        <ul className="plan-list">
          <li>Acesso ilimitado</li>
          <li>Economia de 22%</li>
          <li>Bônus exclusivo</li>
        </ul>
        <button className="plan-btn" onClick={() => choosePlan("3months")}>
          Assinar 3 Meses
        </button>
      </div>
    </main>
  );
}