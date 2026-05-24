'use strict';

const moviesWrapper$2 = document.getElementById("moviesWrapper");
const recommendedPanel = document.getElementById("recommendedList");

function detectType(card, data = null) {
  let type = card.dataset.type;

  if (type === "movie" || type === "tv") return type

  type = card.getAttribute("data-type");
  if (type === "movie" || type === "tv") return type

  if (data?.title && !data?.name) return "movie"
  if (data?.name) return "tv"

  return "movie"
}

const handleCardClick = async (e) => {
  const card = e.target.closest("a");
  if (!card) return

  e.preventDefault();

  const id = card.getAttribute("id");

  if (!id || id === "undefined") {
    console.error("❌ ID inválido en card:", card);
    return
  }

  let type = card.dataset.type || card.getAttribute("data-type") || "movie";

  if (type !== "movie" && type !== "tv") {
    type = "movie";
  }

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/${type}/${id}?api_key=${apiKey$1}&language=es-ES`
    );

    const data = await res.json();

    type = detectType(card, data);

    showMovieDetails(data, type);

  } catch (err) {
    console.error("❌ Error cargando contenido:", err);
  }
};

if (moviesWrapper$2) {
  moviesWrapper$2.addEventListener("click", handleCardClick);
}

if (recommendedPanel) {
  recommendedPanel.addEventListener("click", handleCardClick);
}

const offField = document.getElementById("offField");
const moviePanelContent = document.getElementById("moviePanelContent");
const closePanel = document.getElementById("closePanel");

function openMoviePanel() {
  offField.style.opacity = "1";
  offField.style.pointerEvents = "auto";

  offField.classList.remove("opacity-0");
  offField.classList.add("opacity-100");

  moviePanelContent.classList.remove("scale-95");
  moviePanelContent.classList.add("scale-100");

  moviePanelContent.style.opacity = "1";

  enhanceOverviewScroll();
}

function closeMoviePanel() {
  moviePanelContent.classList.add("scale-95");
  moviePanelContent.classList.remove("scale-100");

  moviePanelContent.style.opacity = "0";

  document.getElementById("panelTrailer").src = "";

  setTimeout(() => {
    offField.style.opacity = "0";
    offField.style.pointerEvents = "none";
  }, 200);
}

// eventos cerrar
if (closePanel) closePanel.addEventListener("click", closeMoviePanel);

if (offField) {
  offField.addEventListener("click", (e) => {
    if (e.target === offField) closeMoviePanel();
  });
}

async function showMovieDetails(movie, type) {
  const id = movie.id;

  if (!id) {
    console.error("❌ movie.id inválido:", movie);
    return
  }

  document.getElementById("panelPoster").src =
    movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "./img/1.png";

  document.getElementById("panelBackdrop").style.backgroundImage =
    movie.backdrop_path
      ? `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
      : "none";

  document.getElementById("panelTitle").textContent =
    movie.title || movie.name || "Sin título";

  document.getElementById("panelGenre").textContent =
    movie.genres?.map(g => g.name).join(", ") || "Sin género";

  document.getElementById("panelAdult").textContent =
    movie.adult ? "🔞 Adulto" : "Apto";

  document.getElementById("panelRating").textContent =
    `⭐ ${movie.vote_average?.toFixed(1) || "0.0"}`;

  document.getElementById("panelOverview").textContent =
    movie.overview || "Sin descripción disponible.";

  const trailerKey = await fetchTrailer(id, type);

  document.getElementById("panelTrailer").src =
    trailerKey
      ? `https://www.youtube.com/embed/${trailerKey}?autoplay=0&controls=1`
      : "";

  openMoviePanel();
}

async function fetchTrailer(id, type) {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/${type}/${id}/videos?api_key=${apiKey$1}&language=es-ES`
    );

    const data = await res.json();

    if (!data.results?.length) return null

    const trailer =
      data.results.find(v => v.type === "Trailer" && v.site === "YouTube") ||
      data.results[0];

    return trailer?.key || null

  } catch (err) {
    console.error("❌ Error trailer:", err);
    return null
  }
}

function enhanceOverviewScroll() {
  const overview = document.getElementById("panelOverview");

  if (!overview) return

  overview.style.overflowY = "auto";
  overview.style.maxHeight = "240px";
  overview.style.scrollBehavior = "smooth";

  overview.scrollTop = 0;
}

const moviesPanel = document.getElementById("moviesPanel");
const moviesWrapper$1 = document.getElementById("moviesWrapper");

const apiKey$1 = "5e5f0507bfb1b4bb2e7c071366814e5c";

window.currentPage = 1;
window.currentCategory = "movie/now_playing";
window.selectedGenre = null;
window.selectedCountry = null;
window.selectedYear = null;
window.globalSearch = "";

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
};

async function getMovies(page, category) {
  const separator = category.includes("?") ? "&" : "?";
  let url = `https://api.themoviedb.org/3/${category}${separator}api_key=${apiKey$1}&language=es-ES&page=${page}`;

  if (window.selectedGenre) {
    url += `&with_genres=${window.selectedGenre}`;
  }
  if (window.selectedCountry) {
    url += `&with_origin_country=${window.selectedCountry}`;
  }
  if (window.selectedYear) {
    url += `&primary_release_year=${window.selectedYear}`;
  }

  const result = await fetch(url);
  const data = await result.json();
  return data.results || []
}

