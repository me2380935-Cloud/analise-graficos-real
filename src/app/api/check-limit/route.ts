import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { user_id } = await req.json();

    if (!user_id) {
      return NextResponse.json(
        { error: "User ID não fornecido." },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. Buscar o usuário na tabela "users"
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("analysis_count, premium_until")
      .eq("id", user_id)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: "Erro ao buscar usuário." },
        { status: 500 }
      );
    }

    // 2. Verificar se é premium
    const now = new Date();
    const isPremium =
      user?.premium_until && new Date(user.premium_until) > now;

    if (isPremium) {
      return NextResponse.json({
        allowed: true,
        remaining: "∞",
        premium: true,
      });
    }

    // 3. Usuário não é premium → verificar limite gratuito
    const analysisCount = user?.analysis_count ?? 0;

    if (analysisCount >= 5) {
      return NextResponse.json({
        allowed: false,
        remaining: 0,
        premium: false,
      });
    }

    // 4. Permitir e atualizar o contador
    const { error: updateError } = await supabase
      .from("users")
      .update({ analysis_count: analysisCount + 1 })
      .eq("id", user_id);

    if (updateError) {
      return NextResponse.json(
        { error: "Erro ao atualizar contador." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      allowed: true,
      remaining: 5 - (analysisCount + 1),
      premium: false,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro no servidor." },
      { status: 500 }
    );
  }
}