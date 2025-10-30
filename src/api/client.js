import axios from 'axios'
import { useUserStore } from '@/store/user.js'
import { useRouter } from 'vue-router'
import * as Fingerprint2 from 'fingerprintjs2'
import * as UAParser from 'ua-parser-js'

const router = useRouter()

const API_URL = import.meta.env.VITE_API_URL

class Client {
  constructor() {
    this.accessToken = null
    this.axios = axios.create({
      baseURL: API_URL,
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
    })

    this.axios.interceptors.response.use(
      (res) => res,
      async (err) => {
        const original = err.config

        if (
          err.response?.status === 401 &&
          !original._retry &&
          !original.url.includes('/auth/token/get-tokens')
        ) {
          original._retry = true
          try {
            const r = await this.refreshTokens()
            if (r.code === 200 && r.access) {
              original.headers['Authorization'] = `Bearer ${r.access}`
              return this.axios(original)
            }
          } catch (e) {
            console.warn('refresh failed', e)
            await router.push('/need_auth')
            return Promise.reject(e)
          }
        }

        if (err.response?.status === 401) {
          console.log('error response', err.response.status, err.response.data)
        }

        return Promise.reject(err)
      },
    )
  }

  getAccessToken() {
    return this.accessToken
  }

  setAccessToken(token) {
    this.accessToken = token
    if (token) {
      this.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete this.axios.defaults.headers.common['Authorization']
    }
  }

  async setFingerprint() {
    if (this.fingerprint) return this.fingerprint

    const getHash = async () => {
      const options = {
        excludes: {
          plugins: true,
          localStorage: true,
          adBlock: true,
          screenResolution: true,
          availableScreenResolution: true,
          enumerateDevices: true,
          pixelRatio: true,
          doNotTrack: true
        },
        preprocessor: (key, value) => {
          if (key === 'userAgent') {
            const parser = new UAParser.UAParser(value)
            return `${parser.getOS().name} :: ${parser.getBrowser().name} :: ${parser.getEngine().name}`
          }
          return value
        }
      }

      const components = await Fingerprint2.getPromise(options)
      const values = components.map(c => c.value)
      return String(Fingerprint2.x64hash128(values.join(''), 31))
    }

    if (window.requestIdleCallback) {
      this.fingerprint = await new Promise(resolve =>
        requestIdleCallback(async () => resolve(await getHash()))
      )
    } else {
      this.fingerprint = await new Promise(resolve =>
        setTimeout(async () => resolve(await getHash()), 500)
      )
    }

    this.axios.defaults.headers.common['Fingerprint'] = this.fingerprint
    return this.fingerprint
  }

  async login(initData) {
    console.log({
      initData
    })
    const res = await this.axios.post('/api/v1/auth/login/webapp', {
      initData
    })
    if (res.status === 200) {
      this.setAccessToken(res.data.access_token)
      return { access: res.data.access_token, code: res.status }
    }
    return { access: null, code: res.status }
  }

  async refreshTokens() {
    try {
      const res = await this.axios.get('/api/v1/auth/token/get-tokens')
      if (res.status === 200) {
        this.setAccessToken(res.data.access_token)
        return { access: res.data.access_token, code: res.status }
      }
      return { access: null, code: res.status }
    } catch (err) {
      if (err.response) {
        return { access: null, code: err.response.status }
      }
      return { access: null, code: 500 }
    }
  }

  async logout() {
    await this.axios.get('/api/v1/auth/token/revoke')
    this.setAccessToken(null)
  }

  async check() {
    const store = useUserStore()
    const res = await apiClient.apiFetch('/api/v1/auth/check')

    console.log(res)

    if (!res || res.status !== 200) {
      store.clearUser()
      await router.push('/need_auth')
    }
    console.log(res.data.user)
    store.setUser(res.data.user)
  }

  async apiFetch(url, opts = {}) {
    const method = opts.method || 'GET'
    const data = opts.body || opts.data || null
    const headers = opts.headers || {}
    return this.axios({ url, method, data, headers })
  }

  async ping() {
    try {
      const res = await this.apiFetch('/api/v1/ping', { timeout: 3000 })
      return res.status === 200
    } catch (err) {
      console.error('Ping failed:', err)
      throw err
    }
  }
}

export const apiClient = new Client()
