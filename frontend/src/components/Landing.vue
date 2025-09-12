<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue' // NEW: onUnmounted, watch
import { Form } from '@primevue/forms'
import type { FormInstance, FormSubmitEvent } from '@primevue/forms'
import Message from 'primevue/message'
import { z } from 'zod'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { useToast } from 'primevue/usetoast'

import { useUsersStore } from '@/stores/users.ts'
import { storeToRefs } from 'pinia'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import SelectButton from 'primevue/selectbutton';

defineProps<{ msg: string }>()

const store = useUsersStore()
const { users, count } = storeToRefs(store)

const NameSchema = z
  .string()
  .trim()
  .min(1, { message: 'Name is required.' })
  .max(32, { message: 'Mood must be ≤ 32 characters.' })
  .regex(/^([^0-9]*)$/, { message: 'No numbers allowed.' })
  .transform((v) => v.replace(/\s+/g, ' ')) // collapse multiple spaces

const MoodSchema = z
  .string()
  .trim()
  .min(1, { message: 'Mood is required.' })
  .max(32, { message: 'Mood must be ≤ 32 characters.' })
  .regex(/^[A-Za-z]+$/, { message: 'Use letters A–Z only.' })

const schema = z.object({ name: NameSchema, mood: MoodSchema })
type Values = z.infer<typeof schema>
const resolver = zodResolver(schema)

const toast = useToast()
const formData = reactive<Values>({ name: '', mood: '' })
const formRef = ref<FormInstance | null>(null)
const showFlag = ref(false)

onMounted(() => {
  store.ensureLoaded()
  store.connectWebSocket()
})

watch(showFlag, async (on) => {
  if (on) {
    await store.ensureLoaded() // make sure we have an initial list
  }
})

onUnmounted(() => {
  store.connectWebSocket(undefined, true);
})

function onShow() {
  showFlag.value = !showFlag.value
}

function onClear() {
  store.clear()
  users.value = [] // failsafe
  toast.add({ severity: 'error', summary: 'Deleted all entries.', life: 2000 })
}

function onFormSubmit(e: FormSubmitEvent<Record<string, unknown>>) {
  if (!e.valid) return
  store.addUser({ name: formData.name, mood: formData.mood })
  toast.add({ severity: 'success', summary: 'Form is submitted.', life: 2000 })
  formRef.value?.reset()
  formData.name = ''
  formData.mood = ''
}

const filters = ref({
  global: { value: null, matchMode: 'contains' },
  name:   { value: null, matchMode: 'startsWith' },
  mood:   { value: null, matchMode: 'startsWith' },
  isReal: { value: null, matchMode: 'equals' },
})

const realOptions = [
  { label: 'All',  value: null },
  { label: 'Real', value: true },
  { label: 'Fake', value: false },
]

const size = ref({ label: 'Normal', value: 'null' });
const sizeOptions = ref([
    { label: 'Compact', value: 'small' },
    { label: 'Normal', value: 'null' },
]);

function onUpdate(u: { id: string; name: string, mood: string} ) {
  store.updateUser(u.id, { name: u.name, mood: u.mood })
  toast.add({ severity: 'contrast', summary: `Updated: ${u.name} is now feeling ${u.mood}`, life: 500})
}
function onRemove(u: { id: string }) {
  store.removeUser(u.id)
}
</script>