async function pageItems(page, category) {
  window.currentCategory = category;
  const items = await getMovies(page, category);
  moviesWrapper$1.innerHTML = "";

  let filtered = items;
  if (window.globalSearch && window.globalSearch.trim() !== "") {
    filtered = items.filter(el =>
      (el.title || el.name || "")
        .toLowerCase()
        .includes(window.globalSearch)
    );
  }

  filtered.forEach((element) => {
    const type =
      element.media_type === "tv" ? "tv"
      : element.media_type === "movie" ? "movie"
      : element.name && !element.title ? "tv"
      : "movie";

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
`;
    moviesWrapper$1.insertAdjacentHTML("beforeend", plantilla);
  });

  const oldControls = document.getElementById("paginationControls");
  if (oldControls) oldControls.remove();
  insertPaginationControls();
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
`;
  moviesWrapper$1.insertAdjacentHTML("beforeend", html);

  document.getElementById("prevBtn").onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      reloadPage();
    }
  };
  document.getElementById("nextBtn").onclick = () => {
    currentPage++;
    reloadPage();
  };
}

async function reloadPage() {
  moviesWrapper$1.classList.add("opacity-50");
  await new Promise((r) => setTimeout(r, 200));
  await pageItems(currentPage, window.currentCategory);
  moviesWrapper$1.classList.remove("opacity-50");
  moviesPanel?.scrollTo({ top: 0, behavior: "smooth" });
}

pageItems(1, "movie/now_playing");

window.pageItems = pageItems;
function safeExpose() {
    if (typeof reloadPage === "function") {
        window.reloadPage = reloadPage;
    } else {
        setTimeout(safeExpose, 50);
    }
}
safeExpose();

const recommendedList = document.getElementById("recommendedList");
const prevBtn = document.getElementById("prevRecommended");
const nextBtn = document.getElementById("nextRecommended");
const pageLabel = document.getElementById("recommendedPageLabel");

let currentRecommendedPage = 1;

function getRecommendedRoute() {
  const cat = window.selectedCategory;

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
  const separator = base.includes("?") ? "&" : "?";
  return `https://api.themoviedb.org/3/${base}${separator}api_key=${apiKey$1}&language=es-ES&page=${page}`
}

async function getRecommendedHighRated(page) {
  const route = getRecommendedRoute();
  const url = buildURL(route, page);

  const res = await fetch(url);
  const data = await res.json();

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
  } = movie;

  const type =
    media_type ||
    (first_air_date ? "tv" : "movie");

  const item = document.createElement("a");
  item.className =
    "flex gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition cursor-pointer group";
  
  item.id = `${movie.id}`;
  item.dataset.type = type;

  const img = document.createElement("img");
  img.className =
    "w-14 h-20 rounded-md object-cover flex-shrink-0 group-hover:scale-[1.02] transition";
  img.src = poster_path
    ? `https://image.tmdb.org/t/p/w185${poster_path}`
    : "https://via.placeholder.com/80x120?text=No+Image";
  img.alt = title ?? name;

  const info = document.createElement("div");
  info.className = "flex flex-col justify-between min-w-0";

  const titleEl = document.createElement("h3");
  titleEl.className =
    "text-[13px] font-medium text-white/90 leading-tight line-clamp-2";
  titleEl.textContent = title ?? name;

  const metaRow = document.createElement("div");
  metaRow.className = "flex items-center gap-2 mt-1";

  const ratingBadge = document.createElement("span");
  ratingBadge.className =
    "text-[11px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30";
  ratingBadge.textContent = `★ ${vote_average?.toFixed(1) || "N/A"}`;

  const langBadge = document.createElement("span");
  langBadge.className =
    "text-[10px] uppercase px-1.5 py-0.5 rounded-full bg-white/5 text-white/50 border border-white/10";
  langBadge.textContent = original_language || "N/A";

  metaRow.appendChild(ratingBadge);
  metaRow.appendChild(langBadge);

  const dateEl = document.createElement("p");
  dateEl.className = "text-[11px] text-white/40 mt-1";
  dateEl.textContent =
    release_date
      ? `Estreno: ${release_date}`
      : first_air_date
      ? `Estreno: ${first_air_date}`
      : "Fecha desconocida";

  info.appendChild(titleEl);
  info.appendChild(metaRow);
  info.appendChild(dateEl);

  item.appendChild(img);
  item.appendChild(info);

  return item
}


