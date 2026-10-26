<script>
  import {onMount} from 'svelte';

  let width = 0;

  onMount(() => {
    width = window.innerWidth;
    document.title = 'Page';
  });
</script>

<p>{width}</p>
