const replaceTemplates = () =>
  new Promise(res => {
    const templates = document.querySelectorAll('template')
    if (!templates.length) res()
    templates.forEach((t, i, all) => {
      fetch('/tmpl' + t.getAttribute('src') + '.html')
        .then(r => r.text())
        .then(html => {
          t.outerHTML = html
          if (i === all.length - 1) res()
        })
    })
  })

const initRoutes = () => {
  document.querySelectorAll('a[href^="/"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault()
      showPage(a.getAttribute('href'))
    })
  })
}

const executeJs = () => {
  document.body.querySelectorAll('script').forEach(oldScript => {
    const newScript = document.createElement('script')
    Array.from(oldScript.attributes).forEach(attr => {
      newScript.setAttribute(attr.name, attr.value)
    })
    newScript.appendChild(document.createTextNode(oldScript.innerHTML))
    oldScript.parentNode.replaceChild(newScript, oldScript)
  })

  document.body.innerHTML = document.body.innerHTML.replace(/{{(.*?)}}/g, match => {
    const m = match.substr(2, match.length - 4)
    return eval(m)
  })
}

const init = () => {
  replaceTemplates().then(() => {
    executeJs()
    initRoutes()
  })
}

const showPage = (href, push = true) => {
  if (push) window.history.pushState({}, href, window.location.origin + href)
  const delimiter = href.substr(1).indexOf('/') + 1
  if (delimiter) href = href.substr(0, delimiter)
  fetch('/pages' + (href === '/' ? '/index' : href) + '.html')
    .then(r => r.text())
    .then(page => {
      document.body.querySelector('#app').innerHTML = page
      init()
    })
}

window.onpopstate = e => {
  showPage(e.target.location.pathname, false)
}

showPage(location.pathname, false)
