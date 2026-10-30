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
function initDesktopSubmenu() {
	const triggers = document.querySelectorAll("#menu .submenu-trigger")
	if (!triggers.length) return

	// Только устройства без hover (телефоны, планшеты)
	const noHover = window.matchMedia("(hover: none)")

	const setState = (trigger, isOpen) => {
		trigger.classList.toggle("is-open", isOpen)
		trigger
			.querySelector("button[aria-expanded]")
			?.setAttribute("aria-expanded", isOpen)
	}

	triggers.forEach((trigger) => {
		const button = trigger.querySelector("button")
		if (!button) return

		button.addEventListener("click", () => {
			if (!noHover.matches) return // на десктопе работает обычный hover
			// закрываем другие подменю
			triggers.forEach((t) => t !== trigger && setState(t, false))
			setState(trigger, !trigger.classList.contains("is-open"))
		})
	})

	// Тап вне меню закрывает подменю
	document.addEventListener("click", (event) => {
		if (!event.target.closest("#menu .submenu-trigger")) {
			triggers.forEach((t) => setState(t, false))
		}
	})

	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape") triggers.forEach((t) => setState(t, false))
	})
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

// Modal
function initializeModal() {
	const openModalButtons = document.querySelectorAll("[data-modal]")
	const closeModalButtons = document.querySelectorAll(".modal-close-btn")
	const cancelModalButtons = document.querySelectorAll(".modal-cancel-btn")

	if (!openModalButtons.length || !closeModalButtons.length) return

	function openModal(modalId) {
		const modal = document.getElementById(modalId)
		if (!modal) return

		modal.classList.remove("opacity-0", "pointer-events-none")
		modal.classList.add("opacity-100", "pointer-events-auto")

		const handleOverlayClick = (e) => {
			if (!e.target.closest(".modal")) {
				closeModal(modalId)
			}
		}
		modal.addEventListener("click", handleOverlayClick)

		const handleEscapeKey = (e) => {
			if (e.key === "Escape") {
				closeModal(modalId)
				document.removeEventListener("keydown", handleEscapeKey)
			}
		}
		document.addEventListener("keydown", handleEscapeKey)
	}

	function closeModal(modalId) {
		const modal = document.getElementById(modalId)
		if (!modal) return

		modal.classList.remove("opacity-100", "pointer-events-auto")
		modal.classList.add("opacity-0", "pointer-events-none")

		const modalContent = modal.querySelector(".modal")
		if (modalContent) {
			modalContent.classList.remove("scale-100")
			modalContent.classList.add("scale-95")
		}
	}

	openModalButtons.forEach((button) => {
		if (!button.classList.contains("modal-close-btn")) {
			button.addEventListener("click", () => {
				const modalId = button.getAttribute("data-modal")
				if (modalId) openModal(modalId)
			})
		}
	})

	closeModalButtons.forEach((button) => {
		button.addEventListener("click", () => {
			const modalId = button.getAttribute("data-modal")
			if (modalId) closeModal(modalId)
		})
	})

	cancelModalButtons.forEach((button) => {
		button.addEventListener("click", () => {
			const modalId = button.getAttribute("data-modal")
			if (modalId) closeModal(modalId)
		})
	})
}

// Toggles the visibility of password input
function togglePasswordVisibility() {
	// Select all password inputs and toggle buttons
	const passwordInputs = document.querySelectorAll(".password-input")
	const toggleButtons = document.querySelectorAll(".toggle-password-btn")

	// Validate that we have matching pairs of inputs and buttons
	if (passwordInputs.length === 0 || toggleButtons.length === 0) {
		console.warn("No password inputs or toggle buttons found.")
		return
	}

	if (passwordInputs.length !== toggleButtons.length) {
		console.warn(
			"Mismatch between number of password inputs and toggle buttons.",
		)
		return
	}

	// Iterate through each toggle button and attach event listener
	toggleButtons.forEach((toggleBtn, index) => {
		const passwordInput = passwordInputs[index]
		const iconVisible = toggleBtn.querySelector(".pswd-icon-visible")
		const iconHidden = toggleBtn.querySelector(".pswd-icon-hidden")

		// Validate icon elements exist
		if (!iconVisible || !iconHidden) {
			console.warn(`Missing visibility icons for password input ${index}.`)
			return
		}

		// Initialize icon states based on input type
		const isPassword = passwordInput.type === "password"
		iconVisible.style.display = isPassword ? "none" : "block"
		iconHidden.style.display = isPassword ? "block" : "none"

		// Add click event listener to toggle visibility
		toggleBtn.addEventListener("click", (e) => {
			e.preventDefault()

			// Toggle input type between password and text
			passwordInput.type =
				passwordInput.type === "password" ? "text" : "password"

			// Update icon visibility based on new input type
			const isPasswordNow = passwordInput.type === "password"
			iconVisible.style.display = isPasswordNow ? "none" : "block"
			iconHidden.style.display = isPasswordNow ? "block" : "none"
		})
	})
}

