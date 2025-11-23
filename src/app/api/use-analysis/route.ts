import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email ausente" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE!
    );

    // Busca o usuário
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verifica limites
    if (user.free_uses <= 0 && !user.plan) {
      return NextResponse.json(
        { blocked: true, message: "Limite atingido" },
        { status: 403 }
      );
    }

    // Desconta 1 análise apenas se estiver no gratuito
    if (!user.plan) {
      const newValue = user.free_uses - 1;

      await supabase
        .from("users")
        .update({ free_uses: newValue })
        .eq("email", email);

      return NextResponse.json({ success: true, free_uses: newValue });
    }

    // Planos têm uso ilimitado (por enquanto)
    return NextResponse.json({ success: true, free_uses: user.free_uses });

  } catch (err: any) {
    return NextResponse.json(
      { error: "Erro interno", details: err.message },
      { status: 500 }
    );
  }
}