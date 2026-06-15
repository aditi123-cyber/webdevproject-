const themeButtonList = document.querySelectorAll('.theme-toggle');
const savedTheme = localStorage.getItem('portfolio-theme');

function applyTheme(theme) {
  document.body.classList.toggle('dark-theme', theme === 'dark');
  themeButtonList.forEach(btn => {
    btn.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
    btn.setAttribute('aria-pressed', theme === 'dark');
  });
}

function toggleTheme() {
  const nextTheme = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
  applyTheme(nextTheme);
  localStorage.setItem('portfolio-theme', nextTheme);
}

if (savedTheme) {
  applyTheme(savedTheme);
} else {
  applyTheme('light');
}

themeButtonList.forEach(button => {
  button.addEventListener('click', toggleTheme);
});