
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Open Sans', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// CallControl Theme Tokens
				'theme-default': {
					text: 'hsl(var(--text-color-default))',
					bg: 'hsl(var(--bg-color-default))'
				},
				'theme-gray': {
					text: 'hsl(var(--text-color-gray))',
					bg: 'hsl(var(--bg-color-gray))'
				},
				'theme-brown': {
					text: 'hsl(var(--text-color-brown))',
					bg: 'hsl(var(--bg-color-brown))'
				},
				'theme-orange': {
					text: 'hsl(var(--text-color-orange))',
					bg: 'hsl(var(--bg-color-orange))'
				},
				'theme-yellow': {
					text: 'hsl(var(--text-color-yellow))',
					bg: 'hsl(var(--bg-color-yellow))'
				},
				'theme-green': {
					text: 'hsl(var(--text-color-green))',
					bg: 'hsl(var(--bg-color-green))'
				},
				'theme-blue': {
					text: 'hsl(var(--text-color-blue))',
					bg: 'hsl(var(--bg-color-blue))'
				},
				'theme-purple': {
					text: 'hsl(var(--text-color-purple))',
					bg: 'hsl(var(--bg-color-purple))'
				},
				'theme-pink': {
					text: 'hsl(var(--text-color-pink))',
					bg: 'hsl(var(--bg-color-pink))'
				},
				'theme-red': {
					text: 'hsl(var(--text-color-red))',
					bg: 'hsl(var(--bg-color-red))'
				},
				// Обратная совместимость с существующими цветами
				teal: {
					600: '#026670',
					400: '#0891B2',
				},
				mint: {
					300: '#9FEDD7',
					200: '#B8F2E6',
				},
				warning: {
					300: '#FCE181',
					200: '#FEF3C7',
				},
				neutral: {
					900: '#1A1A1A',
					50: '#F5F5F7',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
