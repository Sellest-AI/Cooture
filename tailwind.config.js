/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./expo/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        'murays': ['Murays', 'sans-serif'],
      },
      fontSize: {
        'max': ['4.63rem', { letterSpacing: '-0.05em', lineHeight: '0.9em', fontWeight: '800' }],
        'h1': ['2.25rem', { letterSpacing: '-0.05em', lineHeight: '1em', fontWeight: '600' }],
        'h1-alt': ['2.5rem', { letterSpacing: '-0.02em', lineHeight: '0.9em', fontWeight: '600' }],
        'h3': ['1.75rem', { letterSpacing: '-0.07em', lineHeight: '1em', fontWeight: '600' }],
        'h3-alt': ['2rem', { letterSpacing: '-0.01em', lineHeight: '0.9em', fontWeight: '600' }],
        'h4': ['1.25rem', { letterSpacing: '-0.06em', lineHeight: '1.1em', fontWeight: '600' }],
        'lg': ['1.06rem', { letterSpacing: '-0.04em', lineHeight: '1.1em', fontWeight: '600' }],
        'base': ['0.94rem', { letterSpacing: '-0.05em', lineHeight: '1.2em' }],
        'sm': ['0.81rem', { letterSpacing: '-0.06em', lineHeight: '1.1em' }],
      },
      borderWidth: {
        '3': '3px',
      },
      borderRadius: {
        '2xs': 'calc(0.825rem - 11px)',
        'xs': 'calc(0.825rem - 8px)',
        'sm': 'calc(0.825rem - 6px)',
        'md': 'calc(0.825rem - 4px)',
        'lg': '0.825rem',
        'xl': '0.825rem',
      },
      size: {
        '13': '3.25rem',
      },
      colors: {
        background: 'hsl(0, 0%, 3%)',
        foreground: 'hsl(0, 0%, 100%)',
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
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.child-shrink-0>*': {
          'flex-shrink': '0',
        },
        '.flex-row-between': {
          'display': 'flex',
          'flex-direction': 'row',
          'align-items': 'center',
          'justify-content': 'space-between',
        },
        '.flex-row-center': {
          'display': 'flex',
          'flex-direction': 'row',
          'align-items': 'center',
          'justify-content': 'center',
        },
        '.flex-col-center': {
          'display': 'flex',
          'flex-direction': 'column',
          'align-items': 'center',
          'justify-content': 'center',
        },
        '.flex-col-between': {
          'display': 'flex',
          'flex-direction': 'column',
          'align-items': 'center',
          'justify-content': 'space-between',
        },
        '.inset-x-center': {
          'left': '50%',
          'right': '50%',
          'transform': 'translateX(-50%)',
        },
        '.inset-y-center': {
          'top': '50%',
          'bottom': '50%',
          'transform': 'translateY(-50%)',
        },
        '.inset-center': {
          'left': '50%',
          'right': '50%',
          'top': '50%',
          'bottom': '50%',
          'transform': 'translate(-50%, -50%)',
        },
      });
    },
  ],
};