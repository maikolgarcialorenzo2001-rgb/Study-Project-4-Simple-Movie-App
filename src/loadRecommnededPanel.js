import { apiKey } from "./loadPages.js"

const recommendedList = document.getElementById("recommendedList")
const prevBtn = document.getElementById("prevRecommended")
const nextBtn = document.getElementById("nextRecommended")
const pageLabel = document.getElementById("recommendedPageLabel")

let currentRecommendedPage = 1

function getRecommendedRoute() {
  const cat = window.selectedCategory

  switch (cat) {
    case "movie":
      return "discover/movie?sort_by=vote_average.desc&vote_count.gte=200"

    case "tv":
      return "discover/tv?sort_by=vote_average.desc&vote_count.gte=200"

    case "anime":
      return "discover/tv?with_genres=16&with_origin_country=JP&sort_by=vote_average.desc&vote_count.gte=200"

    case "animated":
      return "discover/movie?with_genres=16&sort_by=vote_average.desc&vote_count.gte=200"

    case "reality":
      return "discover/tv?with_genres=10764&sort_by=vote_average.desc&vote_count.gte=200"

    default:
      // Si no hay categoría seleccionada → películas por defecto
      return "discover/movie?sort_by=vote_average.desc&vote_count.gte=200"
  }
}

function buildURL(base, page) {
  const separator = base.includes("?") ? "&" : "?"
  return `https://api.themoviedb.org/3/${base}${separator}api_key=${apiKey}&language=es-ES&page=${page}`
}

async function getRecommendedHighRated(page) {
  const route = getRecommendedRoute()
  const url = buildURL(route, page)

  const res = await fetch(url)
  const data = await res.json()

  return {
    movies: data.results || [],
    totalPages: data.total_pages || 1
  }
}

function createRecommendedItem(movie) {
  const {
    title,
    name,
    poster_path,
    vote_average,
    original_language,
    release_date,
    first_air_date,
    media_type
  } = movie

  const type =
    media_type ||
    (first_air_date ? "tv" : "movie")

  const item = document.createElement("a")
  item.className =
    "flex gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition cursor-pointer group"
  
  item.id = `${movie.id}`
  item.dataset.type = type

  const img = document.createElement("img")
  img.className =
    "w-14 h-20 rounded-md object-cover flex-shrink-0 group-hover:scale-[1.02] transition"
  img.src = poster_path
    ? `https://image.tmdb.org/t/p/w185${poster_path}`
    : "https://via.placeholder.com/80x120?text=No+Image"
  img.alt = title ?? name

  const info = document.createElement("div")
  info.className = "flex flex-col justify-between min-w-0"

  const titleEl = document.createElement("h3")
  titleEl.className =
    "text-[13px] font-medium text-white/90 leading-tight line-clamp-2"
  titleEl.textContent = title ?? name

  const metaRow = document.createElement("div")
  metaRow.className = "flex items-center gap-2 mt-1"

  const ratingBadge = document.createElement("span")
  ratingBadge.className =
    "text-[11px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
  ratingBadge.textContent = `★ ${vote_average?.toFixed(1) || "N/A"}`

  const langBadge = document.createElement("span")
  langBadge.className =
    "text-[10px] uppercase px-1.5 py-0.5 rounded-full bg-white/5 text-white/50 border border-white/10"
  langBadge.textContent = original_language || "N/A"

  metaRow.appendChild(ratingBadge)
  metaRow.appendChild(langBadge)

  const dateEl = document.createElement("p")
  dateEl.className = "text-[11px] text-white/40 mt-1"
  dateEl.textContent =
    release_date
      ? `Estreno: ${release_date}`
      : first_air_date
      ? `Estreno: ${first_air_date}`
      : "Fecha desconocida"

  info.appendChild(titleEl)
  info.appendChild(metaRow)
  info.appendChild(dateEl)

  item.appendChild(img)
  item.appendChild(info)

  return item
}


async function renderRecommendedPanel(page = 1) {
  recommendedList.innerHTML = `
    <div class="text-xs text-white/40 px-2 py-2">Cargando recomendaciones...</div>
  `

  try {
    const { movies, totalPages } = await getRecommendedHighRated(page)

    recommendedList.innerHTML = ""

    if (!movies.length) {
      recommendedList.innerHTML = `
        <div class="text-xs text-white/40 px-2 py-2">No se encontraron recomendaciones.</div>
      `
      return
    }

    movies.forEach(movie => {
      const item = createRecommendedItem(movie)
      recommendedList.appendChild(item)
    })

    currentRecommendedPage = page
    pageLabel.textContent = `Página ${currentRecommendedPage}`

    prevBtn.disabled = currentRecommendedPage <= 1
    nextBtn.disabled = currentRecommendedPage >= totalPages
  } catch (error) {
    console.error(error)
    recommendedList.innerHTML = `
      <div class="text-xs text-red-400 px-2 py-2">Error al cargar recomendaciones.</div>
    `
  }
}

prevBtn.addEventListener("click", () => {
  if (currentRecommendedPage > 1) {
    renderRecommendedPanel(currentRecommendedPage - 1)
  }
})

nextBtn.addEventListener("click", () => {
  renderRecommendedPanel(currentRecommendedPage + 1)
})

// Inicializar
renderRecommendedPanel(1)

export {renderRecommendedPanel}