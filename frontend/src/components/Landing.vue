<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Form } from '@primevue/forms'
import type { FormInstance, FormSubmitEvent } from '@primevue/forms'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Button from 'primevue/button'
import { z } from 'zod'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { useToast } from 'primevue/usetoast'

import { useUsersStore } from '@/stores/users'
import { storeToRefs } from 'pinia'

defineProps<{ msg: string }>()

const store = useUsersStore()
const { users } = storeToRefs(store)

const schema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  mood: z.string().min(1, { message: 'Mood is required.' })
})
type Values = z.infer<typeof schema>
const resolver = zodResolver(schema)

const toast = useToast()

// Use your own reactive model for v-model
const formData = reactive<Values>({ name: '', mood: '' })

const formRef = ref<FormInstance | null>(null)
const showFlag = ref(false)

onMounted(() => { store.ensureLoaded(); });

function onShow() {
  showFlag.value = !showFlag.value
}

function onFormSubmit(e: FormSubmitEvent<Record<string, unknown>>) {
  // If invalid, let the messages show (because $form.submitted becomes true)
  if (!e.valid) return

  // Valid submit
  store.addUser({ name: formData.name, mood: formData.mood })
  toast.add({ severity: 'success', summary: 'Form is submitted.', life: 2000 })

  // 1) Clear form meta so "submitted" doesn't keep errors visible
  formRef.value?.reset()

  // 2) Then clear your model (inputs update via v-model)
  formData.name = ''
  formData.mood = ''
}
</script>

<template>
  <div class="greetings">
    <h1 class="green">{{ msg }}</h1>
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

    <ul class="mt-4" v-if="showFlag">
      <li v-for="u in users" :key="u.id">
        {{ u.name }} is feeling {{ u.mood }} and is very {{ u.isReal ? 'real' : 'much like a robot, beep-boop!' }}
        <Button @click="store.removeUser(u.id)" label="Remove" />
      </li>
    </ul>
  </div>
</template>

<style scoped>
h1 { font-weight: 500; font-size: 2.6rem; position: relative; top: -10px; }
h3 { font-size: 1.2rem; font-weight: 600; }
.greetings h1, .greetings h3 { text-align: center; }
</style>
