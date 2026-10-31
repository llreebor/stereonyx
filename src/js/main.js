const DESKTOP_QUERY = "(min-width: 1024px)"
const desktopMq = window.matchMedia(DESKTOP_QUERY)

// Initialize mobile menu and submenu functionality
function initializeMobileMenu() {
	const menu = document.querySelector("#mobile-menu")
	const overlay = document.querySelector("#mobile-menu-overlay")
	const burger = document.querySelector("#burger")
	const body = document.querySelector("body")

	const MOBILE_BREAKPOINT = 992

	if (!menu || !burger || !body || !overlay) return

	// Submenu helpers
	const setSubmenuState = (item, isOpen) => {
		item.classList.toggle("active", isOpen)
		item
			.querySelector(".submenu-trigger")
			?.setAttribute("aria-expanded", String(isOpen))

		if (isOpen) {
			const scrollEl = item.querySelector("[data-submenu-scroll]")
			if (scrollEl) scrollEl.scrollTop = 0
		}
	}

	const closeAllSubmenus = () => {
		menu
			.querySelectorAll(".with-submenu.active")
			.forEach((item) => setSubmenuState(item, false))
	}

	// Menu toggle
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

		if (!isOpen) closeAllSubmenus()
	}

	const handleBurgerClick = () => {
		const isOpening = !menu.classList.contains("is-open")
		updateMenuState(isOpening)
	}

	const handleOverlayClick = (event) => {
		if (event.target === overlay) updateMenuState(false)
	}

	// Escape closes the submenu first, then the menu
	const handleEscapeKey = (event) => {
		if (event.key !== "Escape" || !menu.classList.contains("is-open")) return

		const activeSubmenu = menu.querySelector(".with-submenu.active")
		if (activeSubmenu) {
			setSubmenuState(activeSubmenu, false)
		} else {
			updateMenuState(false)
		}
	}

	const handleWindowResize = () => {
		if (window.innerWidth >= MOBILE_BREAKPOINT) {
			updateMenuState(false)
		}
	}

	burger.addEventListener("click", handleBurgerClick)
	overlay.addEventListener("click", handleOverlayClick)
	document.addEventListener("keydown", handleEscapeKey)
	window.addEventListener("resize", handleWindowResize)

	burger.setAttribute("aria-expanded", "false")
	handleWindowResize()

	// Menu clicks: open submenu, go back, close, follow links
	menu.addEventListener("click", (event) => {
		// Open next level
		const trigger = event.target.closest(".submenu-trigger")
		if (trigger) {
			const item = trigger.closest(".with-submenu")
			if (item) setSubmenuState(item, true)
			return
		}

		// Back to previous level
		if (event.target.closest("[data-submenu-back]")) {
			const item = event.target.closest(".with-submenu")
			if (item) setSubmenuState(item, false)
			return
		}

		// Close whole menu
		if (event.target.closest("[data-menu-close]")) {
			updateMenuState(false)
			return
		}

		// Real links close the menu
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
		if (!btn || btn.dataset.trackSrc) return

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
		if (!btn || btn.dataset.trackSrc) return

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

// Dropdown
function initDropdown(dropdown, sheet) {
	const trigger = dropdown.querySelector("[data-dropdown-trigger]")
	const menu = dropdown.querySelector("[data-dropdown-menu]")
	if (!trigger || !menu) return

	// Sheet-режим включается только если есть data-sheet + контент + контейнер в sheet
	const sheetEl = trigger.dataset.sheet
		? document.getElementById(trigger.dataset.sheet)
		: null
	const content = dropdown.querySelector("[data-dropdown-content]")
	const mobileHost = sheetEl?.querySelector("[data-sheet-host]")
	const hasSheet = Boolean(sheetEl && content && mobileHost)
	const desktopHost = hasSheet ? content.parentElement : null

	const isMobileSheet = () => hasSheet && !desktopMq.matches
	const isOpen = () => menu.dataset.open === "true"
	const getItems = () => [
		...(content ?? menu).querySelectorAll('[role="menuitem"]'),
	]
	const closeSheet = () => sheet?.close?.()

	const open = () => {
		menu.dataset.open = "true"
		trigger.setAttribute("aria-expanded", "true")
	}

	const close = (returnFocus = false) => {
		menu.dataset.open = "false"
		trigger.setAttribute("aria-expanded", "false")
		if (returnFocus) trigger.focus()
	}

	// Перенос контента между dropdown (desktop) и sheet (mobile)
	if (hasSheet) {
		const mountContent = () => {
			const host = desktopMq.matches ? desktopHost : mobileHost
			if (content.parentElement !== host) host.appendChild(content)
		}
		mountContent()

		desktopMq.addEventListener("change", () => {
			mountContent() // сначала переносим контент
			close()
			closeSheet()
		})
	}

	trigger.addEventListener("click", (e) => {
		// На мобильных клик обработает BottomSheet (document listener)
		if (isMobileSheet()) return
		e.stopPropagation()
		isOpen() ? close() : open()
	})

	// Клик вне dropdown
	document.addEventListener("click", (e) => {
		if (isOpen() && !dropdown.contains(e.target)) close()
	})

	// Клавиатура: Esc закрывает, стрелки навигируют
	document.addEventListener("keydown", (e) => {
		if (!isOpen()) return

		if (e.key === "Escape") {
			close(true)
			return
		}

		if (e.key === "ArrowDown" || e.key === "ArrowUp") {
			e.preventDefault()
			const items = getItems()
			if (!items.length) return
			const idx = items.indexOf(document.activeElement)
			const next =
				e.key === "ArrowDown"
					? items[(idx + 1) % items.length]
					: items[(idx - 1 + items.length) % items.length]
			next.focus()
		}
	})

	// Закрытие после выбора пункта
	;(content ?? menu).addEventListener("click", (e) => {
		if (!e.target.closest('[role="menuitem"]')) return
		if (isMobileSheet()) closeSheet()
		else close()
	})
}

// Sheets
class BottomSheet {
	constructor() {
		this.active = null
		this.isClosing = false

		document.addEventListener("click", (e) => {
			const trigger = e.target.closest("[data-sheet]")
			if (trigger) {
				this.open(trigger.dataset.sheet)
				return
			}

			if (e.target.closest(".sheet-close-btn")) {
				this.close()
				return
			}

			if (this.active && e.target.classList.contains("sheet-wrapper")) {
				this.close()
			}
		})

		document.addEventListener("keydown", (e) => {
			if (e.key === "Escape" && this.active) this.close()
		})

		document.querySelectorAll(".sheet-wrapper").forEach((wrapper) => {
			const grabber = wrapper.querySelector(".sheet-grabber")
			const content = wrapper.querySelector(".sheet-content")
			if (grabber && content) this._initDrag(grabber, content, wrapper)
		})

		// Выбор опции в sheet (например, select страны)
		document.addEventListener("click", (e) => {
			const option = e.target.closest(".sheet-select-option")
			if (!option) return

			const sheet = option.closest(".sheet-wrapper")
			if (!sheet) return

			const trigger = document.querySelector(`[data-sheet="${sheet.id}"]`)
			if (!trigger) return

			const wrapper = trigger.closest(".select-wrapper")
			const img = option.querySelector(".sheet-option-image")
			const text = option.querySelector(".sheet-option-text")

			const triggerFlag = trigger.querySelector(".select-trigger-flag")
			const triggerText = trigger.querySelector(".select-trigger-text")

			if (triggerFlag && img) triggerFlag.src = img.src
			if (triggerText && text) {
				triggerText.textContent = text.textContent.trim()
			}

			if (wrapper) {
				let hiddenInput = wrapper.querySelector(
					"input[type='hidden'].select-hidden-value",
				)
				if (!hiddenInput) {
					hiddenInput = document.createElement("input")
					hiddenInput.type = "hidden"
					hiddenInput.classList.add("select-hidden-value")
					hiddenInput.name = wrapper.dataset.name ?? "select_value"
					wrapper.appendChild(hiddenInput)
				}
				hiddenInput.value = text?.textContent.trim() ?? ""
			}

			this.close()
		})
	}

	open(id) {
		const wrapper = document.getElementById(id)
		if (!wrapper) return

		// Sheet только для мобильных, если указан data-sheet-mobile-only
		if (wrapper.hasAttribute("data-sheet-mobile-only") && desktopMq.matches) {
			return
		}

		if (this.active && this.active !== wrapper) this._hide(this.active, true)
		this.active = wrapper
		this._show(wrapper)
	}

	close() {
		if (!this.active || this.isClosing) return
		this._hide(this.active)
		this.active = null
	}

	_show(wrapper) {
		this.isClosing = false
		wrapper.classList.add("is-visible")
		document.body.style.overflow = "hidden"
	}

	// _hide(wrapper, instant = false) {
	// 	const content = wrapper.querySelector(".sheet-content")
	// 	if (!content) return

	// 	if (instant) {
	// 		content.style.transition = "none"
	// 		content.style.transform = ""
	// 		wrapper.classList.remove("is-visible")
	// 		document.body.style.overflow = ""
	// 		return
	// 	}

	// 	this.isClosing = true

	// 	content.style.transition = "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)"
	// 	content.style.transform = "translateY(100%)"

	// 	wrapper.style.transition = "background-color 0.35s"
	// 	wrapper.style.backgroundColor = "transparent"

	// 	content.addEventListener(
	// 		"transitionend",
	// 		() => {
	// 			content.style.transition = ""
	// 			content.style.transform = ""
	// 			wrapper.style.transition = ""
	// 			wrapper.style.backgroundColor = ""
	// 			wrapper.classList.remove("is-visible")
	// 			document.body.style.overflow = ""
	// 			this.isClosing = false
	// 		},
	// 		{ once: true },
	// 	)
	// }

	_hide(wrapper, instant = false) {
		const content = wrapper.querySelector(".sheet-content")
		if (!content) return

		const cleanup = () => {
			content.style.transition = ""
			content.style.transform = ""
			document.body.style.overflow = ""
			this.isClosing = false
		}

		if (instant) {
			content.style.transition = "none"
			wrapper.style.transition = "none"
			wrapper.classList.remove("is-visible")
			cleanup()
			// Возвращаем transition на следующем кадре
			requestAnimationFrame(() => (wrapper.style.transition = ""))
			return
		}

		this.isClosing = true

		// Sheet уезжает вниз
		content.style.transition = "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)"
		content.style.transform = "translateY(100%)"

		// Overlay плавно гаснет целиком (blur + затемнение) через opacity
		wrapper.classList.remove("is-visible")

		const onEnd = (e) => {
			if (e.target !== content || e.propertyName !== "transform") return
			content.removeEventListener("transitionend", onEnd)
			cleanup()
		}
		content.addEventListener("transitionend", onEnd)
	}

	_initDrag(grabber, content, wrapper) {
		let startY = 0,
			delta = 0,
			dragging = false

		const onStart = (y) => {
			if (this.active !== wrapper) return
			dragging = true
			startY = y
			delta = 0
			content.style.transition = "none"
		}

		const onMove = (y) => {
			if (!dragging) return
			delta = Math.max(0, y - startY)
			content.style.transform = `translateY(${delta}px)`
		}

		const onEnd = () => {
			if (!dragging) return
			dragging = false
			if (delta > content.offsetHeight * 0.3) {
				this.close()
			} else {
				content.style.transition = ""
				content.style.transform = ""
			}
		}

		// Pointer events (desktop)
		grabber.addEventListener("pointerdown", (e) => {
			if (e.pointerType === "touch") return
			onStart(e.clientY)
			grabber.setPointerCapture(e.pointerId)
		})
		grabber.addEventListener("pointermove", (e) => {
			if (e.pointerType === "touch") return
			onMove(e.clientY)
		})
		grabber.addEventListener("pointerup", (e) => {
			if (e.pointerType === "touch") return
			onEnd()
		})

		// Touch events (mobile)
		grabber.addEventListener(
			"touchstart",
			(e) => onStart(e.touches[0].clientY),
			{ passive: true },
		)
		grabber.addEventListener("touchmove", (e) => onMove(e.touches[0].clientY), {
			passive: true,
		})
		grabber.addEventListener("touchend", onEnd)
	}
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

// Search
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

// Helpers
const formatTime = (s) => {
	const m = Math.floor(s / 60)
	const sec = Math.floor(s % 60)
	return `${m}:${String(sec).padStart(2, "0")}`
}

// Init player
function initPlayer(root) {
	const playBtn = root.querySelector("[data-player-play]")
	const waveformEl = root.querySelector("[data-player-waveform]")
	const currentEl = root.querySelector("[data-player-current]")
	const durationEl = root.querySelector("[data-player-duration]")
	const titleEls = root.querySelectorAll("[data-player-title]")
	const subtitleEls = root.querySelectorAll("[data-player-subtitle]")
	const coverEl = root.querySelector("[data-player-cover]")
	const progress = root.querySelector("[data-player-progress]")
	const fill = root.querySelector("[data-player-progress-fill]")
	const closeBtn = root.querySelector("[data-player-close]")
	const volumeInput = root.querySelector("[data-volume-input]")

	if (!playBtn || !waveformEl) return

	let currentBtn = null

	const ws = WaveSurfer.create({
		container: waveformEl,
		height: 32,
		barWidth: 2,
		barGap: 2,
		barRadius: 2,
		cursorWidth: 0,
		normalize: true,
		dragToSeek: true,
		waveColor: "#4b4b4f",
		progressColor: "#7c3aed",
	})

	const trackButtons = () =>
		document.querySelectorAll(".play-btn[data-track-src]")

	// Single source of truth: all buttons follow the player state
	const syncButtons = () => {
		const playing = ws.isPlaying()

		trackButtons().forEach((btn) => {
			const isActive = playing && btn === currentBtn
			btn.classList.toggle("paused", !isActive)
			btn.setAttribute("aria-pressed", String(isActive))
		})

		playBtn.classList.toggle("paused", !playing)
		playBtn.setAttribute("aria-pressed", String(playing))
	}

	const show = () => {
		root.hidden = false
		root.removeAttribute("aria-hidden")
	}

	const hide = () => {
		root.hidden = true
		root.setAttribute("aria-hidden", "true")
	}

	const setText = (els, text) => els.forEach((el) => (el.textContent = text))

	const resetProgress = () => {
		if (currentEl) currentEl.textContent = "0:00"
		if (durationEl) durationEl.textContent = "0:00"
		if (fill) fill.style.width = "0%"
	}

	async function playTrack(btn) {
		// Same button: toggle play/pause
		if (btn === currentBtn) {
			ws.playPause()
			return
		}

		// Different button: switch to its track
		currentBtn = btn

		setText(titleEls, btn.dataset.trackTitle ?? "")
		setText(subtitleEls, btn.dataset.trackSubtitle ?? "")
		if (coverEl && btn.dataset.trackCover) coverEl.src = btn.dataset.trackCover

		resetProgress()
		ws.pause()
		syncButtons()

		try {
			await ws.load(btn.dataset.trackSrc)
			// Ignore if the user clicked another button while loading
			if (currentBtn === btn) await ws.play()
		} catch (err) {
			console.error("Player: failed to load track", err)
			if (currentBtn === btn) currentBtn = null
		} finally {
			syncButtons()
		}
	}

	// Any play button outside the player opens it
	document.addEventListener("click", (e) => {
		const btn = e.target.closest(".play-btn")
		if (!btn || root.contains(btn)) return

		show()
		if (btn.dataset.trackSrc) playTrack(btn)
	})

	// Player's own play button
	playBtn.addEventListener("click", () => ws.playPause())

	ws.on("play", syncButtons)
	ws.on("pause", syncButtons)
	ws.on("finish", () => {
		ws.seekTo(0)
		syncButtons()
	})

	ws.on("ready", (duration) => {
		if (durationEl) durationEl.textContent = formatTime(duration)
	})

	ws.on("timeupdate", (time) => {
		const duration = ws.getDuration()
		if (currentEl) currentEl.textContent = formatTime(time)
		if (fill && duration) fill.style.width = `${(time / duration) * 100}%`
	})

	// Seek on the mobile progress bar
	progress?.addEventListener("click", (e) => {
		const rect = progress.getBoundingClientRect()
		ws.seekTo((e.clientX - rect.left) / rect.width)
	})

	// Close: stop music, hide player, reset buttons
	closeBtn?.addEventListener("click", () => {
		ws.pause()
		ws.seekTo(0)
		currentBtn = null
		hide()
		syncButtons()
	})

	// Volume (shared by every volume control on the page)
	const applyVolume = (value) =>
		ws.setVolume(Math.min(100, Math.max(0, value)) / 100)

	if (volumeInput) {
		const initial = Number(volumeInput.value) || 0
		applyVolume(initial)
		// Sync other controls (e.g. header) with the player's initial value
		document.dispatchEvent(
			new CustomEvent("volume:change", {
				detail: { value: initial, source: root },
			}),
		)
	}

	document.addEventListener("volume:change", (e) => applyVolume(e.detail.value))

	return ws
}

function initVolumeControl(root) {
	const input = root.querySelector("[data-volume-input]")
	const toggle = root.querySelector("[data-volume-toggle]")
	const panel = root.querySelector("[data-volume-panel]")
	const slider = root.querySelector("[data-volume-slider]")
	const fill = root.querySelector("[data-volume-fill]")

	if (!input || !toggle || !panel || !slider || !fill) {
		console.warn("Volume control: missing required elements", root)
		return
	}

	const track = fill.parentElement

	const clamp = (v) => Math.min(100, Math.max(0, v))
	const getVolume = () => clamp(Number(input.value) || 0)

	// Rendering only (no events), so syncing between controls can't loop
	const render = (value) => {
		input.value = value
		fill.style.height = `${value}%`
		slider.setAttribute("aria-valuenow", value)
	}

	function setVolume(v) {
		const value = Math.round(clamp(v))
		render(value)
		input.dispatchEvent(new Event("change", { bubbles: true }))
		document.dispatchEvent(
			new CustomEvent("volume:change", { detail: { value, source: root } }),
		)
	}

	// Another control changed the volume: update only our own UI
	document.addEventListener("volume:change", (e) => {
		if (e.detail.source !== root) render(e.detail.value)
	})

	const setFromPointer = (e) => {
		const rect = track.getBoundingClientRect()
		setVolume(100 - ((e.clientY - rect.top) / rect.height) * 100)
	}

	// Dropdown
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

	// Drag
	slider.addEventListener("pointerdown", (e) => {
		slider.setPointerCapture(e.pointerId)
		slider.focus()
		setFromPointer(e)
		slider.addEventListener("pointermove", setFromPointer)
	})

	const stopDrag = (e) => {
		slider.removeEventListener("pointermove", setFromPointer)
		if (slider.hasPointerCapture(e.pointerId)) {
			slider.releasePointerCapture(e.pointerId)
		}
	}
	slider.addEventListener("pointerup", stopDrag)
	slider.addEventListener("pointercancel", stopDrag)

	// Wheel
	panel.addEventListener(
		"wheel",
		(e) => {
			e.preventDefault()
			setVolume(getVolume() + (e.deltaY < 0 ? 5 : -5))
		},
		{ passive: false },
	)

	// Keyboard
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

	// Initial render from the input value (no events)
	render(getVolume())
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

	// Search
	document.querySelectorAll("[data-search-popup]").forEach(initSearchPopup)

	// Modals
	initializeModal()

	// Player
	document.querySelectorAll("[data-volume]").forEach(initVolumeControl)
	document.querySelectorAll("[data-player]").forEach(initPlayer)

	// Password visibility
	togglePasswordVisibility()

	// Offset
	initStickyOffset()

	// Sheet
	const bottomSheet = new BottomSheet()

	// Profile Dropdown & Sheet
	document
		.querySelectorAll("[data-dropdown]")
		.forEach((el) => initDropdown(el, bottomSheet))

	// ============ Home Page
	const swiperHomeHero = new Swiper(".swiper-home-hero", {
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
	const swiperHomeCategoryNew = new Swiper(".swiper-category-home-new", {
		grid: {
			rows: 2,
			fill: "row",
		},
		spaceBetween: 20,
		navigation: {
			nextEl: ".swiper-button-home-category-new-next",
			prevEl: ".swiper-button-home-category-new-prev",
		},
		pagination: {
			el: ".swiper-home-category-new-fraction",
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
	const swiperHomeCategoryHouse = new Swiper(".swiper-category-home-house", {
		grid: {
			rows: 2,
			fill: "row",
		},
		spaceBetween: 20,
		navigation: {
			nextEl: ".swiper-button-home-category-house-next",
			prevEl: ".swiper-button-home-category-house-prev",
		},
		pagination: {
			el: ".swiper-home-category-house-fraction",
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
	const swiperHomeCategoryDrum = new Swiper(".swiper-category-home-drum", {
		grid: {
			rows: 2,
			fill: "row",
		},
		spaceBetween: 20,
		navigation: {
			nextEl: ".swiper-button-home-category-drum-next",
			prevEl: ".swiper-button-home-category-drum-prev",
		},
		pagination: {
			el: ".swiper-home-category-drum-fraction",
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

	// ============ Contacts Page
	// Faq Accordion
	initializeAccordion()
})