<template>
  <div class="greetings">
    <h1 class="green">{{ msg }}</h1>
    <br />
    <h3>small survey. big picture.</h3>
  </div>

  <div class="card flex justify-center">
    <Form ref="formRef" v-slot="$form" :resolver="resolver" @submit="onFormSubmit">
      <div>
        <h3>Name</h3>
        <InputText name="name" v-model="formData.name" type="text" placeholder="John Doe" fluid />
        <!-- @vue-ignore -->
        <Message
          v-if="
            $form.name?.invalid && ($form.name?.dirty || $form.name?.touched || $form.submitted)
          "
          severity="error"
          size="small"
          variant="simple"
        >
          {{ $form.name.error?.message }}
        </Message>
      </div>

      <div>
        <h3>Mood</h3>
        <InputText name="mood" v-model="formData.mood" type="text" placeholder="Mysterious" fluid />
        <!-- @vue-ignore -->
        <Message
          v-if="
            $form.mood?.invalid && ($form.mood?.dirty || $form.mood?.touched || $form.submitted)
          "
          severity="error"
          size="small"
          variant="simple"
        >
          {{ $form.mood.error?.message }}
        </Message>
      </div>

      <br />
      <Button type="submit" label="Submit" />
    </Form>

    <br />
    <br />
    <Button
      @click="onShow"
      :label="showFlag ? 'Stop' : 'Show Names'"
      :style="showFlag ? { 'background-color': '#ef4444' } : null"
    />
    <Button @click="onClear" :label="'Delete All'" class="delete-btn" />
    <div v-if="showFlag">
      <br/>
      <h2>{{ count == 1 ? `${count} user` : `${count} users` }} submitted their mood. </h2>
      <br>
      <br>
        <SelectButton v-model="size" :options="sizeOptions" optionLabel="label" dataKey="label" />
        <DataTable
          :value="users"
          dataKey="id"
          :filters="filters"
          :globalFilterFields="['name','mood']"
          paginator
          :rows="10"
          responsiveLayout="scroll"
          :size="size.value"
          scrollable scrollHeight="300px"
          removableSort
        >
          <template #header>
            <div class="flex items-center column-gap: 0.5rem;">
              <span class="p-input-icon-left">
                <i class="pi pi-search" />
                <InputText
                  class="inline-btn"
                  v-model="filters['global'].value"
                  placeholder="Search name or mood…"
                />
              </span>

              <Dropdown
                class="inline-btn"
                v-model="filters['isReal'].value"
                :options="realOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="All users"
                size="small"
              />
            </div>
          </template>

          <Column field="name" header="Name" sortable>
            <template #body="{ data }">
              <InputText
                v-model="data.name"
                size="small"
                class="inline-input"
                :disabled="!data.isReal"
              />
            </template>
          </Column>

          <Column field="mood" header="Mood" sortable>
            <template #body="{ data }">
              <InputText
                v-model="data.mood"
                size="small"
                class="inline-input"
                :disabled="!data.isReal"
              />
            </template>
          </Column>

          <Column field="isReal" header="Type">
            <template #body="{ data }">
              <span :class="data.isReal ? 'text-green-600' : 'text-500'">
                {{ data.isReal ? 'Real' : 'Fake' }}
              </span>
            </template>
          </Column>

          <Column header="Actions">
            <template #body="{ data }">
              <Button
                v-if="data.isReal"
                size="small"
                class="inline-btn"
                label="Update"
                @click="onUpdate(data)"
              />
              <Button
                v-if="data.isReal"
                size="small"
                class="inline-btn"
                label="Remove"
                severity="danger"
                @click="onRemove(data)"
              />
            </template>
          </Column>
        </DataTable>

    </div>
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}
h3 {
  font-size: 1.2rem;
  font-weight: 600;
}
.greetings h1,
.greetings h3 {
  text-align: center;
}
.greetings {
  margin-bottom: 15vh;
}

.inline-input {
  min-width: 120px;
  max-width: 200px;
  margin: 0 6px; 
  padding: 0.25rem 0.5rem;
  font-size: 0.92rem;
  border-radius: 8px;
}

.inline-input::placeholder {
  opacity: 0.65;
}
.inline-input:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.25);
}

.inline-btn {
  margin-left: 6px;
}

.delete-btn {
  background-color: #ef4444;
  border-color: #ef4444;
  color: #fff;
  margin-left: 10px;
}
.delete-btn:hover {
  background-color: #b91c1c;
  border-color: #b91c1c;
}

.delete-btn:active {
  background-color: #8a0000;
  border-color: #8a0000;
}
</style>
