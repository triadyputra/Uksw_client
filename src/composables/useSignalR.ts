import * as signalR from '@microsoft/signalr'
import type { Ref } from 'vue'
import { ref } from 'vue'

export interface ChatMessage {
  user: string
  message: string
}

export function useSignalR(onMessageReceived?: () => void) {
  const messages: Ref<ChatMessage[]> = ref([])
  const newMessageAlert: Ref<ChatMessage | null> = ref(null)

  const hubUrl = import.meta.env.VITE_SIGNALR_URL as string

  const connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl)
    .withAutomaticReconnect()
    .build()

  const notificationSound = new Audio('sound/marimba.mp3')

  connection.on('ReceiveMessage', (user: string, message: string) => {
    const msg: ChatMessage = { user, message }

    messages.value.push(msg)

    // Set alert
    newMessageAlert.value = msg

    // Mainkan suara
    notificationSound.play().catch(err => console.warn('Audio play failed:', err))

    // Hapus alert otomatis
    setTimeout(() => (newMessageAlert.value = null), 5000)

    // Trigger callback untuk auto refresh data
    if (onMessageReceived)
      onMessageReceived()
  })

  const startConnection = async () => {
    try {
      await connection.start()
      console.log('SignalR Connected.')
    }
    catch (err) {
      console.error('SignalR Connection Error:', err)
      setTimeout(startConnection, 5000)
    }
  }

  const sendMessage = (user: string, message: string) => {
    connection.invoke('SendMessage', user, message).catch(err => console.error(err))
  }

  return { messages, newMessageAlert, startConnection, sendMessage }
}
