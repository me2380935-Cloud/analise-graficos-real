import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: "Imagem não recebida" },
        { status: 400 }
      );
    }

    // Cliente OpenAI
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Chamada para análise
    const result = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "Você é um analista de gráficos profissional. Responda sempre em JSON."
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Analise este gráfico e gere os dados em JSON."
            },
            {
              type: "input_image",
              image_url: image
            }
          ]
        }
      ]
    });

    // Conteúdo retornado pela IA
    const responseText = result.choices?.[0]?.message?.content;
    let parsed;

    try {
      parsed = JSON.parse(responseText || "{}");
    } catch (e) {
      console.error("Falha ao converter JSON:", e);
      return NextResponse.json(
        { error: "Falha ao interpretar JSON retornado pela IA." },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);

  } catch (err) {
    console.error("Erro interno /analyze-chart:", err);
    return NextResponse.json(
      { error: "Erro interno ao analisar o gráfico." },
      { status: 500 }
    );
  }
}
