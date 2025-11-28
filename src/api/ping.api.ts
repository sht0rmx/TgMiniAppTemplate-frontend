import apiClientInst, { type EmptyResponse } from './api';

export class PingService {
    /** GET /api/v1/ping - Check health of api */
  static async pingPong(): Promise<boolean> {
    const resp = await  apiClientInst.get('/ping');
    if (resp.status !== 200) {
        return false
    }
    return true
  }
}