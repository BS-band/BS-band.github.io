document.addEventListener('DOMContentLoaded', function() {

	// --- Helper: Debounce Function ---
	const debounce = (func, wait = 300) => {
			let timeout;
			return (...args) => {
					clearTimeout(timeout);
					timeout = setTimeout(() => func.apply(this, args), wait);
			};
	};

	// --- Mobile Menu Toggle ---
	const menuToggle = document.getElementById('menu-toggle');
	const navList = document.getElementById('nav-list');
	if (menuToggle && navList) {
			menuToggle.addEventListener('click', () => {
					const isActive = navList.classList.toggle('active');
					menuToggle.classList.toggle('active');
					menuToggle.setAttribute('aria-expanded', isActive);
					document.body.style.overflow = isActive ? 'hidden' : '';
			});
			navList.querySelectorAll('a').forEach(link => {
					link.addEventListener('click', () => {
							if (navList.classList.contains('active')) {
									navList.classList.remove('active');
									menuToggle.classList.remove('active');
									menuToggle.setAttribute('aria-expanded', 'false');
									document.body.style.overflow = '';
							}
					});
			});
			document.addEventListener('click', (event) => {
					const isClickInsideNav = navList.contains(event.target);
					const isClickOnToggle = menuToggle.contains(event.target);
					if (!isClickInsideNav && !isClickOnToggle && navList.classList.contains('active')) {
							navList.classList.remove('active');
							menuToggle.classList.remove('active');
							menuToggle.setAttribute('aria-expanded', 'false');
							document.body.style.overflow = '';
					}
			});
	}

	// --- Smooth Scroll for Internal Links ---
	const scrollLinks = document.querySelectorAll('.scroll-link');
	if (scrollLinks.length > 0) {
			const header = document.querySelector('.site-header');
			const headerHeight = header ? header.offsetHeight : 0;
			scrollLinks.forEach(link => {
					link.addEventListener('click', function(e) {
							e.preventDefault();
							const targetId = this.getAttribute('href');
							if (!targetId || !targetId.startsWith('#')) return;
							const targetElement = document.querySelector(targetId);
							if (targetElement) {
									const elementPosition = targetElement.getBoundingClientRect().top;
									const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
									window.scrollTo({ top: offsetPosition, behavior: "smooth" });
							}
					});
			});
	}

	// --- Footer Current Year ---
	const yearSpan = document.getElementById('current-year');
	if (yearSpan) yearSpan.textContent = new Date().getFullYear();

	// --- Peek-a-boo Carousel Functionality ---
	const carousel = document.querySelector('.carousel');
	if (carousel) {
			const track = carousel.querySelector('.carousel-track');
			const slides = track ? Array.from(track.children) : [];
			const nextButton = carousel.querySelector('.carousel-button--right');
			const prevButton = carousel.querySelector('.carousel-button--left');
			const dotsNav = carousel.querySelector('.carousel-nav');
			let dots = [];
			let slideWidth = 0;
			let currentIndex = 0;

			const updateCarouselDimensions = () => {
					// Ensure slides and track exist before calculations
					if (!slides || slides.length === 0 || !track || !slides[0]) {
						console.warn("Carousel elements not found or empty during dimension update.");
						return;
					}
					const slideStyle = window.getComputedStyle(slides[0]);
					const slideMargin = parseFloat(slideStyle.marginLeft) + parseFloat(slideStyle.marginRight);
					slideWidth = slides[0].offsetWidth + slideMargin;

					// Added check for valid slideWidth
					if (isNaN(slideWidth) || slideWidth <= 0) {
						console.warn("Invalid slide width calculated:", slideWidth);
						// Optionally set a fallback width or just prevent moving
						return;
					}
					// console.log('Recalculated slideWidth:', slideWidth); // Debugging line
					moveToSlide(currentIndex, false); // Move without transition on resize/init
			};


			const moveToSlide = (targetIndex, useTransition = true) => {
					// Added checks for valid elements and targetIndex
					if (!track || !slides || slides.length === 0 || targetIndex < 0 || targetIndex >= slides.length) {
						console.warn("Cannot move to slide, invalid index or elements:", targetIndex);
						return;
					}
					// Ensure slideWidth is valid before calculating movement
					if (isNaN(slideWidth) || slideWidth <= 0) {
						console.warn("Cannot move slide, invalid slideWidth:", slideWidth);
						// Attempt to recalculate dimensions as a fallback
						updateCarouselDimensions();
						// If still invalid after recalc, exit
						if (isNaN(slideWidth) || slideWidth <= 0) return;
					}

					const amountToMove = slideWidth * targetIndex;
					// console.log(`Moving to index: ${targetIndex}, amount: ${amountToMove}px`); // Debugging line
					track.style.transition = useTransition ? `transform ${getComputedStyle(track).transitionDuration || '0.3s'} ease` : 'none';
					track.style.transform = `translateX(-${amountToMove}px)`;

					slides.forEach((slide, index) => {
							slide.classList.toggle('is-selected', index === targetIndex);
					});
					currentIndex = targetIndex;
					updateArrows();
					updateDots();
			};

			const updateArrows = () => {
					if (!prevButton || !nextButton || slides.length === 0) return;
					// console.log('Updating arrows, currentIndex:', currentIndex); // Debugging line
					prevButton.classList.toggle('is-hidden', currentIndex === 0);
					nextButton.classList.toggle('is-hidden', currentIndex >= slides.length - 1); // Use >= for safety
			};

			const createDots = () => {
					if (!dotsNav || !slides || slides.length === 0) return; // Check slides length
					dotsNav.innerHTML = '';
					dots = [];
					slides.forEach((_, index) => {
							const button = document.createElement('button');
							button.classList.add('carousel-indicator');
							button.setAttribute('aria-label', `Přejít na snímek ${index + 1}`); // Accessibility
							button.addEventListener('click', () => moveToSlide(index));
							dotsNav.appendChild(button);
							dots.push(button);
					});
					 updateDots(); // Update dots immediately after creation
			};

			const updateDots = () => {
					 if (!dotsNav || dots.length === 0) return;
					 dots.forEach((dot, index) => {
							 dot.classList.toggle('is-selected', index === currentIndex);
					 });
			};

			// --- Initialization ---
			if (slides.length > 0) {
					createDots(); // Create dots first

					// Use setTimeout to allow initial rendering, might help with layout calculations
					setTimeout(() => {
						updateCarouselDimensions();
						// moveToSlide(0, false); // This is called within updateCarouselDimensions
					}, 50);

					window.addEventListener('resize', debounce(updateCarouselDimensions, 250));

					if (prevButton) prevButton.addEventListener('click', () => moveToSlide(currentIndex - 1));
					if (nextButton) nextButton.addEventListener('click', () => moveToSlide(currentIndex + 1));

					// Optional: Add keyboard navigation
					carousel.addEventListener('keydown', (e) => {
						if (e.key === 'ArrowLeft') {
							e.preventDefault(); // Prevent page scroll
							moveToSlide(currentIndex - 1);
						} else if (e.key === 'ArrowRight') {
							e.preventDefault(); // Prevent page scroll
							moveToSlide(currentIndex + 1);
						}
					});
			} else {
				console.warn("Carousel track has no slides."); // Warn if no slides found
                // Optionally hide controls if there are no slides
                if(prevButton) prevButton.style.display = 'none';
                if(nextButton) nextButton.style.display = 'none';
                if(dotsNav) dotsNav.style.display = 'none';
			}
	}


	// --- Repertoire Filtering (Updated for Div Structure) ---
	const filterInput = document.getElementById('repertoire-filter');
	const repertoireList = document.querySelector('.repertoire-list'); // Target the container div

	if (filterInput && repertoireList) {
			function filterRepertoireListNow() {
					const filterText = filterInput.value.toLowerCase().trim();
					const repertoireItems = repertoireList.querySelectorAll('.repertoire-item'); // Get all items

					repertoireItems.forEach(item => {
							// Check text content of artist and title for a match
							const artistText = item.querySelector('.artist')?.textContent.toLowerCase() || '';
							const titleText = item.querySelector('.title')?.textContent.toLowerCase() || '';
							const match = artistText.includes(filterText) || titleText.includes(filterText);
							item.style.display = match ? '' : 'none'; // Show/hide the entire item div
					});
			}
			const debouncedFilter = debounce(filterRepertoireListNow, 300); // Use existing debounce
			filterInput.addEventListener('input', debouncedFilter);

			// Make controls visible if JS is enabled and input exists
			const controlsDiv = document.querySelector('.repertoire-controls');
			if (controlsDiv) controlsDiv.style.display = 'block'; // Or 'flex', 'grid' etc. depending on its styling
	}


	// --- Scroll Animations ---
	const animatedSections = document.querySelectorAll('.animated-section');
	if (animatedSections.length > 0) {
			const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
			const observerCallback = (entries, observer) => {
					entries.forEach(entry => {
							if (entry.isIntersecting) {
                                entry.target.classList.add('is-visible');
                                // Optional: Stop observing after animation triggered once
                                // observer.unobserve(entry.target);
                            }
							// else entry.target.classList.remove('is-visible'); // uncomment if you want animation on scroll up too
					});
			};
			const observer = new IntersectionObserver(observerCallback, observerOptions);
			animatedSections.forEach(section => observer.observe(section));
	}

});