import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "Imagem não recebida" }, { status: 400 });
    }

    // Inicializa OpenAI com sua chave secreta
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Envia imagem para análise
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
            { type: "input_text", text: "Analise esse gráfico e responda em JSON." },
            {
              type: "input_image",
              image_url: image,
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(result.choices[0].message.content || "{}");

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Erro API analyze-chart:", err);
    return NextResponse.json(
      { error: "Erro interno na análise." },
      { status: 500 }
    );
  }
}