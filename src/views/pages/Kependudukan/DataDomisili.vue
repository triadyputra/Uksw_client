<script setup lang="ts">
import type { DataDomisili } from './types'

const props = defineProps<{
  formData: DataDomisili
}>()

const emit = defineEmits<{
  (e: 'update:formData', value: DataDomisili): void
}>()

const formData = ref<DataDomisili>(props.formData)

watch(formData, () => {
  emit('update:formData', formData.value)
})

// === Data bersarang dari API ===
const dusunList = ref<any[]>([])
const isLoading = ref(false)

// === Ambil data dari API ===
async function fetchDusunKampungRwRt() {
  try {
    isLoading.value = true

    const res = await useApi('/api/combo/ComboDusunDomisili') // <- endpoint kamu
    if (res?.data?.value) {
      dusunList.value = res.data.value
    }
    else {
      dusunList.value = []
      console.warn('Data kosong atau tidak valid:', res)
    }
  }
  catch (err) {
    console.error('Gagal mengambil data dusun:', err)
  }
  finally {
    isLoading.value = false
  }
}

// === Computed bertingkat ===
const optDusun = computed(() =>
  dusunList.value.map(d => ({ title: d.Nama, value: d.Nama })),
)

const optKampung = computed(() => {
  const dusun = dusunList.value.find(d => d.Nama === formData.value.Dusun)

  return dusun
    ? dusun.TblKampung.map(k => ({ title: k.Nama, value: k.Nama }))
    : []
})

const optRW = computed(() => {
  const dusun = dusunList.value.find(d => d.Nama === formData.value.Dusun)
  const kampung = dusun?.TblKampung.find(k => k.Nama === formData.value.Kampung)

  return kampung
    ? kampung.TblRw.map(r => ({ title: r.Nama, value: r.Nama }))
    : []
})

const optRT = computed(() => {
  const dusun = dusunList.value.find(d => d.Nama === formData.value.Dusun)
  const kampung = dusun?.TblKampung.find(k => k.Nama === formData.value.Kampung)
  const rw = kampung?.TblRw.find(r => r.Nama === formData.value.RW)

  return rw ? rw.TblRt.map(t => ({ title: t.Nama, value: t.Nama })) : []
})

// === Reset bawah jika atas berubah ===
watch(
  () => formData.value.Dusun,
  () => {
    formData.value.Kampung = null
    formData.value.RW = null
    formData.value.RT = null
  },
)
watch(
  () => formData.value.Kampung,
  () => {
    formData.value.RW = null
    formData.value.RT = null
  },
)
watch(
  () => formData.value.RW,
  () => {
    formData.value.RT = null
  },
)

fetchDusunKampungRwRt()
</script>

<template>
  <VForm>
    <VRow>
      <VCol
        cols="12"
        sm="12"
      >
        <AppTextarea
          v-model="formData.Alamat"
          label="Alamat"
          placeholder="Jl. Raya HR Edi Sukma"
          rows="3"
        />
      </VCol>

      <VCol
        cols="12"
        sm="6"
      >
        <AppTextField
          v-model="formData.NoRumah"
          label="No Rumah"
          placeholder="023"
        />
      </VCol>

      <VCol
        cols="12"
        sm="6"
      >
        <AppTextField
          v-model="formData.NOP"
          label="NOP"
          placeholder="Nomor Objek Pajak"
        />
      </VCol>

      <VCol
        cols="12"
        sm="3"
      >
        <AppSelect
          v-model="formData.Dusun"
          label="Dusun"
          placeholder="Pilih Salah Satu"
          :items="optDusun"
          persistent-hint
          clearable
          clear-icon="tabler-x"
        />
      </VCol>

      <VCol
        cols="12"
        sm="3"
      >
        <AppSelect
          v-model="formData.Kampung"
          label="Kampung"
          placeholder="Pilih Salah Satu"
          :items="optKampung"
          persistent-hint
          clearable
          clear-icon="tabler-x"
        />
      </VCol>

      <VCol
        cols="12"
        sm="3"
      >
        <AppSelect
          v-model="formData.RW"
          label="RW"
          placeholder="Pilih Salah Satu"
          :items="optRW"
          persistent-hint
          clearable
          clear-icon="tabler-x"
        />
      </VCol>

      <VCol
        cols="12"
        sm="3"
      >
        <AppSelect
          v-model="formData.RT"
          label="RT"
          placeholder="Pilih Salah Satu"
          :items="optRT"
          persistent-hint
          clearable
          clear-icon="tabler-x"
        />
      </VCol>

      <VCol
        cols="12"
        sm="3"
      >
        <AppTextField
          v-model="formData.Latitude"
          label="Latitude"
          placeholder="Latitude"
        />
      </VCol>

      <VCol
        cols="12"
        sm="3"
      >
        <AppTextField
          v-model="formData.Longitude"
          label="Longitude"
          placeholder="Longitude"
        />
      </VCol>
      <!--  -->
      <!--  -->
    </VRow>
  </VForm>
</template>
