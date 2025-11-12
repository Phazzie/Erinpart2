<script lang="ts">
	import {
		Button,
		Input,
		Card,
		Dialog,
		Checkbox,
		RadioGroup,
		Select,
		Tooltip
	} from '$lib/components/ui';

	let dialogOpen = $state(false);
	let checkboxChecked = $state(false);
	let radioValue = $state('option1');
	let selectValue = $state('');
	let inputValue = $state('');

	const radioOptions = [
		{ value: 'option1', label: 'Option 1' },
		{ value: 'option2', label: 'Option 2' },
		{ value: 'option3', label: 'Option 3' }
	];

	const selectOptions = [
		{ value: 'apple', label: 'Apple' },
		{ value: 'banana', label: 'Banana' },
		{ value: 'cherry', label: 'Cherry' }
	];
</script>

<div class="min-h-screen bg-dark-primary p-8">
	<div class="max-w-4xl mx-auto space-y-8">
		<h1 class="text-4xl font-bold text-white mb-8">UI Components Demo</h1>

		<!-- Button Component -->
		<Card title="Button Component">
			<div class="space-y-4">
				<div class="flex gap-4 flex-wrap">
					<Button variant="primary">Primary</Button>
					<Button variant="secondary">Secondary</Button>
					<Button variant="ghost">Ghost</Button>
					<Button variant="danger">Danger</Button>
					<Button disabled>Disabled</Button>
				</div>
			</div>
		</Card>

		<!-- Input Component -->
		<Card title="Input Component">
			<div class="space-y-4">
				<Input
					bind:value={inputValue}
					label="Email"
					type="email"
					placeholder="Enter your email"
				/>
				<Input
					label="Password"
					type="password"
					placeholder="Enter your password"
				/>
				<Input
					label="Disabled Input"
					disabled
					placeholder="This is disabled"
				/>
				<Input
					label="Input with Error"
					error="This field is required"
					placeholder="Invalid input"
				/>
				<p class="text-gray-300 text-sm">Current value: {inputValue}</p>
			</div>
		</Card>

		<!-- Card Component -->
		<Card title="Card Component with Actions">
			<p class="text-gray-300">
				This is a card component with a title and content. Cards can also have optional action
				buttons in the footer.
			</p>
			{#snippet actions()}
				<div class="flex gap-2">
					<Button variant="primary">Save</Button>
					<Button variant="ghost">Cancel</Button>
				</div>
			{/snippet}
		</Card>

		<!-- Dialog Component -->
		<Card title="Dialog Component">
			<Button onClick={() => (dialogOpen = true)}>Open Dialog</Button>
			<Dialog bind:open={dialogOpen} title="Example Dialog">
				<div class="space-y-4">
					<p class="text-gray-300">
						This is a modal dialog with an overlay and close button. It can be closed by
						clicking the X button, clicking the overlay, or pressing ESC.
					</p>
					<Button onClick={() => (dialogOpen = false)}>Close</Button>
				</div>
			</Dialog>
		</Card>

		<!-- Checkbox Component -->
		<Card title="Checkbox Component">
			<div class="space-y-4">
				<Checkbox
					bind:checked={checkboxChecked}
					label="I agree to the terms and conditions"
				/>
				<Checkbox label="Another checkbox" />
				<Checkbox label="Disabled checkbox" disabled />
				<p class="text-gray-300 text-sm">
					Checkbox checked: {checkboxChecked}
				</p>
			</div>
		</Card>

		<!-- RadioGroup Component -->
		<Card title="RadioGroup Component">
			<div class="space-y-4">
				<RadioGroup
					bind:value={radioValue}
					options={radioOptions}
					name="demo-radio"
				/>
				<p class="text-gray-300 text-sm">
					Selected value: {radioValue}
				</p>
			</div>
		</Card>

		<!-- Select Component -->
		<Card title="Select Component">
			<div class="space-y-4">
				<Select
					bind:value={selectValue}
					options={selectOptions}
					placeholder="Choose a fruit"
				/>
				<p class="text-gray-300 text-sm">
					Selected value: {selectValue || 'None'}
				</p>
			</div>
		</Card>

		<!-- Tooltip Component -->
		<Card title="Tooltip Component">
			<div class="flex gap-4">
				<Tooltip content="This is a tooltip on top" placement="top">
					<Button variant="secondary">Hover me (top)</Button>
				</Tooltip>
				<Tooltip content="This is a tooltip on the right" placement="right">
					<Button variant="secondary">Hover me (right)</Button>
				</Tooltip>
				<Tooltip content="This is a tooltip on the bottom" placement="bottom">
					<Button variant="secondary">Hover me (bottom)</Button>
				</Tooltip>
				<Tooltip content="This is a tooltip on the left" placement="left">
					<Button variant="secondary">Hover me (left)</Button>
				</Tooltip>
			</div>
		</Card>
	</div>
</div>
