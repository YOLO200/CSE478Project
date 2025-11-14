class BubbleChart {
    constructor(containerId, tooltipId) {
        this.containerId = containerId;
        this.tooltipId = tooltipId;
        this.margin = { top: 40, right: 40, bottom: 60, left: 40 };
        this.width = 800;
        this.height = 500;
        this.svg = null;
        this.simulation = null;
        this.data = null;
        this.currentDecade = null;
        this.colorScale = null;
        this.sizeScale = null;
        this.bubbles = null;
        this.isResizing = false;
    }

    init(data) {
        console.log('[BubbleChart] Initialization started');
        console.log('[BubbleChart] Container ID:', this.containerId);
        console.log('[BubbleChart] Data received:', data);
        
        if (!data || data.length === 0) {
            console.error('[BubbleChart] ERROR: No data provided to bubble chart');
            return;
        }
        
        console.log('[BubbleChart] Data length:', data.length);
        this.data = data;
        this.setupColorScale();
        this.setupSizeScale();
        this.setupSVG();
        this.addFilter();
        this.updateChart('1960s');
        console.log('[BubbleChart] Initialization complete');
    }

    setupColorScale() {
        const genres = ['Pop', 'Rock', 'Hip-Hop', 'Electronic', 'R&B', 'Country', 'Jazz'];
        const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a'];
        this.colorScale = d3.scaleOrdinal()
            .domain(genres)
            .range(colors);
    }

    setupSizeScale() {
        const maxPopularity = d3.max(this.data, d => d.popularity) || 100;
        this.sizeScale = d3.scaleSqrt()
            .domain([0, maxPopularity])
            .range([15, 60]);
    }

    setupSVG() {
        console.log('[BubbleChart] Setting up SVG for container:', this.containerId);
        const container = d3.select(`#${this.containerId}`);
        
        if (container.empty()) {
            console.error(`[BubbleChart] ERROR: Container #${this.containerId} not found`);
            return;
        }
        
        const containerNode = container.node();
        const containerRect = containerNode.getBoundingClientRect();
        console.log('[BubbleChart] Container found. Dimensions:', {
            width: containerRect.width,
            height: containerRect.height,
            visible: containerRect.width > 0 && containerRect.height > 0
        });
        
        container.selectAll('*').remove();

        const containerWidth = container.node().getBoundingClientRect().width || 800;
        this.width = Math.max(600, containerWidth - this.margin.left - this.margin.right);

        this.svg = container
            .append('svg')
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom)
            .append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
    }

    addFilter() {
        const container = d3.select(`#${this.containerId}`);
        if (container.select('.filter-controls').empty()) {
            const decades = ['1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];
            
            const filterDiv = container.append('div')
                .attr('class', 'filter-controls')
                .style('margin-bottom', '10px')
                .style('text-align', 'center');

            filterDiv.append('label')
                .text('Select Decade: ')
                .style('margin-right', '10px');

            const select = filterDiv.append('select')
                .attr('id', 'bubble-decade-filter')
                .on('change', (event) => {
                    const newDecade = event.target.value;
                    if (this.currentDecade !== newDecade) {
                        console.log('[BubbleChart] Decade filter changed from', this.currentDecade, 'to', newDecade);
                        this.updateChart(newDecade);
                    }
                });

            select.selectAll('option')
                .data(decades)
                .enter()
                .append('option')
                .attr('value', d => d)
                .text(d => d)
                .property('selected', (d, i) => i === 0);
        }
    }

    updateChart(decade) {
        console.log('[BubbleChart] Updating chart for decade:', decade);
        
        if (!this.svg) {
            console.error('[BubbleChart] ERROR: SVG not initialized');
            return;
        }
        
        if (!this.data) {
            console.error('[BubbleChart] ERROR: Data not available');
            return;
        }
        
        this.currentDecade = decade;
        const filteredData = this.data.filter(d => d.decade === decade);
        
        console.log('[BubbleChart] Filtered data:', {
            decade,
            artistsCount: filteredData.length
        });
        
        if (filteredData.length === 0) {
            console.warn('[BubbleChart] WARNING: No data for decade', decade);
            return;
        }
        
        if (this.simulation) {
            this.simulation.stop();
        }
        
        this.svg.selectAll('*').remove();
        
        this.svg.append('text')
            .attr('class', 'chart-title')
            .attr('x', this.width / 2)
            .attr('y', 20)
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
            .style('font-weight', 'bold')
            .text(`Top Artists: ${decade}`);

        this.simulation = d3.forceSimulation(filteredData)
            .force('x', d3.forceX(this.width / 2).strength(0.1))
            .force('y', d3.forceY(this.height / 2).strength(0.1))
            .force('charge', d3.forceManyBody().strength(-100))
            .force('collision', d3.forceCollide().radius(d => this.sizeScale(d.popularity) + 5))
            .on('tick', () => this.ticked());

        this.bubbles = this.svg.selectAll('.bubble')
            .data(filteredData)
            .enter()
            .append('g')
            .attr('class', 'bubble');

        this.bubbles.append('circle')
            .attr('r', d => this.sizeScale(d.popularity))
            .attr('fill', d => this.colorScale(d.genre) || '#999')
            .attr('opacity', 0.7)
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .on('mouseover', (event, d) => this.showTooltip(event, d))
            .on('mouseout', () => this.hideTooltip())
            .on('mousemove', (event) => this.moveTooltip(event));

        this.bubbles.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '.35em')
            .attr('font-size', d => Math.max(10, this.sizeScale(d.popularity) / 3))
            .attr('fill', '#fff')
            .attr('font-weight', 'bold')
            .text(d => d.name.split(' ')[0]);

        this.drawLegend();
        
        console.log('[BubbleChart] Chart update complete');
        console.log('[BubbleChart] Bubbles created:', filteredData.length);
    }

    ticked() {
        if (this.bubbles) {
            this.bubbles
                .attr('transform', d => `translate(${d.x},${d.y})`);
        }
    }

    drawLegend() {
        const genres = Array.from(new Set(this.data.map(d => d.genre)));
        const legend = this.svg.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${this.width - 150}, 60)`);

        const legendItems = legend.selectAll('.legend-item')
            .data(genres)
            .enter()
            .append('g')
            .attr('class', 'legend-item')
            .attr('transform', (d, i) => `translate(0,${i * 20})`);

        legendItems.append('circle')
            .attr('r', 8)
            .attr('fill', d => this.colorScale(d) || '#999');

        legendItems.append('text')
            .attr('x', 15)
            .attr('y', 5)
            .attr('font-size', '11px')
            .text(d => d);
    }

    showTooltip(event, d) {
        const tooltip = d3.select(`#${this.tooltipId}`);
        tooltip
            .style('opacity', 1)
            .html(`
                <strong>${d.name}</strong><br/>
                Decade: ${d.decade}<br/>
                Popularity: ${d.popularity.toFixed(0)}<br/>
                Genre: ${d.genre}<br/>
                Hits: ${d.hitCount || 'N/A'}
            `);
    }

    hideTooltip() {
        const tooltip = d3.select(`#${this.tooltipId}`);
        tooltip.style('opacity', 0);
    }

    moveTooltip(event) {
        const tooltip = d3.select(`#${this.tooltipId}`);
        tooltip
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
    }

    resize() {
        if (this.data && !this.isResizing) {
            this.isResizing = true;
            console.log('[BubbleChart] Resizing chart');
            this.setupSVG();
            const container = d3.select(`#${this.containerId}`);
            if (container.select('.filter-controls').empty()) {
                this.addFilter();
            }
            this.updateChart(this.currentDecade || '1960s');
            this.isResizing = false;
        }
    }
}
