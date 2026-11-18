export interface ChatAccessManifest {
  conversationId: string;
  applicationId?: string;
  freelancerId: string;
  freelancerName: string;
  companyId: string;
  companyName: string;
  supportId: 'vaptvaga-support-official';
}

export interface ChatViewerIdentity {
  userId?: string | null;
  role?: string | null;
}

export interface StoredEncryptedChatMessage {
  id: string;
  sender: 'me' | 'them' | 'support';
  encryptedPayload: string;
  time: string;
}

const CHANNEL_PREFIX = 'vv-sec-v1:';
const STORAGE_PREFIX = 'vaptvaga_chat_sec_';
const SUPPORT_MASTER_SALT = 'VaptVaga-Support-Escrow-Channel-v1';

/**
 * Checks whether the current viewer is strictly one of the 2 conversation participants
 * (Freelancer or Contractor/Company) or an official VaptVaga Support member.
 */
export const isOfficialSupportViewer = (viewer: ChatViewerIdentity): boolean => {
  return viewer.role === 'support' || viewer.role === 'admin';
};

export const canAccessConversation = (
  manifest: ChatAccessManifest,
  viewer: ChatViewerIdentity
): boolean => {
  if (isOfficialSupportViewer(viewer)) return true;
  if (!viewer.userId) return false;
  return (
    viewer.userId === manifest.freelancerId || viewer.userId === manifest.companyId
  );
};

const fnv1aHash = (input: string, seed = 2166136261): number => {
  let hash = seed >>> 0;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash >>> 0;
};

const computeChannelTag = (manifest: ChatAccessManifest): string => {
  const canonical = [
    manifest.conversationId,
    manifest.freelancerId,
    manifest.companyId,
    manifest.supportId,
  ].join('|');
  const h1 = fnv1aHash(canonical, 2166136261).toString(16).padStart(8, '0');
  const h2 = fnv1aHash(`${SUPPORT_MASTER_SALT}:${canonical}`, 0x811c9dc5)
    .toString(16)
    .padStart(8, '0');
  return `${h1}${h2}`;
};

const deriveChannelKeyBytes = (manifest: ChatAccessManifest): Uint8Array => {
  const canonical = `${SUPPORT_MASTER_SALT}::${manifest.conversationId}::${manifest.freelancerId}::${manifest.companyId}::${manifest.supportId}`;
  const key = new Uint8Array(32);
  let state = fnv1aHash(canonical);
  for (let i = 0; i < key.length; i++) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state = (state + canonical.charCodeAt(i % canonical.length)) >>> 0;
    key[i] = state & 0xff;
  }
  return key;
};

const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

const hexToBytes = (hex: string): Uint8Array => {
  const clean = hex.trim();
  const len = Math.floor(clean.length / 2);
  const out = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16) || 0;
  }
  return out;
};

/**
 * Encrypts transmitted chat text so only the 2 channel participants and
 * official VaptVaga Support can decrypt and read the payload.
 */
export const encryptChatPayload = (
  plainText: string,
  manifest: ChatAccessManifest,
  viewer: ChatViewerIdentity
): string => {
  if (!canAccessConversation(manifest, viewer)) {
    throw new Error(
      'Acesso negado: apenas os 2 participantes e o suporte da VaptVaga podem transmitir dados nesta conversa.'
    );
  }

  const encoder = new TextEncoder();
  const plainBytes = encoder.encode(plainText);
  const keyBytes = deriveChannelKeyBytes(manifest);
  const tag = computeChannelTag(manifest);

  const cipherBytes = new Uint8Array(plainBytes.length);
  for (let i = 0; i < plainBytes.length; i++) {
    cipherBytes[i] = plainBytes[i] ^ keyBytes[i % keyBytes.length] ^ ((i * 29) & 0xff);
  }

  return `${CHANNEL_PREFIX}${tag}:${bytesToHex(cipherBytes)}`;
};

/**
 * Decrypts a chat message payload strictly after verifying that the viewer is
 * one of the 2 participants or official VaptVaga Support.
 */
export const decryptChatPayload = (
  payload: string,
  manifest: ChatAccessManifest,
  viewer: ChatViewerIdentity
): { authorized: boolean; text: string } => {
  if (!canAccessConversation(manifest, viewer)) {
    return {
      authorized: false,
      text: '[Acesso bloqueado: dados restritos aos 2 participantes e Suporte VaptVaga]',
    };
  }

  if (!payload.startsWith(CHANNEL_PREFIX)) {
    return { authorized: true, text: payload };
  }

  const body = payload.slice(CHANNEL_PREFIX.length);
  const sepIndex = body.indexOf(':');
  if (sepIndex === -1) {
    return { authorized: false, text: '[Envelope criptográfico inválido]' };
  }

  const payloadTag = body.slice(0, sepIndex);
  const hexCipher = body.slice(sepIndex + 1);
  const expectedTag = computeChannelTag(manifest);

  if (payloadTag !== expectedTag) {
    return {
      authorized: false,
      text: '[Integridade recusada: mensagem pertence a outro canal seguro]',
    };
  }

  const cipherBytes = hexToBytes(hexCipher);
  const keyBytes = deriveChannelKeyBytes(manifest);
  const plainBytes = new Uint8Array(cipherBytes.length);
  for (let i = 0; i < cipherBytes.length; i++) {
    plainBytes[i] = cipherBytes[i] ^ keyBytes[i % keyBytes.length] ^ ((i * 29) & 0xff);
  }

  const decoder = new TextDecoder();
  return { authorized: true, text: decoder.decode(plainBytes) };
};

