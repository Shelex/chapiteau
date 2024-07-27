import { nextui } from "@nextui-org/theme";
import type { Config } from "tailwindcss";

const config = {
    darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./node_modules/@nextui-org/theme/dist/components/(button|date-picker|dropdown|input|modal|select|table|user|ripple|spinner|calendar|date-input|popover|menu|divider|listbox|scroll-shadow|checkbox|spacer|avatar).js"
  ],
    prefix: "",
    theme: {
        extend: {},
    },
    plugins: [nextui()],
} satisfies Config;

export default config;
