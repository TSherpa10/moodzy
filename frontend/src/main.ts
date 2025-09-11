import './assets/main.css' // your Tailwind (if any) or global CSS

import { createApp } from 'vue'
import App from './App.vue'
import Ripple from 'primevue/ripple'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'     // ← pick Aura, Lara, Nora, Material
import 'primeicons/primeicons.css'           // ← still needed for icons
import ToastService from 'primevue/toastservice'

import { createPinia } from 'pinia'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

app.use(PrimeVue, {
  theme: {
    preset: Aura,
    // If you use Tailwind, consider a CSS Layer to avoid specificity fights:
    // See https://primevue.org/configuration
    options: {
      // prefix: 'p', // default
      darkModeSelector: 'system',
      // If using Tailwind, this layer ordering helps:
      cssLayer: { name: 'primevue', order: 'tailwind-base, primevue, tailwind-utilities' }
    }
  }
})

app.directive('ripple', Ripple)

app.use(ToastService)
app.mount('#app')
