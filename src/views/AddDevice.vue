<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'
import { Button } from '@/components/ui/button'
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose
} from '@/components/ui/drawer'

const showScanner = ref(true)
const drawerOpen = ref(false)
const scannedDevice = ref<string | null>(null)

let scanner: Html5Qrcode | null = null

const handleScan = (decodedText: string) => {
  try {
    if (!decodedText.startsWith('app://adddevice?')) return
    const params = new URLSearchParams(decodedText.split('?')[1])
    const loginid = params.get('loginid')
    if (loginid) {
      scannedDevice.value = atob(loginid)
      showScanner.value = false
      drawerOpen.value = true
      stopScanner()
    }
  } catch (e) {
    console.warn('QR parse error', e)
  }
}

const startScanner = async () => {
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

const stopScanner = async () => {
  if (scanner) {
    await scanner.stop().catch(console.error)
    scanner.clear()
  }
  showScanner.value = false
}

onMounted(() => startScanner())
onUnmounted(() => stopScanner())

const approveDevice = () => {
  console.log('Device approved:', scannedDevice.value)
  drawerOpen.value = false
}

const denyDevice = () => {
  console.log('Device denied:', scannedDevice.value)
  drawerOpen.value = false
}
</script>

<template>
  <div v-if="showScanner" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="stopScanner">
    <div class="w-full max-w-md bg-card rounded-2xl shadow-xl p-6 mx-4">
      <h2 class="text-xl font-semibold mb-4">Scan QR</h2>
      <div id="scanner" class="w-full h-96"></div>
      <Button class="mt-2 w-full" @click="stopScanner">Cancel</Button>
    </div>
  </div>

  <Drawer v-model:open="drawerOpen">
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>Device: {{ scannedDevice }}</DrawerTitle>
      </DrawerHeader>
      <DrawerFooter class="flex gap-2">
        <Button variant="destructive" class="flex-1" @click="denyDevice">Deny</Button>
        <DrawerClose as-child>
          <Button variant="primary" class="flex-1" @click="approveDevice">Allow</Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>
