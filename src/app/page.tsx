// Redirecionamento automático para /home
import { redirect } from "next/navigation";

export default function Page() {
  redirect("/home");
  return null;
}