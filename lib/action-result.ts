export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

export function fail(error: string): ActionResult<never> {
  return { ok: false, error };
}

export function ok<T = void>(data?: T): ActionResult<T> {
  return { ok: true, data };
}