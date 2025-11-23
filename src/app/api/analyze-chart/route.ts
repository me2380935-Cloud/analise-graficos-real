const analyzeChart = async () => {
  if (!image) {
    alert("Envie um gráfico primeiro!");
    return;
  }

  setLoading(true);

  try {
    // 👉 Pega o email do aparelho
    const deviceEmail = getDeviceEmail();

    // 👉 Verifica limite no Supabase
    const limitCheck = await fetch("/api/check-limit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: deviceEmail })
    });

    const limit = await limitCheck.json();

    if (limit.error) {
      alert(limit.error);
      setLoading(false);
      return;
    }

    // 👉 Se já usou as 5 análises grátis
    if (!limit.allowed) {
      window.location.href = "/plans"; // vai para página de planos
      return;
    }

    // 👉 Agora pode analisar o gráfico normalmente
    const resp = await fetch("/api/analyze-chart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image })
    });

    const data = await resp.json();

    if (data.error) {
      alert("Erro: " + data.error);
    } else {
      const params = new URLSearchParams({
        reco: data.recommendation || "",
        conf: String(data.confidence || ""),
        trend: data.trend || "",
        analysis: data.analysis || "",
        risk: data.riskLevel || "",
        support: data.support || "",
        resistance: data.resistance || "",
        entry: data.entryPoint || "",
        stop: data.stopLoss || "",
        take: data.takeProfit || "",
        time: data.timeframe || "",
      });

      window.location.href = `/result-test?${params.toString()}`;
    }
  } catch (err) {
    alert("Erro ao analisar gráfico.");
  }

  setLoading(false);
};