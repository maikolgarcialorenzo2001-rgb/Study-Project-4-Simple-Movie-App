
const yearInput = document.getElementById("yearInput")

if (yearInput) {
    yearInput.addEventListener("input", (e) => {
        const value = e.target.value
        window.selectedYear = value ? Number(value) : null
        if (typeof window.reloadPage === "function") {
            window.reloadPage()
        }
    })
}

document.addEventListener("DOMContentLoaded", () => {
    const yearInput = document.getElementById("yearInput")
    if (!yearInput) return

    yearInput.addEventListener("input", (e) => {
        const value = e.target.value
        if (!value) {
            window.selectedYear = null
            window.applyFilters?.()
            return
        }
        window.selectedYear = value.length === 4 ? Number(value) : null
        if (value.length === 4) {
            window.applyFilters?.()
        }
    })
})