async function renderRecommendedPanel(page = 1) {
  recommendedList.innerHTML = `
    <div class="text-xs text-white/40 px-2 py-2">Cargando recomendaciones...</div>
  `;

  try {
    const { movies, totalPages } = await getRecommendedHighRated(page);

    recommendedList.innerHTML = "";

    if (!movies.length) {
      recommendedList.innerHTML = `
        <div class="text-xs text-white/40 px-2 py-2">No se encontraron recomendaciones.</div>
      `;
      return
    }

    movies.forEach(movie => {
      const item = createRecommendedItem(movie);
      recommendedList.appendChild(item);
    });

    currentRecommendedPage = page;
    pageLabel.textContent = `Página ${currentRecommendedPage}`;

    prevBtn.disabled = currentRecommendedPage <= 1;
    nextBtn.disabled = currentRecommendedPage >= totalPages;
  } catch (error) {
    console.error(error);
    recommendedList.innerHTML = `
      <div class="text-xs text-red-400 px-2 py-2">Error al cargar recomendaciones.</div>
    `;
  }
}

prevBtn.addEventListener("click", () => {
  if (currentRecommendedPage > 1) {
    renderRecommendedPanel(currentRecommendedPage - 1);
  }
});

nextBtn.addEventListener("click", () => {
  renderRecommendedPanel(currentRecommendedPage + 1);
});

// Inicializar
renderRecommendedPanel(1);

const yearInput = document.getElementById("yearInput");

if (yearInput) {
    yearInput.addEventListener("input", (e) => {
        const value = e.target.value;
        window.selectedYear = value ? Number(value) : null;
        if (typeof window.reloadPage === "function") {
            window.reloadPage();
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const yearInput = document.getElementById("yearInput");
    if (!yearInput) return

    yearInput.addEventListener("input", (e) => {
        const value = e.target.value;
        if (!value) {
            window.selectedYear = null;
            window.applyFilters?.();
            return
        }
        window.selectedYear = value.length === 4 ? Number(value) : null;
        if (value.length === 4) {
            window.applyFilters?.();
        }
    });
});

async function getGenres$2(type = "movie") {
  const url = `https://api.themoviedb.org/3/genre/${type}/list?api_key=${apiKey$1}&language=es-ES`;
  const res = await fetch(url);
  const data = await res.json();
  return data.genres || []
}

window.genreDropdown = function () {
  return {
    open: false,
    selected: "Género",
    genres: [],

    async init() {
      const type = getGenreTypeForCategory$2(window.selectedCategory);
      this.genres = await getGenres$2(type);
    },

    async refresh() {
      const type = getGenreTypeForCategory$2(window.selectedCategory);
      this.genres = await getGenres$2(type);
      this.selected = "Género";
    },

    selectGenre(genre) {
      this.selected = genre.name;
      window.selectedGenre = genre.id;
      this.open = false;
      applyFilters();
    }
  }
};

function getGenreTypeForCategory$2(category) {
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
      this.selected = "País";
      this.selectedFlag = null;
      window.selectedCountry = null;
    },

    selectCountry(country) {
      this.selected = country.english_name;
      this.selectedFlag = country.flag;
      window.selectedCountry = country.iso_3166_1;
      this.open = false;
      applyFilters();
    }
  }
};

window.selectedCategory = "";
window.currentPage = 1;
window.pageItems = pageItems;
window.renderRecommendedPanel = renderRecommendedPanel;

window.setCategory = function (value) {
  window.selectedCategory = value;
  window.selectedGenre = null;
  window.selectedCountry = null;
};

window.applyFilters = function () {
  const category = window.selectedCategory;
  generateCategoryPanel(category);
};

