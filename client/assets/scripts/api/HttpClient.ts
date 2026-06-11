/**
 * 统一 HTTP 客户端 (基于 fetch, Cocos H5/Native 通用)
 * @author make java
 * @since 2026-05-01
 */
import { Result } from './types';

export class HttpClient {

    private static baseUrl: string = 'http://127.0.0.1:8080/api';

    static setBaseUrl(url: string): void {
        HttpClient.baseUrl = url;
    }

    static getBaseUrl(): string {
        return HttpClient.baseUrl;
    }

    /**
     * GET 请求
     * @param path 不含 baseUrl 的相对路径
     */
    static async get<T>(path: string): Promise<T> {
        const resp = await fetch(`${HttpClient.baseUrl}${path}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        const json = (await resp.json()) as Result<T>;
        return HttpClient.unwrap(json);
    }

    /**
     * POST 请求 (body 为 Query 实体, 严禁裸传 Map)
     */
    static async post<T>(path: string, body: unknown): Promise<T> {
        const resp = await fetch(`${HttpClient.baseUrl}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body ?? {}),
        });
        const json = (await resp.json()) as Result<T>;
        return HttpClient.unwrap(json);
    }

    private static unwrap<T>(r: Result<T>): T {
        if (r.code !== 0) {
            throw new BizError(r.code, r.message);
        }
        return r.data as T;
    }
}

/**
 * 业务异常 (映射后端 BizException)
 * @author make java
 * @since 2026-05-01
 */
export class BizError extends Error {
    code: number;
    constructor(code: number, message: string) {
        super(message);
        this.code = code;
        this.name = 'BizError';
    }
}
