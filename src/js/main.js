// Initialize mobile menu and submenu functionality
function initializeMobileMenu() {
	// Select main DOM elements for mobile menu
	const menu = document.querySelector("#mobile-menu")
	const overlay = document.querySelector("#mobile-menu-overlay")
	const burger = document.querySelector("#burger")
	const body = document.querySelector("body")

	// Define mobile breakpoint for responsive behavior
	const MOBILE_BREAKPOINT = 992

	// Exit if required elements are missing
	if (!menu || !burger || !body || !overlay) return

	// ============================
	// MENU TOGGLE FUNCTIONALITY
	// ============================

	const updateMenuState = (isOpen) => {
		burger.setAttribute("aria-expanded", isOpen)
		burger.classList.toggle("active", isOpen)

		menu.classList.toggle("is-open", isOpen)
		menu.classList.toggle("-translate-x-full", !isOpen)
		menu.classList.toggle("translate-x-0", isOpen)

		overlay.classList.toggle("opacity-0", !isOpen)
		overlay.classList.toggle("opacity-100", isOpen)
		overlay.classList.toggle("pointer-events-none", !isOpen)
		overlay.classList.toggle("pointer-events-auto", isOpen)

		body.classList.toggle("overflow-hidden", isOpen)
	}

	const handleBurgerClick = () => {
		const isOpening = !menu.classList.contains("is-open")
		updateMenuState(isOpening)
	}

	const handleOverlayClick = (event) => {
		if (event.target === overlay) updateMenuState(false)
	}

	const handleEscapeKey = (event) => {
		if (event.key === "Escape" && menu.classList.contains("is-open")) {
			updateMenuState(false)
		}
	}

	const handleWindowResize = () => {
		if (window.innerWidth >= MOBILE_BREAKPOINT) {
			updateMenuState(false)
		}
	}

	// Add event listeners for main menu
	burger.addEventListener("click", handleBurgerClick)
	overlay.addEventListener("click", handleOverlayClick)
	document.addEventListener("keydown", handleEscapeKey)
	window.addEventListener("resize", handleWindowResize)

	burger.setAttribute("aria-expanded", "false")
	handleWindowResize()

	// ============================
	// SUBMENU FUNCTIONALITY
	// ============================

	// Check if there are submenu triggers at all
	const submenuTriggersExist = menu.querySelector(".submenu-trigger")

	if (submenuTriggersExist) {
		menu.addEventListener("click", (event) => {
			const trigger = event.target.closest(".submenu-trigger")
			if (!trigger) return

			const submenuItem = trigger.closest(".with-submenu")
			if (submenuItem) {
				submenuItem.classList.toggle("active")
			}
		})
	}

	// ============================
	// LINK CLICK CLOSE MENU
	// ============================

	menu.addEventListener("click", (event) => {
		const link = event.target.closest("a")
		if (!link) return

		const href = link.getAttribute("href")
		if (href && href !== "#") {
			updateMenuState(false)
		}
	})
}
function initStickyHeader() {
	const header = document.querySelector("header[data-sticky]")
	if (!header) return

	const mode = header.dataset.sticky

	if (mode === "always") {
		header.classList.add("fixed-header")
		document.body.style.paddingTop = header.offsetHeight + "px"
		return
	}

	if (mode === "smart") {
		header.classList.add("fixed-header")
		document.body.style.paddingTop = header.offsetHeight + "px"

		let lastY = window.scrollY

		window.addEventListener(
			"scroll",
			function () {
				const currentY = window.scrollY
				if (currentY > lastY && currentY > header.offsetHeight) {
					header.classList.add("-translate-y-full")
				} else {
					header.classList.remove("-translate-y-full")
				}
				lastY = currentY
			},
			{ passive: true },
		)
	}
}

// Toggle buttons state
function initPlayButtons(root = document) {
	root.addEventListener("click", (e) => {
		const btn = e.target.closest(".play-btn")
		if (!btn) return

		btn.classList.toggle("paused")
		btn.setAttribute("aria-pressed", String(!btn.classList.contains("paused")))
	})
}

