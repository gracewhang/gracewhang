// Inline script that resolves the theme before paint so we never flash the
// wrong palette. Reads localStorage, falls back to system preference.

const script = `
(function() {
  try {
    var stored = localStorage.getItem('theme');
    var theme = stored;
    if (theme !== 'light' && theme !== 'dark') {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.dataset.theme = theme;
  } catch (e) {
    document.documentElement.dataset.theme = 'light';
  }
})();
`;

export function NoFlashTheme() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
