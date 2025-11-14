class Scatterplot {
    constructor(containerId, tooltipId) {
        this.containerId = containerId;
        this.tooltipId = tooltipId;
        this.margin = { top: 40, right: 40, bottom: 60, left: 80 };
        this.width = 800;
        this.height = 500;
        this.svg = null;
        this.xScale = null;
        this.yScale = null;
        this.colorScale = null;
        this.sizeScale = null;
        this.data = null;
        this.currentFilter = null;
    }

    init(data) {
        if (!data || data.length === 0) {
            console.error('No data provided to scatterplot');
            return;
        }
        this.data = data;
        this.setupColorScale();
        this.setupSizeScale();
        this.setupSVG();
        this.drawChart();
        this.addFilter();
    }

    setupColorScale() {
        const decades = ['1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];
        const colors = ['#8B4513', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
        this.colorScale = d3.scaleOrdinal()
            .domain(decades)
            .range(colors);
    }

    setupSizeScale() {
        const maxPopularity = d3.max(this.data, d => d.popularity) || 100;
        this.sizeScale = d3.scaleSqrt()
            .domain([0, maxPopularity])
            .range([3, 12]);
    }

    setupSVG() {
        const container = d3.select(`#${this.containerId}`);
        if (container.empty()) {
            console.error(`Container #${this.containerId} not found`);
            return;
        }
        container.selectAll('*').remove();

        const containerWidth = container.node().getBoundingClientRect().width || 800;
        this.width = Math.max(600, containerWidth - this.margin.left - this.margin.right);

        this.svg = container
            .append('svg')
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom)
            .append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

        this.xScale = d3.scaleLinear()
            .domain([0, 1])
            .nice()
            .range([0, this.width]);

        this.yScale = d3.scaleLinear()
            .domain([0, 1])
            .nice()
            .range([this.height, 0]);
    }

    drawChart() {
        if (!this.svg || !this.data) return;

        this.svg.selectAll('.dot').remove();

        this.drawAxes();

        const filteredData = this.currentFilter 
            ? this.data.filter(d => d.decade === this.currentFilter)
            : this.data;

        const dots = this.svg.selectAll('.dot')
            .data(filteredData)
            .enter()
            .append('circle')
            .attr('class', 'dot interactive')
            .attr('cx', d => this.xScale(d.danceability))
            .attr('cy', d => this.yScale(d.energy))
            .attr('r', d => this.sizeScale(d.popularity))
            .attr('fill', d => this.colorScale(d.decade))
            .attr('opacity', 0.7)
            .attr('stroke', '#fff')
            .attr('stroke-width', 1)
            .on('mouseover', (event, d) => this.showTooltip(event, d))
            .on('mouseout', () => this.hideTooltip())
            .on('mousemove', (event) => this.moveTooltip(event));
    }

    drawAxes() {
        this.svg.selectAll('.axis').remove();

        this.svg.append('g')
            .attr('class', 'axis')
            .attr('transform', `translate(0,${this.height})`)
            .call(d3.axisBottom(this.xScale).ticks(10))
            .append('text')
            .attr('class', 'axis-label')
            .attr('x', this.width / 2)
            .attr('y', 40)
            .attr('text-anchor', 'middle')
            .text('Danceability');

        this.svg.append('g')
            .attr('class', 'axis')
            .call(d3.axisLeft(this.yScale).ticks(10))
            .append('text')
            .attr('class', 'axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('y', -60)
            .attr('x', -this.height / 2)
            .attr('text-anchor', 'middle')
            .text('Energy');

        this.svg.append('text')
            .attr('class', 'chart-title')
            .attr('x', this.width / 2)
            .attr('y', -20)
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
            .style('font-weight', 'bold')
            .text('Energy vs. Danceability');
    }

    addFilter() {
        const container = d3.select(`#${this.containerId}`);
        if (container.select('.filter-controls').empty()) {
            const decades = ['All', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];
            
            const filterDiv = container.append('div')
                .attr('class', 'filter-controls')
                .style('margin-bottom', '10px')
                .style('text-align', 'center');

            filterDiv.append('label')
                .text('Filter by Decade: ')
                .style('margin-right', '10px');

            const select = filterDiv.append('select')
                .attr('id', 'decade-filter')
                .on('change', (event) => {
                    this.currentFilter = event.target.value === 'All' ? null : event.target.value;
                    this.drawChart();
                });

            select.selectAll('option')
                .data(decades)
                .enter()
                .append('option')
                .attr('value', d => d)
                .text(d => d);
        }
    }

    showTooltip(event, d) {
        const tooltip = d3.select(`#${this.tooltipId}`);
        tooltip
            .style('opacity', 1)
            .html(`
                <strong>${d.decade}</strong><br/>
                Energy: ${d.energy.toFixed(2)}<br/>
                Danceability: ${d.danceability.toFixed(2)}<br/>
                Popularity: ${d.popularity.toFixed(0)}<br/>
                ${d.genre ? `Genre: ${d.genre}` : ''}
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
        if (this.data) {
            this.setupSVG();
            this.drawChart();
            this.addFilter();
        }
    }
}
