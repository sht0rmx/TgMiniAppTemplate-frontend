import apiClientInst, { type EmptyResponse } from './api'

interface SessionResponse {
  ip?: string
  lastUsed?: string
  info?: string
  detail?: string
}

export class SessionsService {
  private static SESSIONS_BASE = '/api/v1/session'

  /** GET /api/v1/session/current - Current Session Details */
  static async getCurrentSession(): Promise<SessionResponse> {
    let res = await apiClientInst.get(`${this.SESSIONS_BASE}/current`)
    if (res.data) {
      return res.data as SessionResponse
    }
    return {}
  }

  /** GET /api/v1/session/all - All Active Sessions */
  static async getAllSessions(): Promise<EmptyResponse> {
    return await apiClientInst.get(`${this.SESSIONS_BASE}/all`)
  }

  /** GET /api/v1/session/kill/{sid} - Kill a specific Session */
  static async killSession(sid: string): Promise<EmptyResponse> {
    return await apiClientInst.get(`${this.SESSIONS_BASE}/kill/${sid}`)
  }
}
