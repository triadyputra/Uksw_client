<script setup lang="ts">
definePage({
  meta: {
    action: 'Read',
    subject: 'Beranda',
  },
})

const userData = useCookie<any>('userData')

console.log(userData.value?.unit)
</script>

<template>
  <div>
    <VCard title="Selamat datang kembali">
      <VCardText>Senang melihat Anda kembali.</VCardText>
      <VCardText>
        Semoga hari Anda menyenangkan dan penuh semangat untuk beraktivitas.
        Teruslah melangkah maju dan capai hal-hal hebat hari ini!
      </VCardText>
    </VCard>
  </div>
</template>
