<script setup lang="ts">
definePage({
  meta: {
    action: 'GetLaporanKonsolidasi',
    subject: 'Laporan',
  },
})

interface ViewListData {
  KodeYayasan: string
  NamaYayasan: string
  Total: string
}

const headers = [
  /* { title: 'ID', key: 'Id', sortable: false, width: '15%' }, */
  { title: 'Kode', key: 'KodeYayasan', sortable: false, width: '15%' },
  { title: 'Nama', key: 'NamaYayasan', sortable: false, width: '65%' },
  { title: 'Total', key: 'Total', sortable: false, width: '15%', align: 'end' },
  { title: 'Debet', key: 'Debet', sortable: false, width: '15%', align: 'end' },
  { title: 'Kredit', key: 'Kredit', sortable: false, width: '15%', align: 'end' },
  { title: 'Saldo', key: 'Saldo', sortable: false, width: '15%', align: 'end' },
]

const searchQuery = ref('')
const selectedRows = ref([])

// pagination & filter
const itemsPerPage = ref(10)
const page = ref(1)

const queryParams = reactive({
  filter: searchQuery,
  page,
  pageSize: itemsPerPage,
})

const { data: dataApi, execute: fetchData } = await useApi<any>(
  createUrl('/api/Laporan/GetLaporanKonsolidasi', { query: queryParams }),
)

const listData = computed((): ViewListData[] => dataApi.value?.Data ?? [])
const totalData = computed(() => dataApi.value?.TotalCount ?? 10)

// =========================
// VALIDASI
// =========================
const isFilterReady = computed(() => {
  return searchQuery.value && searchQuery.value.length === 6
})

// =========================
// DOWNLOAD
// =========================
const loadingDownload = ref(false)

async function handleDownload(type: 'konsolidasi' | 'penghasilan') {
  try {
    loadingDownload.value = true

    const urlMap = {
      konsolidasi: '/api/Laporan/export-konsolidasi',
      penghasilan: '/api/Laporan/export-konsolidasi-penghasilan',
    }

    const url = `${urlMap[type]}?periode=${searchQuery.value}`

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
</script>

<template>
  <div>
    <!-- Filter -->
    <VCard
      title="Laporan Konsolidasi"
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

        <VSpacer />

        <div class="d-flex gap-4 flex-wrap align-center">
          <AppSelect
            v-model="itemsPerPage"
            :items="[5, 10, 20, 25, 50]"
          />
          <VMenu>
            <template #activator="{ props }">
              <VBtn
                color="primary"
                prepend-icon="tabler-download"
                v-bind="props"
                :loading="loadingDownload"
                :disabled="!isFilterReady"
              >
                Cetak Laporan
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
