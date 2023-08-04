/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./build/**/*.{html,js}"],
  theme: {
    keyframes: {
      spin: {
        "0%": { transform: "rotate(0deg)" },
        "100%": { transform: "rotate(360deg)" },
      },
    },
    extend: {
      container: {
        center: true,
        padding: "1.5rem",
        screens: {
          xs: "1000px",
          lg: "1125px",
          xl: "1280px",
          "2xl": "1536px",
        },
      },
      colors: {
        primaryAccent: "#FFC107",
        secondaryAccent: "#F44336",
        thirdAccent: "#03A9F4",
        textColor: "#fff",
        textColor2: "#D4D4D4",
        dark: "#130F40",

        // Auth
        nobleDark500: "#363A3D",
        nobleDark600: "#1A1D21",
      },
      backgroundImage: {
        background: "url('../imgs/bg.jpg')",
        gradient: "linear-gradient(306deg, #000 0%, #0B1531 100%)",
      },
      fontFamily: {
        logo: ["Bona Nova", "serif"],
      },
      boxShadow: {
        shadow1: "-7px 11px 20px #000000a1",
      },
      screens: {
        wrap: "878px",
      },
      animation: {
        bgSlide: "bgSlide 20s linear alternate infinite",
        fadeIn: "fadeIn 1s linear alternate infinite",
        skeleton: "skeleton 1s linear alternate infinite",
      },
      keyframes: {
        bgSlide: {
          "0%": { backgroundPosition: "left" },
          "50%": { backgroundPosition: "center" },
          "100%": { backgroundPosition: "right" },
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        skeleton: {
          "0%": { backgroundColor: "rgb(212 212 212 / 60%)" },
          "100%": { backgroundColor: "rgb(212 212 212 / 100%)" },
        },
      },
    },
  },
  plugins: [],
};
