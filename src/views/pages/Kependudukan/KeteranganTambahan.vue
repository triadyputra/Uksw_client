<script setup lang="ts">
import type { KeteranganTambahan } from './types'

const props = defineProps<{
  formData: KeteranganTambahan
}>()

const emit = defineEmits<{
  (e: 'update:formData', value: KeteranganTambahan): void
}>()

const formData = ref<KeteranganTambahan>(props.formData)

watch(formData, () => {
  emit('update:formData', formData.value)
})

interface OptionResponse {
  optMembaca: any[]
  optProgramKb: any[]
  optBantuanJps: any[]
  optEkonomi: any[]
  optKelayakanRumah: any[]
  optFisik: any[]
  optPajak: any[]
}

interface ApiResponse {
  data: {
    value: OptionResponse
  }
}

interface OptionItem {
  value: string
  title: string
}

const optBaca = ref<OptionItem[]>([])
const optKb = ref<OptionItem[]>([])
const optBantuanJps = ref<OptionItem[]>([])
const optEkonomi = ref<OptionItem[]>([])
const optKelayakanRumah = ref<OptionItem[]>([])
const optFisik = ref<OptionItem[]>([])
const optPajak = ref<OptionItem[]>([])

async function fetchStatus() {
  try {
    const resData = await useApi<ApiResponse>('/api/combo/ComboKeteranganTambahan')

    if (resData?.data) {
      const dataValue = resData.data.value as unknown as OptionResponse

      optBaca.value = dataValue.optMembaca ?? []
      optKb.value = dataValue.optProgramKb ?? []
      optBantuanJps.value = dataValue.optBantuanJps ?? []
      optEkonomi.value = dataValue.optEkonomi ?? []
      optKelayakanRumah.value = dataValue.optKelayakanRumah ?? []
      optFisik.value = dataValue.optFisik ?? []
      optPajak.value = dataValue.optPajak ?? []
    }
    else {
      optBaca.value = []
      optKb.value = []
      optBantuanJps.value = []
      optEkonomi.value = []
      optKelayakanRumah.value = []
      optFisik.value = []
      optPajak.value = []
      console.warn('Data cabang kosong atau tidak valid:', resData)
    }

    console.log('Respon Data:', resData)
  }
  catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error:', error.message)

      if (error.message.includes('Failed to fetch'))
        console.error('Server tidak dapat dijangkau. Periksa koneksi backend atau CORS.')
    }
    else {
      console.error('Error tak terduga:', error)
    }
  }
  finally {
    console.log('Fetch cabang selesai.')
  }
}

fetchStatus()
</script>

<template>
  <VForm>
    <VRow>
      <VCol
        cols="12"
        sm="6"
      >
        <AppSelect
          v-model="formData.DapatMembacaHuruf"
          label="Dapat Membaca Huruf"
          placeholder="Pilih Salah Satu"
          :items="optBaca"
        />
      </VCol>

      <VCol
        cols="12"
        sm="6"
      >
        <AppSelect
          v-model="formData.KB"
          label="Program KB"
          placeholder="Pilih Salah Satu"
          :items="optKb"
        />
      </VCol>

      <VCol
        cols="12"
        sm="6"
      >
        <AppSelect
          v-model="formData.AdaTidakKTP"
          label="Ada/Tidak KTP"
          placeholder="Pilih Salah Satu"
          :items="['Ada', 'Tidak']"
        />
      </VCol>

      <VCol
        cols="12"
        sm="6"
      >
        <AppSelect
          v-model="formData.StatusE_KTP"
          label="Status E-KTP"
          placeholder="Pilih Salah Satu"
          :items="['CARD PRINTER', 'CARD SHIPPED', 'PRINT READY RECORD']"
        />
      </VCol>

      <VCol
        cols="12"
        sm="6"
      >
        <AppSelect
          v-model="formData.AdaTidakKK"
          label="Ada/Tidak KK"
          placeholder="Pilih Salah Satu"
          :items="['Ada', 'Tidak']"
        />
      </VCol>

      <VCol
        cols="12"
        sm="6"
      >
        <AppSelect
          v-model="formData.DPTNonDPT"
          label="DPT/Non DPT"
          placeholder="Pilih Salah Satu"
          :items="['DPT', 'Non DPT']"
        />
      </VCol>

      <VCol
        cols="12"
        sm="6"
      >
        <AppSelect
          v-model="formData.Bantuan"
          label="Bantuan JPS"
          placeholder="Pilih Salah Satu"
          :items="optBantuanJps"
          multiple
          chips
          closable-chips
        />
      </VCol>

      <VCol
        cols="12"
        sm="6"
      >
        <AppSelect
          v-model="formData.KondisiEkonomi"
          label="Kondisi Ekonomi"
          placeholder="Pilih Salah Satu"
          :items="optEkonomi"
        />
      </VCol>

      <VCol
        cols="12"
        sm="6"
      >
        <AppSelect
          v-model="formData.KelayakanRumah"
          label="Kelayakan Rumah"
          placeholder="Pilih Salah Satu"
          :items="optKelayakanRumah"
        />
      </VCol>

      <VCol
        cols="12"
        sm="6"
      >
        <AppSelect
          v-model="formData.Dtks"
          label="Jenis DTKS"
          placeholder="Pilih Salah Satu"
          :items="['Jompo', 'Janda Tua', 'Fakir Miskin', 'NON DTKS']"
          multiple
          chips
          closable-chips
        />
      </VCol>

      <VCol
        cols="12"
        sm="6"
      >
        <AppSelect
          v-model="formData.KondisiFisik"
          label="Kondisi Fisik"
          placeholder="Pilih Salah Satu"
          :items="optFisik"
        />
      </VCol>

      <VCol
        cols="12"
        sm="6"
      >
        <AppSelect
          v-model="formData.AdaTidakKendaraan"
          label="Ada/Tidak Kendaraan"
          placeholder="Pilih Salah Satu"
          :items="['Ada', 'Tidak']"
        />
      </VCol>

      <VCol
        cols="12"
        sm="6"
      >
        <AppSelect
          v-model="formData.AdaTidakWajibPajak"
          label="Ada/Tidak Wajib Pajak"
          placeholder="Pilih Salah Satu"
          :items="['Ada', 'Tidak']"
        />
      </VCol>

      <VCol
        cols="12"
        sm="6"
      >
        <AppSelect
          v-model="formData.PajakPersonal"
          label="Pajak Personal"
          placeholder="Pilih Salah Satu"
          :items="optPajak"
          multiple
          chips
          closable-chips
        />
      </VCol>
      <!--  -->
      <!--  -->
    </VRow>
  </VForm>
</template>
