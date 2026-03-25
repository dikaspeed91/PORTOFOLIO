// Skills Visualizer Script
// Handles hover animations and skill counter

class SkillsVisualizer {
    constructor() {
        this.skillItems = document.querySelectorAll('.skill-item');
        this.init();
    }

    init() {
        this.observeScroll();
        this.addHoverListeners();
    }

    observeScroll() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, { threshold: 0.1 });

        this.skillItems.forEach(item => observer.observe(item));
    }

    addHoverListeners() {
        this.skillItems.forEach(item => {
            const tooltip = item.querySelector('.tooltip');
            const skillPercent = item.dataset.skill;
            const skillName = item.dataset.name;
            const progressEl = tooltip.querySelector('.skill-progress');
            const percentEl = tooltip.querySelector('.skill-percent');

            let animationRunning = false;

            item.addEventListener('mouseenter', () => {
                if (animationRunning) return;
                
                animationRunning = true;
                percentEl.textContent = '0%';
                progressEl.style.width = '0%';

                this.animateCounter(percentEl, skillPercent);
                this.animateProgressBar(progressEl, skillPercent);
            });

            item.addEventListener('mouseleave', () => {
                animationRunning = false;
                setTimeout(() => {
                    percentEl.textContent = '0%';
                    progressEl.style.width = '0%';
                }, 500);
            });
        });
    }

    animateCounter(element, target) {
        const duration = 1500;
        const increment = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current) + '%';
        }, 16);
    }

    animateProgressBar(element, target) {
        setTimeout(() => {
            element.style.width = target + '%';
        }, 200);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SkillsVisualizer();
});

// Smooth scroll for any anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
