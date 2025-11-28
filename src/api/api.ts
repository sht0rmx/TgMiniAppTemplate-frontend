import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import router from '@/router'
import FingerprintJS from '@fingerprintjs/fingerprintjs'

const fpPromise = FingerprintJS.load()
const API_URL = import.meta.env.VITE_API_URL as string

interface RefreshResponse {
  code: number
  access?: string
}

export interface EmptyResponse {
  detail?: string
}

interface RetryAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

class Client {
  private accessToken: string | null = null
  private axios: AxiosInstance
  private fingerprint: string | null = null

  constructor() {
    this.axios = axios.create({
      baseURL: API_URL,
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    this.axios.interceptors.response.use(
      (res: AxiosResponse) => res,
      async (err: AxiosError) => {
        const original = err.config as RetryAxiosRequestConfig

        const isTokensEndpoint = original?.url?.includes('/api/v1/auth/token/get-tokens')
        const isLoginEndpoint = original?.url?.includes('/api/v1/auth/login/webapp')

        if (
          err.response?.status === 401 &&
          original &&
          !original._retry &&
          !isLoginEndpoint &&
          !isTokensEndpoint
        ) {
          original._retry = true
          try {
            await this.refreshTokens()
          } catch (e) {
            console.warn('Refresh failed:', e)
            await router.push('/login')
            return Promise.reject(e)
          }
        } else if (err.response?.status === 401) {
          console.error('Error response 401:', err.response.data)
        } else {
          console.error('Error response:', err)
        }
        return null
      },
    )
  }

  private async refreshTokens(): Promise<RefreshResponse> {
    const res = await this.axios.get('/api/v1/auth/token/get-tokens')
    if (res.status === 200) {
      this.setAccessToken(res.data.access_token)
      return { access: res.data.access_token, code: res.status }
    }
    throw new Error('Invalid refresh token')
  }

  getAccessToken(): string | null {
    return this.accessToken
  }

  setAccessToken(token: string | null): void {
    this.accessToken = token
    if (token) {
      this.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete this.axios.defaults.headers.common['Authorization']
    }
  }

  async setFingerprint(): Promise<string> {
    if (this.fingerprint) return this.fingerprint

    const fp = await fpPromise
    const result = await fp.get()

    this.fingerprint = result.visitorId
    this.axios.defaults.headers.common['Fingerprint'] = result.visitorId
    return result.visitorId
  }

  public getAxiosInstance(): AxiosInstance {
    return this.axios
  }
}

export const apiClient = new Client()

export const apiClientInst = apiClient.getAxiosInstance()
export default apiClientInst
