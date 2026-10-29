<script setup>
const response = await fetch('https://example.com/posts.json');
const posts = await response.json();
</script>

<template>
  <p>{{ posts.length }}</p>
</template>
