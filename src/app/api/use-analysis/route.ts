import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "E-mail não fornecido." },
        { status: 400 }
      );
    }

    // Conexão com Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Busca o usuário no banco
    const { data: user, error } = await supabase
      .from("users")
      .select("used_analyses")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json(
        { error: "Erro ao buscar usuário." },
        { status: 500 }
      );
    }

    // Se usuário não existir → cria agora com used_analyses = 1
    if (!user) {
      const { error: insertError } = await supabase
        .from("users")
        .insert([{ email, used_analyses: 1 }]);

      if (insertError) {
        return NextResponse.json(
          { error: "Erro ao criar usuário." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        used: 1,
        remaining: 4
      });
    }

    // Usuário existe → atualiza o contador
    const used = (user.used_analyses ?? 0) + 1;

    const { error: updateError } = await supabase
      .from("users")
      .update({ used_analyses: used })
      .eq("email", email);

    if (updateError) {
      return NextResponse.json(
        { error: "Erro ao atualizar análises." },
        { status: 500 }
      );
    }

    const remaining = Math.max(0, 5 - used);

    return NextResponse.json({
      success: true,
      used,
      remaining
    });

  } catch (err) {
    console.error("ERRO USE-ANALYSIS:", err);
    return NextResponse.json(
      { error: "Erro interno da API." },
      { status: 500 }
    );
  }
}