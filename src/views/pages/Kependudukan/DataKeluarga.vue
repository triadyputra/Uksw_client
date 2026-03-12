<script setup lang="ts">
import type { DataKeluarga } from './types'

const props = defineProps<{
  formData: DataKeluarga
}>()

const emit = defineEmits<{
  (e: 'update:formData', value: DataKeluarga): void
}>()

const formData = ref<DataKeluarga>(props.formData)

watch(formData, () => {
  emit('update:formData', formData.value)
})
</script>

<template>
  <VForm>
    <VRow>
      <VCol
        cols="12"
        sm="6"
      >
        <AppTextField
          v-model="formData.NoKK"
          label="No Kartu Keluarga"
          placeholder="No Kartu Keluarga"
        />
      </VCol>

      <VCol
        cols="12"
        sm="12"
      >
        <AppTextField
          v-model="formData.NamaIbu"
          label="Nama Ibu"
          placeholder="Nama Ibu"
        />
      </VCol>

      <VCol
        cols="12"
        sm="12"
      >
        <AppTextField
          v-model="formData.NamaAyah"
          label="Nama Ayah"
          placeholder="Nama Ayah"
        />
      </VCol>

      <!--  -->
      <!--  -->
    </VRow>
  </VForm>
</template>
