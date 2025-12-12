/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2d6a73',
        'primary-hover': '#1d4855',
        success: '#32b8c6',
        error: '#c01547',
        warning: '#a84b2f',
      },
      animation: {
        'fade-in': 'fadeIn 250ms ease',
        'slide-up': 'slideUp 250ms ease',
        'slide-down': 'slideDown 250ms ease',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { 
            opacity: '0',
            transform: 'translateY(20px)',
          },
          to: { 
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        slideDown: {
          from: { 
            opacity: '0',
            transform: 'translateY(-10px)',
          },
          to: { 
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [],
}