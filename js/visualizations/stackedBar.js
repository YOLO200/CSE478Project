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
        this.isResizing = false;
        this.legendWidth = 0;
    }

    init(data) {
        console.log('[StackedBarChart] Initialization started');
        console.log('[StackedBarChart] Container ID:', this.containerId);
        console.log('[StackedBarChart] Data received:', data);
        
        if (!data || data.length === 0) {
            console.error('[StackedBarChart] ERROR: No data provided to stacked bar chart');
            return;
        }
        
        console.log('[StackedBarChart] Data length:', data.length);
        this.data = data;
        this.extractKeys();
        console.log('[StackedBarChart] Extracted genre keys:', this.keys.length, 'genres');
        
        // Verify data structure and proportions
        this.data.forEach(d => {
            const genreSum = Object.values(d.genres || {}).reduce((sum, val) => sum + (val || 0), 0);
            console.log(`[StackedBarChart] ${d.decade}: Genre proportions sum = ${genreSum.toFixed(3)} (${(genreSum * 100).toFixed(1)}%)`);
        });
        
        this.setupColorScale();
        // setupSVG needs to be called after extractKeys to know the number of genres
        this.setupSVG();
        this.drawChart();
        console.log('[StackedBarChart] Initialization complete');
    }

    extractKeys() {
        const allGenres = new Set();
        // Decades that might accidentally be in genre data
        const decades = ['1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];
        
        this.data.forEach(d => {
            Object.keys(d.genres || {}).forEach(genre => {
                // Filter out decade names that might be incorrectly in genre data
                if (!decades.includes(genre) && genre !== 'decade' && genre !== 'total') {
                    allGenres.add(genre);
                }
            });
        });
        
        // Sort genres alphabetically for consistent legend
        this.keys = Array.from(allGenres).sort((a, b) => a.localeCompare(b));
        
        // Always put "Other" at the end if it exists
        if (this.keys.includes('Other')) {
            this.keys = this.keys.filter(k => k !== 'Other').concat('Other');
        }
    }

    setupColorScale() {
        // Expanded color palette for many genres
        const colors = [
            '#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', 
            '#43e97b', '#fa709a', '#fee140', '#ff6b6b', '#4ecdc4',
            '#45b7d1', '#f7b731', '#5f27cd', '#00d2d3', '#ff6348',
            '#2ed573', '#ffa502', '#ff3838', '#7bed9f', '#70a1ff',
            '#5352ed', '#ff4757', '#1e90ff', '#2f3542', '#a55eea',
            '#26de81', '#fd79a8', '#fdcb6e', '#6c5ce7', '#00b894',
            '#d63031', '#0984e3', '#e17055', '#81ecec', '#fab1a0',
            '#b2bec3', '#636e72', '#dfe6e9', '#000000'
        ];
        this.colorScale = d3.scaleOrdinal()
            .domain(this.keys)
            .range(colors.slice(0, this.keys.length));
        
        // Ensure "Other" category has a distinct muted color if it exists
        if (this.keys.includes('Other')) {
            const otherColor = '#cccccc';
            const existingColors = colors.slice(0, this.keys.length);
            const otherIndex = this.keys.indexOf('Other');
            existingColors[otherIndex] = otherColor;
            this.colorScale.range(existingColors);
        }
    }

    setupSVG() {
        console.log('[StackedBarChart] Setting up SVG for container:', this.containerId);
        const container = d3.select(`#${this.containerId}`);
        
        if (container.empty()) {
            console.error(`[StackedBarChart] ERROR: Container #${this.containerId} not found`);
            return;
        }
        
        const containerNode = container.node();
        const containerRect = containerNode.getBoundingClientRect();
        console.log('[StackedBarChart] Container found. Dimensions:', {
            width: containerRect.width,
            height: containerRect.height,
            visible: containerRect.width > 0 && containerRect.height > 0
        });
        
        container.selectAll('*').remove();

        const containerWidth = container.node().getBoundingClientRect().width || 800;
        // Reserve space for legend on the right (adjust based on number of genres)
        // Each column is 180px wide, max 2 columns (360px total)
        const numColumns = Math.ceil((this.keys?.length || 1) / 20);
        const estimatedLegendWidth = Math.min(360, numColumns * 180);
        const chartWidth = Math.max(500, containerWidth - this.margin.left - this.margin.right - estimatedLegendWidth - 20);
        this.width = chartWidth;
        this.legendWidth = estimatedLegendWidth;
        
        console.log('[StackedBarChart] Calculated dimensions:', {
            containerWidth,
            chartWidth: this.width,
            chartHeight: this.height,
            legendWidth: this.legendWidth,
            numColumns,
            numGenres: this.keys.length
        });

        this.svg = container
            .append('svg')
            .attr('width', this.width + this.margin.left + this.margin.right + this.legendWidth)
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
        // Convert proportions (0-1) to percentages (0-100)
        const dataWithPercentages = this.data.map(d => {
            const obj = { decade: d.decade };
            let totalPercentage = 0;
            
            // Convert each genre proportion to percentage
            this.keys.forEach(key => {
                const proportion = d.genres[key] || 0;
                const percentage = proportion * 100;
                obj[key] = percentage;
                totalPercentage += percentage;
            });
            
            // If the percentages don't sum to 100%, add an "Other" category
            if (totalPercentage < 100 && totalPercentage > 0) {
                if (!this.keys.includes('Other')) {
                    this.keys.push('Other');
                }
                obj['Other'] = 100 - totalPercentage;
            }
            
            console.log(`[StackedBarChart] ${d.decade}: Total percentage = ${totalPercentage.toFixed(2)}%`);
            return obj;
        });

        const stack = d3.stack()
            .keys(this.keys)
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone);  // Use None instead of Expand since we already have percentages

        const stackedData = stack(dataWithPercentages);
        
        // Verify the data
        stackedData.forEach(layer => {
            layer.forEach(point => {
                if (point[1] < point[0] || point[0] < 0) {
                    console.warn(`[StackedBarChart] Invalid stacked values: [${point[0]}, ${point[1]}] for ${layer.key}`);
                }
            });
        });

        return stackedData;
    }

    drawChart() {
        console.log('[StackedBarChart] Drawing chart');
        
        if (!this.svg) {
            console.error('[StackedBarChart] ERROR: SVG not initialized');
            return;
        }
        
        if (!this.data) {
            console.error('[StackedBarChart] ERROR: Data not available');
            return;
        }

        this.drawAxes();
        console.log('[StackedBarChart] Axes drawn');

        const stackedData = this.prepareStackedData();
        console.log('[StackedBarChart] Stacked data prepared:', {
            layers: stackedData.length,
            dataPoints: stackedData[0]?.length || 0
        });

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
            .attr('y', d => {
                // Ensure y position is valid (bottom value should be <= top value for stacking)
                const top = Math.max(0, Math.min(100, d[0]));      // Bottom of this segment
                const bottom = Math.max(0, Math.min(100, d[1]));  // Top of this segment
                return this.yScale(bottom);  // Y position is based on bottom value
            })
            .attr('height', d => {
                // Calculate height ensuring it's positive
                const top = Math.max(0, Math.min(100, d[0]));      // Bottom of segment
                const bottom = Math.max(0, Math.min(100, d[1]));  // Top of segment
                const height = Math.abs(this.yScale(top) - this.yScale(bottom));
                return Math.max(1, height);  // Minimum 1px height for visibility
            })
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
        
        console.log('[StackedBarChart] Chart drawing complete');
        console.log('[StackedBarChart] Bars drawn:', this.data.length);
    }

    drawAxes() {
        this.svg.append('g')
            .attr('transform', `translate(0,${this.height})`)
            .attr('class', 'x-axis')
            .call(d3.axisBottom(this.xScale))
            .selectAll('text')
            .style('font-size', '12px')
            .style('fill', '#666');

        this.svg.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(this.yScale).ticks(10).tickFormat(d => d + '%'))
            .selectAll('text')
            .style('font-size', '11px')
            .style('fill', '#666');
            
        this.svg.append('text')
            .attr('class', 'axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('y', -50)
            .attr('x', -this.height / 2)
            .attr('text-anchor', 'middle')
            .attr('font-size', '13px')
            .attr('fill', '#666')
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
        // Remove existing legend if it exists
        this.svg.selectAll('.legend').remove();
        
        // Position legend to the right of the chart with better spacing
        const legendX = this.width + 20;
        const legendY = 20;
        const itemsPerColumn = 20;
        const columnWidth = 180;
        const rowHeight = 18;
        const maxHeight = this.height;
        
        // Calculate number of columns needed
        const numColumns = Math.ceil(this.keys.length / itemsPerColumn);
        const actualItemsPerColumn = Math.ceil(this.keys.length / numColumns);
        
        // Create legend container
        const legend = this.svg.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${legendX}, ${legendY})`);

        // Add legend title
        legend.append('text')
            .attr('class', 'legend-title')
            .attr('x', 0)
            .attr('y', 0)
            .attr('font-size', '13px')
            .attr('font-weight', 'bold')
            .attr('fill', '#333')
            .text('Genres');

        // Create columns for better organization
        for (let col = 0; col < numColumns; col++) {
            const columnStart = col * actualItemsPerColumn;
            const columnEnd = Math.min(columnStart + actualItemsPerColumn, this.keys.length);
            const columnGenres = this.keys.slice(columnStart, columnEnd);
            
            const columnGroup = legend.append('g')
                .attr('class', `legend-column-${col}`)
                .attr('transform', `translate(${col * columnWidth}, 20)`);

            const legendItems = columnGroup.selectAll('.legend-item')
                .data(columnGenres)
                .enter()
                .append('g')
                .attr('class', 'legend-item interactive')
                .attr('transform', (d, i) => `translate(0,${i * rowHeight})`)
                .on('mouseover', (event, d) => {
                    d3.selectAll('.bar').style('opacity', 0.2);
                    d3.selectAll(`.genre-group`).filter(data => data.key === d)
                        .selectAll('.bar')
                        .style('opacity', 1)
                        .style('stroke', '#000')
                        .style('stroke-width', 2);
                })
                .on('mouseout', function() {
                    d3.selectAll('.bar').style('opacity', 1).style('stroke', 'none');
                });

            legendItems.append('rect')
                .attr('width', 12)
                .attr('height', 12)
                .attr('fill', d => this.colorScale(d))
                .attr('stroke', '#ccc')
                .attr('stroke-width', 0.5)
                .attr('rx', 2);

            legendItems.append('text')
                .attr('x', 16)
                .attr('y', 9)
                .attr('font-size', '10px')
                .attr('fill', '#333')
                .text(d => {
                    // Format genre names for better readability
                    if (d === 'Other') return 'Other';
                    return d.charAt(0).toUpperCase() + d.slice(1).replace(/'/g, "'");
                });
        }
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
        if (this.data && !this.isResizing) {
            this.isResizing = true;
            console.log('[StackedBarChart] Resizing chart');
            this.setupSVG();
            this.drawChart();
            this.isResizing = false;
        }
    }
}
