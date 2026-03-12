<script setup lang="ts">
definePage({
  meta: {
    action: 'GetLaporanKonsolidasi',
    subject: 'Laporan',
  },
})

// interface ViewListData {
//   KodeYayasan: string
//   NamaYayasan: string
//   Total: string
// }

const headers = [
  { title: 'Kode', key: 'KodeYayasan', width: '15%' },
  { title: 'Nama', key: 'NamaYayasan', width: '65%' },
  { title: 'Total', key: 'Total', align: 'end' },
  { title: 'Debet', key: 'Debet', align: 'end' },
  { title: 'Kredit', key: 'Kredit', align: 'end' },
  { title: 'Saldo', key: 'Saldo', align: 'end' },
]

const searchQuery = ref('')
const selectedRows = ref([])

const itemsPerPage = ref(10)
const page = ref(1)

const jenis = ref([
  { title: 'Entitas', value: 'Entitas' },
  { title: 'Unit', value: 'Unit' },
])

const selectedUnit = ref('Unit')

/* =========================
   READY FILTER
========================= */
const isFilterReady = computed(() => {
  return searchQuery.value?.length >= 6
})

/* =========================
   QUERY PARAMS
========================= */
const queryParams = computed(() => ({
  periode: searchQuery.value,
  unit: selectedUnit.value,
  page: page.value,
  pageSize: itemsPerPage.value,
}))

/* =========================
   API
========================= */
const { data: dataApi, execute: fetchData } = await useApi<any>(
  createUrl('/api/Laporan/GetLaporanGabungan', { query: queryParams }),
)

/* =========================
   WATCH SEARCH (6 DIGIT)
========================= */
watchDebounced(
  [searchQuery, selectedUnit, page, itemsPerPage],
  () => {
    if (!isFilterReady.value)
      return

    fetchData()
  },
  { debounce: 500 },
)

/* =========================
   DATA
========================= */
const listData = computed(() => dataApi.value?.Data ?? [])
const totalData = computed(() => dataApi.value?.TotalCount ?? 0)

/* =========================
   DOWNLOAD
========================= */
async function download() {
  const unit = unitId ?? selectedUnit.value

  const url = `/api/Laporan/export-gabungan?periode=${searchQuery.value}&unit=${unit}`

  const resData = await useApi(url)
  const base64 = resData?.data?.value.fileBase64

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
  link.download = `Laporan_Konsolidasi_${searchQuery.value}.xlsx`
  link.click()

  URL.revokeObjectURL(blobUrl)
}
</script>

<template>
  <div>
    <!-- Filter -->
    <VCard
      title="Laporan Gabungan"
      class="mb-6"
    >
      <div class="d-flex flex-wrap gap-4 ma-6">
        <div class="d-flex align-center">
          <AppTextField
            v-model="searchQuery"
            placeholder="Cari Data"
            style="inline-size: 200px;"
            class="me-3"
          />
        </div>
        <AppSelect
          v-model="selectedUnit"
          placeholder="Pilih Unit"
          :items="jenis"
        />

        <VSpacer />

        <VSpacer />

        <div class="d-flex gap-4 flex-wrap align-center">
          <AppSelect
            v-model="itemsPerPage"
            :items="[5, 10, 20, 25, 50]"
          />
          <VBtn
            color="primary"
            prepend-icon="tabler-file-upload"
            @click="() => download()"
          >
            Download
          </VBtn>
        </div>
      </div>

      <VDivider class="mt-4" />

      <!-- DataTable -->
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:model-value="selectedRows"
        v-model:page="page"
        :headers="headers"
        :items="listData"
        :items-length="totalData"
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
        <!-- pagination -->
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
</template>
