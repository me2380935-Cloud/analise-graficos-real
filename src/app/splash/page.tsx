"use client";

import "./style.css";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function SplashScreen() {
  const router = useRouter();

  const handleEnter = () => {
    router.push("/");
  };

  return (
    <div className="splash-container">
      <div className="logo-area">
        <Image
          src="/icon.svg"
          alt="App Icon"
          width={110}
          height={110}
          className="splash-icon"
        />
        <h1 className="splash-title">TradeVision AI</h1>
        <p className="splash-subtitle">Análise Inteligente de Mercado</p>
      </div>

      <button className="enter-button" onClick={handleEnter}>
        Entrar
      </button>
    </div>
  );
}