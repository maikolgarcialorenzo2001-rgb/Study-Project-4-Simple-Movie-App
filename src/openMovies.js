
const moviesWrapper = document.getElementById("moviesWrapper")
const recommendedPanel = document.getElementById("recommendedList")

import { apiKey } from "./loadPages.js"

function detectType(card, data = null) {
  let type = card.dataset.type

  if (type === "movie" || type === "tv") return type

  type = card.getAttribute("data-type")
  if (type === "movie" || type === "tv") return type

  if (data?.title && !data?.name) return "movie"
  if (data?.name) return "tv"

  return "movie"
}

const handleCardClick = async (e) => {
  const card = e.target.closest("a")
  if (!card) return

  e.preventDefault()

  const id = card.getAttribute("id")

  if (!id || id === "undefined") {
    console.error("❌ ID inválido en card:", card)
    return
  }

  let type = card.dataset.type || card.getAttribute("data-type") || "movie"

  if (type !== "movie" && type !== "tv") {
    type = "movie"
  }

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/${type}/${id}?api_key=${apiKey}&language=es-ES`
    )

    const data = await res.json()

    type = detectType(card, data)

    showMovieDetails(data, type)

  } catch (err) {
    console.error("❌ Error cargando contenido:", err)
  }
}

if (moviesWrapper) {
  moviesWrapper.addEventListener("click", handleCardClick)
}

if (recommendedPanel) {
  recommendedPanel.addEventListener("click", handleCardClick)
}

const offField = document.getElementById("offField")
const moviePanelContent = document.getElementById("moviePanelContent")
const closePanel = document.getElementById("closePanel")

function openMoviePanel() {
  offField.style.opacity = "1"
  offField.style.pointerEvents = "auto"

  offField.classList.remove("opacity-0")
  offField.classList.add("opacity-100")

  moviePanelContent.classList.remove("scale-95")
  moviePanelContent.classList.add("scale-100")

  moviePanelContent.style.opacity = "1"

  enhanceOverviewScroll()
}

function closeMoviePanel() {
  moviePanelContent.classList.add("scale-95")
  moviePanelContent.classList.remove("scale-100")

  moviePanelContent.style.opacity = "0"

  document.getElementById("panelTrailer").src = ""

  setTimeout(() => {
    offField.style.opacity = "0"
    offField.style.pointerEvents = "none"
  }, 200)
}

// eventos cerrar
if (closePanel) closePanel.addEventListener("click", closeMoviePanel)

if (offField) {
  offField.addEventListener("click", (e) => {
    if (e.target === offField) closeMoviePanel()
  })
}

async function showMovieDetails(movie, type) {
  const id = movie.id

  if (!id) {
    console.error("❌ movie.id inválido:", movie)
    return
  }

  document.getElementById("panelPoster").src =
    movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "./img/1.png"

  document.getElementById("panelBackdrop").style.backgroundImage =
    movie.backdrop_path
      ? `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
      : "none"

  document.getElementById("panelTitle").textContent =
    movie.title || movie.name || "Sin título"

  document.getElementById("panelGenre").textContent =
    movie.genres?.map(g => g.name).join(", ") || "Sin género"

  document.getElementById("panelAdult").textContent =
    movie.adult ? "🔞 Adulto" : "Apto"

  document.getElementById("panelRating").textContent =
    `⭐ ${movie.vote_average?.toFixed(1) || "0.0"}`

  document.getElementById("panelOverview").textContent =
    movie.overview || "Sin descripción disponible."

  const trailerKey = await fetchTrailer(id, type)

  document.getElementById("panelTrailer").src =
    trailerKey
      ? `https://www.youtube.com/embed/${trailerKey}?autoplay=0&controls=1`
      : ""

  openMoviePanel()
}

async function fetchTrailer(id, type) {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/${type}/${id}/videos?api_key=${apiKey}&language=es-ES`
    )

    const data = await res.json()

    if (!data.results?.length) return null

    const trailer =
      data.results.find(v => v.type === "Trailer" && v.site === "YouTube") ||
      data.results[0]

    return trailer?.key || null

  } catch (err) {
    console.error("❌ Error trailer:", err)
    return null
  }
}

function enhanceOverviewScroll() {
  const overview = document.getElementById("panelOverview")

  if (!overview) return

  overview.style.overflowY = "auto"
  overview.style.maxHeight = "240px"
  overview.style.scrollBehavior = "smooth"

  overview.scrollTop = 0
}

export {
  showMovieDetails,
  openMoviePanel,
  closeMoviePanel
}