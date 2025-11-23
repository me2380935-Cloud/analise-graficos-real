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

    // Conectando ao Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Verifica se o usuário já existe
    const { data: user, error } = await supabase
      .from("users")
      .select("email, used_analyses")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json(
        { error: "Erro ao buscar usuário." },
        { status: 500 }
      );
    }

    // Se não existir, cria com used_analyses = 0
    if (!user) {
      const { error: insertError } = await supabase
        .from("users")
        .insert([{ email, used_analyses: 0 }]);

      if (insertError) {
        return NextResponse.json(
          { error: "Erro ao criar usuário." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        allowed: true,
        remaining: 5,
        used: 0
      });
    }

    // Se já existe, valida limite (5 análises grátis)
    const used = user.used_analyses ?? 0;

    if (used >= 5) {
      return NextResponse.json({
        allowed: false,
        remaining: 0,
        used
      });
    }

    return NextResponse.json({
      allowed: true,
      remaining: 5 - used,
      used
    });

  } catch (err) {
    console.error("ERRO CHECK-LIMIT:", err);
    return NextResponse.json(
      { error: "Erro interno da API." },
      { status: 500 }
    );
  }
}