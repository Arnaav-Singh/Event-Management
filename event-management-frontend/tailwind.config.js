export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
    extend: {
      colors: {
        mit: {
          maroon: '#7b1f2c',
          gold: '#f9b233',
          black: '#222222',
          white: '#ffffff',
        },
      },
    },
  },
  plugins: [],
}
