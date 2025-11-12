import { describe, it, expect } from 'vitest';

describe('Button Component', () => {
	it('exists and can be imported', async () => {
		const module = await import('./Button.svelte');
		expect(module.default).toBeDefined();
	});

	it('exports a valid Svelte component', async () => {
		const module = await import('./Button.svelte');
		expect(typeof module.default).toBe('function');
	});
});

describe('Input Component', () => {
	it('exists and can be imported', async () => {
		const module = await import('./Input.svelte');
		expect(module.default).toBeDefined();
	});
});

describe('Card Component', () => {
	it('exists and can be imported', async () => {
		const module = await import('./Card.svelte');
		expect(module.default).toBeDefined();
	});
});

describe('Dialog Component', () => {
	it('exists and can be imported', async () => {
		const module = await import('./Dialog.svelte');
		expect(module.default).toBeDefined();
	});
});

describe('Checkbox Component', () => {
	it('exists and can be imported', async () => {
		const module = await import('./Checkbox.svelte');
		expect(module.default).toBeDefined();
	});
});

describe('RadioGroup Component', () => {
	it('exists and can be imported', async () => {
		const module = await import('./RadioGroup.svelte');
		expect(module.default).toBeDefined();
	});
});

describe('Select Component', () => {
	it('exists and can be imported', async () => {
		const module = await import('./Select.svelte');
		expect(module.default).toBeDefined();
	});
});

describe('Tooltip Component', () => {
	it('exists and can be imported', async () => {
		const module = await import('./Tooltip.svelte');
		expect(module.default).toBeDefined();
	});
});