function initFavoriteButtons(root = document) {
	root.addEventListener("click", (e) => {
		const btn = e.target.closest(".favorite-button")
		if (!btn) return

		btn.classList.toggle("favorite")
		btn.setAttribute("aria-pressed", String(btn.classList.contains("favorite")))
	})
}
function initExclusivePlayback(root = document) {
	root.addEventListener("click", (e) => {
		const btn = e.target.closest(".play-btn")
		if (!btn) return

		// Выполняется после initPlayButtons (порядок подключения),
		// поэтому проверяем уже обновлённое состояние кнопки.
		if (btn.classList.contains("paused")) return

		root.querySelectorAll(".play-btn:not(.paused)").forEach((other) => {
			if (other !== btn) {
				other.classList.add("paused")
				other.setAttribute("aria-pressed", "false")
			}
		})
	})
}

// Inits
document.addEventListener("DOMContentLoaded", () => {
	// ============ Global
	// Mobile Menu
	initializeMobileMenu()
	initStickyHeader()

	// Play&Pause button & Favorite Buttons
	initPlayButtons()
	initExclusivePlayback()
	initFavoriteButtons()

	// ============ Home Page
	const swiperHomeHero = new Swiper(".swiper-home-hero", {
		// Optional parameters
		loop: true,
		spaceBetween: 20,
		pagination: {
			el: ".swiper-pagination-home-hero",
			clickable: true,
		},
		navigation: {
			nextEl: ".swiper-button-next-home-hero",
			prevEl: ".swiper-button-prev-home-hero",
		},
	})
	const swiperHomeCategory = new Swiper(".swiper-category-home", {
		// Optional parameters
		slidesPerView: 5,
		// slidesPerGroup: 5,
		grid: {
			rows: 2,
			fill: "row",
		},
		spaceBetween: 20,
		navigation: {
			nextEl: ".swiper-button-home-category-next",
			prevEl: ".swiper-button-home-category-prev",
		},
		pagination: {
			el: ".swiper-home-category-fraction",
			type: "fraction",
		},
	})
	const swiperHomeTestimonials = new Swiper(".swiper-home-testimonials", {
		// Optional parameters
		loop: true,
		spaceBetween: 20,
		slidesPerView: 3,
		pagination: {
			el: ".swiper-pagination-home-testimonials",
			clickable: true,
		},
	})
})

function initVolumeControl(root) {
	const input = root.querySelector("[data-volume-input]")
	const toggle = root.querySelector("[data-volume-toggle]")
	const panel = root.querySelector("[data-volume-panel]")
	const slider = root.querySelector("[data-volume-slider]")
	const fill = root.querySelector("[data-volume-fill]")
	const track = fill.parentElement

	const clamp = (v) => Math.min(100, Math.max(0, v))

	// ----- значение (0–100), хранится в input -----
	const getVolume = () => clamp(Number(input.value) || 0)

	function setVolume(v) {
		const value = Math.round(clamp(v))
		input.value = value
		fill.style.height = `${value}%`
		slider.setAttribute("aria-valuenow", value)
		input.dispatchEvent(new Event("change", { bubbles: true }))
	}

	const setFromPointer = (e) => {
		const rect = track.getBoundingClientRect()
		setVolume(100 - ((e.clientY - rect.top) / rect.height) * 100)
	}

	// ----- dropdown -----
	const isOpen = () => toggle.getAttribute("aria-expanded") === "true"

	function setOpen(open) {
		toggle.setAttribute("aria-expanded", open)
		panel.classList.toggle("hidden", !open)
		panel.classList.toggle("flex", open)
	}

	toggle.addEventListener("click", () => setOpen(!isOpen()))

	document.addEventListener("pointerdown", (e) => {
		if (isOpen() && !root.contains(e.target)) setOpen(false)
	})

	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape" && isOpen()) {
			setOpen(false)
			toggle.focus()
		}
	})

	// ----- drag -----
	slider.addEventListener("pointerdown", (e) => {
		slider.setPointerCapture(e.pointerId)
		slider.focus()
		setFromPointer(e)
		slider.addEventListener("pointermove", setFromPointer)
	})

	const stopDrag = (e) => {
		slider.removeEventListener("pointermove", setFromPointer)
		if (slider.hasPointerCapture(e.pointerId))
			slider.releasePointerCapture(e.pointerId)
	}
	slider.addEventListener("pointerup", stopDrag)
	slider.addEventListener("pointercancel", stopDrag)

	// ----- wheel -----
	panel.addEventListener(
		"wheel",
		(e) => {
			e.preventDefault()
			setVolume(getVolume() + (e.deltaY < 0 ? 5 : -5))
		},
		{ passive: false },
	)

	// ----- keyboard -----
	slider.addEventListener("keydown", (e) => {
		const step = e.shiftKey ? 10 : 5
		const actions = {
			ArrowUp: () => setVolume(getVolume() + step),
			ArrowRight: () => setVolume(getVolume() + step),
			ArrowDown: () => setVolume(getVolume() - step),
			ArrowLeft: () => setVolume(getVolume() - step),
			Home: () => setVolume(0),
			End: () => setVolume(100),
		}
		if (actions[e.key]) {
			e.preventDefault()
			actions[e.key]()
		}
	})

	// начальная отрисовка из значения input
	setVolume(getVolume())
}

