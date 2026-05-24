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
  return "tv"
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

function getCategoryParams(category) {
  switch (category) {
    case "movie":
      return { type: "movie" }
    case "tv":
      return { type: "tv" }
    case "anime":
      return { type: "tv", with_genres: "16", with_origin_country: "JP" }
    case "animated":
      return { type: "movie", with_genres: "16" }
    case "reality":
      return { type: "tv", with_genres: "10764" }
    default:
      return {}
  }
}

window.selectedCategory = ""
window.currentPage = 1

import { pageItems } from "./loadPages.js"
window.pageItems = pageItems

import { renderRecommendedPanel } from "./loadRecommnededPanel.js"
window.renderRecommendedPanel = renderRecommendedPanel

window.setCategory = function (value) {
  window.selectedCategory = value
  window.selectedGenre = null
  window.selectedCountry = null
}

window.applyFilters = function () {
  const category = window.selectedCategory
  generateCategoryPanel(category)
}

function generateCategoryPanel(category){
    window.selectedCategory = category
    let base = ""

    if (category === "tv") {
        base = "discover/tv"
    } else if (category === "movie") {
        base = "discover/movie"
    } else if (category === "anime") {
        base = "discover/tv?with_genres=16&with_origin_country=JP"
    } else if (category === "animated") {
        base = "discover/movie?with_genres=16"
    } else if (category === "reality") {
        base = "discover/tv?with_genres=10764"
    }

    if (!base) {
        base = "discover/movie"
    }

    if (window.selectedCountry) {
        const separator = base.includes("?") ? "&" : "?"
        base += `${separator}with_origin_country=${window.selectedCountry}`
    }

    window.currentCategory = base
    window.currentPage = 1
    moviesWrapper.innerHTML = ""

    setTimeout(() => {
        document.querySelectorAll('.genre-dropdown').forEach(el => {
            if (el.__x && el.__x.$data) {
                el.__x.$data.refresh()
            }
        })
    }, 0)

    setTimeout(() => {
        document.querySelectorAll('.country-dropdown').forEach(el => {
            if (el.__x && el.__x.$data) {
                el.__x.$data.refresh()
            }
        })
    }, 0)

    window.pageItems(1, window.currentCategory)
    window.renderRecommendedPanel(1)
}
