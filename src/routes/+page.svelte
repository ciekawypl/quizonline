<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props()
</script>

<article>
	<form method="POST" use:enhance>
		<h1>Dołącz do quizu</h1>
		<fieldset>
			<label>
				Kod pokoju
				{#if form?.error}
					<input type="text" name="room" aria-invalid="true" />
					<small>{form.error}</small>
				{:else}
					<input type="text" name="room" />
				{/if}
			</label>
		</fieldset>
		{#if data.user}
			<button type="submit">Dołącz do pokoju -></button>
		{:else}
			<div class="grid">
				<button class="secondary" type="submit">Dołącz jako gość -></button>
				<a type="submit" role="button" href="/login">Zaloguj się i zapisuj wyniki -></a>
			</div>
		{/if}
	</form>
</article>
