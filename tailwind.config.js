/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      keyframes: {
        lightning: {
          '0%, 90%, 100%': {
            opacity: '0',
            transform: 'scaleY(0)'
          },
          '5%, 85%': {
            opacity: '1',
            transform: 'scaleY(1)'
          }
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(100vh) scale(0)',
            opacity: '0'
          },
          '10%, 90%': {
            opacity: '1'
          },
          '50%': {
            transform: 'translateY(-10vh) scale(1)',
            opacity: '0.8'
          }
        },
        'energy-pulse': {
          '0%, 100%': {
            opacity: '0',
            transform: 'translate(-50%, -50%) scale(0.5)'
          },
          '50%': {
            opacity: '1',
            transform: 'translate(-50%, -50%) scale(1.2)'
          }
        },
        'title-glow': {
          '0%': {
            textShadow: '0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(59, 130, 246, 0.3), 0 0 60px rgba(139, 92, 246, 0.2)'
          },
          '100%': {
            textShadow: '0 0 30px rgba(255, 255, 255, 0.8), 0 0 60px rgba(59, 130, 246, 0.5), 0 0 80px rgba(139, 92, 246, 0.3)'
          }
        },
        'gradient-shift': {
          '0%, 100%': {
            backgroundPosition: '0% 50%'
          },
          '50%': {
            backgroundPosition: '100% 50%'
          }
        },
        'fade-in-out': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' }
        }
      },
      animation: {
        'lightning': 'lightning 2s ease-in-out infinite',
        'float': 'float 6s infinite ease-in-out',
        'energy-pulse': 'energy-pulse 4s infinite ease-in-out',
        'title-glow': 'title-glow 3s ease-in-out infinite alternate',
        'gradient-shift': 'gradient-shift 4s ease-in-out infinite',
        'fade-in-out': 'fade-in-out 3s infinite ease-in-out'
      }
    },
  },
  plugins: [],
}