function generateCategoryPanel(category){
    window.selectedCategory = category;
    let base = "";

    if (category === "tv") {
        base = "discover/tv";
    } else if (category === "movie") {
        base = "discover/movie";
    } else if (category === "anime") {
        base = "discover/tv?with_genres=16&with_origin_country=JP";
    } else if (category === "animated") {
        base = "discover/movie?with_genres=16";
    } else if (category === "reality") {
        base = "discover/tv?with_genres=10764";
    }

    if (!base) {
        base = "discover/movie";
    }

    if (window.selectedCountry) {
        const separator = base.includes("?") ? "&" : "?";
        base += `${separator}with_origin_country=${window.selectedCountry}`;
    }

    window.currentCategory = base;
    window.currentPage = 1;
    moviesWrapper.innerHTML = "";

    setTimeout(() => {
        document.querySelectorAll('.genre-dropdown').forEach(el => {
            if (el.__x && el.__x.$data) {
                el.__x.$data.refresh();
            }
        });
    }, 0);

    setTimeout(() => {
        document.querySelectorAll('.country-dropdown').forEach(el => {
            if (el.__x && el.__x.$data) {
                el.__x.$data.refresh();
            }
        });
    }, 0);

    window.pageItems(1, window.currentCategory);
    window.renderRecommendedPanel(1);
}

async function getGenres$1(type = "movie") {
  const url = `https://api.themoviedb.org/3/genre/${type}/list?api_key=${apiKey$1}&language=es-ES`;
  const res = await fetch(url);
  const data = await res.json();
  return data.genres || []
}

window.genreDropdown = function () {
    return {
        open: false,
        selected: "Género",
        genres: [],

        async init() {
            const type = getGenreTypeForCategory$1(window.selectedCategory);
            this.genres = await getGenres$1(type);
        },

        async refresh() {
            const type = getGenreTypeForCategory$1(window.selectedCategory);
            this.genres = await getGenres$1(type);
            this.selected = "Género";
        },

        selectGenre(genre) {
            this.selected = genre.name;
            window.selectedGenre = genre.id;
            this.open = false;
            applyFilters();
        }
    }
};

function getGenreTypeForCategory$1(category) {
  if (category === "movie" || category === "animated") {
    return "movie"
  }
  return "tv" // tv, anime, reality
}

async function getGenres(type = "movie") {
  const url = `https://api.themoviedb.org/3/genre/${type}/list?api_key=${apiKey$1}&language=es-ES`;
  const res = await fetch(url);
  const data = await res.json();
  return data.genres || []
}

window.genreDropdown = function () {
  return {
    open: false,
    selected: "Género",
    genres: [],

    async init() {
      const type = getGenreTypeForCategory(window.selectedCategory);
      this.genres = await getGenres(type);
    },

    async refresh() {
      const type = getGenreTypeForCategory(window.selectedCategory);
      this.genres = await getGenres(type);
      this.selected = "Género";
    },

    selectGenre(genre) {
      this.selected = genre.name;
      window.selectedGenre = genre.id;
      this.open = false;
      applyFilters();
    }
  }
};

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
      this.selected = "País";
      this.selectedFlag = null;
      window.selectedCountry = null;
    },

    selectCountry(country) {
      this.selected = country.english_name;
      this.selectedFlag = country.flag;
      window.selectedCountry = country.iso_3166_1;
      this.open = false;
      applyFilters();
    }
  }
};

const searchInput = document.getElementById("searchInput");
const suggestionsBox = document.getElementById("searchSuggestions");

const apiKey = "5e5f0507bfb1b4bb2e7c071366814e5c";

let timeout;

searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim();

    clearTimeout(timeout);

    if (!query) {
        suggestionsBox.classList.add("hidden");
        suggestionsBox.innerHTML = "";
        return
    }

    timeout = setTimeout(() => {
        fetchSuggestions(query);
    }, 300);
});

async function fetchSuggestions(query) {
    try {
        const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=es-ES&query=${query}`;

        const res = await fetch(url);

        if (!res.ok) {
            console.error("Error API:", res.status);
            return
        }

        const data = await res.json();
        const results = data.results || [];

        renderSuggestions(results.slice(0, 6));

    } catch (err) {
        console.error("Fetch error:", err);
    }
}

function renderSuggestions(items) {
    suggestionsBox.innerHTML = "";

    if (!items.length) {
        suggestionsBox.classList.add("hidden");
        return
    }

    items.forEach(item => {
        const title = item.title || item.name;
        const poster = item.poster_path
            ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
            : "";

        const type = item.media_type;

        const div = document.createElement("div");
        div.className = "flex items-center gap-3 p-2 hover:bg-white/10 cursor-pointer transition";

        div.innerHTML = `
            <img src="${poster}" class="w-10 h-14 object-cover rounded" />
            <span class="text-white text-sm">${title}</span>
        `;

        div.onclick = () => {
            suggestionsBox.classList.add("hidden");
            window.showMovieDetails?.(item, type);
        };

        suggestionsBox.appendChild(div);
    });

    suggestionsBox.classList.remove("hidden");
}

document.addEventListener("click", (e) => {
    if (!e.target.closest("#searchInput") && !e.target.closest("#searchSuggestions")) {
        suggestionsBox.classList.add("hidden");
    }
});
