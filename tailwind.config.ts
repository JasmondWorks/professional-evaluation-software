import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
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
      boxShadow:{
        'custom': '0px 0px 20px 5px',
      },
      inset: {
        '3/12': '25%'
      },
      margin:{
        '1_2': '2px'
      },
      width:{
        '4_5': '47%',
        '192': '48rem',
        '144': '42rem',
        '3_4': '31.5%',
      },
      height:{
        '22': '5.5rem',
        '100': '25rem',
        '108': '27rem',
        '112': '28rem',
        '116': '29rem',
        '144': '42rem',
        '192': '48rem'
      },
      colors:{
        'pes' : '#322b80',
        'orng' : '#9e7400',
        'grn' : '#1c9c07',
        'gray-10': '#f8f8fa85'
      }
    },
  },
  plugins: [],
}
export default config
