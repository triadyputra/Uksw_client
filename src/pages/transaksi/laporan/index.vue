<script setup lang="ts">
definePage({
  meta: {
    action: 'GetLaporanKonsolidasi',
    subject: 'Laporan',
  },
})

// =========================
// TABLE
// =========================
const headers = [
  { title: 'Kode', key: 'KodeYayasan', width: '15%' },
  { title: 'Nama', key: 'NamaYayasan', width: '65%' },
  { title: 'Total', key: 'Total', align: 'end' },
  { title: 'Debet', key: 'Debet', align: 'end' },
  { title: 'Kredit', key: 'Kredit', align: 'end' },
  { title: 'Saldo', key: 'Saldo', align: 'end' },
]

// =========================
// STATE
// =========================
const searchQuery = ref('')
const selectedRows = ref([])
const itemsPerPage = ref(10)
const page = ref(1)

const jenis = [
  { title: 'Entitas', value: 'Entitas' },
  { title: 'Unit', value: 'Unit' },
]

const selectedUnit = ref('Unit')

/* snackbar */
const isSnackbarScaleVisible = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success') // default

// =========================
// VALIDASI
// =========================
const isFilterReady = computed(() => {
  return searchQuery.value && searchQuery.value.length === 6
})

// =========================
// QUERY PARAM
// =========================
const queryParams = computed(() => ({
  periode: searchQuery.value,
  unit: selectedUnit.value,
  page: page.value,
  pageSize: itemsPerPage.value,
}))

// =========================
// API
// =========================
const { data: dataApi, execute: fetchData } = await useApi<any>(
  createUrl('/api/Laporan/GetLaporanGabungan', { query: queryParams }),
)

// =========================
// DATA
// =========================
const listData = computed(() => dataApi.value?.Data ?? [])
const totalData = computed(() => dataApi.value?.TotalCount ?? 0)
const isLoading = computed(() => dataApi?.pending ?? false)

// =========================
// SEARCH (MANUAL)
// =========================
async function handleSearch() {
  if (!isFilterReady.value)
    return

  page.value = 1
  await fetchData()
}

// =========================
// WATCH (PAGE SAJA)
// =========================
watch([page, itemsPerPage, selectedUnit], () => {
  if (!isFilterReady.value)
    return

  fetchData()
})

// =========================
// DOWNLOAD
// =========================
const loadingDownload = ref(false)

