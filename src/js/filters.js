// ============================================================
// FILTERS (desktop + mobile)
// Добавить в тот же <script>, рядом с остальными функциями.
// ============================================================

// Единое состояние фильтров. Desktop и mobile работают с одним и тем же Map,
// поэтому всегда синхронизированы.
function initFilters() {
	const scopes = [...document.querySelectorAll("[data-filter-group]")]
	if (!scopes.length) return

	const selected = new Map() // key -> { group, name, label }
	const tagsWrap = document.querySelector("[data-filter-tags-wrap]")
	const tagsList = document.querySelector("[data-filter-tags]")
	const mobileTotal = document.querySelector(".mobile-filters-button-num")

	const show = (el, isVisible) => {
		if (el) el.style.display = isVisible ? "" : "none"
	}
	const keyOf = (group, name) => `${group}::${name}`
	const labelOf = (cb) =>
		cb
			.closest(".checkbox-row")
			?.querySelector(".checkbox-label")
			?.textContent.trim() ?? cb.name

	// --- 1. Уникальные id внутри мобильного меню ---------------------------
	// В разметке id/for дублируются (desktop + 4 аккордеона), из-за этого label
	// кликает не тот input. Делаем id уникальными в рамках каждого блока.
	// (В WordPress лучше сразу генерировать уникальные id в PHP.)
	scopes
		.filter((scope) => !scope.matches("[data-dropdown]"))
		.forEach((scope) => {
			const prefix = `m-${scope.dataset.filterGroup}-`
			scope.querySelectorAll("[id]").forEach((el) => {
				el.id = prefix + el.id
			})
			scope.querySelectorAll("label[for]").forEach((label) => {
				label.htmlFor = prefix + label.getAttribute("for")
			})
		})

	// --- 2. Сообщение "Not found" для поиска -------------------------------
	scopes.forEach((scope) => {
		const firstItem = scope.querySelector(".checkbox-group")
		if (!firstItem) return
		const empty = document.createElement("p")
		empty.dataset.filterEmpty = ""
		empty.className = "text-gray px-2 py-3 text-sm"
		empty.textContent = "Not found"
		empty.style.display = "none"
		firstItem.parentElement.appendChild(empty)
	})

	// --- 3. Render ---------------------------------------------------------
	function render() {
		const counts = {}
		selected.forEach((item) => {
			counts[item.group] = (counts[item.group] ?? 0) + 1
		})

		scopes.forEach((scope) => {
			const group = scope.dataset.filterGroup

			// Чекбоксы приводим к состоянию (desktop <-> mobile)
			scope.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
				cb.checked = selected.has(keyOf(group, cb.name))
			})

			// Счётчик: span в desktop-кнопке или p в mobile-аккордеоне
			const badge = scope.matches("[data-dropdown]")
				? scope.querySelector("[data-dropdown-trigger] span")
				: scope.querySelector(".accordion-mobile-filters-num")
			const count = counts[group] ?? 0
			if (badge) {
				badge.textContent = count
				show(badge, count > 0)
			}
		})

		// Общий счётчик на кнопке "Filters"
		if (mobileTotal) {
			mobileTotal.textContent = selected.size
			show(mobileTotal, selected.size > 0)
		}

		// Теги
		if (tagsList) {
			tagsList.replaceChildren()
			selected.forEach((item, key) => {
				const tag = document.createElement("div")
				tag.className = "filter-tag"
				tag.append(item.label)

				const btn = document.createElement("button")
				btn.type = "button"
				btn.className = "filter-tag-close-btn"
				btn.dataset.filterKey = key
				btn.setAttribute("aria-label", `Remove ${item.label}`)
				btn.innerHTML =
					'<img src="./images/icons/remove-tag.svg" alt="remove tag" />'

				tag.appendChild(btn)
				tagsList.appendChild(tag)
			})
		}
		show(tagsWrap, selected.size > 0)

		// Для WordPress / AJAX-фильтрации каталога
		document.dispatchEvent(
			new CustomEvent("filters:change", {
				detail: { selected: [...selected.values()] },
			}),
		)
	}

	// --- 4. Выбор чекбокса -------------------------------------------------
	document.addEventListener("change", (e) => {
		const cb = e.target.closest?.('input[type="checkbox"]')
		const scope = cb?.closest("[data-filter-group]")
		if (!cb || !scope) return

		const group = scope.dataset.filterGroup
		const key = keyOf(group, cb.name)

		if (cb.checked) {
			selected.set(key, { group, name: cb.name, label: labelOf(cb) })
		} else {
			selected.delete(key)
		}
		render()
	})

	// --- 5. Удаление тега / Clear filters / Clear all ---------------------
	document.addEventListener("click", (e) => {
		const removeBtn = e.target.closest(".filter-tag-close-btn")
		if (removeBtn?.dataset.filterKey) {
			selected.delete(removeBtn.dataset.filterKey)
			render()
			return
		}

		if (e.target.closest(".filter-tag-clear-btn, .clear-mobile-filters")) {
			selected.clear()
			render()
		}
	})

	// --- 6. Поиск внутри своего dropdown / аккордеона ----------------------
	document.addEventListener("input", (e) => {
		const input = e.target.closest?.("[data-search-input]")
		const scope = input?.closest("[data-filter-group]")
		if (!input || !scope) return

		const query = input.value.trim().toLowerCase()
		let visible = 0

		scope.querySelectorAll(".checkbox-group").forEach((item) => {
			const text =
				item.querySelector(".checkbox-label")?.textContent.toLowerCase() ?? ""
			const match = text.includes(query)
			show(item, match)
			if (match) visible++
		})

		show(scope.querySelector("[data-filter-empty]"), visible === 0)
	})

	// Стартовое состояние (на случай если что-то checked в разметке)
	scopes.forEach((scope) => {
		const group = scope.dataset.filterGroup
		scope.querySelectorAll('input[type="checkbox"]:checked').forEach((cb) => {
			selected.set(keyOf(group, cb.name), {
				group,
				name: cb.name,
				label: labelOf(cb),
			})
		})
	})
	render()
}
initFilters()
// Мобильное меню фильтров: slide-in / slide-out
function initMobileFilters() {
	const menu = document.querySelector(".filters-mobile-menu")
	const openBtn = document.querySelector(".btn-mobile-filters")
	if (!menu || !openBtn) return

	const HIDDEN = "hidden!" // класс из разметки (Tailwind v4 important)
	const EASE = "cubic-bezier(0.32, 0.72, 0, 1)"
	let isOpen = false
	let anim = null

	function open() {
		if (isOpen) return
		isOpen = true
		announcePopupOpen(menu)

		anim?.cancel()
		menu.classList.remove(HIDDEN)
		document.body.classList.add("overflow-hidden")

		anim = menu.animate(
			[{ transform: "translateX(100%)" }, { transform: "translateX(0)" }],
			{ duration: 300, easing: EASE },
		)
	}

	function close({ instant = false } = {}) {
		if (!isOpen) return
		isOpen = false
		document.body.classList.remove("overflow-hidden")
		anim?.cancel()

		if (instant) {
			menu.classList.add(HIDDEN)
			return
		}

		const current = menu.animate(
			[{ transform: "translateX(0)" }, { transform: "translateX(100%)" }],
			{ duration: 250, easing: "ease-in", fill: "forwards" },
		)
		anim = current
		current.onfinish = () => {
			if (anim !== current) return // за это время меню снова открыли
			menu.classList.add(HIDDEN)
			current.cancel()
		}
	}

	openBtn.addEventListener("click", open)

	menu
		.querySelector(".close-mobile-filters")
		?.addEventListener("click", () => close())

	menu
		.querySelector(".show-result-mobile-filters")
		?.addEventListener("click", () => {
			close()
			document.dispatchEvent(new CustomEvent("filters:apply"))
		})

	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape" && isOpen) close()
	})

	// Другой popup открылся — закрываем меню
	document.addEventListener("popup:open", (e) => {
		if (e.detail.source !== menu) close({ instant: true })
	})

	// Переход на desktop — закрываем
	desktopMq.addEventListener("change", (e) => {
		if (e.matches) close({ instant: true })
	})
}
initMobileFilters()
