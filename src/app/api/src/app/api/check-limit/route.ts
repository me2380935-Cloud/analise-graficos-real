 import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  // pega user logado
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "not-authenticated" }, { status: 401 });
  }

  // busca o registro de limite
  const { data: limit } = await supabase
    .from("analysis_limits")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // se não existir, cria um novo com limite 5
  if (!limit) {
    const { data: newLimit } = await supabase
      .from("analysis_limits")
      .insert({
        user_id: user.id,
        used: 0,
        max_limit: 5,
        plan: "free"
      })
      .select()
      .single();

    return NextResponse.json(newLimit);
  }

  return NextResponse.json(limit);
}