async function handleDownload(type: 'konsolidasi' | 'penghasilan') {
  try {
    loadingDownload.value = true

    const urlMap = {
      konsolidasi: '/api/Laporan/export-gabungan',
      penghasilan: '/api/Laporan/export-gabungan-penghasilan',
    }

    const url = `${urlMap[type]}?periode=${searchQuery.value}&unit=${selectedUnit.value}`

    const resData = await useApi(url)
    const base64 = resData?.data?.value?.fileBase64

    if (!base64) {
      console.warn('File kosong')

      return
    }

    const binary = atob(base64)
    const array = new Uint8Array(binary.length)

    for (let i = 0; i < binary.length; i++)
      array[i] = binary.charCodeAt(i)

    const blob = new Blob([array], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    const blobUrl = URL.createObjectURL(blob)

    const link = document.createElement('a')

    link.href = blobUrl
    link.download = `${type}_${searchQuery.value}.xlsx`
    link.click()

    URL.revokeObjectURL(blobUrl)
  }
  finally {
    loadingDownload.value = false
  }
}

const handleDownloadPdf = async (type: 'konsolidasi' | 'penghasilan') => {
  try {
    loadingDownload.value = true

    const urlMap = {
      konsolidasi: '/api/Laporan/export-konsolidasi-pdf-v2',
      penghasilan: '/api/Laporan/export-penghasilan-pdf',
    }

    const url = `${urlMap[type]}?periode=${searchQuery.value}&unit=${selectedUnit.value}`

    const res = await $api(url) // 🔥 TANPA POST

    if (!res?.fileBase64) {
      console.error('Response kosong dari API')

      return
    }

    const fileName = res.fileName || `${type}.pdf`

    const byteCharacters = atob(res.fileBase64)

    const byteArray = new Uint8Array(
      Array.from(byteCharacters, c => c.charCodeAt(0)),
    )

    const blob = new Blob([byteArray], { type: res.contentType || 'application/pdf' })

    const link = document.createElement('a')

    link.href = URL.createObjectURL(blob)
    link.download = fileName

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(link.href)
  }
  catch (error) {
    console.error('Gagal download laporan:', error)
  }
  finally {
    loadingDownload.value = false
  }
}
</script>

<template>
  <div>
    <VCard
      title="Laporan Gabungan"
      class="mb-6"
    >
      <!-- ================= FILTER ================= -->
      <div class="d-flex justify-space-between align-center flex-wrap gap-4 ma-6">
        <!-- LEFT -->
        <div class="d-flex align-center gap-3 flex-wrap">
          <AppTextField
            v-model="searchQuery"
            placeholder="Periode (YYYYMM)"
            style="inline-size: 180px;"
            @keyup.enter="handleSearch"
          />

          <AppSelect
            v-model="selectedUnit"
            :items="jenis"
            style="inline-size: 160px;"
          />

          <VBtn
            color="primary"
            prepend-icon="tabler-search"
            :disabled="!isFilterReady"
            :loading="isLoading"
            @click="handleSearch"
          >
            Cari
          </VBtn>
        </div>

        <!-- RIGHT -->
        <div class="d-flex align-center gap-3">
          <!-- DROPDOWN CETAK -->
          <VMenu>
            <template #activator="{ props }">
              <VBtn
                color="primary"
                prepend-icon="tabler-download"
                v-bind="props"
                :loading="loadingDownload"
                :disabled="!isFilterReady"
              >
                Cetak Laporan Excel
              </VBtn>
            </template>

            <VList>
              <VListItem @click="handleDownload('konsolidasi')">
                <VListItemTitle>
                  Laporan Konsolidasi
                </VListItemTitle>
              </VListItem>

              <VListItem @click="handleDownload('penghasilan')">
                <VListItemTitle>
                  Penghasilan Komprehensif
                </VListItemTitle>
              </VListItem>
            </VList>
          </VMenu>

          <VMenu>
            <template #activator="{ props }">
              <VBtn
                color="primary"
                prepend-icon="tabler-download"
                v-bind="props"
                :loading="loadingDownload"
                :disabled="!isFilterReady"
              >
                Cetak Laporan PDF
              </VBtn>
            </template>

            <VList>
              <VListItem @click="handleDownloadPdf('konsolidasi')">
                <VListItemTitle>
                  Laporan Konsolidasi
                </VListItemTitle>
              </VListItem>

              <VListItem @click="handleDownloadPdf('penghasilan')">
                <VListItemTitle>
                  Penghasilan Komprehensif
                </VListItemTitle>
              </VListItem>
            </VList>
          </VMenu>

          <!-- PAGE SIZE -->
          <AppSelect
            v-model="itemsPerPage"
            :items="[5, 10, 20, 50]"
            style="inline-size: 90px;"
          />
        </div>
      </div>

      <VDivider />

      <!-- ================= TABLE ================= -->
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:model-value="selectedRows"
        v-model:page="page"
        :headers="headers"
        :items="listData"
        :items-length="totalData"
        :loading="isLoading"
        class="text-no-wrap"
      >
        <template #item.Total="{ item }">
          {{ formatNumber(item.Total) }}
        </template>

        <template #item.Debet="{ item }">
          {{ formatNumber(item.Debet) }}
        </template>

        <template #item.Kredit="{ item }">
          {{ formatNumber(item.Kredit) }}
        </template>

        <template #item.Saldo="{ item }">
          {{ formatNumber(item.Saldo) }}
        </template>

        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalData"
          />
        </template>
      </VDataTableServer>
    </VCard>
  </div>

  <VSnackbar
    v-model="isSnackbarScaleVisible"
    transition="scale-transition"
    location="top end"
    variant="flat"
    :color="snackbarColor"
    :timeout="1500"
  >
    {{ snackbarMessage }}
  </VSnackbar>
</template>
