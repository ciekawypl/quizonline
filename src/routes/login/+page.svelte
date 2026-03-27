<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { form } : PageProps = $props()
</script>

<article>
	<h1>Logowanie</h1>
	<form action="?/login" method="POST" use:enhance>
		<fieldset>
			<label>
				Login
				{#if form?.usernameError}
					<input name="username" type="text" aria-invalid="true" value={form.usernameError.username} />
					<small>{form.usernameError.error}</small>
				{:else if form?.globalError}
					<input name="username" type="text" aria-invalid="true" value={form.globalError.username} />
					<small>{form.globalError.error}</small>
				{:else if form?.passwordError}
					<input name="username" type="text" value={form.passwordError.username} />
				{:else}
					<input name="username" type="text" />
				{/if}
			</label>
			<label>
				Hasło
				{#if form?.passwordError}
					<input name="password" type="password" aria-invalid="true" />
					<small>{form.passwordError.error}</small>
				{:else if form?.globalError}
					<input name="password" type="password" aria-invalid="true" />
					<small>{form.globalError.error}</small>
				{:else}
					<input name="password" type="password" />
				{/if}
			</label>
		</fieldset>
		<div class="grid">
			<button type="submit">Zaloguj</button>
			<button class="secondary" type="submit" formaction="?/register">Zarejestruj</button>
		</div>
	</form>
</article>
