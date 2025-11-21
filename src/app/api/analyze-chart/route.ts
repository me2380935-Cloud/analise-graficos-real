// /src/app/api/analyze/route.ts
import { NextResponse } from "next/server";
import * as ti from "technicalindicators";

type Candle = { t: string | number; o: number; h: number; l: number; c: number; v?: number };

async function callOpenAIExtractCandles(imageDataUriOrUrl: string, openAiKey: string) {
  // Prompt rigoroso: pedir um JSON estrito com candles (últimos 50 candles preferencialmente).
  const systemPrompt = `Você é um extrator técnico de dados de gráfico. 
Receberá uma imagem com um gráfico de velas e deve retornar APENAS um JSON válido sem explicações
no formato: { "candles": [ { "t": 1672531200, "o": 1.2345, "h": 1.2350, "l": 1.2330, "c": 1.2348, "v": 1234 }, ... ] }
Retorne entre 30 e 100 candles mais recentes (preferência 50). Os campos devem ser números (timestamp em unix ou ISO aceitável).
Se não puder extrair, retorne { "candles": [] }.
Se houver múltiplas áreas detectadas, retorne apenas a série principal.`;

  const userMessage = [
    { role: "user", content: "Extrai os candles em JSON, seguindo estritamente o esquema do system prompt." },
    {
      role: "user",
      content: `image: ${imageDataUriOrUrl}`
    }
  ];

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openAiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...userMessage
      ],
      temperature: 0.0,
      max_tokens: 2000,
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`OpenAI error ${resp.status}: ${err}`);
  }

  const json = await resp.json();
  const text = json.choices?.[0]?.message?.content ?? "";
  // clean any code fences
  const cleaned = text.replace(/```json\s?|```/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    return parsed as { candles?: Candle[] };
  } catch (e) {
    // fallback: try to find JSON substring
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { /* pass */ }
    }
    throw new Error("Unable to parse OpenAI response as JSON. Response: " + cleaned);
  }
}

function computeIndicators(candles: Candle[]) {
  // Convert to arrays expected by technicalindicators
  const closes = candles.map(c => c.c);
  const highs = candles.map(c => c.h);
  const lows = candles.map(c => c.l);
  const volumes = candles.map(c => c.v ?? 0);

  // Ensure we have enough points
  const safe = (fn: () => any, fallback: any) => {
    try { return fn(); } catch { return fallback; }
  };

  const rsi = safe(() => ti.RSI.calculate({ period: 14, values: closes }), []);
  const ema20 = safe(() => ti.EMA.calculate({ period: 20, values: closes }), []);
  const ema50 = safe(() => ti.EMA.calculate({ period: 50, values: closes }), []);
  const macd = safe(() => ti.MACD.calculate({
    values: closes, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, SimpleMAOscillator: false, SimpleMASignal: false
  }), []);
  const bb = safe(() => ti.BollingerBands.calculate({ period: 20, values: closes, stdDev: 2 }), []);

  return {
    lastClose: closes[closes.length - 1],
    closes, highs, lows, volumes,
    rsi, ema20, ema50, macd, bb
  };
}

function scoreRecommendation(indicators: ReturnType<typeof computeIndicators>) {
  // Basic scoring rules (you can tune weights)
  const { lastClose, rsi, ema20, ema50, macd, bb, closes } = indicators;
  let score = 0;
  const reasons: string[] = [];

  // EMA crossover: compare last EMA20 vs EMA50 (they are shorter arrays - align to end)
  const lastEma20 = ema20[ema20.length - 1];
  const lastEma50 = ema50[ema50.length - 1];
  if (lastEma20 && lastEma50) {
    if (lastEma20 > lastEma50) { score += 25; reasons.push("EMA20 > EMA50 (bullish)"); }
    else if (lastEma20 < lastEma50) { score -= 25; reasons.push("EMA20 < EMA50 (bearish)"); }
  }

  // RSI
  const lastRsi = rsi[rsi.length - 1];
  if (lastRsi !== undefined) {
    if (lastRsi < 30) { score += 15; reasons.push(`RSI ${Math.round(lastRsi)} (oversold)`); }
    else if (lastRsi > 70) { score -= 15; reasons.push(`RSI ${Math.round(lastRsi)} (overbought)`); }
    else { score += 5; reasons.push(`RSI ${Math.round(lastRsi)} (neutral)`); }
  }

  // MACD histogram
  const lastMacd = macd[macd.length - 1];
  if (lastMacd) {
    const hist = lastMacd.histogram;
    if (hist > 0) { score += 12; reasons.push("MACD histogram > 0 (bullish)"); }
    else if (hist < 0) { score -= 12; reasons.push("MACD histogram < 0 (bearish)"); }
  }

  // Price relative to Bollinger Bands
  const lastBB = bb[bb.length - 1];
  if (lastBB) {
    if (lastClose > lastBB.upper) { score -= 8; reasons.push("Price above upper Bollinger (possible pullback)"); }
    else if (lastClose < lastBB.lower) { score += 8; reasons.push("Price below lower Bollinger (possible rebound)"); }
  }

  // Short-term momentum: compare last close vs previous close
  const prevClose = closes[closes.length - 2];
  if (prevClose) {
    if (lastClose > prevClose) { score += 5; reasons.push("Short-term upward momentum"); }
    else if (lastClose < prevClose) { score -= 5; reasons.push("Short-term downward momentum"); }
  }

  // Map score to recommendation
  const normalized = Math.max(-100, Math.min(100, score));
  let recommendation: "BUY" | "SELL" | "HOLD" = "HOLD";
  if (normalized >= 20) recommendation = "BUY";
  else if (normalized <= -20) recommendation = "SELL";
  else recommendation = "HOLD";

  // Confidence: map absolute score to 50-95 range (so low scores still have baseline)
  const confidence = Math.round(50 + (Math.min(95, Math.abs(normalized)) * 0.45));

  return { recommendation, confidence, score: normalized, reasons, lastRsi };
}

