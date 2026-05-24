import { apiKey } from "./loadPages.js"

export async function getCountries() {
  const url = `https://api.themoviedb.org/3/configuration/countries?api_key=${apiKey}`
  const res = await fetch(url)
  const data = await res.json()
  return data || []
}

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

window.countryDropdown = function () {
  return {
    open: false,
    selected: "País",
    selectedFlag: null,

    countries: [
      { iso_3166_1: "US", english_name: "Estados Unidos", flag: "https://flagcdn.com/us.svg" },
      { iso_3166_1: "IN", english_name: "India",          flag: "https://flagcdn.com/in.svg" },
      { iso_3166_1: "JP", english_name: "Japón",          flag: "https://flagcdn.com/jp.svg" },
      { iso_3166_1: "KR", english_name: "Corea del Sur",  flag: "https://flagcdn.com/kr.svg" },
      { iso_3166_1: "GB", english_name: "Reino Unido",    flag: "https://flagcdn.com/gb.svg" },
      { iso_3166_1: "FR", english_name: "Francia",        flag: "https://flagcdn.com/fr.svg" },
      { iso_3166_1: "DE", english_name: "Alemania",       flag: "https://flagcdn.com/de.svg" },
      { iso_3166_1: "CN", english_name: "China",          flag: "https://flagcdn.com/cn.svg" },
      { iso_3166_1: "CA", english_name: "Canadá",         flag: "https://flagcdn.com/ca.svg" },
      { iso_3166_1: "ES", english_name: "España",         flag: "https://flagcdn.com/es.svg" }
    ],

    refresh() {
      this.selected = "País"
      this.selectedFlag = null
      window.selectedCountry = null
    },

    selectCountry(country) {
      this.selected = country.english_name
      this.selectedFlag = country.flag
      window.selectedCountry = country.iso_3166_1
      this.open = false
      applyFilters()
    }
  }
}
