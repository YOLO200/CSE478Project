class ScrollytellingManager {
    constructor() {
        this.scroller = null;
        this.currentStep = 0;
        this.sections = [];
        this.callbacks = {};
    }

    init() {
        console.log('[Scrollytelling] Initializing scrollytelling manager...');
        if (typeof scrollama === 'undefined') {
            console.warn('[Scrollytelling] WARNING: Scrollama.js not loaded. Using fallback scroll detection.');
            this.initFallback();
            return;
        }
        
        console.log('[Scrollytelling] Scrollama.js found, setting up...');
        this.scroller = scrollama();
        
        this.scroller
            .setup({
                step: '.scroll-section',
                offset: 0.5,
                debug: false,
                progress: false
            })
            .onStepEnter(this.handleStepEnter.bind(this))
            .onStepExit(this.handleStepExit.bind(this));
        
        console.log('[Scrollytelling] Scrollama setup complete');

        window.addEventListener('resize', () => {
            if (this.scroller && this.scroller.resize) {
                this.scroller.resize();
            }
        });

        this.sections = Array.from(document.querySelectorAll('.scroll-section'));
        console.log('[Scrollytelling] Found', this.sections.length, 'scroll sections');
    }

    initFallback() {
        this.sections = Array.from(document.querySelectorAll('.scroll-section'));
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const index = this.sections.indexOf(entry.target);
                    if (index !== -1) {
                        this.handleStepEnter({
                            element: entry.target,
                            index: index,
                            direction: 'down'
                        });
                    }
                }
            });
        }, {
            threshold: 0.5,
            rootMargin: '0px'
        });

        this.sections.forEach(section => observer.observe(section));
    }

    handleStepEnter(response) {
        const { element, index, direction } = response;
        this.currentStep = index;
        
        console.log('[Scrollytelling] Step entered:', {
            stepIndex: index,
            direction: direction,
            elementId: element.id || 'no-id',
            elementClass: element.className
        });

        element.classList.add('active');

        if (this.callbacks[`step${index}`]) {
            this.callbacks[`step${index}`]('enter', element);
        }

        if (this.callbacks.onStepChange) {
            this.callbacks.onStepChange(index, 'enter', element);
        }
    }

    handleStepExit(response) {
        const { element, index, direction } = response;
        element.classList.remove('active');

        if (this.callbacks[`step${index}`]) {
            this.callbacks[`step${index}`]('exit', element);
        }
    }

    onStep(stepIndex, callback) {
        this.callbacks[`step${stepIndex}`] = callback;
    }

    onStepChange(callback) {
        this.callbacks.onStepChange = callback;
    }

    getCurrentStep() {
        return this.currentStep;
    }

    getSection(index) {
        return this.sections[index] || null;
    }
}

const scrollytelling = new ScrollytellingManager();
