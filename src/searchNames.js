const searchInput = document.getElementById("searchInput")
const suggestionsBox = document.getElementById("searchSuggestions")

const apiKey = "5e5f0507bfb1b4bb2e7c071366814e5c"

let timeout

searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim()

    clearTimeout(timeout)

    if (!query) {
        suggestionsBox.classList.add("hidden")
        suggestionsBox.innerHTML = ""
        return
    }

    timeout = setTimeout(() => {
        fetchSuggestions(query)
    }, 300)
})

async function fetchSuggestions(query) {
    try {
        const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=es-ES&query=${query}`

        const res = await fetch(url)

        if (!res.ok) {
            console.error("Error API:", res.status)
            return
        }

        const data = await res.json()
        const results = data.results || []

        renderSuggestions(results.slice(0, 6))

    } catch (err) {
        console.error("Fetch error:", err)
    }
}

function renderSuggestions(items) {
    suggestionsBox.innerHTML = ""

    if (!items.length) {
        suggestionsBox.classList.add("hidden")
        return
    }

    items.forEach(item => {
        const title = item.title || item.name
        const poster = item.poster_path
            ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
            : ""

        const type = item.media_type

        const div = document.createElement("div")
        div.className = "flex items-center gap-3 p-2 hover:bg-white/10 cursor-pointer transition"

        div.innerHTML = `
            <img src="${poster}" class="w-10 h-14 object-cover rounded" />
            <span class="text-white text-sm">${title}</span>
        `

        div.onclick = () => {
            suggestionsBox.classList.add("hidden")
            window.showMovieDetails?.(item, type)
        }

        suggestionsBox.appendChild(div)
    })

    suggestionsBox.classList.remove("hidden")
}

document.addEventListener("click", (e) => {
    if (!e.target.closest("#searchInput") && !e.target.closest("#searchSuggestions")) {
        suggestionsBox.classList.add("hidden")
    }
})