function smartRoundPrice(p: number) {
  if (p >= 1000) return p.toFixed(0);
  if (p >= 100) return p.toFixed(2);
  return p.toFixed(4);
}

export async function POST(request: Request) {
  try {
    const openAiKey = process.env.OPENAI_API_KEY;
    if (!openAiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY não configurada" }, { status: 500 });
    }

    // Detecta FormData upload (file) ou JSON com image URL
    const contentType = request.headers.get("content-type") || "";
    let imageSource: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file") as any;
      if (!file) return NextResponse.json({ error: "Arquivo 'file' não fornecido" }, { status: 400 });

      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      // cria data URI (assume image/png se não souber)
      const mime = file.type || "image/png";
      imageSource = `data:${mime};base64,${base64}`;
    } else {
      // JSON body with { image: "url" }
      try {
        const body = await request.json();
        if (!body?.image) return NextResponse.json({ error: "Campo 'image' não fornecido" }, { status: 400 });
        imageSource = body.image;
      } catch {
        return NextResponse.json({ error: "Formato de request inválido" }, { status: 400 });
      }
    }

    // 1) Pedir ao OpenAI para retornar candles (OHLC)
    const extracted = await callOpenAIExtractCandles(imageSource, openAiKey);
    const candles: Candle[] = extracted?.candles ?? [];

    if (!candles || candles.length < 12) {
      // fallback: se OpenAI não extraiu suficientes candles, retornar erro amigável
      return NextResponse.json({ error: "Não foi possível extrair candles suficientes da imagem." }, { status: 422 });
    }

    // 2) Calcular indicadores localmente
    const indicators = computeIndicators(candles);

    // 3) Calcular suportes/resistências simples (pivots) e formato de saída
    // pivots simples: usar últimos 20 closes para calcular pivot points (classic)
    const closes = indicators.closes;
    const lastClose = indicators.lastClose;
    const recentHigh = Math.max(...indicators.highs.slice(-50));
    const recentLow = Math.min(...indicators.lows.slice(-50));
    const support = smartRoundPrice(recentLow);
    const resistance = smartRoundPrice(recentHigh);

    // 4) Score / Recommendation
    const scored = scoreRecommendation(indicators);

    // 5) Prepare indicators list compacta
    const indicatorsOut = [
      { name: "RSI (14)", value: indicators.rsi[indicators.rsi.length - 1]?.toFixed(1) ?? "n/a", signal: (indicators.rsi[indicators.rsi.length - 1] ?? 50) > 70 ? "bearish" : ((indicators.rsi[indicators.rsi.length - 1] ?? 50) < 30 ? "bullish" : "neutral") },
      { name: "EMA20", value: indicators.ema20[indicators.ema20.length - 1]?.toFixed(4) ?? "n/a", signal: (indicators.ema20[indicators.ema20.length - 1] ?? 0) > (indicators.ema50[indicators.ema50.length - 1] ?? 0) ? "bullish" : "bearish" },
      { name: "EMA50", value: indicators.ema50[indicators.ema50.length - 1]?.toFixed(4) ?? "n/a", signal: "neutral" },
      { name: "MACD hist", value: indicators.macd[indicators.macd.length - 1]?.histogram?.toFixed(4) ?? "n/a", signal: (indicators.macd[indicators.macd.length - 1]?.histogram ?? 0) > 0 ? "bullish" : "bearish" },
    ];

    // 6) Build response
    const result = {
      recommendation: scored.recommendation,
      confidence: scored.confidence,
      trend: (scored.score > 0 ? "Alta" : (scored.score < 0 ? "Baixa" : "Lateral")),
      support: `$${support}`,
      resistance: `$${resistance}`,
      indicators: indicatorsOut,
      analysis: `Análise combinada IA+indicadores. Motivos: ${scored.reasons.join(", ")}.`,
      riskLevel: Math.abs(scored.score) > 50 ? "high" : Math.abs(scored.score) > 25 ? "medium" : "low",
      entryPoint: `$${smartRoundPrice(lastClose * (scored.recommendation === "BUY" ? 0.995 : 1.005))}`,
      stopLoss: `$${smartRoundPrice(lastClose * (scored.recommendation === "BUY" ? 0.985 : 1.015))}`,
      takeProfit: `$${smartRoundPrice(lastClose * (scored.recommendation === "BUY" ? 1.03 : 0.97))}`,
      timeframe: "Curto prazo",
      marketContext: "Imagem analisada estática; recomendações baseadas em candles visuais e cálculos locais."
    };

    return NextResponse.json(result);

  } catch (err: any) {
    console.error("API analyze error:", err);
    return NextResponse.json({ error: "Erro interno", details: err?.message || String(err) }, { status: 500 });
  }
}