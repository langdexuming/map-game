/**
 * 统一 HTTP 封装，解析后端 Result（code=0 成功）
 */
import type {Result} from './types';

export class BizError extends Error {
  readonly code: number;

  constructor(code: number, message: string) {
    super(message);
    this.code = code;
    this.name = 'BizError';
  }
}

function baseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL;
  if (fromEnv !== undefined && fromEnv !== '') {
    return fromEnv.replace(/\/$/, '');
  }
  return '/api';
}

async function parseJson<T>(resp: Response): Promise<Result<T>> {
  const text = await resp.text();
  try {
    return JSON.parse(text) as Result<T>;
  } catch {
    throw new BizError(-1, `响应非 JSON：HTTP ${resp.status}`);
  }
}

function unwrap<T>(r: Result<T>): T {
  if (r.code !== 0) {
    throw new BizError(r.code, r.message || '业务失败');
  }
  return r.data as T;
}

export async function getJson<T>(path: string): Promise<T> {
  const url = `${baseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  const resp = await fetch(url, {
    method: 'GET',
    headers: {'Content-Type': 'application/json'},
  });
  const json = await parseJson<T>(resp);
  if (!resp.ok) {
    throw new BizError(json.code || resp.status, json.message || resp.statusText);
  }
  return unwrap(json);
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const url = `${baseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body ?? {}),
  });
  const json = await parseJson<T>(resp);
  if (!resp.ok) {
    throw new BizError(json.code || resp.status, json.message || resp.statusText);
  }
  return unwrap(json);
}
