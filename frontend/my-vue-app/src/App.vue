<template>
  <DocumentEditor />
</template>

<script>
import DocumentEditor from './components/DocumentEditor.vue'

export default {
  name: 'App',
  components: {
    DocumentEditor
  }
}
</script>

<style>
body {
  font-family: sans-serif;
  margin: 0;
  padding: 0;
  display: flex; /* Allow full-screen height */
  min-height: 100vh;
}
</style>
