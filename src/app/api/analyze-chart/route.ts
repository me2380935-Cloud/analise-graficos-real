import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: "Nenhuma imagem recebida" },
        { status: 400 }
      );
    }

    const openAiKey = process.env.OPENAI_API_KEY;
    if (!openAiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY não configurada no Vercel" },
        { status: 500 }
      );
    }

    // PROMPT PREMIUM (nível mais alto possível)
    const systemPrompt = `
Você é um analista técnico profissional nível institucional. 
Use Price Action + padrões de candle + estrutura de mercado + análise multi-indicadores (RSI, MACD, MME/EMA, OBV, VWAP, Suporte/Resistência, Tendência, Momentum).

Sua missão:
1. Detectar os candles do gráfico com máxima precisão.
2. Analisar mercado com metodologia profissional.
3. Retornar APENAS JSON válido, no formato:

{
  "recommendation": "BUY" | "SELL" | "HOLD",
  "confidence": número 0-100,
  "trend": "Alta" | "Baixa" | "Lateral",
  "support": "valor numérico",
  "resistance": "valor numérico",
  "indicators": [
    { "name": "RSI", "value": "valor", "signal": "bullish|bearish|neutral" },
    { "name": "MACD", "value": "descrição", "signal": "bullish|bearish|neutral" },
    { "name": "MME", "value": "descrição", "signal": "bullish|bearish|neutral" },
    { "name": "Volume", "value": "descrição", "signal": "bullish|bearish|neutral" }
  ],
  "analysis": "resumo profissional 2–3 frases",
  "riskLevel": "low" | "medium" | "high",
  "entryPoint": "valor recomendado",
  "stopLoss": "stop sugerido",
  "takeProfit": "alvo sugerido",
  "timeframe": "curto | médio | longo prazo",
  "marketContext": "análise complementar"
}

NUNCA retorne texto fora de JSON.
Apenas JSON puro.
    `;

    const body = {
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analise tecnicamente este gráfico com precisão máxima."
            },
            {
              type: "image_url",
              image_url: { url: image, detail: "high" }
            }
          ]
        }
      ],
      temperature: 0.2,
      max_tokens: 2000
    };

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const result = await resp.json();

    const raw = result.choices?.[0]?.message?.content;
    if (!raw) {
      return NextResponse.json(
        { error: "Resposta vazia da OpenAI" },
        { status: 500 }
      );
    }

    // Remove blocos markdown caso existam
    const cleaned = raw.replace(/```json|```/g, "").trim();

    // Parse final
    const json = JSON.parse(cleaned);

    return NextResponse.json(json);

  } catch (err: any) {
    return NextResponse.json(
      { error: "Erro interno", details: err.message },
      { status: 500 }
    );
  }
}