/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  safelist: [
    'bg-cyan-500/20', 'bg-purple-500/20', 'bg-blue-500/20', 'bg-emerald-500/20',
    'text-cyan-400', 'text-purple-400', 'text-blue-400', 'text-emerald-400',
    'border-cyan-500/30', 'border-purple-500/30', 'border-blue-500/30', 'border-emerald-500/30',
    'bg-emerald-500/10', 'bg-red-500/10', 'bg-amber-500/10',
    'border-emerald-500/30', 'border-red-500/30', 'border-amber-500/30',
  ],
  theme: {
    extend: {
      colors: {
        space: {
          700: '#0f172a',
          800: '#0b1120',
          900: '#060b18',
          950: '#030712',
        },
        'secondary-container': '#feb700',
        surface: '#111319',
        'surface-container-low': '#191b22',
        'surface-container-lowest': '#0c0e14',
        error: '#ffb4ab',
        outline: '#849495',
        'outline-variant': '#3b494b',
      },
      spacing: {
        'margin-edge': '48px',
        'stack-sm': '8px',
        unit: '4px',
      },
      fontFamily: {
        'body-md': ['Geist', 'sans-serif'],
        'label-sm': ['JetBrains Mono', 'monospace'],
        'technical-md': ['JetBrains Mono', 'monospace'],
        'display-xl': ['Space Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
