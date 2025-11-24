import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: "Imagem não recebida" },
        { status: 400 }
      );
    }

    // Inicializa cliente da OpenAI com sua chave da Vercel
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Chamada correta da API nova usando chat.completions
    const result = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Você é um analista profissional que interpreta gráficos de trading.",
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Analise este gráfico e responda em JSON estruturado.",
            },
            {
              type: "input_image",
              image_url: image,
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    // A API retorna o JSON como texto — então precisa parse
    const responseText = result.choices?.[0]?.message?.content;

    let parsed = {};

    try {
      parsed = JSON.parse(responseText || "{}");
    } catch (e) {
      console.error("Falha ao converter resposta JSON:", e);
      return NextResponse.json(
        { error: "Falha ao interpretar JSON retornado pela IA." },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Erro interno no /analyze-chart:", error);
    return NextResponse.json(
      { error: "Erro interno na análise." },
      { status: 500 }
    );
  }
}