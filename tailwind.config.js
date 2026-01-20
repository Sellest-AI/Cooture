/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./expo/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontSize: {
        'h1': ['2.25rem', { letterSpacing: '-0.05rem', lineHeight: '1rem' }],
        'h1-alt': ['2.5rem', { letterSpacing: '-0.02rem', lineHeight: '0.9rem' }],
        'h3': ['1.75rem', { letterSpacing: '-0.07rem', lineHeight: '1rem' }],
        'h3-alt': ['2rem', { letterSpacing: '-0.01rem', lineHeight: '0.9rem' }],
        'h4': ['1.25rem', { letterSpacing: '-0.06rem', lineHeight: '1.1rem' }],
        'lg': ['1.06rem', { letterSpacing: '-0.04rem', lineHeight: '1.1rem' }],
        'base': ['0.94rem', { letterSpacing: '-0.05rem', lineHeight: '1.2rem' }],
        'sm': ['0.81rem', { letterSpacing: '-0.06rem', lineHeight: '1.1rem' }],
      },
      borderRadius: {
        '2xs': 'calc(0.825rem - 11px)',
        'xs': 'calc(0.825rem - 8px)',
        'sm': 'calc(0.825rem - 6px)',
        'md': 'calc(0.825rem - 4px)',
        'lg': '0.825rem',
        'xl': '0.825rem',
      },
      colors: {
        background: 'hsl(0, 0%, 94%)',
        foreground: 'hsl(0, 0%, 0%)',
        neutral: {
          50: 'hsl(0, 0%, 100%)',
          100: 'hsl(0, 0%, 94%)',
          200: 'hsl(0, 0%, 87%)',
          400: 'hsl(0, 0%, 66%)',
          800: 'hsl(0, 0%, 3%)',
          900: 'hsl(0, 0%, 0%)',
        },
        blur: {
          light: 'hsla(0, 0%, 84%, 0.37)',
          medium: 'hsla(0, 0%, 45%, 0.30)',
          dark: 'hsla(0, 0%, 13%, 0.70)',
          modal: 'hsla(0, 0%, 6%, 0.80)',
        },
        primary: {
          900: 'hsl(76, 100%, 5%)',
          700: 'hsl(81, 69%, 35%)',
          500: 'hsl(74, 100%, 56%)',
          200: 'hsl(74, 100%, 82%)',
        },
        secondary: {
          900: 'hsl(300, 100%, 3%)',
          500: 'hsl(314, 100%, 68%)',
          200: 'hsl(311, 100%, 82%)',
        },
        destructive: {
          500: 'hsl(0, 85%, 54%)',
          200: 'hsl(0, 0%, 100%)',
        },
      },
      spacing: {
        '1px': '1px',
      },
    },
  },
  plugins: [],
}