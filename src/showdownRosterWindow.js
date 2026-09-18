document.addEventListener('DOMContentLoaded', () => {
  const body = document.getElementById('showdownRosterBody')
  const knownThemeClasses = [
    'theme-dark', 'theme-light', 'theme-zen-day', 'theme-zen-night',
    'theme-despair-light', 'theme-despair-dark', 'theme-zen-layout'
  ]
  window.api.onShowdownRosterUpdated(payload => {
    body.innerHTML = String(payload?.markup || '<p class="showdown-roster-empty">No survivors have departed yet.</p>')
    for (const className of knownThemeClasses) document.body.classList.remove(className)
    for (const className of Array.isArray(payload?.bodyClasses) ? payload.bodyClasses : []) {
      if (knownThemeClasses.includes(className)) document.body.classList.add(className)
    }
  })
})
