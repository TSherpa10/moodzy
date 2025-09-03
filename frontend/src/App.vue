<script setup lang="ts">
import Landing from './components/Landing.vue';
import { Toast } from 'primevue';
</script>

<template>

    <div class="wrapper">
      <Toast/>
      <Landing msg="Moodzy"/>
    </div>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}
</style>
