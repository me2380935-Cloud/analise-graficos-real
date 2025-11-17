import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: "Imagem não fornecida" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { 
          error: "Chave da API OpenAI não configurada",
          details: "Configure a variável OPENAI_API_KEY nas configurações do projeto"
        },
        { status: 500 }
      );
    }

    // Chamar OpenAI Vision API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Você é um analista técnico especializado em criptomoedas e trading. Analise o gráfico fornecido e retorne APENAS um objeto JSON válido (sem markdown, sem explicações extras) com a seguinte estrutura:

{
  "recommendation": "BUY" | "SELL" | "HOLD",
  "confidence": número entre 0-100,
  "trend": "descrição da tendência (ex: Alta, Baixa, Lateral)",
  "support": "nível de suporte (ex: $45,000)",
  "resistance": "nível de resistência (ex: $48,000)",
  "indicators": [
    {
      "name": "nome do indicador (ex: RSI, MACD, Médias Móveis)",
      "value": "valor ou descrição",
      "signal": "bullish" | "bearish" | "neutral"
    }
  ],
  "analysis": "análise detalhada em português (2-3 frases)",
  "riskLevel": "low" | "medium" | "high",
  "entryPoint": "ponto de entrada sugerido (opcional)",
  "stopLoss": "stop loss sugerido (opcional)",
  "takeProfit": "take profit sugerido (opcional)",
  "timeframe": "prazo recomendado (ex: Curto prazo, Médio prazo)",
  "marketContext": "contexto geral do mercado (opcional)"
}

Seja preciso, objetivo e baseie-se nos padrões técnicos visíveis no gráfico.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analise este gráfico de trading e forneça uma recomendação técnica detalhada."
              },
              {
                type: "image_url",
                image_url: {
                  url: image,
                  detail: "high"
                }
              }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erro da OpenAI:", errorData);
      
      return NextResponse.json(
        { 
          error: `Erro ao processar análise com OpenAI - ${response.status} ${errorData.error?.message || response.statusText}`,
          details: errorData.error?.message || "Verifique sua chave da API"
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const analysisText = data.choices[0]?.message?.content;

    if (!analysisText) {
      return NextResponse.json(
        { error: "Resposta vazia da OpenAI" },
        { status: 500 }
      );
    }

    // Tentar fazer parse do JSON retornado
    let analysisResult;
    try {
      // Remover possíveis markdown code blocks
      const cleanedText = analysisText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      
      analysisResult = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Erro ao fazer parse da resposta:", parseError);
      console.error("Texto recebido:", analysisText);
      
      return NextResponse.json(
        { 
          error: "Erro ao processar resposta da análise",
          details: "A IA retornou um formato inválido"
        },
        { status: 500 }
      );
    }

    return NextResponse.json(analysisResult);

  } catch (error) {
    console.error("Erro no servidor:", error);
    
    return NextResponse.json(
      { 
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido"
      },
      { status: 500 }
    );
  }
}
