import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        // (177deg, #090066 2.18%, #060046 112.35%)
        'my': " linear-gradient( #322b80ee, #322b80ee ), url('/bg-forpes.png') ",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':  'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'pes-gradient': 'linear-gradient(173deg, #3125AE 3.71%, rgba(255, 199, 42, 0.85) 257.51%);',
      },
      rotate: {
        '65': '65deg'
      },
      opacity: {
        '5': '0.03'
      },
      boxShadow: {
        // Real depth: offset + soft blur, tuned for a light institutional UI.
        'xs': '0 1px 2px 0 rgb(16 17 53 / 0.05)',
        'sm': '0 1px 3px 0 rgb(16 17 53 / 0.08), 0 1px 2px -1px rgb(16 17 53 / 0.06)',
        'card': '0 1px 2px 0 rgb(16 17 53 / 0.04), 0 4px 12px -2px rgb(16 17 53 / 0.06)',
        'md': '0 4px 16px -2px rgb(16 17 53 / 0.10), 0 2px 6px -2px rgb(16 17 53 / 0.06)',
        'lg': '0 12px 32px -8px rgb(16 17 53 / 0.16), 0 4px 12px -4px rgb(16 17 53 / 0.08)',
        'focus': '0 0 0 3px rgb(50 43 128 / 0.18)',
        // Kept for backward-compat with legacy `shadow-custom` usages.
        'custom': '0px 0px 20px 5px',
      },
      inset: {
        '3/12': '25%'
      },
      margin: {
        '1_2': '2px'
      },
      width: {
        '4_5': '47%',
        '192': '48rem',
        '144': '42rem',
        '3_4': '31.5%',
      },
      height: {
        '22': '5.5rem',
        '100': '25rem',
        '108': '27rem',
        '112': '28rem',
        '116': '29rem',
        '144': '42rem',
        '192': '48rem'
      },
      colors: {
        // --- Brand: systematized indigo ---------------------------------
        // `pes` keeps a DEFAULT so every existing `bg-pes` / `text-pes`
        // keeps working, while the full ramp (pes-50…950) is now available.
        pes: {
          DEFAULT: '#322b80',
          50:  '#f3f3fb',
          100: '#e6e6f6',
          200: '#c9c7ec',
          300: '#a5a2dd',
          400: '#7d78c9',
          500: '#5b55b3',
          600: '#464099',
          700: '#322b80', // brand anchor
          800: '#2a2469',
          900: '#221d52',
          950: '#161135',
        },
        // --- Semantic surfaces / lines (driven by CSS vars) --------------
        surface: 'rgb(var(--surface) / <alpha-value>)',
        canvas: 'rgb(var(--canvas) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        // --- Status ------------------------------------------------------
        success: {
          DEFAULT: '#1c9c07',
          50:  '#f0faec',
          100: '#dcf3d2',
          500: '#1c9c07',
          600: '#178205',
          700: '#136a05',
        },
        warning: {
          DEFAULT: '#9e7400',
          50:  '#fdf6ec',
          100: '#fae7c8',
          500: '#c2820b',
          600: '#9e7400',
          700: '#7c5a00',
        },
        danger: {
          DEFAULT: '#dc2626',
          50:  '#fef2f2',
          100: '#fde3e3',
          500: '#e5484d',
          600: '#dc2626',
          700: '#b91c1c',
        },
        // --- Legacy tokens kept for backward-compat ----------------------
        'orng': '#9e7400',
        'grn': '#1c9c07',
        'gray-10': '#f8f8fa85',
      },
    },
  },
  plugins: [],
}
export default config
