document.addEventListener('DOMContentLoaded', function () {

	const debounce = (func, wait = 300) => {
		let timeout;
		return (...args) => {
			clearTimeout(timeout);
			timeout = setTimeout(() => func.apply(this, args), wait);
		};
	};

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
			const isClickInsideNav = navList.contains(event.target) || (event.target.closest && event.target.closest('.nav-list'));
			const isClickOnToggle = menuToggle.contains(event.target);

			if (!isClickInsideNav && !isClickOnToggle && navList.classList.contains('active')) {
				navList.classList.remove('active');
				menuToggle.classList.remove('active');
				menuToggle.setAttribute('aria-expanded', 'false');
				document.body.style.overflow = '';
			}
		});
	}

	const scrollLinks = document.querySelectorAll('.scroll-link');
	if (scrollLinks.length > 0) {
		const header = document.querySelector('.site-header');
		const headerHeight = header ? header.offsetHeight : 0;
		scrollLinks.forEach(link => {
			link.addEventListener('click', function (e) {
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

	const yearSpan = document.getElementById('current-year');
	if (yearSpan) yearSpan.textContent = new Date().getFullYear();

	const carousel = document.querySelector('.carousel');
	if (carousel) {
		const carouselViewport = carousel.querySelector('.carousel-viewport');
		const track = carousel.querySelector('.carousel-track');
		const originalSlides = Array.from(track?.children || []);
		const nextButton = carousel.querySelector('.carousel-button--right');
		const prevButton = carousel.querySelector('.carousel-button--left');
		const dotsNav = carousel.querySelector('.carousel-nav');

		if (!carouselViewport || !track || originalSlides.length === 0) {
			if (prevButton) prevButton.style.display = 'none';
			if (nextButton) nextButton.style.display = 'none';
			if (dotsNav) dotsNav.style.display = 'none';
		} else {
			let slideWidth = 0;
			let viewportWidth = 0;
			let slides = [];
			let currentIndex = 0;
			let actualIndex = 1;
			let isTransitioning = false;
			const cloneCount = 1;

			const setupCarousel = () => {
				if (originalSlides.length <= 1) {
					if (prevButton) prevButton.style.display = 'none';
					if (nextButton) nextButton.style.display = 'none';
					if (dotsNav) dotsNav.style.display = 'none';
					if (originalSlides.length === 1) {
						originalSlides[0].classList.add('is-selected');
						updateCarouselDimensions();
						if (!isNaN(viewportWidth) && !isNaN(slideWidth) && slideWidth > 0) {
							const singleSlideOffset = (viewportWidth - slideWidth) / 2;
							const slideStyle = window.getComputedStyle(originalSlides[0]);
							const slideMarginLeft = parseFloat(slideStyle.marginLeft) || 0;
							track.style.transform = `translateX(-${singleSlideOffset + slideMarginLeft}px)`;
						}
					}
					return;
				}

				for (let i = 0; i < cloneCount; i++) {
					const clone = originalSlides[originalSlides.length - 1 - i].cloneNode(true);
					clone.classList.add('is-clone');
					track.insertBefore(clone, track.firstChild);
				}
				for (let i = 0; i < cloneCount; i++) {
					const clone = originalSlides[i].cloneNode(true);
					clone.classList.add('is-clone');
					track.appendChild(clone);
				}

				slides = Array.from(track.children);
				actualIndex = cloneCount;

				createDots();
				updateCarouselDimensions();
				positionTrack(false);
				track.addEventListener('transitionend', handleTransitionEnd);
			};

			const updateCarouselDimensions = () => {
				const referenceSlide = slides[cloneCount];
				if (!referenceSlide) return;
				const slideStyle = window.getComputedStyle(referenceSlide);
				const slideMarginLeft = parseFloat(slideStyle.marginLeft) || 0;
				const slideMarginRight = parseFloat(slideStyle.marginRight) || 0;
				const slideElementWidth = referenceSlide.offsetWidth;
				slideWidth = slideElementWidth + slideMarginLeft + slideMarginRight;
				viewportWidth = carouselViewport.offsetWidth;
			};

			const positionTrack = (useTransition = true) => {
				if (isNaN(slideWidth) || slideWidth <= 0 || isNaN(viewportWidth) || viewportWidth <= 0) {
					updateCarouselDimensions();
					if (isNaN(slideWidth) || slideWidth <= 0 || isNaN(viewportWidth) || viewportWidth <= 0) return;
				}
				const amountToMove = (slideWidth * actualIndex) + (slideWidth / 2) - (viewportWidth / 2);
				track.style.transition = useTransition ? `transform var(--transition-speed-medium) cubic-bezier(0.65, 0.05, 0.36, 1)` : 'none';
				track.style.transform = `translateX(-${amountToMove}px)`;
				updateSlideClasses();
			};

			const updateSlideClasses = () => {
				slides.forEach((slide, index) => {
					slide.classList.toggle('is-selected', index === actualIndex);
					slide.setAttribute('aria-hidden', index !== actualIndex);
					slide.querySelectorAll('a, button, iframe').forEach(el => {
						el.tabIndex = (index === actualIndex) ? 0 : -1;
					});
				});
				updateDots();
			};

			const moveTo = (direction) => {
				if (isTransitioning || slides.length <= (cloneCount * 2)) return;
				isTransitioning = true;
				actualIndex += direction;
				currentIndex = (actualIndex - cloneCount + originalSlides.length) % originalSlides.length;
				positionTrack(true);
			};

			const handleTransitionEnd = () => {
				isTransitioning = false;
				if (slides[actualIndex] && slides[actualIndex].classList.contains('is-clone')) {
					const newOriginalIndex = (actualIndex - cloneCount + originalSlides.length) % originalSlides.length;
					actualIndex = newOriginalIndex + cloneCount;
					positionTrack(false);
				}
			};

			const createDots = () => {
				if (!dotsNav || originalSlides.length <= 1) {
					if (dotsNav) dotsNav.style.display = 'none';
					return;
				}
				dotsNav.style.display = 'flex';
				dotsNav.innerHTML = '';
				originalSlides.forEach((_, index) => {
					const button = document.createElement('button');
					button.classList.add('carousel-indicator');
					button.setAttribute('aria-label', `Přejít na snímek ${index + 1} z ${originalSlides.length}`);
					button.addEventListener('click', () => {
						if (isTransitioning || index === currentIndex) return;
						isTransitioning = true;
						currentIndex = index;
						actualIndex = index + cloneCount;
						positionTrack(true);
					});
					dotsNav.appendChild(button);
				});
				updateDots();
			};

			const updateDots = () => {
				if (!dotsNav) return;
				const dots = Array.from(dotsNav.children);
				dots.forEach((dot, index) => {
					dot.classList.toggle('is-selected', index === currentIndex);
				});
			};

			setupCarousel();

			const debouncedResize = debounce(() => {
				if (slides.length > (cloneCount * 2)) {
					updateCarouselDimensions();
					positionTrack(false);
				} else if (originalSlides.length === 1) {
					updateCarouselDimensions();
					if (!isNaN(viewportWidth) && !isNaN(slideWidth) && slideWidth > 0) {
						const singleSlideOffset = (viewportWidth - slideWidth) / 2;
						const slideStyle = window.getComputedStyle(originalSlides[0]);
						const slideMarginLeft = parseFloat(slideStyle.marginLeft) || 0;
						track.style.transform = `translateX(-${singleSlideOffset + slideMarginLeft}px)`;
					}
				}
			}, 250);
			window.addEventListener('resize', debouncedResize);

			if (prevButton) prevButton.addEventListener('click', () => moveTo(-1));
			if (nextButton) nextButton.addEventListener('click', () => moveTo(1));

			carousel.setAttribute('tabindex', '0');
			carousel.addEventListener('keydown', (e) => {
				if (e.key === 'ArrowLeft') {
					e.preventDefault();
					moveTo(-1);
				} else if (e.key === 'ArrowRight') {
					e.preventDefault();
					moveTo(1);
				}
			});
		}
	}

	const repertoireData = [
		{ artist: '4 Non Blondes', title: 'What`s Up', style: 'ploužák' },
		{ artist: 'AC/DC', title: 'Highway to Hell', style: 'rock' },
		{ artist: 'AC/DC', title: 'T.N.T.', style: 'rock' },
		{ artist: 'AC/DC', title: 'You shook me all night long', style: 'rock' },
		{ artist: 'Aleš Brichta', title: 'Dívka s perlami ve vlasech', style: 'ploužák' },
		{ artist: 'Alkehol', title: 'Spalovač chlastu', style: 'rock' },
		{ artist: 'Aneta Langerová', title: 'Voda živá', style: 'ploužák' },
		{ artist: 'Arakain', title: 'Zimní královna', style: 'ploužák' },
		{ artist: 'Argema', title: 'Jarošovský pivovar', style: 'valčík' },
		{ artist: 'Argema (Smokie)', title: 'Prohrát není žádná hanba', style: 'poprock' },
		{ artist: 'Blue Effect', title: 'Sluneční hrob', style: 'ploužák' },
		{ artist: 'Bobr a motýl', title: 'Vyznání', style: 'ploužák' },
		{ artist: 'Bonesaver', title: 'Naše první kapela', style: 'poprock' },
		{ artist: 'Bonesaver', title: 'Vyhnanec času', style: 'ploužák' },
		{ artist: 'Bonesaver', title: 'Já piju dál', style: 'rockNroll' },
		{ artist: 'Bonesaver', title: 'Protože chcem', style: 'rock' },
		{ artist: 'Bonesaver', title: 'Nedostanu metál za metal', style: 'rock' },
		{ artist: 'Bonesaver', title: 'Růže', style: 'ploužák' },
		{ artist: 'Bonesaver', title: 'Mlhavá rána', style: 'poprock' },
		{ artist: 'Bonesaver', title: 'Balada o hladovém strýci', style: 'rock' },
		{ artist: 'Bonesaver', title: 'CampNRoll', style: 'rockNroll' },
		{ artist: 'Bonesaver', title: 'GrowYourOwn', style: 'rock' },
		{ artist: 'Bonesaver', title: 'Ješitnost', style: 'rock' },
		{ artist: 'Bonesaver', title: 'Krtek', style: 'rock' },
		{ artist: 'Bonesaver', title: 'O svobodě', style: 'rock' },
		{ artist: 'Bonesaver', title: 'Pomsta bábě', style: 'punkrock' },
		{ artist: 'Bonesaver', title: 'Prase', style: 'reggae' },
		{ artist: 'Bonesaver', title: 'Stal se z něho maniak', style: 'ploužák' },
		{ artist: 'Brichta Aleš', title: 'Slečna závist', style: 'poprock' },
		{ artist: 'Brichta Aleš', title: 'Nechte vlajky vlát', style: 'rock' },
		{ artist: 'Brutus', title: 'Dlažební kostka', style: 'rock' },
		{ artist: 'Bryan Adams', title: 'Summer of 69', style: 'rock' },
		{ artist: 'Bryan Adams', title: 'Please Forgive Me', style: 'ploužák' },
		{ artist: 'Buty', title: 'Nad stádem koní', style: 'ploužák' },
		{ artist: 'Čejka band', title: 'Večerníček', style: 'ploužák' },
		{ artist: 'Černoch Karel', title: 'Zrcadlo', style: 'poprock' },
		{ artist: 'Daniel Landa', title: 'Holky a mašiny', style: 'rock' },
		{ artist: 'Deep Purple', title: 'Smoke on The Water', style: 'rock' },
		{ artist: 'DefLeBart', title: 'Vyletěl mozek z lebky', style: 'rock' },
		{ artist: 'Divokej Bill', title: 'Plakala', style: 'country rock' },
		{ artist: 'Doctor PP', title: 'Whisky co má šťávu', style: 'rock' },
		{ artist: 'Eagles', title: 'Hotel California', style: 'country rock' },
		{ artist: 'Eva Olmerová', title: 'Čekej tiše (Waltz)', style: 'Waltz' },
		{ artist: 'František Kmoch', title: 'Po starodávnu', style: 'mazurka' },
		{ artist: 'Garáž/Plastic people of The Universe', title: 'Muchomůrky bílé', style: 'ploužák' },
		{ artist: 'GunsNRoses', title: 'Knocking on heavens door', style: 'ploužák' },
		{ artist: 'Halestorm', title: 'Bad Romance', style: 'rock' },
		{ artist: 'Harlej', title: 'Svařák', style: 'rock' },
		{ artist: 'Harlej', title: 'Přirození', style: 'rock' },
		{ artist: 'Harlej', title: 'Strážní andělé', style: 'rock' },
		{ artist: 'Harlej', title: 'Pověste ho vejš', style: 'country rock' },
		{ artist: 'Harlej', title: 'Až tady jednou nebudu', style: 'rock' },
		{ artist: 'Harlej', title: 'Proč pocit mám', style: 'rock' },
		{ artist: 'Helloween', title: 'I want out', style: 'rock' },
		{ artist: 'Honza Nedvěd', title: 'Stánky', style: 'country' },
		{ artist: 'Horkýže slíže', title: 'L.A.G. Song', style: 'rock' },
		{ artist: 'Horkýže slíže', title: 'Malá Žužu', style: 'rock' },
		{ artist: 'Hudba Praha', title: 'Máma - táta', style: 'rock' },
		{ artist: 'Hudba Praha', title: 'Špinavý záda (Na Žofíně)', style: 'rock' },
		{ artist: 'Chinaski', title: '1970', style: 'poprock' },
		{ artist: 'Chinaski', title: 'Slovenský klín', style: 'ploužák' },
		{ artist: 'Chinaski', title: 'Punčocháče', style: 'rock' },
		{ artist: 'Chinaski', title: 'Vinárna u Valdštejna', style: 'ploužák' },
		{ artist: 'Ivan Hlas', title: 'Jednou mi fotr povídá', style: 'rockNroll' },
		{ artist: 'Ivan Hlas', title: 'Malagelo', style: 'country rock' },
		{ artist: 'Ivan Hlas', title: 'RockNRoll pro Beethovena', style: 'rockNroll' },
		{ artist: 'Ivan Mládek', title: 'Když je v Praze hic', style: 'foxtrot' },
		{ artist: 'Já jsem Aleš', title: 'Tři sestry', style: 'rock' },
		{ artist: 'Janek Ledecký', title: 'Na ptáky jsme krátký', style: 'poprock' },
		{ artist: 'Jarda Hypochondr', title: 'Archivní', style: 'poprock' },
		{ artist: 'Jarda Hypochondr', title: 'Šenkýřka', style: 'pop' },
		{ artist: 'Jiří Schelinger', title: 'Jahody mražený', style: 'poprock' },
		{ artist: 'Joan Jett', title: 'I love Rock N Roll', style: 'rock' },
		{ artist: 'Kabát', title: 'Šaman', style: 'rock' },
		{ artist: 'Kabát', title: 'Pohoda', style: 'rock' },
		{ artist: 'Kabát', title: 'Balada o špinavejch fuseklých', style: 'ploužák' },
		{ artist: 'Kabát', title: 'Houby magický', style: 'poprock' },
		{ artist: 'Kabát', title: 'V pekle sudy válej', style: 'rock' },
		{ artist: 'Kabát', title: 'Malá dáma', style: 'rock' },
		{ artist: 'Kabát', title: 'Láďa má velkou hlavu', style: 'rock' },
		{ artist: 'Kabát', title: 'Žízeň', style: 'rock' },
		{ artist: 'Kapitán Demo', title: 'Zlatíčka', style: 'disco' },
		{ artist: 'Karel Gott', title: 'Trezor', style: 'poprock' },
		{ artist: 'Karel Hašler', title: 'Vltavo, Vltavo', style: 'waltz' },
		{ artist: 'Karel Vacek', title: 'Fůra slámy', style: 'polka' },
		{ artist: 'Karel Vacek', title: 'Nikdy se nevrátí pohádka mládí', style: 'tango' },
		{ artist: 'Katapult', title: 'Až', style: 'rock' },
		{ artist: 'Katapult', title: 'Smutná nevěsta', style: 'poprock' },
		{ artist: 'Katapult', title: 'Já nesnídám sám', style: 'ploužák' },
		{ artist: 'Katapult', title: 'Blues opuštěný postele', style: 'poprock' },
		{ artist: 'Katapult', title: 'Někdy příště', style: 'rock' },
		{ artist: 'Katapult', title: 'Vojín XY hlásí příchod', style: 'ploužák' },
		{ artist: 'Keks', title: 'Víš', style: 'ploužák' },
		{ artist: 'Keks', title: 'Proč holky pláčou', style: 'ploužák' },
		{ artist: 'Kiss', title: 'I was made for loving you', style: 'rock' },
		{ artist: 'Kryštof', title: 'Inzerát', style: 'poprock' },
		{ artist: 'Lady Gaga', title: 'Shallow', style: 'ploužák' },
		{ artist: 'Lidová', title: 'Pivovarští koně', style: 'polka' },
		{ artist: 'Lidová', title: 'Sukýnka', style: 'valčík' },
		{ artist: 'Lidová', title: 'Za tů horů', style: 'valčík' },
		{ artist: 'Lidová', title: 'Na tý louce zelený', style: 'valčík' },
		{ artist: 'Lidová', title: 'Mysliveček (polka směs)', style: 'polka/čardáš' },
		{ artist: 'Lidová', title: 'Já jsem malý mysliveček', style: 'valčík' },
		{ artist: 'Luboš Pospíšil', title: 'Tak Vznikla Zem', style: 'ploužák' },
		{ artist: 'Lucie', title: 'Panic', style: 'ploužák' },
		{ artist: 'Lucie', title: 'Sen', style: 'ploužák' },
		{ artist: 'Lucie', title: 'Šťastnej chlap', style: 'rock' },
		{ artist: 'Lucie', title: 'Amerika', style: 'ploužák' },
		{ artist: 'Mandrage', title: 'Šrouby a matice', style: 'ploužák' },
		{ artist: 'Mandrage', title: 'Hledá se žena', style: 'pop rock' },
		{ artist: 'Metallica', title: 'Whisky in the Jar', style: 'rock' },
		{ artist: 'Metallica', title: 'Nothing Else Matters', style: 'ploužák' },
		{ artist: 'Michal David', title: 'Poupata', style: 'pop' },
		{ artist: 'Michal David', title: 'Nonstop', style: 'poprock' },
		{ artist: 'Michal David', title: 'Každý mi tě lásko závidí', style: 'ploužák' },
		{ artist: 'Michal David', title: 'Pár přátel', style: 'ploužák' },
		{ artist: 'Michal Prokop', title: 'Blues o spolykaných slovech', style: 'ploužák' },
		{ artist: 'Michal Šindelář', title: 'Hořely, padaly hvězdy', style: 'ploužák' },
		{ artist: 'Michal Širl', title: 'Malá Baletka', style: 'valčík' },
		{ artist: 'Mňága a Žďorp', title: 'I cesta může být cíl', style: 'poprock' },
		{ artist: 'Mňága a Žďorp', title: 'Písnička pro tebe', style: 'country rock' },
		{ artist: 'Moonlight shadow', title: 'Mike Oldfield', style: 'poprock' },
		{ artist: 'Morčata na útěku', title: 'Hledá se děda', style: 'rock' },
		{ artist: 'Nedvědi', title: 'Kočovní herci', style: 'folk a country' },
		{ artist: 'Nedvědi', title: 'Ptáčata', style: 'folk a country' },
		{ artist: 'Nedvědi', title: 'Podvod', style: 'folk a country' },
		{ artist: 'Nedvědi', title: 'Kohout', style: 'folk a country' },
		{ artist: 'Nedvědi', title: 'Frankie Dlouhán', style: 'folk a country' },
		{ artist: 'Neto', title: 'Srdce v ruce mám', style: 'poprock' },
		{ artist: 'Neznámý autor', title: 'Ptačí tanec', style: 'fogl dance' },
		{ artist: 'Nirvana', title: 'Smels Like Teen Spirit', style: 'punkrock' },
		{ artist: 'No name', title: 'Žily', style: 'poprock' },
		{ artist: 'Odyssea', title: 'Divadelní společnost JK Tyla', style: 'ploužák' },
		{ artist: 'Odyssea', title: 'Kamna kouří', style: 'rockNroll' },
		{ artist: 'Olympic', title: 'Okno mé lásky', style: 'ploužák' },
		{ artist: 'Olympic', title: 'Dej mi víc své lásky', style: 'poprock' },
		{ artist: 'Olympic', title: 'Želva', style: 'poprock' },
		{ artist: 'Olympic (Petr Janda solo)', title: 'Stejskání', style: 'ploužák' },
		{ artist: 'Orlík', title: 'Bílej jezdec', style: 'rock' },
		{ artist: 'Petra Černocká', title: 'Saxana', style: 'pop' },
		{ artist: 'Petra Janů, Petr Janda', title: 'Jedeme dál', style: 'poprock' },
		{ artist: 'Pink', title: 'Try', style: 'poprock' },
		{ artist: 'Pink Floyd', title: 'Wish You Were Here', style: 'ploužák' },
		{ artist: 'Plexis', title: 'Svět jsou jen báry', style: 'pop rock' },
		{ artist: 'pohádka (Uhlíř, Svěrák)', title: 'Statistika', style: 'pop' },
		{ artist: 'pohádka (Uhlíř, Svěrák)', title: 'Dělání', style: 'pop' },
		{ artist: 'pohádka (Uhlíř, Svěrák)', title: 'Hlupáku, najdu tě', style: 'pop' },
		{ artist: 'Premier', title: 'Hrobař', style: 'rock' },
		{ artist: 'Queen', title: 'We Will Rock You', style: 'rock' },
		{ artist: 'Rangers', title: 'Zvedněte kotvy', style: 'folk' },
		{ artist: 'Ready Kirken', title: 'Zejtra mám', style: 'poprock' },
		{ artist: 'Richard Müller', title: 'Srdce jako kníže Rohan', style: 'pop' },
		{ artist: 'Rybičky 48', title: 'Léto', style: 'reggae' },
		{ artist: 'Rybičky 48', title: 'Ženy', style: 'ploužák' },
		{ artist: 'Rybičky 48', title: 'Američan z Poličan', style: 'rock' },
		{ artist: 'Rybičky 48', title: 'Slibuju, že nebudu pít', style: 'rock' },
		{ artist: 'Rybičky 48', title: 'Zamilovaný/nešťastná', style: 'rock' },
		{ artist: 'Rybičky 48', title: 'My ještě nejsme starý', style: 'rock' },
		{ artist: 'Rybičky 48', title: 'Muži', style: 'poprock' },
		{ artist: 'Semtex', title: 'Mašinka', style: 'poprock' },
		{ artist: 'Smokie/Karel Zich', title: 'Alenka v říši divů', style: 'poprock' },
		{ artist: 'Sunrise Avenue', title: 'Hollwood Hills', style: 'poprock' },
		{ artist: 'Svěrák, Uhlíř', title: 'Severní vítr', style: 'waltz' },
		{ artist: 'Škwor', title: 'Síla starejch vín', style: 'ploužák' },
		{ artist: 'Škwor', title: 'Máme tu problém', style: 'ploužák' },
		{ artist: 'The Clash', title: 'Should I stay or should I go', style: 'punkrock' },
		{ artist: 'The Cure', title: 'Fiday I am in love', style: 'poprock' },
		{ artist: 'Tina Turner', title: 'The Best', style: 'rock' },
		{ artist: 'Traktor', title: 'Kdy dojdou náboje a vzduch', style: 'rock' },
		{ artist: 'Traktor', title: 'Letokruhy', style: 'rock' },
		{ artist: 'Tři sestry', title: 'Lidojedi', style: 'rock' },
		{ artist: 'Tři sestry', title: 'Sovy v mazutu', style: 'folk' },
		{ artist: 'Tři sestry', title: 'Večírek', style: 'polka' },
		{ artist: 'Tři sestry', title: 'Piánovka (Láďa jede autobusem)', style: 'country rock' }
	];

	const filterInput = document.getElementById('repertoire-filter');
	const tableBody = document.getElementById('repertoire-tbody');
	const sentinel = document.getElementById('load-more-sentinel');
	const loadingIndicator = document.getElementById('loading-indicator');
	const initialLoadingRow = document.getElementById('initial-loading-row');

	const ITEMS_PER_PAGE = 75;
	let currentOffset = 0;
	let currentFilteredData = [...repertoireData];
	let isLoading = false;
	let observer;

	function renderTableRows(items, append = false) {
		if (!tableBody) return;

		if (!append) {
			tableBody.innerHTML = '';
			currentOffset = 0;
		}

		if (!append && initialLoadingRow && tableBody.contains(initialLoadingRow)) {
			tableBody.removeChild(initialLoadingRow);
		}

		const fragment = document.createDocumentFragment();
		items.forEach(item => {
			const tr = document.createElement('tr');
			tr.innerHTML = `
				<td>${item.artist}</td>
				<td>${item.title}</td>
				<td>${item.style}</td>
			`;
			fragment.appendChild(tr);
		});

		tableBody.appendChild(fragment);
		currentOffset += items.length;

		if (currentOffset >= currentFilteredData.length) {
			if (observer && sentinel) observer.unobserve(sentinel);
		} else {
			if (observer && sentinel && !isLoading) {
				observer.observe(sentinel);
			}
		}
	}

	function addNoResultsMessage() {
		if (!tableBody) return;
		tableBody.innerHTML = '';
		const tr = document.createElement('tr');
		tr.innerHTML = `<td colspan="3" class="no-results-cell">Žádné písně neodpovídají filtru.</td>`;
		tableBody.appendChild(tr);
	}

	function removeNoResultsMessage() {
		const noResultsRow = tableBody?.querySelector('.no-results-cell');
		if (noResultsRow) noResultsRow.parentElement.remove();
	}

	function addLoadingIndicatorRow() {
		if (!tableBody || tableBody.querySelector('.loading-cell')) return;
		const tr = document.createElement('tr');
		tr.innerHTML = `<td colspan="3" class="loading-cell"><i class="fas fa-spinner fa-spin"></i> Načítání...</td>`;
		tableBody.appendChild(tr);
	}

	function removeLoadingIndicatorRow() {
		const loadingRow = tableBody?.querySelector('.loading-cell');
		if (loadingRow) loadingRow.parentElement.remove();
	}

	function loadMoreItems() {
		if (isLoading || currentOffset >= currentFilteredData.length) {
			return;
		}

		isLoading = true;
		if (loadingIndicator) loadingIndicator.style.display = 'block';

		const nextChunk = currentFilteredData.slice(currentOffset, currentOffset + ITEMS_PER_PAGE);
		renderTableRows(nextChunk, true);
		isLoading = false;
		if (loadingIndicator) loadingIndicator.style.display = 'none';
	}

	function handleFilter() {
		const filterText = filterInput.value.toLowerCase().trim();

		currentFilteredData = filterText
			? repertoireData.filter(item =>
				item.artist.toLowerCase().includes(filterText) ||
				item.title.toLowerCase().includes(filterText) ||
				item.style.toLowerCase().includes(filterText)
			)
			: [...repertoireData];

		isLoading = false;
		removeNoResultsMessage();

		if (observer && sentinel) {
			observer.unobserve(sentinel);
		}

		if (currentFilteredData.length === 0) {
			addNoResultsMessage();
		} else {
			const initialChunk = currentFilteredData.slice(0, ITEMS_PER_PAGE);
			renderTableRows(initialChunk, false);
			if (observer && sentinel && currentFilteredData.length > ITEMS_PER_PAGE) {
				observer.observe(sentinel);
			}
		}
	}

	if (filterInput && tableBody && sentinel) {
		if (initialLoadingRow && tableBody.contains(initialLoadingRow)) {
			tableBody.removeChild(initialLoadingRow);
		}

		const initialChunk = currentFilteredData.slice(0, ITEMS_PER_PAGE);
		renderTableRows(initialChunk, false);

		const observerOptions = {
			root: null,
			rootMargin: '0px',
			threshold: 0.1
		};

		observer = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting && !isLoading) {
				loadMoreItems();
			}
		}, observerOptions);

		if (currentFilteredData.length > ITEMS_PER_PAGE) {
			observer.observe(sentinel);
		}

		filterInput.addEventListener('input', debounce(handleFilter, 350));

	} else {
		console.error("Required elements for repertoire table/lazy loading not found.");
		if (tableBody) {
			if (initialLoadingRow && tableBody.contains(initialLoadingRow)) {
				tableBody.removeChild(initialLoadingRow);
			}
			tableBody.innerHTML = `<tr><td colspan="3" style="color: red; text-align: center; padding: 2rem;">Chyba: Nepodařilo se inicializovat tabulku repertoáru.</td></tr>`;
		}
	}

	const animatedSections = document.querySelectorAll('.animated-section');
	if (animatedSections.length > 0) {
		const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
		const scrollObserver = new IntersectionObserver((entries, obs) => {
			entries.forEach(entry => {
				if (entry.target.id === 'repertoire-table-section') return;

				if (entry.isIntersecting) {
					entry.target.classList.add('is-visible');
				}
			});
		}, observerOptions);
		animatedSections.forEach(section => scrollObserver.observe(section));
	}

	// Contact Form Submission Handler
	const contactForms = document.querySelectorAll('.contact-form');
	contactForms.forEach(form => {
		form.addEventListener('submit', function (e) {
			e.preventDefault();
			const submitBtn = form.querySelector('button[type="submit"]');
			const originalBtnText = submitBtn.textContent;

			// Simulate sending
			submitBtn.disabled = true;
			submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Odesílám...';

			setTimeout(() => {
				// Show success message
				const successMessage = document.createElement('div');
				successMessage.className = 'form-success-message';
				successMessage.innerHTML = `
					<div class="success-content">
						<i class="fas fa-check-circle"></i>
						<p>Děkujeme! Vaše poptávka byla úspěšně odeslána. Brzy se vám ozveme.</p>
					</div>
				`;

				// Hide form and show message
				form.style.display = 'none';
				form.parentNode.insertBefore(successMessage, form.nextSibling);

				// Reset form for next time
				form.reset();
				submitBtn.disabled = false;
				submitBtn.textContent = originalBtnText;

				// Remove success message and show form again after some time
				setTimeout(() => {
					successMessage.style.opacity = '0';
					successMessage.style.transition = 'opacity 0.5s ease';
					setTimeout(() => {
						successMessage.remove();
						form.style.display = 'block';
						form.style.opacity = '0';
						setTimeout(() => {
							form.style.transition = 'opacity 0.5s ease';
							form.style.opacity = '1';
						}, 50);
					}, 500);
				}, 5000);
			}, 1500);
		});
	});

});