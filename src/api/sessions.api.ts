import apiClientInst, { type EmptyResponse } from './api';

interface SessionResponse {
  ip?: string,
  lastUsed?: string,
  info?: string,
  detail?: string
}

export class SessionsService {
  private static SESSIONS_BASE = '/api/v1/session';

  /** GET /api/v1/session/current - Current Session Details */
  static getCurrentSession(): Promise<SessionResponse> {
    return apiClientInst.get(`${this.SESSIONS_BASE}/current`);
  }

  /** GET /api/v1/session/all - All Active Sessions */
  static getAllSessions(): Promise<EmptyResponse> {
    return apiClientInst.get(`${this.SESSIONS_BASE}/all`);
  }

  /** GET /api/v1/session/kill/{sid} - Kill a specific Session */
  static killSession(sid: string): Promise<EmptyResponse> {
    return apiClientInst.get(`${this.SESSIONS_BASE}/kill/${sid}`);
  }
}