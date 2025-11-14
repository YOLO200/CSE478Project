let lineChart = null;
let stackedBarChart = null;
let scatterplot = null;
let bubbleChart = null;
let radialSpectrum = null;

async function init() {
    try {
        document.body.classList.add('loading');

        const processedData = await dataLoader.loadAll();

        setTimeout(() => {
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

            scrollytelling.init();

            scrollytelling.onStepChange((stepIndex, direction, element) => {
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
    if (direction === 'enter') {
        setTimeout(() => {
            if (stepIndex === 1 && lineChart) {
                lineChart.resize();
            } else if (stepIndex === 2 && stackedBarChart) {
                stackedBarChart.resize();
            } else if (stepIndex === 3 && scatterplot) {
                scatterplot.resize();
            } else if (stepIndex === 4 && bubbleChart) {
                bubbleChart.resize();
            } else if (stepIndex === 5 && radialSpectrum) {
                radialSpectrum.resize();
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
