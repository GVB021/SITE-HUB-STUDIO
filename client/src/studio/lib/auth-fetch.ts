export async function authFetch(url: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body && typeof options.body === "string") {
    headers.set("Content-Type", "application/json");
  }

  let res;
  try {
    res = await fetch(url, { ...options, headers, credentials: "include" });
  } catch (fetchError) {
    throw new Error("Falha na conexão. Verifique sua internet e tente novamente.");
  }

  if (!res) {
    throw new Error("Resposta inválida do servidor");
  }

  if (res.status === 401) {
    const { memoryNavigate } = await import("@studio/lib/memory-router");
    memoryNavigate("/login");
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    let errorMsg = res.statusText;
    try {
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await res.json();
        if (data.message) errorMsg = data.message;
      } else {
        const text = await res.text();
        if (text) errorMsg = text.slice(0, 200);
      }
    } catch {}
    throw new Error(errorMsg);
  }

  if (res.status === 204) return null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  const text = await res.text().catch(() => "");
  throw new Error(text ? `Resposta invalida do servidor: ${text.slice(0, 200)}` : "Resposta invalida do servidor");
}
