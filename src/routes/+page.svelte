<script lang="ts">
    let room = $state()
</script>

<div class="grid">
	<article class="keepPadding">
		<hgroup>
			<h1>Dołącz do quizu</h1>
			<p>Jako gość</p>
		</hgroup>
		<input type="text" bind:value={room} />
		<div class="grid">
			<a role="button" href="/play/{room}">Dołącz jako gość</a>
		</div>
	</article>
	<!-- <article class="keepPadding">
		<hgroup>
			<h1>Dołącz do quizu</h1>
			<p>Jako gość</p>
		</hgroup>
		<input type="text" bind:value={room} />
		<div class="grid">
			<a role="button" href="/test/join/{room}">Dołącz jako gość</a>
		</div>
	</article> -->
</div>
