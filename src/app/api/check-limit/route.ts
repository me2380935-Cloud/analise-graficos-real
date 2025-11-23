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
      process.env.SUPABASE_SERVICE_ROLE! // <— precisa desse
    );

    // Busca o usuário
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    // Se não existir → cria com 5 análises grátis
    if (!user) {
      const { error: createErr } = await supabase
        .from("users")
        .insert({ email, free_uses: 5, plan: null });

      if (createErr) {
        return NextResponse.json({ error: createErr.message }, { status: 500 });
      }

      return NextResponse.json({
        free_uses: 5,
        plan: null
      });
    }

    return NextResponse.json({
      free_uses: user.free_uses,
      plan: user.plan
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: "Erro interno", details: err.message },
      { status: 500 }
    );
  }
}