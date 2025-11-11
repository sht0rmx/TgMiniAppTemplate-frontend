<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'
import { Button } from '@/components/ui/button'
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose
} from '@/components/ui/drawer'
import { useRoute } from 'vue-router'

const showScanner = ref(false)
const drawerOpen = ref(false)
const scannedDevice = ref<string | null>(null)
let scanner: Html5Qrcode | null = null

const route = useRoute()

// Старт сканера
const startScanner = async () => {
  showScanner.value = true
  await nextTick()
  if (!scanner) scanner = new Html5Qrcode('scanner')
  try {
    await scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: 250 },
      handleScan
    )
  } catch (err) {
    console.error('Failed to start scanner', err)
  }
}

// Стоп сканера
const stopScanner = async () => {
  if (scanner) {
    await scanner.stop().catch(console.error)
    scanner.clear()
    scanner = null
  }
  showScanner.value = false
}

// Обработка сканированного QR
const handleScan = (decodedText: string) => {
  try {
    const url = new URL(decodedText)
    const loginid = url.searchParams.get('loginid')
    if (loginid) {
      scannedDevice.value = atob(loginid)
      drawerOpen.value = true
      stopScanner()
    }
  } catch (e) {
    console.warn('QR parse error', e)
  }
}

// Кнопки Drawer
const approveDevice = () => {
  console.log('Device approved:', scannedDevice.value)
  drawerOpen.value = false
}
const denyDevice = () => {
  console.log('Device denied:', scannedDevice.value)
  drawerOpen.value = false
}

// Монтирование компонента
onMounted(() => {
  const loginid = route.query.loginid as string
  if (loginid) {
    scannedDevice.value = atob(loginid)
    drawerOpen.value = true
    showScanner.value = false
  } else {
    startScanner()
  }
})

watch(
  () => route.query.loginid,
  (loginid) => {
    if (loginid) {
      scannedDevice.value = atob(loginid as string)
      drawerOpen.value = true
      stopScanner()
    }
  }
)

onUnmounted(() => stopScanner())
</script>

<template>
  <!-- QR Scanner Overlay -->
  <div v-if="showScanner" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    @click.self="stopScanner">
    <div class="w-full max-w-md bg-card rounded-2xl shadow-xl p-6 mx-4">
      <h2 class="text-xl font-semibold mb-4">Scan QR</h2>
      <div id="scanner" class="w-full h-96"></div>
      <Button class="mt-2 w-full" @click="stopScanner">Cancel</Button>
    </div>
  </div>

  <!-- Drawer устройства -->
  <Drawer v-model:open="drawerOpen">
    <DrawerContent class="py-3">
      <DrawerHeader>
        <DrawerTitle class="flex flex-col items-center text-center mb-2 text-white">
          Device: System</DrawerTitle>
      </DrawerHeader>
      <p class="px-3 text-xl text-white">DeviceID:</p>
      <p class="px-3 text-xl text-white">IP:</p>
      <p class="px-3 text-white">Вы уверенны что хотите подтвердить вход на данном устройстве</p>
      <DrawerFooter class="flex flex-row gap-2">
        <Button variant="destructive" class="flex-[2] min-w-0" @click="approveDevice">
          {{ $t('views.adddevice.dropdown.accept') }}
        </Button>
        <DrawerClose as-child>
          <Button variant="secondary" class="flex-1 min-w-0 bg-primary border border-border" @click="denyDevice">
            {{ $t('views.adddevice.dropdown.close') }}
          </Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>
