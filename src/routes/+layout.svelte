<script lang="ts">
	import '@skeletonlabs/skeleton/themes/theme-rocket.css';
	import '@skeletonlabs/skeleton/styles/skeleton.css';
	import '../app.postcss';
	import { AppShell, AppBar } from '@skeletonlabs/skeleton';
	import { Toast } from '@skeletonlabs/skeleton';
	import LightSwitch from '$lib/LightSwitch.svelte';
</script>

<Toast rounded="rounded-3xl" shadow="shadow-lg" />
<AppShell>
	<center class="sticky top-0 z-10">
		<AppBar class="rounded-b-3xl variant-ghost-surface max-w-5xl">
			<svelte:fragment slot="lead">
				<a href="/" class="text-xl font-bold">Reddit Search</a>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<a
					class="btn btn-sm variant-ghost-surface rounded-2xl"
					href="https://pullpush.io/"
					target="_blank"
					rel="noreferrer"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32"
						><path
							fill="currentColor"
							d="M12 10h10V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h6V12a2 2 0 0 1 2-2Z"
						/><path
							fill="currentColor"
							d="M28 10h-6v10a2 2 0 0 1-2 2H10v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V12a2 2 0 0 0-2-2Z"
						/></svg
					>
				</a>
				<a
					class="btn btn-sm variant-ghost-surface rounded-2xl"
					href="https://discord.gg/jsn3TSS8bs"
					target="_blank"
					rel="noreferrer"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32"
						><path
							fill="currentColor"
							d="M25.7 7.1C23.9 6.3 22 5.7 20 5.3h-.1c-.2.4-.5 1-.7 1.5c-2.2-.3-4.3-.3-6.4 0c-.2-.5-.5-1-.7-1.5H12c-2 .3-3.9.9-5.7 1.8C2.7 12.5 1.7 17.8 2.2 23v.1c2.4 1.8 4.7 2.8 7 3.5h.1c.5-.7 1-1.5 1.4-2.3v-.1c-.8-.3-1.5-.6-2.2-1c-.1 0-.1-.1 0-.1c.1-.1.3-.2.4-.3H9c4.6 2.1 9.5 2.1 14.1 0h.1c.1.1.3.2.4.3c.1 0 0 .1 0 .1c-.7.4-1.4.8-2.2 1c0 0-.1.1 0 .1c.4.8.9 1.6 1.4 2.3h.1c2.3-.7 4.6-1.8 7-3.5V23c.6-6-1-11.2-4.2-15.9zM11.4 19.9c-1.4 0-2.5-1.3-2.5-2.8s1.1-2.8 2.5-2.8s2.5 1.3 2.5 2.8c0 1.5-1.1 2.8-2.5 2.8zm9.3 0c-1.4 0-2.5-1.3-2.5-2.8s1.1-2.8 2.5-2.8s2.5 1.3 2.5 2.8c0 1.5-1.1 2.8-2.5 2.8z"
						/></svg
					>
				</a>
				<LightSwitch />
			</svelte:fragment>
		</AppBar>
	</center>
	<svelte:fragment slot="pageFooter">
		<div class="flex justify-center pb-3 w-full">
			<p class=" break-keep">
				By using <a
					href="https://pullpush.io"
					target="_blank"
					referrerpolicy="no-referrer"
					class="underline cursor-pointer font-bold break-keep">PullPush.io</a
				>
				you agree to the
				<a
					href="https://pullpush.io/tos.html"
					target="_blank"
					referrerpolicy="no-referrer"
					class="underline cursor-pointer font-bold break-keep">TOS</a
				>
			</p>
		</div>
	</svelte:fragment>
	<slot />
</AppShell>