// CLose Banner
function toggleBannerVisibility() {
	const banner = document.querySelector(".banner")
	const closeBannerBtn = document.querySelector(".close-banner-btn")
	if (!banner) return

	closeBannerBtn.addEventListener("click", () => {
		banner.classList.add("hidden")
	})
}

// Initialize accordion functionality
function initializeAccordion() {
	const accordions = document.querySelectorAll(".accordion")
	if (!accordions.length) return

	accordions.forEach((accordion) => {
		const accordionItems = accordion.querySelectorAll(".accordion-item")

		accordionItems.forEach((item) => {
			const content = item.querySelector(".accordion-content")
			const trigger = item.querySelector(".accordion-trigger")

			if (!content || !trigger) return

			trigger.setAttribute("aria-expanded", item.classList.contains("active"))
			content.setAttribute("aria-hidden", !item.classList.contains("active"))
		})

		accordion.addEventListener("click", (event) => {
			const trigger = event.target.closest(".accordion-trigger")
			if (!trigger) return

			const parent = trigger.closest(".accordion-item")
			if (!parent) return

			const content = parent.querySelector(".accordion-content")
			if (!content) return

			const isOpening = !parent.classList.contains("active")
			parent.classList.toggle("active")
			content.classList.toggle("active")

			trigger.setAttribute("aria-expanded", isOpening)
			content.setAttribute("aria-hidden", !isOpening)
		})

		accordion.addEventListener("keydown", (event) => {
			if (event.key === "Enter" || event.key === " ") {
				const trigger = event.target.closest(".accordion-trigger")
				if (!trigger) return

				event.preventDefault()
				trigger.click()
			}
		})
	})
}

function initDropdown(dropdown) {
	const trigger = dropdown.querySelector("[data-dropdown-trigger]")
	const menu = dropdown.querySelector("[data-dropdown-menu]")
	const items = () => [...menu.querySelectorAll('[role="menuitem"]')]

	const isOpen = () => menu.dataset.open === "true"

	const open = () => {
		menu.dataset.open = "true"
		trigger.setAttribute("aria-expanded", "true")
	}

	const close = (returnFocus = false) => {
		menu.dataset.open = "false"
		trigger.setAttribute("aria-expanded", "false")
		if (returnFocus) trigger.focus()
	}

	trigger.addEventListener("click", (e) => {
		e.stopPropagation()
		isOpen() ? close() : open()
	})

	// Close on outside click
	document.addEventListener("click", (e) => {
		if (isOpen() && !dropdown.contains(e.target)) close()
	})

	// Keyboard: Esc closes, arrows navigate
	document.addEventListener("keydown", (e) => {
		if (!isOpen()) return

		if (e.key === "Escape") {
			close(true)
			return
		}

		if (e.key === "ArrowDown" || e.key === "ArrowUp") {
			e.preventDefault()
			const list = items()
			const idx = list.indexOf(document.activeElement)
			const next =
				e.key === "ArrowDown"
					? list[(idx + 1) % list.length]
					: list[(idx - 1 + list.length) % list.length]
			next.focus()
		}
	})

	// Close after selecting an item
	menu.addEventListener("click", (e) => {
		if (e.target.closest('[role="menuitem"]')) close()
	})
}

function initStickyOffset({
	headerSelector = ".header-wrapper",
	varName = "--header-h",
} = {}) {
	const header = document.querySelector(headerSelector)
	if (!header) return () => {}

	const update = () => {
		document.documentElement.style.setProperty(
			varName,
			`${header.getBoundingClientRect().height}px`,
		)
	}

	update()

	const observer = new ResizeObserver(update)
	observer.observe(header)

	return () => observer.disconnect()
}

// Inits
document.addEventListener("DOMContentLoaded", () => {
	// ============ Global
	// Mobile Menu
	initializeMobileMenu()
	toggleBannerVisibility()
	initDesktopSubmenu()

	// Play&Pause button & Favorite Buttons
	initPlayButtons()
	initExclusivePlayback()
	initFavoriteButtons()

	// Modals
	initializeModal()

	// Dwopdown menus
	document.querySelectorAll("[data-dropdown]").forEach(initDropdown)

	// Password visibility
	togglePasswordVisibility()

	// Offset
	initStickyOffset()

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
		breakpoints: {
			320: {
				slidesPerView: 1.6,
			},
			375: {
				slidesPerView: 2.2,
			},
			600: {
				slidesPerView: 3.2,
			},
			768: {
				slidesPerView: 4.3,
			},
			1024: {
				slidesPerView: 5,
			},
		},
	})
	const swiperHomeTestimonials = new Swiper(".swiper-home-testimonials", {
		// Optional parameters
		loop: true,
		spaceBetween: 20,

		pagination: {
			el: ".swiper-pagination-home-testimonials",
			clickable: true,
		},
		breakpoints: {
			320: {
				slidesPerView: 1,
			},
			375: {
				slidesPerView: 1.3,
			},
			680: {
				slidesPerView: 2.3,
			},
			1024: {
				slidesPerView: 3,
			},
		},
	})

	// ============ Contacts Page
	// Faq Accordion
	initializeAccordion()
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
