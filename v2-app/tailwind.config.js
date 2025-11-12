/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				purple: {
					600: '#8B5CF6',
					700: '#7C3AED'
				},
				dark: {
					primary: '#1E1E2E',
					secondary: '#2A2A3C'
				},
				gray: {
					300: '#94A3B8',
					600: '#4B5563',
					700: '#374151',
					800: '#1F2937'
				}
			}
		}
	},
	plugins: []
};
