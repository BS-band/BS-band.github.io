document.addEventListener('DOMContentLoaded', function() {

	// --- Mobile Menu Toggle ---
	const menuToggle = document.getElementById('menu-toggle');
	const navList = document.getElementById('nav-list');

	if (menuToggle && navList) {
			menuToggle.addEventListener('click', () => {
					navList.classList.toggle('active');
					menuToggle.classList.toggle('active');
					// Toggle ARIA attribute for accessibility
					const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
					menuToggle.setAttribute('aria-expanded', !isExpanded);
					// Optional: Prevent body scrolling when menu is open
					document.body.style.overflow = navList.classList.contains('active') ? 'hidden' : '';
			});

			// Close menu if clicking outside of it (optional, good for usability)
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

	// --- Smooth Scroll for Hero Button ---
	const scrollLink = document.querySelector('.scroll-link');
	if(scrollLink) {
			scrollLink.addEventListener('click', function(e) {
					e.preventDefault();
					const targetId = this.getAttribute('href'); // Gets #about
					const targetElement = document.querySelector(targetId);
					if (targetElement) {
							 // Calculate position considering header height
							const headerOffset = document.querySelector('.site-header').offsetHeight;
							const elementPosition = targetElement.getBoundingClientRect().top;
							const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

							window.scrollTo({
									top: offsetPosition,
									behavior: "smooth"
							});

							 // Close mobile menu if open after clicking a scroll link
							if (navList && navList.classList.contains('active')) {
									navList.classList.remove('active');
									menuToggle.classList.remove('active');
									menuToggle.setAttribute('aria-expanded', 'false');
									document.body.style.overflow = '';
							}
					}
			});
	}


	// --- Footer Current Year ---
	const yearSpan = document.getElementById('current-year');
	if (yearSpan) {
			yearSpan.textContent = new Date().getFullYear();
	}

});