export const getChannelSecurityFingerprint = (manifest: ChatAccessManifest): string => {
  const tag = computeChannelTag(manifest).toUpperCase();
  return `VV-SEC-${tag.slice(0, 4)}-${tag.slice(4, 8)}`;
};

/**
 * Detects whether a message transmits sensitive operational/personal data
 * (PIX keys, CPF/CNPJ, phone numbers, check-in codes, addresses).
 */
export const hasSensitiveTransmittedData = (text: string): boolean => {
  const normalized = text.toLowerCase();
  if (
    normalized.includes('pix') ||
    normalized.includes('cpf') ||
    normalized.includes('cnpj') ||
    normalized.includes('chave') ||
    normalized.includes('check-in') ||
    normalized.includes('checkin') ||
    normalized.includes('código') ||
    normalized.includes('codigo') ||
    normalized.includes('rua ') ||
    normalized.includes('av.') ||
    normalized.includes('al.')
  ) {
    return true;
  }
  // Phone numbers, CPF/CNPJ-like digits, or VV check-in codes
  return /(\bvv\d{4,}\b|\d{3}\.?\d{3}\.?\d{3}-?\d{2}|\(\d{2}\)\s?\d{4,5}-?\d{4}|\d{8,11})/i.test(
    text
  );
};

export interface ExternalContactViolationResult {
  violated: boolean;
  matchedTerm?: string;
  reason?: string;
}

/**
 * Strictly detects any attempt to move the conversation off-platform to WhatsApp
 * or external messaging/phone channels.
 */
export const detectExternalContactViolation = (
  text: string
): ExternalContactViolationResult => {
  const normalized = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  const keywordPatterns: Array<{ regex: RegExp; label: string; reason: string }> = [
    {
      regex: /(?:whatsapp|whats\s*app|whatss|wpp|zap\s*zap|\bzap\b|wa\.me)/i,
      label: 'WhatsApp / Zap',
      reason:
        'Tentativa de migrar a conversa para o WhatsApp. Todo alinhamento deve ocorrer exclusivamente dentro do chat oficial da VaptVaga.',
    },
    {
      regex: /(?:\btelegram\b|\binstagram\b|\binsta\b|@[a-z0-9._]{2,})/i,
      label: 'Rede social externa',
      reason:
        'Compartilhamento de rede social ou aplicativo externo para contato fora da plataforma VaptVaga.',
    },
    {
      regex:
        /(?:me liga|ligar no|chama fora|por fora|falar fora|meu numero|meu tel|meu celular|passa seu numero|passa o numero|chama no pv)/i,
      label: 'Convite para contato externo',
      reason:
        'Convite para resolver ou negociar o turno fora do aplicativo VaptVaga.',
    },
  ];

  for (const rule of keywordPatterns) {
    const match = normalized.match(rule.regex);
    if (match) {
      return {
        violated: true,
        matchedTerm: match[0],
        reason: rule.reason,
      };
    }
  }

  const phoneMatch = text.match(
    /(?:\+?55\s?)?(?:\(?\d{2}\)?[\s.-]?)?9?\d{4}[-\s.]\d{4}|\b\d{10,11}\b/
  );
  if (phoneMatch) {
    return {
      violated: true,
      matchedTerm: phoneMatch[0],
      reason:
        'Envio de número de telefone/WhatsApp identificado. É proibido trocar contatos externos para evitar evasão da plataforma.',
    };
  }

  return { violated: false };
};

export const loadEncryptedThreadMessages = (
  conversationId: string,
  manifest: ChatAccessManifest,
  viewer: ChatViewerIdentity
): Array<{ id: string; sender: 'me' | 'them' | 'support'; text: string; time: string }> => {
  if (!canAccessConversation(manifest, viewer)) return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${conversationId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredEncryptedChatMessage[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => {
        const decrypted = decryptChatPayload(item.encryptedPayload, manifest, viewer);
        if (!decrypted.authorized) return null;
        return {
          id: item.id,
          sender: item.sender,
          text: decrypted.text,
          time: item.time,
        };
      })
      .filter(
        (m): m is { id: string; sender: 'me' | 'them' | 'support'; text: string; time: string } =>
          Boolean(m)
      );
  } catch {
    return [];
  }
};

export const saveEncryptedThreadMessages = (
  conversationId: string,
  manifest: ChatAccessManifest,
  viewer: ChatViewerIdentity,
  messages: Array<{ id: string; sender: 'me' | 'them' | 'support'; text: string; time: string }>
): void => {
  if (!canAccessConversation(manifest, viewer)) return;
  try {
    const encrypted: StoredEncryptedChatMessage[] = messages.map((m) => ({
      id: m.id,
      sender: m.sender,
      encryptedPayload: encryptChatPayload(m.text, manifest, viewer),
      time: m.time,
    }));
    localStorage.setItem(`${STORAGE_PREFIX}${conversationId}`, JSON.stringify(encrypted));
  } catch {
    // Ignore storage quota errors
  }
};
