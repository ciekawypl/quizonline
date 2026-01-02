<script lang="ts">
	import { enhance } from '$app/forms';
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();
</script>

<form use:enhance action="/logout" method="POST"><button type="submit">logout</button></form>
