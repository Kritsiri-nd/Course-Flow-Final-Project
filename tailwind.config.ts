import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'blue': {
          '100': 'var(--blue-100)',
          '200': 'var(--blue-200)',
          '300': 'var(--blue-300)',
          '400': 'var(--blue-400)',
          '500': 'var(--blue-500)',
          '600': 'var(--blue-600)',
          '700': 'var(--blue-700)',
          '800': 'var(--blue-800)',
          '900': 'var(--blue-900)',
        },
        'dark-blue': {
          '500': 'var(--dark-blue-500)',
        },
        'gray': {
          '100': 'var(--gray--100)',
          '200': 'var(--gray--200)',
          '300': 'var(--gray--300)',
          '400': 'var(--gray--400)',
          '500': 'var(--gray--500)',
          '600': 'var(--gray--600)',
          '700': 'var(--gray--700)',
          '800': 'var(--gray--800)',
          '900': 'var(--gray--900)',
        },
        'orange': {
          '100': 'var(--orange-100)',
          '500': 'var(--orange-500)',
        },
        'green': 'var(--green)',
        'black': 'var(--black)',
        'white': 'var(--white)',
      },
      fontSize: {
        'h1': 'var(--H1)',
        'h2': 'var(--H2)',
        'h3': 'var(--H3)',
        'b1': 'var(--B1)',
        'b2': 'var(--B2)',
        'b3': 'var(--B3)',
        'b4': 'var(--B4)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
      },
      backgroundImage: {
        'linear-1': 'var(--linear1)',
        'linear-2': 'var(--linear2)',
      },
      boxShadow: {
        '1': '2px 2px 12px 0 rgba(0, 0, 0, 0.08)',
        '2': '2px 2px 12px 0 rgba(64, 50, 133, 0.12)',
      }
      backgroundImage: {
        'linear1': 'var(--linear1)',
        'linear2': 'var(--linear2)', 
      },
    },
  },
  plugins: [],
}

export default config