console.clear();

gsap.registerPlugin(ScrollTrigger);

//  bgm control
let audioInitialized = false;

function initializeAudio() {
    const audio = document.getElementById('backgroundMusic');
    const toggleButton = document.getElementById('audioToggle');
    const audioIcon = document.getElementById('audioIcon');

    if (!audio || !toggleButton) return;

    // initial volume
    audio.volume = 0.3;

    // Make audio button draggable
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };
    let hasMoved = false;

    function makeDraggable(element) {
        element.addEventListener('mousedown', startDrag);
        element.addEventListener('touchstart', startDrag, { passive: false });
        
        function startDrag(e) {
            e.preventDefault();
            isDragging = true;
            hasMoved = false;
            
            const rect = element.getBoundingClientRect();
            const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
            const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
            
            dragOffset.x = clientX - rect.left;
            dragOffset.y = clientY - rect.top;
            
            element.style.transition = 'none';
            element.style.cursor = 'grabbing';
            
            document.addEventListener('mousemove', drag);
            document.addEventListener('touchmove', drag, { passive: false });
            document.addEventListener('mouseup', stopDrag);
            document.addEventListener('touchend', stopDrag);
        }
        
        function drag(e) {
            if (!isDragging) return;
            
            e.preventDefault();
            hasMoved = true;
            
            const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
            const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
            
            let newX = clientX - dragOffset.x;
            let newY = clientY - dragOffset.y;
            
            // Constrain within viewport boundaries
            const buttonSize = 60; 
            const maxX = window.innerWidth - buttonSize;
            const maxY = window.innerHeight - buttonSize;
            
            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));
            
            element.style.left = newX + 'px';
            element.style.top = newY + 'px';
            element.style.right = 'auto';
            element.style.bottom = 'auto';
        }
        
        function stopDrag() {
            if (isDragging) {
                isDragging = false;
                element.style.transition = 'all 0.3s ease';
                element.style.cursor = 'grab';
                
                document.removeEventListener('mousemove', drag);
                document.removeEventListener('touchmove', drag);
                document.removeEventListener('mouseup', stopDrag);
                document.removeEventListener('touchend', stopDrag);
                
                if (hasMoved) {
                    setTimeout(() => {
                        hasMoved = false;
                    }, 50);
                }
            }
        }
        
        element.style.cursor = 'grab';
    }

    // Initialize draggable functionality
    makeDraggable(toggleButton);

    // Toggle audio function
    function toggleAudio(e) {
        // prevent toggle if user just finished dragging
        if (hasMoved) {
            e.preventDefault();
            return;
        }
        
        if (audio.paused) {
            audio.play().then(() => {
                audioIcon.className = 'fas fa-volume-up';
                toggleButton.classList.remove('muted');
            }).catch(e => {
                console.log('Audio play failed:', e);
            });
        } else {
            audio.pause();
            audioIcon.className = 'fas fa-volume-mute';
            toggleButton.classList.add('muted');
        }
    }

    toggleButton.addEventListener('click', toggleAudio);

    function startAudioOnInteraction() {
        if (!audioInitialized) {
            audio.play().then(() => {
                audioInitialized = true;
                audioIcon.className = 'fas fa-volume-up';
                toggleButton.classList.remove('muted');

                document.removeEventListener('click', startAudioOnInteraction);
                document.removeEventListener('scroll', startAudioOnInteraction);
            }).catch(e => {
                console.log('Auto-play failed, user interaction required');
            });
        }
    }

    // Listen for user interactions to start audio
    document.addEventListener('click', startAudioOnInteraction);
    document.addEventListener('scroll', startAudioOnInteraction);

    // initial muted state
    toggleButton.classList.add('muted');
    audioIcon.className = 'fas fa-volume-mute';
}

