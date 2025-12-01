import { NextResponse } from "next/server";
import OpenAI from "openai";

/**
 * Valida de forma simples se a string é uma URL válida.
 */
function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    // -------------------------------
    // 🔒 VALIDAÇÃO DO INPUT
    // -------------------------------
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Request inválida. Envie um JSON contendo 'image'." },
        { status: 400 }
      );
    }

    const { image } = body;

    if (!image || typeof image !== "string") {
      return NextResponse.json(
        { error: "Campo 'image' obrigatório e deve ser string." },
        { status: 400 }
      );
    }

    if (!isValidUrl(image)) {
      return NextResponse.json(
        { error: "A URL enviada não é válida." },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY não configurada.");
      return NextResponse.json(
        { error: "Erro interno de configuração." },
        { status: 500 }
      );
    }

    // -------------------------------
    // 🚀 CLIENTE OPENAI
    // -------------------------------
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // -------------------------------
    // 🤖 CHAMADA À API DE ANÁLISE
    // -------------------------------
    const result = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Você é um analista profissional de gráficos. Sempre responda em JSON válido.",
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Analise este gráfico e retorne um JSON estruturado.",
            },
            {
              type: "input_image",
              image_url: image,
            },
          ],
        },
      ],
    });

    const responseText = result.choices?.[0]?.message?.content;

    if (!responseText) {
      return NextResponse.json(
        { error: "A IA não retornou nenhuma resposta." },
        { status: 500 }
      );
    }

    // -------------------------------
    // 🔍 PARSE SEGURO DO JSON
    // -------------------------------
    let parsedJSON;

    try {
      parsedJSON = JSON.parse(responseText);
    } catch (error) {
      console.error("JSON inválido retornado pela IA:", responseText);
      return NextResponse.json(
        {
          error: "A IA retornou um JSON inválido.",
          raw: responseText,
        },
        { status: 500 }
      );
    }

    // Garante que não venha um tipo inesperado
    if (typeof parsedJSON !== "object" || Array.isArray(parsedJSON)) {
      return NextResponse.json(
        {
          error: "O JSON retornado não possui formato de objeto.",
          raw: parsedJSON,
        },
        { status: 500 }
      );
    }

    // -------------------------------
    // ✅ RESPOSTA FINAL
    // -------------------------------
    return NextResponse.json({
      success: true,
      data: parsedJSON,
    });

  } catch (err: any) {
    console.error("Erro inesperado no analyze-chart:", err?.message || err);

    return NextResponse.json(
      {
        error: "Erro interno inesperado.",
      },
      { status: 500 }
    );
  }
}

}
