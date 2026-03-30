/**
 * Lien « Debug » : rechargement complet avec #debug (le hash seul ne recharge pas toujours la page).
 */
const el = document.querySelector('.debug-link')
if (el) {
  el.addEventListener('click', (e) => {
    e.preventDefault()
    if (window.location.hash !== '#debug') {
      window.location.hash = '#debug'
    }
    window.location.reload()
  })
}