document.addEventListener('DOMContentLoaded', () => {

    // Configuration for Chrome's viewport height compatibility
    const stickyCards = document.querySelector('.sticky-cards');
    if (stickyCards) {
        const setHeight = () => {
            stickyCards.style.height = `${window.innerHeight}px`;
        };
        setHeight();
        window.addEventListener('resize', setHeight);
    }

    // Initialize audio controls
    initializeAudio();

    // floating particles - letter section
    function createParticles() {
        const particlesContainer = document.querySelector('.particles-container');
        if (!particlesContainer) return;

        const particleConfig = {
            count: 30,        
            minSize: 15,     
            maxSize: 50,     
            minDuration: 5,  
            maxDuration: 10,  
            maxDelay: 10            
        };

        // clear existing particles
        particlesContainer.innerHTML = '';

        // generate particles
        for (let i = 0; i < particleConfig.count; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');

            // random size
            const size = Math.random() * (particleConfig.maxSize - particleConfig.minSize) + particleConfig.minSize;
            
            // random position
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            
            // random timing
            const duration = Math.random() * (particleConfig.maxDuration - particleConfig.minDuration) + particleConfig.minDuration;
            const delay = Math.random() * particleConfig.maxDelay;

            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${x}%`;
            particle.style.top = `${y}%`;
            particle.style.animationDuration = `${duration}s`;
            particle.style.animationDelay = `${delay}s`;

            particlesContainer.appendChild(particle);
        }
    }

    // create particles when page loads
    createParticles();

    // initialize smooth scrolling
    const lenis = new Lenis();

    lenis.on("scroll", ScrollTrigger.update);

    // sync animation frames
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    const cards = gsap.utils.toArray(".card");

    const rotations = [-12, 10, -5, 5, -5, -2];

    // initial card setup
    cards.forEach((card, index) => {
        gsap.set(card, {
            y: window.innerHeight,
            rotate: rotations[index],
        });
    });

    // main timeline that handles everything
    const mainTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: ".wrapper",
            start: "top top",
            end: `+=${window.innerHeight * 10}px`,
            scrub: 1,
            pin: true,
            pinSpacing: true,
            markers: false,
            onUpdate: (self) => {
                // Handle card animations during scroll
                const progress = self.progress;
                const totalCards = cards.length;
                
                // Cards animation starts at 20% of total scroll progress
                const cardsStartProgress = 0.2;
                const cardsEndProgress = 1;
                const cardsScrollRange = cardsEndProgress - cardsStartProgress;
                
                if (progress >= cardsStartProgress) {
                    const cardsProgress = (progress - cardsStartProgress) / cardsScrollRange;
                    const progressPerCard = 1 / totalCards;

                    // Animate each card individually
                    cards.forEach((card, index) => {
                        const cardStart = index * progressPerCard;
                        let cardProgress = (cardsProgress - cardStart) / progressPerCard;
                        cardProgress = Math.min(Math.max(cardProgress, 0), 1);

                        // Base vertical animation (bottom to center)
                        let yPos = window.innerHeight * (1 - cardProgress);
                        let xPos = 0;

                        // Diagonal movement when card is "done"
                        if (cardProgress === 1 && index < totalCards - 1) {
                            const remainingProgress = (cardsProgress - (cardStart + progressPerCard)) / (1 - (cardStart + progressPerCard));

                            if (remainingProgress > 0) {
                                const distanceMultiplier = 1 - index * 0.15;
                                xPos = -window.innerWidth * 0.3 * distanceMultiplier * remainingProgress;
                                yPos = -window.innerHeight * 0.3 * distanceMultiplier * remainingProgress;
                            }
                        }

                        // Apply position updates
                        gsap.to(card, {
                            y: yPos,
                            x: xPos,
                            duration: 0,
                            ease: "none",
                        });
                    });
                }
            }
        }
    });

    // landing image zoom animation (happens first)
    mainTimeline.to(".landing", {
        scale: 9,
        z: 350,
        transformOrigin: "center center",
        ease: "power1.inOut",
        duration: 3
    })
    // sticky-cards background scale (happens at same time as image zoom)
    .to(".sticky-cards", {
        scale: 1.1,
        transformOrigin: "center center",
        ease: "power1.inOut",
        duration: 3
    }, 0) 

    .to({}, {
        duration: 7
    });

    // Setup sticky text (after main timeline)
    // initial setup for sticky text items
    gsap.set(".section-item", {
        opacity: 0,
        scale: 0.5,
        y: 100,
    });
    gsap.set(".section-item:first-child", {
        opacity: 1,
        scale: 1,
        y: 0,
    });

    // sticky text animation timeline
    const stickyTextTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: ".sticky-scroll",
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            pin: ".section-wrapp",
            pinSpacing: true,
            markers: false,
            id: "sticky-text"
        }
    });

    // add sticky text animations
    const items = document.querySelectorAll(".section-item");
    
    items.forEach((item, index) => {
        if (index > 0) {
            stickyTextTimeline.to(items[index - 1], {
                opacity: 0,
                scale: 0.5,
                y: -100,
                ease: "none"
            });
        }
        
        // show current element
        stickyTextTimeline.to(item, {
            opacity: 1,
            scale: 1,
            y: 0,
            ease: "none"
        }, "-=0.9");
        
        // hide current element if not the last one
        if (index < items.length - 1) {
            stickyTextTimeline.to(item, {
                opacity: 0,
                scale: 0.5,
                y: -100,
                ease: "none"
            }, "-=0.4");
        }
    });

    ScrollTrigger.refresh();
});



//envelope section
const wrap = document.querySelector('.envelope-wrapper');
const seal = wrap.querySelector('.envelope-seal');
const letter = wrap.querySelector('.letter');

seal.addEventListener('click', () => {
    wrap.classList.add('open');
});

const envelope = wrap.querySelector('.envelope');
envelope.addEventListener('click', (e) => {
     if (e.target.closest('.envelope-seal')) return;
    if (!wrap.classList.contains('open')) return;
    if (!letter.classList.contains('open')) {
        letter.classList.add('show-letter');

        setTimeout(() => {
            letter.classList.remove('show-letter');
            letter.classList.add('open');
            wrap.classList.add('deactivate-envelope');
        }, 500);
    } else {
        letter.classList.add('closing-letter');
        wrap.classList.remove('deactivate-envelope');

            setTimeout(() => {
                letter.classList.remove('closing-letter');
                letter.classList.remove('open');
                wrap.classList.remove('open');
            }, 500);
    }
});