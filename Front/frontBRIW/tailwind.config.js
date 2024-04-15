import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  mode: 'jit',
  content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        Lato : ['Lato']

      }
    },
  },
  plugins: [daisyui],
  purge: ["./index.html",
  "./src/**/*.{js,ts,jsx,tsx}"
  
  ],
  daisyui:{
    themes: true
  }
}

