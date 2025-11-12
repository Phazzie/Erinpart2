<script lang="ts">
	import type { Day } from '$lib/contracts/task.contracts';

	interface Props {
		currentDay: Day;
		onChange: (day: Day) => void;
	}

	let { currentDay, onChange }: Props = $props();

	function handleKeyDown(e: KeyboardEvent, day: Day) {
		const otherDay: Day = day === 'today' ? 'tomorrow' : 'today';

		if (e.key === 'ArrowLeft') {
			e.preventDefault();
			onChange('today');
		} else if (e.key === 'ArrowRight') {
			e.preventDefault();
			onChange('tomorrow');
		} else if (e.key === 'Home') {
			e.preventDefault();
			onChange('today');
		} else if (e.key === 'End') {
			e.preventDefault();
			onChange('tomorrow');
		}
	}

	function handleClick(day: Day) {
		onChange(day);
	}
</script>

<div
	class="inline-flex bg-gray-800 rounded-lg p-1 relative"
	role="group"
	aria-label="Day selector"
>
	<!-- Sliding background indicator -->
	<div
		class="absolute top-1 bottom-1 rounded-md bg-purple-600 transition-all duration-200 ease-in-out"
		style="left: {currentDay === 'today' ? '4px' : '50%'}; width: calc(50% - 4px);"
		aria-hidden="true"
	></div>

	<!-- Today Button -->
	<button
		onclick={() => handleClick('today')}
		onkeydown={(e) => handleKeyDown(e, 'today')}
		class="relative z-10 px-6 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 {currentDay ===
		'today'
			? 'text-white'
			: 'text-gray-400 hover:text-white'}"
		aria-pressed={currentDay === 'today'}
		type="button"
	>
		Today
	</button>

	<!-- Tomorrow Button -->
	<button
		onclick={() => handleClick('tomorrow')}
		onkeydown={(e) => handleKeyDown(e, 'tomorrow')}
		class="relative z-10 px-6 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 {currentDay ===
		'tomorrow'
			? 'text-white'
			: 'text-gray-400 hover:text-white'}"
		aria-pressed={currentDay === 'tomorrow'}
		type="button"
	>
		Tomorrow
	</button>
</div>
