class LineChart {
    constructor(containerId, tooltipId) {
        this.containerId = containerId;
        this.tooltipId = tooltipId;
        this.margin = { top: 40, right: 40, bottom: 60, left: 80 };
        this.width = 800;
        this.height = 500;
        this.svg = null;
        this.xScale = null;
        this.yScale = null;
        this.data = null;
    }

    init(data) {
        if (!data || data.length === 0) {
            console.error('No data provided to line chart');
            return;
        }
        this.data = data;
        this.setupSVG();
        this.drawChart();
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

        this.xScale = d3.scaleBand()
            .domain(this.data.map(d => d.decade))
            .range([0, this.width])
            .padding(0.2);

        const maxPopularity = d3.max(this.data, d => d.avgPopularity) || 100;
        this.yScale = d3.scaleLinear()
            .domain([0, Math.max(100, maxPopularity * 1.1)])
            .nice()
            .range([this.height, 0]);
    }

    drawChart() {
        if (!this.svg || !this.data) return;

        this.drawAxes();

        const line = d3.line()
            .x(d => this.xScale(d.decade) + this.xScale.bandwidth() / 2)
            .y(d => this.yScale(d.avgPopularity))
            .curve(d3.curveMonotoneX);

        this.svg.append('path')
            .datum(this.data)
            .attr('fill', 'none')
            .attr('stroke', '#667eea')
            .attr('stroke-width', 3)
            .attr('d', line)
            .attr('class', 'line-path');

        const dots = this.svg.selectAll('.dot')
            .data(this.data)
            .enter()
            .append('circle')
            .attr('class', 'dot interactive')
            .attr('cx', d => this.xScale(d.decade) + this.xScale.bandwidth() / 2)
            .attr('cy', d => this.yScale(d.avgPopularity))
            .attr('r', 6)
            .attr('fill', '#667eea')
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .on('mouseover', (event, d) => this.showTooltip(event, d))
            .on('mouseout', () => this.hideTooltip())
            .on('mousemove', (event) => this.moveTooltip(event));

        this.svg.selectAll('.decade-label')
            .data(this.data)
            .enter()
            .append('text')
            .attr('class', 'decade-label')
            .attr('x', d => this.xScale(d.decade) + this.xScale.bandwidth() / 2)
            .attr('y', this.height + 40)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .attr('fill', '#666')
            .text(d => d.decade);
    }

    drawAxes() {
        this.svg.append('g')
            .attr('transform', `translate(0,${this.height})`)
            .call(d3.axisBottom(this.xScale))
            .selectAll('text')
            .style('font-size', '11px');

        this.svg.append('g')
            .call(d3.axisLeft(this.yScale).ticks(10))
            .append('text')
            .attr('class', 'axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('y', -60)
            .attr('x', -this.height / 2)
            .attr('text-anchor', 'middle')
            .text('Average Popularity');

        this.svg.append('text')
            .attr('class', 'chart-title')
            .attr('x', this.width / 2)
            .attr('y', -20)
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
            .style('font-weight', 'bold')
            .text('Popularity Over Time');
    }

    showTooltip(event, d) {
        const tooltip = d3.select(`#${this.tooltipId}`);
        tooltip
            .style('opacity', 1)
            .html(`
                <strong>${d.decade}</strong><br/>
                Average Popularity: ${d.avgPopularity.toFixed(1)}<br/>
                ${d.count ? `Songs: ${d.count.toLocaleString()}` : ''}
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
        }
    }
}
