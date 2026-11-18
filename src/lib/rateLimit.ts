/**
 * Frontend Rate Limiter
 * Utiliza o localStorage para armazenar as tentativas de ações sensíveis
 * e bloquear excessos, fornecendo feedback amigável ao usuário.
 */

interface RateLimitData {
  attempts: number;
  firstAttemptAt: number;
}

const getStorageKey = (action: string, identifier?: string) => {
  return `rate_limit_${action}${identifier ? `_${identifier}` : ''}`;
};

export const rateLimiter = {
  /**
   * Verifica se a ação pode ser executada.
   * Se ultrapassou o limite, retorna false e o tempo restante em ms.
   * Se não, registra a tentativa e retorna true.
   * 
   * @param action Nome da ação (ex: 'login', 'contact')
   * @param maxAttempts Máximo de tentativas permitidas no intervalo
   * @param windowMs Intervalo de tempo em milissegundos
   * @param identifier Identificador opcional (ex: email do usuário)
   */
  checkAndRecord: (
    action: string,
    maxAttempts: number,
    windowMs: number,
    identifier?: string
  ): { allowed: boolean; remainingMs: number } => {
    const key = getStorageKey(action, identifier);
    const now = Date.now();
    const stored = localStorage.getItem(key);

    let data: RateLimitData = { attempts: 0, firstAttemptAt: now };

    if (stored) {
      try {
        data = JSON.parse(stored);
      } catch (e) {
        // Ignora erro de parse e começa do zero
      }
    }

    // Se o intervalo de tempo expirou, reseta a contagem
    if (now - data.firstAttemptAt > windowMs) {
      data = { attempts: 0, firstAttemptAt: now };
    }

    // Se já atingiu o limite, bloqueia
    if (data.attempts >= maxAttempts) {
      const remainingMs = windowMs - (now - data.firstAttemptAt);
      return { allowed: false, remainingMs };
    }

    // Registra a nova tentativa
    data.attempts += 1;
    localStorage.setItem(key, JSON.stringify(data));

    return { allowed: true, remainingMs: 0 };
  },

  /**
   * Reseta o limite de uma ação (ex: após um login bem-sucedido)
   */
  reset: (action: string, identifier?: string) => {
    const key = getStorageKey(action, identifier);
    localStorage.removeItem(key);
  },

  /**
   * Formata o tempo restante em uma string amigável (ex: "2m 30s")
   */
  formatRemainingTime: (ms: number): string => {
    const seconds = Math.ceil(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }
};
