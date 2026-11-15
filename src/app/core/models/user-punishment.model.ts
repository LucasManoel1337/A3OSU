export type UserPunishmentType =
  | 'BANIMENTO_PERMANENTE'
  | 'BANIMENTO_TEMPORARIO'
  | 'SUSPENSAO_RANQUEADO'
  | 'SUSPENSAO_CASUAL';

export interface UserPunishment {
  id: number;
  type: UserPunishmentType;
  reason: string;
  appliedAt: string;
  expiresAt: string | null;
  active: boolean;
  appliedByUsername: string;
  appliedByAvatarUrl: string | null;
  appliedByVerified: boolean;
  endedAt: string | null;
}

export interface UserPunishmentRequest {
  type: UserPunishmentType;
  reason: string;
  expiresAt: string | null;
}

export function parsePunishmentResponse(value: unknown, allowedTypes: UserPunishmentType[]): UserPunishment | null {
  const body = parseErrorBody(value);
  const nested = body?.['punishment'];
  if (!nested || typeof nested !== 'object') return null;

  const punishment = nested as Record<string, unknown>;
  if (!allowedTypes.includes(punishment['type'] as UserPunishmentType)
      || typeof punishment['reason'] !== 'string'
      || !punishment['reason'].trim()) {
    return null;
  }

  return {
    id: typeof punishment['id'] === 'number' ? punishment['id'] : 0,
    type: punishment['type'] as UserPunishmentType,
    reason: punishment['reason'],
    appliedAt: typeof punishment['appliedAt'] === 'string' ? punishment['appliedAt'] : '',
    expiresAt: typeof punishment['expiresAt'] === 'string' ? punishment['expiresAt'] : null,
    active: typeof punishment['active'] === 'boolean' ? punishment['active'] : true,
    appliedByUsername: typeof punishment['appliedByUsername'] === 'string'
      ? punishment['appliedByUsername']
      : 'Moderação da plataforma',
    appliedByAvatarUrl: typeof punishment['appliedByAvatarUrl'] === 'string'
      ? punishment['appliedByAvatarUrl']
      : null,
    appliedByVerified: punishment['appliedByVerified'] === true,
    endedAt: typeof punishment['endedAt'] === 'string' ? punishment['endedAt'] : null
  };
}

function parseErrorBody(value: unknown): Record<string, unknown> | null {
  if (typeof value === 'string') {
    try {
      return parseErrorBody(JSON.parse(value) as unknown);
    } catch {
      return null;
    }
  }
  if (!value || typeof value !== 'object') return null;

  const body = value as Record<string, unknown>;
  if (body['punishment'] && typeof body['punishment'] === 'object') return body;

  for (const key of ['error', 'detail', 'message']) {
    const nested = body[key];
    if (nested && typeof nested === 'object') {
      const parsed = parseErrorBody(nested);
      if (parsed) return parsed;
    }
    if (typeof nested === 'string') {
      try {
        const parsed = parseErrorBody(JSON.parse(nested) as unknown);
        if (parsed) return parsed;
      } catch {
        continue;
      }
    }
  }
  return null;
}

export function parseActiveBan(value: unknown): UserPunishment | null {
  return parsePunishmentResponse(value, ['BANIMENTO_PERMANENTE', 'BANIMENTO_TEMPORARIO']);
}

export function parseActiveTournamentSuspension(value: unknown): UserPunishment | null {
  return parsePunishmentResponse(value, ['SUSPENSAO_RANQUEADO', 'SUSPENSAO_CASUAL']);
}
