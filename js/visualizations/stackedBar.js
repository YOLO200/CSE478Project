class StackedBarChart {
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
        this.data = null;
        this.keys = [];
    }

    init(data) {
        if (!data || data.length === 0) {
            console.error('No data provided to stacked bar chart');
            return;
        }
        this.data = data;
        this.extractKeys();
        this.setupColorScale();
        this.setupSVG();
        this.drawChart();
    }

    extractKeys() {
        const allGenres = new Set();
        this.data.forEach(d => {
            Object.keys(d.genres).forEach(genre => allGenres.add(genre));
        });
        this.keys = Array.from(allGenres);
    }

    setupColorScale() {
        const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140'];
        this.colorScale = d3.scaleOrdinal()
            .domain(this.keys)
            .range(colors.slice(0, this.keys.length));
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

        this.yScale = d3.scaleLinear()
            .domain([0, 100])
            .nice()
            .range([this.height, 0]);
    }

    prepareStackedData() {
        const stack = d3.stack()
            .keys(this.keys)
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetExpand);

        const stackedData = stack(this.data.map(d => {
            const obj = { decade: d.decade };
            this.keys.forEach(key => {
                obj[key] = d.genres[key] || 0;
            });
            return obj;
        }));

        return stackedData;
    }

    drawChart() {
        if (!this.svg || !this.data) return;

        this.drawAxes();

        const stackedData = this.prepareStackedData();

        const groups = this.svg.selectAll('.genre-group')
            .data(stackedData)
            .enter()
            .append('g')
            .attr('class', 'genre-group')
            .attr('fill', d => this.colorScale(d.key));

        const bars = groups.selectAll('rect')
            .data(d => d)
            .enter()
            .append('rect')
            .attr('class', 'bar interactive')
            .attr('x', d => this.xScale(d.data.decade))
            .attr('y', d => this.yScale(d[1]))
            .attr('height', d => this.yScale(d[0]) - this.yScale(d[1]))
            .attr('width', this.xScale.bandwidth())
            .on('mouseover', (event, d) => this.showTooltip(event, d))
            .on('mouseout', () => this.hideTooltip())
            .on('mousemove', (event) => this.moveTooltip(event));

        this.drawLegend();

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
            .call(d3.axisLeft(this.yScale).ticks(10).tickFormat(d => d + '%'))
            .append('text')
            .attr('class', 'axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('y', -60)
            .attr('x', -this.height / 2)
            .attr('text-anchor', 'middle')
            .text('Genre Share (%)');

        this.svg.append('text')
            .attr('class', 'chart-title')
            .attr('x', this.width / 2)
            .attr('y', -20)
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
            .style('font-weight', 'bold')
            .text('Genre Composition by Decade');
    }

    drawLegend() {
        const legend = this.svg.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${this.width - 150}, 20)`);

        const legendItems = legend.selectAll('.legend-item')
            .data(this.keys)
            .enter()
            .append('g')
            .attr('class', 'legend-item interactive')
            .attr('transform', (d, i) => `translate(0,${i * 20})`)
            .on('mouseover', function(event, d) {
                d3.selectAll('.bar').style('opacity', 0.3);
                d3.selectAll(`.genre-group`).filter(data => data.key === d)
                    .selectAll('.bar')
                    .style('opacity', 1);
            })
            .on('mouseout', function() {
                d3.selectAll('.bar').style('opacity', 1);
            });

        legendItems.append('rect')
            .attr('width', 15)
            .attr('height', 15)
            .attr('fill', d => this.colorScale(d));

        legendItems.append('text')
            .attr('x', 20)
            .attr('y', 12)
            .attr('font-size', '11px')
            .text(d => d);
    }

    showTooltip(event, d) {
        const tooltip = d3.select(`#${this.tooltipId}`);
        const stackedData = this.prepareStackedData();
        const genre = stackedData.find(s => {
            return s.some(point => point === d || (point[0] === d[0] && point[1] === d[1]));
        })?.key || 'Unknown';
        const value = d[1] - d[0];
        
        tooltip
            .style('opacity', 1)
            .html(`
                <strong>${d.data.decade}</strong><br/>
                ${genre}: ${value.toFixed(1)}%
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
