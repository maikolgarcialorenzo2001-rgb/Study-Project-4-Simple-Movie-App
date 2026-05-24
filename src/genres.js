import { apiKey } from "./loadPages.js"

export async function getGenres(type = "movie") {
  const url = `https://api.themoviedb.org/3/genre/${type}/list?api_key=${apiKey}&language=es-ES`
  const res = await fetch(url)
  const data = await res.json()
  return data.genres || []
}

window.genreDropdown = function () {
    return {
        open: false,
        selected: "Género",
        genres: [],

        async init() {
            const type = getGenreTypeForCategory(window.selectedCategory)
            this.genres = await getGenres(type)
        },

        async refresh() {
            const type = getGenreTypeForCategory(window.selectedCategory)
            this.genres = await getGenres(type)
            this.selected = "Género"
        },

        selectGenre(genre) {
            this.selected = genre.name
            window.selectedGenre = genre.id
            this.open = false
            applyFilters()
        }
    }
}

function getGenreTypeForCategory(category) {
  if (category === "movie" || category === "animated") {
    return "movie"
  }
  return "tv" // tv, anime, reality
}
