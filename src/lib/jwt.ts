export interface JwtPayload {
    exp: number;
    iat: number;
    jti: string;
    token_type: string;
    user_id: number;
    email?: string;
}

export function decodeJwtPayload(token: string): JwtPayload {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(json) as JwtPayload;
}

export function isTokenExpired(payload: JwtPayload): boolean {
    return Date.now() >= payload.exp * 1000;
}
