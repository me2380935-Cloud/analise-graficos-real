"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SplashScreen() {
  const router = useRouter();

  // Redirecionamento automático
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/home");
    }, 2500); // 2.5s

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div style={styles.container}>
      {/* LOGO */}
      <div style={styles.logoWrapper}>
        <div style={styles.logoGlow} />
        <img
          src="/icon.svg" // você pode trocar pela logo premium futuramente
          alt="logo"
          style={styles.logo}
        />
      </div>

      {/* TÍTULO */}
      <h1 style={styles.title}>TradeVision AI</h1>

      {/* SUBTÍTULO */}
      <p style={styles.subtitle}>Análise Inteligente de Mercado</p>
    </div>
  );
}

/* ===================  ESTILOS PREMIUM =================== */
const styles: Record<string, React.CSSProperties> = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background:
      "radial-gradient(circle at top, #1a082b 0%, #090012 60%, #000000 100%)",
    animation: "fadeIn 1.2s ease-out forwards",
    position: "relative",
    overflow: "hidden",
    textAlign: "center",
  },

  // CAIXA DA LOGO
  logoWrapper: {
    position: "relative",
    width: 130,
    height: 130,
    marginBottom: 20,
  },

  // BRILHO AO REDOR
  logoGlow: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(168,85,247,0.6), rgba(168,85,247,0.1) 60%, transparent 100%)",
    filter: "blur(25px)",
    animation: "pulseGlow 3s infinite ease-in-out",
  },

  // LOGO
  logo: {
    width: "100%",
    height: "100%",
    zIndex: 2,
    position: "relative",
    animation: "float 3s ease-in-out infinite",
  },

  // TÍTULO
  title: {
    fontSize: 34,
    fontWeight: 700,
    color: "white",
    marginTop: 10,
    textShadow: "0 0 12px #a855f7, 0 0 22px #9333ea",
    animation: "fadeIn 2s ease-out forwards",
  },

  // SUBTÍTULO
  subtitle: {
    fontSize: 16,
    color: "#c9a4ff",
    marginTop: 8,
    opacity: 0.8,
  },
};

/* ===================  ANIMAÇÕES (CSS GLOBAL) =================== */
/*
IMPORTANTE: cole isso dentro do arquivo globals.css:

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes float {
  0%   { transform: translateY(0); }
  50%  { transform: translateY(-10px); }
  100% { transform: translateY(0); }
}

@keyframes pulseGlow {
  0%   { transform: scale(0.95); opacity: 0.8; }
  50%  { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.8; }
}
*/
