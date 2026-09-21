// Shared by every component that needs the active theme's accent colour as
// raw "r,g,b" channels for building its own rgba()/gradient strings in JS
// (CSS itself gets this via the --accent-rgb custom property directly).
export function readAccentRgb(): string {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb').trim();
  return raw || '95,212,214';
}
