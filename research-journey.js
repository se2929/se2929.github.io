
document.querySelectorAll('[data-comparison]').forEach(button=>{button.addEventListener('click',()=>{document.querySelectorAll('[data-comparison]').forEach(other=>{const active=other===button;other.setAttribute('aria-pressed',String(active));document.getElementById(other.getAttribute('aria-controls')).hidden=!active;});});});
