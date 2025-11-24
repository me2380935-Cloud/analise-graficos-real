import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "Imagem não recebida" }, { status: 400 });
    }

    // Inicializa OpenAI com sua chave secreta
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Envia imagem para IA analisar
    const result = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Você é um analista de gráficos profissional. Responda sempre em JSON."
        },
        {
          role: "user",
          content: [
            { type: "input_text", text: "Analise este gráfico e gere os dados em JSON." },
            { type: "input_image", image_url: image }
          ]
        }
      ],
      response_format: { type: "json_object" }
    });

    const json = JSON.parse(result.choices[0].message.content || "{}");

    return NextResponse.json(json);

  } catch (err) {
    console.error("API ERROR analyze-chart:", err);
    return NextResponse.json(
      { error: "Erro interno ao analisar o gráfico." },
      { status: 500 }
    );
  }
}