// инициализация всех регуляторов на странице
document.querySelectorAll("[data-volume]").forEach(initVolumeControl)

// пример: слушаем изменения
// document.querySelector('[data-volume-input]').addEventListener('change', (e) => {
//   audio.volume = e.target.value / 100;
// });

function initSearchPopup(popup) {
	const openBtns = document.querySelectorAll("[data-search-open]")
	const closeBtn = popup.querySelector("[data-search-close]")
	const backdrop = popup.querySelector("[data-search-backdrop]")
	const input = popup.querySelector("[data-search-input]")

	const isOpen = () => !popup.classList.contains("hidden")

	function setOpen(open) {
		popup.classList.toggle("hidden", !open)
		document.body.classList.toggle("overflow-hidden", open)
		if (open) input.focus()
	}

	openBtns.forEach((btn) => btn.addEventListener("click", () => setOpen(true)))
	closeBtn.addEventListener("click", () => setOpen(false))
	backdrop.addEventListener("click", () => setOpen(false))

	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape" && isOpen()) setOpen(false)
	})
}

/* ---------- Volume control ---------- */
function initVolumeControl(root) {
	const input = root.querySelector("[data-volume-input]")
	const toggle = root.querySelector("[data-volume-toggle]")
	const panel = root.querySelector("[data-volume-panel]")
	const slider = root.querySelector("[data-volume-slider]")
	const fill = root.querySelector("[data-volume-fill]")
	const track = fill.parentElement

	const clamp = (v) => Math.min(100, Math.max(0, v))
	const getVolume = () => clamp(Number(input.value) || 0)

	function setVolume(v) {
		const value = Math.round(clamp(v))
		input.value = value
		fill.style.height = `${value}%`
		slider.setAttribute("aria-valuenow", value)
		input.dispatchEvent(new Event("change", { bubbles: true }))
	}

	const setFromPointer = (e) => {
		const rect = track.getBoundingClientRect()
		setVolume(100 - ((e.clientY - rect.top) / rect.height) * 100)
	}

	const isOpen = () => toggle.getAttribute("aria-expanded") === "true"

	function setOpen(open) {
		toggle.setAttribute("aria-expanded", open)
		panel.classList.toggle("hidden", !open)
		panel.classList.toggle("flex", open)
	}

	toggle.addEventListener("click", () => setOpen(!isOpen()))

	document.addEventListener("pointerdown", (e) => {
		if (isOpen() && !root.contains(e.target)) setOpen(false)
	})

	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape" && isOpen()) {
			setOpen(false)
			toggle.focus()
		}
	})

	slider.addEventListener("pointerdown", (e) => {
		slider.setPointerCapture(e.pointerId)
		slider.focus()
		setFromPointer(e)
		slider.addEventListener("pointermove", setFromPointer)
	})

	const stopDrag = (e) => {
		slider.removeEventListener("pointermove", setFromPointer)
		if (slider.hasPointerCapture(e.pointerId))
			slider.releasePointerCapture(e.pointerId)
	}
	slider.addEventListener("pointerup", stopDrag)
	slider.addEventListener("pointercancel", stopDrag)

	panel.addEventListener(
		"wheel",
		(e) => {
			e.preventDefault()
			setVolume(getVolume() + (e.deltaY < 0 ? 5 : -5))
		},
		{ passive: false },
	)

	slider.addEventListener("keydown", (e) => {
		const step = e.shiftKey ? 10 : 5
		const actions = {
			ArrowUp: () => setVolume(getVolume() + step),
			ArrowRight: () => setVolume(getVolume() + step),
			ArrowDown: () => setVolume(getVolume() - step),
			ArrowLeft: () => setVolume(getVolume() - step),
			Home: () => setVolume(0),
			End: () => setVolume(100),
		}
		if (actions[e.key]) {
			e.preventDefault()
			actions[e.key]()
		}
	})

	setVolume(getVolume())
}

document.querySelectorAll("[data-search-popup]").forEach(initSearchPopup)
