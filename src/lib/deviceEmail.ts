 // src/lib/deviceEmail.ts
export function getDeviceEmail() {
  // Verifica se já existe no localStorage
  if (typeof window !== "undefined") {
    let email = localStorage.getItem("device_email");

    if (!email) {
      // Gera um ID aleatório
      const randomId = Math.random().toString(36).substring(2, 12);

      email = `device_${randomId}@local.app`;

      // Salva no dispositivo
      localStorage.setItem("device_email", email);
    }

    return email;
  }

  // Fallback para evitar erro no Next.js SSR
  return "device_fallback@local.app";
}