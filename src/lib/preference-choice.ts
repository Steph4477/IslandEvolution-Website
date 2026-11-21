export type Choice = 'allowed' | 'refused';
export type RecordOfChoice = { choice: Choice; expiresAt: number; generation?: string } | null;

export function sameRecord(a: RecordOfChoice, b: RecordOfChoice) {
  return (
    a?.choice === b?.choice && a?.expiresAt === b?.expiresAt && a?.generation === b?.generation
  );
}

export function resolveDraft(
  initial: RecordOfChoice,
  current: RecordOfChoice,
  checked: boolean
): Choice | null {
  // Un changement externe ou une expiration prime sur le brouillon de ce service.
  if (!sameRecord(initial, current)) return null;
  return checked ? 'allowed' : 'refused';
}
