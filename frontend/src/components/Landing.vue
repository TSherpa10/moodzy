<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue' // NEW: onUnmounted, watch
import { Form } from '@primevue/forms'
import type { FormInstance, FormSubmitEvent } from '@primevue/forms'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Button from 'primevue/button'
import { z } from 'zod'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { useToast } from 'primevue/usetoast'

import { useUsersStore } from '@/stores/users.ts'
import { storeToRefs } from 'pinia'

defineProps<{ msg: string }>()

const store = useUsersStore()
const { users } = storeToRefs(store)

const NameSchema = z.string().trim().min(1, { message: 'Name is required.' })
  .max(32, {message: 'Mood must be ≤ 32 characters.'})
  .regex(/^([^0-9]*)$/, { message: 'No numbers allowed.' })
  .transform(v => v.replace(/\s+/g, ' ')); // collapse multiple spaces

const MoodSchema = z.string()
  .trim()
  .min(1, { message: 'Mood is required.' })
  .max(32, { message: 'Mood must be ≤ 32 characters.' })
  .regex(/^[A-Za-z]+$/, { message: 'Use letters A–Z only.' });

const schema = z.object({ name: NameSchema, mood: MoodSchema })
type Values = z.infer<typeof schema>
const resolver = zodResolver(schema)

const toast = useToast()
const formData = reactive<Values>({ name: '', mood: '' })
const formRef = ref<FormInstance | null>(null)
const showFlag = ref(false)

// NEW: hold a disposer returned by store.startPolling()
let stopPolling: (() => void) | null = null

// keep your initial load as-is (does nothing if already fetched)
onMounted(() => { 
  store.ensureLoaded()
  stopPolling = store.startPolling(1500)  // poll every second
 })

// NEW: start/stop polling when Show/Stop toggles
watch(showFlag, async (on) => {
  if (on) {
    await store.ensureLoaded()          // make sure we have an initial list
  } else {
    stopPolling?.()
    stopPolling = null
  }
})

// NEW: cleanup if user navigates away while polling
onUnmounted(() => { stopPolling?.(); stopPolling = null })

function onShow() {
  showFlag.value = !showFlag.value
}

function onClear() {
  store.clear();
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
</script>


<template>
  <div class="greetings">
    <h1 class="green">{{ msg }}</h1>
    <br>
    <h3>small survey. big picture.</h3>
  </div>

  <div class="card flex justify-center">
    <Form
      ref="formRef"
      v-slot="$form"
      :resolver="resolver"
      @submit="onFormSubmit"
    >
      <div>
        <h3>Name</h3>
        <!-- v-model drives the input like normal Vue -->
        <InputText name="name" v-model="formData.name" type="text" placeholder="John Doe" fluid />
        <!-- Show only if invalid AND user interacted OR a (failed) submit happened -->
        <!-- @vue-ignore -->
        <Message
          v-if="$form.name?.invalid && ($form.name?.dirty || $form.name?.touched || $form.submitted)"
          severity="error" size="small" variant="simple"
        >
          {{ $form.name.error?.message }}
        </Message>
      </div>

      <div>
        <h3>Mood</h3>
        <InputText name="mood" v-model="formData.mood" type="text" placeholder="Mysterious" fluid />
        <!-- @vue-ignore -->
        <Message
          v-if="$form.mood?.invalid && ($form.mood?.dirty || $form.mood?.touched || $form.submitted)"
          severity="error" size="small" variant="simple"
        >
          {{ $form.mood.error?.message }}
        </Message>
      </div>

      <br />
      <Button type="submit" label="Submit" />
    </Form>
    
    <br>
    <br>
    <Button @click="onShow" :label="showFlag ? 'Stop' : 'Show Names'" :style="showFlag ? {'background-color': 'red'} : null"/>
    <Button @click="onClear" :label="'Delete All'" class="delete-btn" />

<ul class="mt-4" v-if="showFlag">
  <li v-for="u in users" :key="u.id" class="li-entry">
    <InputText
      size="small"
      v-model="u.name"
      placeholder="Name"
      class="inline-input"
    />
    <span>is feeling</span>
    <InputText
      size="small"
      v-model="u.mood"
      placeholder="Mood"
      class="inline-input"
    />
    <span>and is most definitely {{ u.isReal ? 'real' : 'a robot, beep-boop, jee wilikers!' }}</span>

    <Button
      size="small"
      class="inline-btn"
      label="Update"
      @click="store.updateUser(u.id, { name: u.name, mood: u.mood })"
    />
    <Button
      size="small"
      class="inline-btn"
      label="Remove"
      severity="danger"
      @click="store.removeUser(u.id)"
    />
  </li>
</ul>


  </div>
</template>

<style scoped>
h1 { font-weight: 500; font-size: 2.6rem; position: relative; top: -10px; }
h3 { font-size: 1.2rem; font-weight: 600; }
.greetings h1, .greetings h3 { text-align: center; }
.greetings { margin-bottom: 15vh ;}
/* Make each row tidy and evenly spaced */
.li-entry {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;                 /* natural spacing between all inline items */
  margin: 10px 0;
  padding: 10px 12px;
  border: 1px solid var(--p-surface-300, #e5e7eb);
  border-radius: 10px;
  background: var(--p-surface-0, #fff);
}

/* Compact, nicer inputs */
.inline-input {
  min-width: 120px;
  max-width: 200px;
  margin: 0 6px;            /* left/right margins */
  padding: 0.25rem 0.5rem;  /* a touch smaller */
  font-size: 0.92rem;
  border-radius: 8px;
}

/* Subtle placeholder + focus treatment */
.inline-input::placeholder { opacity: 0.65; }
.inline-input:focus {
  outline: none;
  border-color: #60a5fa;               /* soft blue */
  box-shadow: 0 0 0 2px rgba(96,165,250,.25);
}

/* Small, even spacing for both buttons */
.inline-btn { margin-left: 6px; }

.delete-btn {
  background-color: #ef4444; /* red-500 */
  border-color: #ef4444;
  color: #fff;
  margin-left: 10px;
}
.delete-btn:hover {
  background-color: #b91c1c;
  border-color: #b91c1c;
}

.delete-btn:active {
  background-color: #8A0000;
  border-color: #8A0000;
}

</style>
