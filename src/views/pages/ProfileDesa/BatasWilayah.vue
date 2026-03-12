<script setup lang="ts">
// ==== Props & Emit ====
interface BatasWilayah {
  ArahBatas: string
  DesaKel: string
  Kecamatan: string
}

interface Props {
  data: BatasWilayah[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'add-detail'): void
  (e: 'remove-detail', index: number): void
}>()

// ==== Methods ====
const removeDetail = (index: number) => {
  emit('remove-detail', index)
}
</script>

<template>
  <div>
    <div class="d-flex justify-between align-center mb-2">
      <VBtn
        color="primary"
        variant="tonal"
        @click="emit('add-detail')"
      >
        <VIcon
          icon="tabler-plus"
          start
        /> Tambah
      </VBtn>
    </div>
    <VDivider class="my-6 border-dashed" />
    <VRow
      v-for="(item, index) in props.data"
      :key="index"
      class="mb-4 border pa-4 rounded-lg align-center"
    >
      <VCol
        cols="12"
        md="4"
      >
        <AppTextField
          v-model="item.ArahBatas"
          placeholder="Arah Batas (Utara, Selatan, dst)"
          label="Arah Batas"
        />
      </VCol>

      <VCol
        cols="12"
        md="4"
      >
        <AppTextField
          v-model="item.DesaKel"
          placeholder="Desa atau Kelurahan"
          label="Desa / Kelurahan"
        />
      </VCol>

      <VCol
        cols="12"
        md="3"
      >
        <AppTextField
          v-model="item.Kecamatan"
          placeholder="Kecamatan"
          label="Kecamatan"
        />
      </VCol>

      <VCol
        cols="12"
        md="1"
        class="d-flex align-center justify-end"
      >
        <IconBtn
          color="error"
          @click="removeDetail(index)"
        >
          <VIcon icon="tabler-x" />
        </IconBtn>
      </VCol>
    </VRow>
  </div>
</template>
