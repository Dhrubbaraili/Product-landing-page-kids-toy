import type { Config } from 'tailwindcss';
const config: Config = { content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'], theme: { extend: { colors: { ink: '#12233f', sky: '#e8f5ff', electric: '#1689e8', aqua: '#21c4c7', sun: '#ffc857' }, boxShadow: { glow: '0 18px 60px rgba(22,137,232,.18)' } } }, plugins: [] };
export default config;
