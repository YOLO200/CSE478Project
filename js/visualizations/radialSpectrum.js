class RadialSpectrum {
    constructor(containerId, tooltipId) {
        this.containerId = containerId;
        this.tooltipId = tooltipId;
        this.margin = { top: 40, right: 40, bottom: 40, left: 40 };
        this.width = 800;
        this.height = 800;
        this.svg = null;
        this.radius = null;
        this.centerX = null;
        this.centerY = null;
        this.data = null;
        this.currentDecadeIndex = 0;
        this.colorScale = null;
    }

    init(data) {
        if (!data || data.length === 0) {
            console.error('No data provided to radial spectrum');
            return;
        }
        this.data = data;
        this.setupColorScale();
        this.setupSVG();
        this.addControls();
        this.drawChart();
    }

    setupColorScale() {
        this.colorScale = d3.scaleSequential(d3.interpolateRdBu)
            .domain([1, 0]);
    }

    setupSVG() {
        const container = d3.select(`#${this.containerId}`);
        if (container.empty()) {
            console.error(`Container #${this.containerId} not found`);
            return;
        }
        container.selectAll('*').remove();

        const containerWidth = container.node().getBoundingClientRect().width || 800;
        this.width = Math.min(containerWidth - this.margin.left - this.margin.right, 700);
        this.height = this.width;

        this.radius = Math.min(this.width, this.height) / 2 - 50;
        this.centerX = this.width / 2 + this.margin.left;
        this.centerY = this.height / 2 + this.margin.top;

        this.svg = container
            .append('svg')
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom)
            .append('g')
            .attr('transform', `translate(${this.centerX},${this.centerY})`);
    }

    tempoToAngle(tempo) {
        const minTempo = 60;
        const maxTempo = 200;
        const normalized = (tempo - minTempo) / (maxTempo - minTempo);
        return normalized * 360;
    }

    loudnessToThickness(loudness) {
        const minLoudness = -20;
        const maxLoudness = 0;
        const normalized = (loudness - minLoudness) / (maxLoudness - minLoudness);
        return 2 + (normalized * 13);
    }

    drawChart() {
        if (!this.svg || !this.data || this.data.length === 0) return;

        const currentData = this.data[this.currentDecadeIndex];
        
        this.svg.selectAll('.spectrum-element').remove();

        this.data.forEach((decadeData, index) => {
            const ringRadius = (this.radius / this.data.length) * (index + 1);
            const opacity = index === this.currentDecadeIndex ? 1 : 0.3;
            
            this.drawDecadeRing(decadeData, ringRadius, opacity, index === this.currentDecadeIndex);
        });

        this.drawCenterCircle(currentData);
        this.drawLegend();
    }

    drawDecadeRing(decadeData, radius, opacity, isActive) {
        const numPoints = 36;
        const points = [];

        for (let i = 0; i < numPoints; i++) {
            const angle = (i * 360) / numPoints;
            const radians = (angle * Math.PI) / 180;
            
            const energyRadius = radius * (0.5 + decadeData.energy * 0.5);
            
            const tempoAngle = this.tempoToAngle(decadeData.tempo);
            const angleDiff = Math.abs(angle - tempoAngle);
            const minAngleDiff = Math.min(angleDiff, 360 - angleDiff);
            
            let adjustedRadius = energyRadius;
            if (minAngleDiff < 20) {
                adjustedRadius *= (1 + (1 - minAngleDiff / 20) * 0.2);
            }
            
            const x = Math.cos(radians) * adjustedRadius;
            const y = Math.sin(radians) * adjustedRadius;
            
            points.push({
                x,
                y,
                angle,
                valence: decadeData.valence,
                energy: decadeData.energy,
                tempo: decadeData.tempo
            });
        }

        const lineGenerator = d3.line()
            .x(d => d.x)
            .y(d => d.y)
            .curve(d3.curveCardinalClosed);

        const ring = this.svg.append('path')
            .datum(points)
            .attr('class', 'spectrum-element decade-ring')
            .attr('d', lineGenerator)
            .attr('fill', this.colorScale(decadeData.valence))
            .attr('opacity', opacity)
            .attr('stroke', isActive ? '#fff' : 'none')
            .attr('stroke-width', isActive ? 2 : 0)
            .on('mouseover', () => {
                if (!isActive) {
                    this.currentDecadeIndex = this.data.indexOf(decadeData);
                    this.drawChart();
                }
            });

        const tempoRadians = (this.tempoToAngle(decadeData.tempo) * Math.PI) / 180;
        const innerRadius = radius * 0.5;
        const outerRadius = radius * 1.5;
        const thickness = this.loudnessToThickness(decadeData.loudness);
        
        const tempoLine = this.svg.append('line')
            .attr('class', 'spectrum-element tempo-indicator')
            .attr('x1', Math.cos(tempoRadians) * innerRadius)
            .attr('y1', Math.sin(tempoRadians) * innerRadius)
            .attr('x2', Math.cos(tempoRadians) * outerRadius)
            .attr('y2', Math.sin(tempoRadians) * outerRadius)
            .attr('stroke', '#333')
            .attr('stroke-width', thickness)
            .attr('opacity', opacity)
            .attr('stroke-linecap', 'round');
    }

    drawCenterCircle(decadeData) {
        const centerGroup = this.svg.append('g')
            .attr('class', 'spectrum-element center-circle');

        centerGroup.append('circle')
            .attr('r', 50)
            .attr('fill', this.colorScale(decadeData.valence))
            .attr('opacity', 0.8)
            .attr('stroke', '#fff')
            .attr('stroke-width', 3);

        centerGroup.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '-10')
            .attr('font-size', '18px')
            .attr('font-weight', 'bold')
            .attr('fill', '#fff')
            .text(decadeData.decade);

        centerGroup.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '10')
            .attr('font-size', '12px')
            .attr('fill', '#fff')
            .text(`E: ${decadeData.energy.toFixed(2)}`);
    }

    drawLegend() {
        const legend = this.svg.append('g')
            .attr('class', 'spectrum-element legend')
            .attr('transform', `translate(${-this.radius - 80}, ${-this.radius})`);

        legend.append('text')
            .attr('font-size', '14px')
            .attr('font-weight', 'bold')
            .text('Encoding:')
            .attr('y', 0);

        const items = [
            { label: 'Radius: Energy', y: 25 },
            { label: 'Color: Valence', y: 45 },
            { label: 'Angle: Tempo', y: 65 },
            { label: 'Thickness: Loudness', y: 85 }
        ];

        items.forEach(item => {
            legend.append('text')
                .attr('font-size', '11px')
                .attr('y', item.y)
                .text(item.label);
        });
    }

    addControls() {
        const container = d3.select(`#${this.containerId}`);
        if (container.select('.radial-controls').empty()) {
            const controlsDiv = container.append('div')
                .attr('class', 'radial-controls')
                .style('margin-bottom', '10px')
                .style('text-align', 'center');

            controlsDiv.append('button')
                .attr('id', 'prev-decade')
                .text('◀ Previous')
                .on('click', () => {
                    this.currentDecadeIndex = Math.max(0, this.currentDecadeIndex - 1);
                    this.drawChart();
                });

            controlsDiv.append('span')
                .text('  ')
                .style('margin', '0 10px');

            controlsDiv.append('button')
                .attr('id', 'next-decade')
                .text('Next ▶')
                .on('click', () => {
                    this.currentDecadeIndex = Math.min(this.data.length - 1, this.currentDecadeIndex + 1);
                    this.drawChart();
                });
        }
    }

    showTooltip(event, d) {
        const tooltip = d3.select(`#${this.tooltipId}`);
        tooltip
            .style('opacity', 1)
            .html(`
                <strong>${d.decade}</strong><br/>
                Energy: ${d.energy.toFixed(2)}<br/>
                Tempo: ${d.tempo.toFixed(0)} BPM<br/>
                Valence: ${d.valence.toFixed(2)}<br/>
                Loudness: ${d.loudness.toFixed(1)} dB
            `);
    }

    hideTooltip() {
        const tooltip = d3.select(`#${this.tooltipId}`);
        tooltip.style('opacity', 0);
    }

    resize() {
        if (this.data) {
            this.setupSVG();
            this.addControls();
            this.drawChart();
        }
    }
}
