let lineChart = null;
let stackedBarChart = null;
let scatterplot = null;
let bubbleChart = null;
let radialSpectrum = null;

async function init() {
    console.log('[Main] Application initialization started');
    try {
        document.body.classList.add('loading');
        console.log('[Main] Loading data...');

        const processedData = await dataLoader.loadAll();
        console.log('[Main] Data loaded successfully');

        setTimeout(() => {
            console.log('[Main] Initializing visualizations with processed data:', {
                popularity: processedData.popularity?.length || 0,
                genres: processedData.genres?.length || 0,
                energyDanceability: processedData.energyDanceability?.length || 0,
                topArtists: processedData.topArtists?.length || 0,
                radialData: processedData.radialData?.length || 0
            });
            
            lineChart = new LineChart('line-chart-container', 'tooltip');
            lineChart.init(processedData.popularity);

            stackedBarChart = new StackedBarChart('stacked-bar-container', 'tooltip');
            stackedBarChart.init(processedData.genres);

            scatterplot = new Scatterplot('scatterplot-container', 'tooltip');
            scatterplot.init(processedData.energyDanceability);

            bubbleChart = new BubbleChart('bubble-chart-container', 'tooltip');
            bubbleChart.init(processedData.topArtists);

            radialSpectrum = new RadialSpectrum('radial-spectrum-container', 'tooltip');
            radialSpectrum.init(processedData.radialData);
            
            console.log('[Main] All visualizations initialized');

            console.log('[Main] Initializing scrollytelling...');
            scrollytelling.init();

            scrollytelling.onStepChange((stepIndex, direction, element) => {
                console.log('[Main] Step change detected:', {
                    stepIndex,
                    direction,
                    elementId: element?.id || 'no-id'
                });
                handleStepChange(stepIndex, direction);
            });

            window.addEventListener('resize', handleResize);

            document.body.classList.remove('loading');
        }, 100);

    } catch (error) {
        console.error('Error initializing application:', error);
        document.body.classList.remove('loading');
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'padding: 2rem; text-align: center; color: red;';
        errorDiv.innerHTML = `
            <h2>Error Loading Application</h2>
            <p>${error.message}</p>
            <p>Please check the browser console for more details.</p>
        `;
        document.body.appendChild(errorDiv);
    }
}

function handleStepChange(stepIndex, direction) {
    console.log('[Main] Handling step change:', {
        stepIndex,
        direction,
        willResize: direction === 'enter'
    });
    
    if (direction === 'enter') {
        setTimeout(() => {
            console.log('[Main] Resizing visualization for step', stepIndex);
            if (stepIndex === 1 && lineChart) {
                console.log('[Main] Resizing line chart');
                const container = document.getElementById('line-chart-container');
                if (container && container.getBoundingClientRect().width > 0) {
                    lineChart.resize();
                } else {
                    console.warn('[Main] Line chart container not visible, skipping resize');
                }
            } else if (stepIndex === 2 && stackedBarChart) {
                console.log('[Main] Resizing stacked bar chart');
                const container = document.getElementById('stacked-bar-container');
                if (container && container.getBoundingClientRect().width > 0) {
                    stackedBarChart.resize();
                }
            } else if (stepIndex === 3 && scatterplot) {
                console.log('[Main] Resizing scatterplot');
                const container = document.getElementById('scatterplot-container');
                if (container && container.getBoundingClientRect().width > 0) {
                    scatterplot.resize();
                }
            } else if (stepIndex === 4 && bubbleChart) {
                console.log('[Main] Resizing bubble chart');
                const container = document.getElementById('bubble-chart-container');
                if (container && container.getBoundingClientRect().width > 0) {
                    bubbleChart.resize();
                }
            } else if (stepIndex === 5 && radialSpectrum) {
                console.log('[Main] Resizing radial spectrum');
                const container = document.getElementById('radial-spectrum-container');
                if (container && container.getBoundingClientRect().width > 0) {
                    radialSpectrum.resize();
                }
            }
        }, 100);
    }
}

function handleResize() {
    if (lineChart) lineChart.resize();
    if (stackedBarChart) stackedBarChart.resize();
    if (scatterplot) scatterplot.resize();
    if (bubbleChart) bubbleChart.resize();
    if (radialSpectrum) radialSpectrum.resize();
    if (scrollytelling && scrollytelling.scroller) {
        scrollytelling.scroller.resize();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
