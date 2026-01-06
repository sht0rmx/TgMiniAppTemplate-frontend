<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted, watch } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'
import { SessionsService } from '@/api/sessions.api'
import Menu from '@/components/menu/Menu.vue'
import MenuButton from '@/components/menu/Button.vue'
import Header from '@/components/Header.vue'

type Device = {
  icon: string
  name: string
  ip: string
  last: string
  session_id: string
}

const devices = ref([
  { icon: 'ri-smartphone-line', name: 'Pixel 8', ip: '192.168.0.12', last: '2025-10-08 17:42', session_id: "12345" },
  { icon: 'ri-macbook-line', name: 'MacBook Pro', ip: '10.0.0.15', last: '2025-10-07 22:10', session_id: "123456" },
  { icon: 'ri-tablet-line', name: 'iPad Air', ip: '172.19.0.5', last: '2025-10-08 09:33', session_id: "123457" },
])

const selectedDevice = ref<Device | null>(null)
const drawerOpen = ref(false)
const devicedata = ref<any>(null)
const showScanner = ref(false)

let scanner: Html5Qrcode | null = null

const startScanner = async () => {
  showScanner.value = true
  await nextTick()
  if (!scanner) scanner = new Html5Qrcode('scanner')
  try {
    await scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: 250 },
      handleScan,
      startScanner,
    )
  } catch (err) {
    console.error('Failed to start scanner', err)
  }
}

const stopScanner = async () => {
  if (scanner) {
    await scanner.stop().catch(console.error)
    scanner.clear()
    scanner = null
  }
  showScanner.value = false
}

const handleScan = (decodedText: string) => {
  try {
    const url = new URL(decodedText)
    const loginid = url.searchParams.get('loginid')

    if (loginid) {
      let scanned_device = atob(loginid)
      stopScanner()
    }
  } catch (e) {
    console.warn('QR parse error', e)
  }
}

const openDrawer = (device: any) => {
  selectedDevice.value = device
  drawerOpen.value = true
}

const closeSession = async () => {
  drawerOpen.value = false
  await SessionsService.killSession(String(selectedDevice.value?.session_id))
  devices.value = devices.value.filter(
    device => device.session_id !== selectedDevice.value?.session_id
  )
  console.log('Session closed')
}

const getCurrentDevice = async () => {
  try {
    devicedata.value = await SessionsService.getCurrentSession()
  } catch (e) {
    console.error('Failed to load current device', e)
  }
}

const terminateSession = async () => {
  if (!selectedDevice.value) return
  
  try {
    console.log('Terminating session:', selectedDevice.value.name)
    await closeSession()
  } catch (error) {
    console.error('Failed to terminate session', error)
  }
}

onMounted(() => getCurrentDevice())

onUnmounted(() => stopScanner())
</script>

<template>
  <Header :title="$t('views.devices.title')" />
  <div class="flex flex-col max-w-xl mx-auto space-y-8 text-base-content">

    <div class="text-center space-y-3 mb-3 mt-8">
      <i class="ri-mac-line text-8xl text-accent"></i>
      <p class="text-sm text-muted-foreground max-w-sm">
        {{ $t('views.devices.hint') }}
      </p>
    </div>

    <button class="btn btn-soft btn-accent w-full py-6 flex items-center justify-center gap-2" @click="startScanner">
      <i class="ri-loader-3-line text-xl"></i>
      <span class="font-semibold">
        {{ $t('views.devices.link') }}
      </span>
    </button>

    <div class="space-y-2">
      <h3 class="text-sm font-semibold text-muted-foreground px-2">
        {{ $t('views.devices.this_device') }}
      </h3>

      <Menu>
        <MenuButton v-if="devicedata" :text="devicedata.info.dev || 'Unknown device'"
          :icon="`ri-${devicedata.info.os}-line`">
          <template #content>
            <div class="w-full flex items-center gap-3">
              <i :class="[`ri-${devicedata.info.os}-line`, 'text-2xl']"></i>

              <div class="flex-1 text-left">
                <div class="font-medium">
                  {{ devicedata.info.dev || 'Unknown device' }}
                </div>
                <div class="text-xs text-muted-foreground">
                  {{ devicedata.ip }} • {{ devicedata.lastUsed }}
                </div>
              </div>
            </div>
          </template>
          <i class="ri-arrow-right-s-line text-lg opacity-60"></i>
        </MenuButton>
      </Menu>
    </div>

    <div class="space-y-2">
      <h3 class="text-sm font-semibold text-muted-foreground px-2">
        {{ $t('views.devices.active') }}
      </h3>

      <Menu>
        <MenuButton v-for="(d, i) in devices" :key="i" :text="d.name" :icon="d.icon" @click="openDrawer(d)">
          <template #content>
            <div class="w-full flex items-center gap-3">
              <i :class="[d.icon, 'text-2xl']"></i>

              <div class="flex-1 text-left">
                <div class="font-medium">{{ d.name }}</div>
                <div class="text-xs text-muted-foreground">
                  {{ d.ip }} • {{ d.last }}
                </div>
              </div>

            </div>
          </template>
          <i class="ri-arrow-right-s-line text-lg opacity-60"></i>
        </MenuButton>
      </Menu>
    </div>

    <div class="modal modal-bottom sm:modal-middle" :class="{ 'modal-open': drawerOpen }">
      <div class="modal-box p-0 bg-base-100 rounded-t-3xl rounded-b-none border-t border-base-300 pt-4">
        <div class="p-6 pt-2 flex flex-col items-center text-center">
          <div class="w-20 h-20 mb-4 rounded-3xl bg-accent/10 flex items-center justify-center text-accent">
            <i :class="selectedDevice?.icon" class="text-5xl"></i>
          </div>

          <h3 class="text-2xl font-bold">{{ selectedDevice?.name }}</h3>
          <p class="text-sm opacity-50 mb-6 uppercase tracking-wider">
            <span class="font-medium">{{ selectedDevice?.last }}</span>
          </p>

          <div class="grid grid-cols-1 gap-3 w-full mb-8">
            <div class="flex items-center justify-between p-4 bg-base-200 rounded-2xl">
              <span class="text-sm opacity-60">{{ $t('views.devices.dropdown.ip') }}</span>
              <span class="font-mono font-medium">{{ selectedDevice?.ip }}</span>
            </div>
          </div>

          <div class="flex flex-col gap-3 w-full">
            <button class="btn btn-error btn-lg w-full rounded-2xl" @click="terminateSession">
              <i class="ri-logout-circle-line"></i>
              {{ $t('views.devices.dropdown.terminate') }}
            </button>
          </div>
        </div>
      </div>

      <form method="dialog" class="modal-backdrop bg-black/40 backdrop-blur-[2px]" @click="closeSession">
        <button>close</button>
      </form>
    </div>

    <input type="checkbox" class="modal-toggle" v-model="showScanner" />

    <div class="modal">
      <div class="modal-box max-w-md">
        <h3 class="font-bold text-lg mb-4">Scan QR</h3>

        <div id="scanner" class="w-full h-96 rounded-lg bg-base-200"></div>

        <div class="modal-action">
          <Button class="w-full" @click="stopScanner">
            {{ $t("views.devices.") }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>