export const API_URL = 'http://localhost:3001';

// Wrapper fino sobre fetch — sempre manda o cookie de sessão (credentials: 'include'), o que
// os ~50 fetch() espalhados pelos componentes não faziam antes de existir login. Sem isso o
// backend não teria como saber quem está logado em cada requisição.
export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: options.body ? { 'Content-Type': 'application/json', ...options.headers } : options.headers
  });
  return res;
}

// Variante que já faz .json() e lança { status, error } em respostas não-OK — cobre o caso
// comum (rotas de auth e a maioria das de jogo) sem repetir o mesmo boilerplate em todo lugar.
export async function apiJson(path, options) {
  const res = await apiFetch(path, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'request_failed');
    err.status = res.status;
    err.code = data.error;
    throw err;
  }
  return data;
}
