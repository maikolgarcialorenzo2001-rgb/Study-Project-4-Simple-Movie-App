
const moviesPanel = document.getElementById("moviesPanel")
const moviesWrapper = document.getElementById("moviesWrapper")

import { showMovieDetails } from "./openMovies.js"

const apiKey = "5e5f0507bfb1b4bb2e7c071366814e5c"

window.currentPage = 1
window.currentCategory = "movie/now_playing"
window.selectedGenre = null
window.selectedCountry = null
window.selectedYear = null
window.globalSearch = ""

const genresMap = {
  28: "Acción",
  12: "Aventura",
  16: "Animación",
  35: "Comedia",
  80: "Crimen",
  99: "Documental",
  18: "Drama",
  10751: "Familia",
  14: "Fantasía",
  36: "Historia",
  27: "Terror",
  10402: "Música",
  9648: "Misterio",
  10749: "Romance",
  878: "Ciencia ficción",
  10770: "TV Movie",
  53: "Suspenso",
  10752: "Guerra",
  37: "Western",
}

async function getMovies(page, category) {
  const separator = category.includes("?") ? "&" : "?"
  let url = `https://api.themoviedb.org/3/${category}${separator}api_key=${apiKey}&language=es-ES&page=${page}`

  if (window.selectedGenre) {
    url += `&with_genres=${window.selectedGenre}`
  }
  if (window.selectedCountry) {
    url += `&with_origin_country=${window.selectedCountry}`
  }
  if (window.selectedYear) {
    url += `&primary_release_year=${window.selectedYear}`
  }

  const result = await fetch(url)
  const data = await result.json()
  return data.results || []
}

export async function pageItems(page, category) {
  window.currentCategory = category
  const items = await getMovies(page, category)
  moviesWrapper.innerHTML = ""

  let filtered = items
  if (window.globalSearch && window.globalSearch.trim() !== "") {
    filtered = items.filter(el =>
      (el.title || el.name || "")
        .toLowerCase()
        .includes(window.globalSearch)
    )
  }

  filtered.forEach((element) => {
    const type =
      element.media_type === "tv" ? "tv"
      : element.media_type === "movie" ? "movie"
      : element.name && !element.title ? "tv"
      : "movie"

    const plantilla = `
<a href="#"
   id="${element.id}"
   data-type="${type}"
   class="w-52 mb-8 flex flex-col group hover:scale-[1.03] transition-all duration-300 ease-out items-center">

  <div class="relative w-52 h-72 overflow-hidden rounded-xl shadow-lg transition-all duration-300 group-hover:shadow-red-500/40">

      <div class="absolute top-2 right-2 bg-black/70 text-yellow-400 text-xs font-semibold px-2 py-1 rounded-md backdrop-blur-sm">
          ⭐ ${element.vote_average?.toFixed(1) || "0.0"}
      </div>

      <div class="absolute top-2 left-2 bg-black/70 text-white text-xs font-semibold px-2 py-1 rounded-md backdrop-blur-sm">
          ${element.original_language?.toUpperCase() || "N/A"}
      </div>

      <img src="https://image.tmdb.org/t/p/w500${element.poster_path}"
           alt="${element.title || element.name}"
           class="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105">
  </div>

  <p class="mt-1 text-white font-semibold text-sm">
      ${element.title || element.name}
  </p>

  <p class="text-gray-400 text-xs">
      ${genresMap[element.genre_ids?.[0]] ?? "Sin género"}
  </p>

</a>
`
    moviesWrapper.insertAdjacentHTML("beforeend", plantilla)
  })

  const oldControls = document.getElementById("paginationControls")
  if (oldControls) oldControls.remove()
  insertPaginationControls()
}

function insertPaginationControls() {
  const html = `
  <div id="paginationControls" class="col-span-5 flex justify-center items-center gap-6 mt-6 mb-10">

    <button id="prevBtn"
      class="px-3 py-1.5 bg-[#E50914] text-white cursor-pointer text-sm rounded-md hover:bg-gray-700 transition">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="currentColor" d="m4 10l9 9l1.4-1.5L7 10l7.4-7.5L13 1z"/></svg>
    </button>

    <span class="text-white text-sm font-semibold select-none">
      Página ${currentPage}
    </span>

    <button id="nextBtn"
      class="px-3 py-1.5 bg-[#E50914] text-white cursor-pointer text-sm rounded-md hover:bg-gray-700 transition">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="currentColor" d="M7 1L5.6 2.5L13 10l-7.4 7.5L7 19l9-9z"/></svg>
    </button>

  </div>
`
  moviesWrapper.insertAdjacentHTML("beforeend", html)

  document.getElementById("prevBtn").onclick = () => {
    if (currentPage > 1) {
      currentPage--
      reloadPage()
    }
  }
  document.getElementById("nextBtn").onclick = () => {
    currentPage++
    reloadPage()
  }
}

async function reloadPage() {
  moviesWrapper.classList.add("opacity-50")
  await new Promise((r) => setTimeout(r, 200))
  await pageItems(currentPage, window.currentCategory)
  moviesWrapper.classList.remove("opacity-50")
  moviesPanel?.scrollTo({ top: 0, behavior: "smooth" })
}

pageItems(1, "movie/now_playing")

window.pageItems = pageItems
function safeExpose() {
    if (typeof reloadPage === "function") {
        window.reloadPage = reloadPage
    } else {
        setTimeout(safeExpose, 50)
    }
}
safeExpose()

export { getMovies as recentMovies, apiKey }
