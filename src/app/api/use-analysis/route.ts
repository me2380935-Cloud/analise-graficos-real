import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST() {
  const supabase = createRouteHandlerClient({ cookies });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "not-authenticated" }, { status: 401 });
  }

  // pega limites atuais
  const { data: limit } = await supabase
    .from("analysis_limits")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!limit) {
    return NextResponse.json({ error: "limit-not-found" }, { status: 400 });
  }

  const { used, max_limit, plan } = limit;

  // usuário ainda tem análises grátis
  if (used < max_limit || plan !== "free") {
    const { data: updated } = await supabase
      .from("analysis_limits")
      .update({
        used: plan === "free" ? used + 1 : used, // se premium, não conta
        updated_at: new Date()
      })
      .eq("user_id", user.id)
      .select()
      .single();

    return NextResponse.json(updated);
  }

  // acabou o limite
  return NextResponse.json({ error: "limit-reached" });
}