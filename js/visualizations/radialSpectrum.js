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
        this.isDrawing = false;
        this.lastHoverTime = 0;
    }

    init(data) {
        console.log('[RadialSpectrum] Initialization started');
        console.log('[RadialSpectrum] Container ID:', this.containerId);
        console.log('[RadialSpectrum] Data received:', data);
        
        if (!data || data.length === 0) {
            console.error('[RadialSpectrum] ERROR: No data provided to radial spectrum');
            return;
        }
        
        console.log('[RadialSpectrum] Data length:', data.length);
        this.data = data;
        this.setupColorScale();
        this.setupSVG();
        this.addControls();
        this.drawChart();
        console.log('[RadialSpectrum] Initialization complete');
    }

    setupColorScale() {
        // Use a vibrant color scheme for better readability
        // Higher valence = warmer colors (yellow/orange), lower valence = cooler colors (blue/purple)
        this.colorScale = d3.scaleSequential()
            .domain([0, 1])
            .interpolator(d3.interpolateViridis);
        
        // Alternative: Use a custom vibrant palette
        // this.colorScale = d3.scaleSequential()
        //     .domain([0, 1])
        //     .interpolator(t => {
        //         // Blue (0) -> Green -> Yellow -> Orange -> Red (1)
        //         if (t < 0.25) return d3.interpolateBlues(1 - t * 4);
        //         if (t < 0.5) return d3.interpolateGreens((t - 0.25) * 4);
        //         if (t < 0.75) return d3.interpolateYlOrRd((t - 0.5) * 4);
        //         return d3.interpolateOranges((t - 0.75) * 4);
        //     });
    }

    setupSVG() {
        console.log('[RadialSpectrum] Setting up SVG for container:', this.containerId);
        const container = d3.select(`#${this.containerId}`);
        
        if (container.empty()) {
            console.error(`[RadialSpectrum] ERROR: Container #${this.containerId} not found`);
            return;
        }
        
        const containerNode = container.node();
        const containerRect = containerNode.getBoundingClientRect();
        console.log('[RadialSpectrum] Container found. Dimensions:', {
            width: containerRect.width,
            height: containerRect.height,
            visible: containerRect.width > 0 && containerRect.height > 0
        });
        
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
        
        console.log('[RadialSpectrum] SVG created. Dimensions:', {
            width: this.width,
            height: this.height,
            radius: this.radius,
            centerX: this.centerX,
            centerY: this.centerY
        });
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
        if (this.isDrawing) {
            console.warn('[RadialSpectrum] WARNING: Already drawing, skipping recursive call');
            return;
        }
        
        console.log('[RadialSpectrum] Drawing chart - currentDecadeIndex:', this.currentDecadeIndex);
        this.isDrawing = true;
        
        if (!this.svg) {
            console.error('[RadialSpectrum] ERROR: SVG not initialized');
            this.isDrawing = false;
            return;
        }
        
        if (!this.data || this.data.length === 0) {
            console.error('[RadialSpectrum] ERROR: Data not available');
            this.isDrawing = false;
            return;
        }

        if (this.currentDecadeIndex < 0 || this.currentDecadeIndex >= this.data.length) {
            console.warn('[RadialSpectrum] WARNING: Invalid currentDecadeIndex, resetting to 0');
            this.currentDecadeIndex = 0;
        }

        const currentData = this.data[this.currentDecadeIndex];
        console.log('[RadialSpectrum] Current decade data:', {
            index: this.currentDecadeIndex,
            decade: currentData.decade,
            energy: currentData.energy,
            tempo: currentData.tempo,
            valence: currentData.valence
        });
        
        const elementsToRemove = this.svg.selectAll('.spectrum-element');
        const count = elementsToRemove.size();
        console.log('[RadialSpectrum] Removing', count, 'existing spectrum elements');
        elementsToRemove.remove();

        // Create text shadow filter for better readability (only once per chart redraw)
        const defs = this.svg.append('defs');
        const textShadow = defs.append('filter')
            .attr('id', 'text-shadow-center')
            .attr('x', '-50%')
            .attr('y', '-50%')
            .attr('width', '200%')
            .attr('height', '200%');
        
        textShadow.append('feGaussianBlur')
            .attr('in', 'SourceAlpha')
            .attr('stdDeviation', 2)
            .attr('result', 'blur');
        
        textShadow.append('feOffset')
            .attr('in', 'blur')
            .attr('dx', 0)
            .attr('dy', 0)
            .attr('result', 'offsetBlur');
        
        textShadow.append('feFlood')
            .attr('flood-color', '#000000')
            .attr('flood-opacity', 0.6)
            .attr('result', 'offsetColor');
        
        textShadow.append('feComposite')
            .attr('in', 'offsetColor')
            .attr('in2', 'offsetBlur')
            .attr('operator', 'in')
            .attr('result', 'shadow');
        
        textShadow.append('feComposite')
            .attr('in', 'SourceGraphic')
            .attr('in2', 'shadow')
            .attr('operator', 'over');

        const ringsDrawn = [];
        this.data.forEach((decadeData, index) => {
            const ringRadius = (this.radius / this.data.length) * (index + 1);
            // Increase opacity for inactive rings to make them more visible
            const opacity = index === this.currentDecadeIndex ? 1 : 0.5;
            
            this.drawDecadeRing(decadeData, ringRadius, opacity, index === this.currentDecadeIndex);
            ringsDrawn.push(decadeData.decade);
        });
        console.log('[RadialSpectrum] Rings drawn for decades:', ringsDrawn);

        this.drawCenterCircle(currentData);
        this.drawLegend();
        
        console.log('[RadialSpectrum] Chart drawing complete');
        console.log('[RadialSpectrum] Rings drawn:', this.data.length);
        
        this.isDrawing = false;
    }

    drawDecadeRing(decadeData, radius, opacity, isActive) {
        const numPoints = 36;
        const points = [];
        const decadeIndex = this.data.indexOf(decadeData);

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
            .attr('class', `spectrum-element decade-ring ring-${decadeIndex}`)
            .attr('d', lineGenerator)
            .attr('fill', this.colorScale(decadeData.valence))
            .attr('opacity', opacity)
            .attr('stroke', isActive ? '#ffffff' : (opacity > 0.3 ? '#666666' : 'none'))
            .attr('stroke-width', isActive ? 3 : (opacity > 0.3 ? 1 : 0))
            .style('filter', isActive ? 'drop-shadow(0 0 8px rgba(0,0,0,0.3))' : 'none')
            .on('mouseover', () => {
                const now = Date.now();
                if (now - this.lastHoverTime < 300) {
                    console.log('[RadialSpectrum] Hover throttled, skipping');
                    return;
                }
                
                if (!isActive && decadeIndex !== this.currentDecadeIndex && !this.isDrawing) {
                    console.log('[RadialSpectrum] Hover detected on ring', decadeIndex, '- switching to decade:', decadeData.decade);
                    this.lastHoverTime = now;
                    this.currentDecadeIndex = decadeIndex;
                    setTimeout(() => this.drawChart(), 50);
                } else if (isActive) {
                    console.log('[RadialSpectrum] Hover on active ring, no action needed');
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
            .attr('stroke', isActive ? '#1a1a1a' : '#888888')
            .attr('stroke-width', thickness)
            .attr('opacity', opacity)
            .attr('stroke-linecap', 'round')
            .style('filter', isActive ? 'drop-shadow(0 0 4px rgba(0,0,0,0.5))' : 'none');
    }

    drawCenterCircle(decadeData) {
        const centerGroup = this.svg.append('g')
            .attr('class', 'spectrum-element center-circle');

        // Add a semi-transparent background circle for better text readability
        centerGroup.append('circle')
            .attr('r', 50)
            .attr('fill', '#ffffff')
            .attr('opacity', 0.15)
            .attr('stroke', 'none');

        // Main colored circle
        centerGroup.append('circle')
            .attr('r', 48)
            .attr('fill', this.colorScale(decadeData.valence))
            .attr('opacity', 0.9)
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 4)
            .style('filter', 'drop-shadow(0 0 8px rgba(0,0,0,0.4))');

        // Add text with shadow for better readability
        centerGroup.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '-10')
            .attr('font-size', '20px')
            .attr('font-weight', 'bold')
            .attr('fill', '#ffffff')
            .style('filter', 'url(#text-shadow-center)')
            .style('text-shadow', '0 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.5)')
            .text(decadeData.decade);

        centerGroup.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '12')
            .attr('font-size', '13px')
            .attr('font-weight', '600')
            .attr('fill', '#ffffff')
            .style('filter', 'url(#text-shadow-center)')
            .style('text-shadow', '0 2px 4px rgba(0,0,0,0.8), 0 0 6px rgba(0,0,0,0.5)')
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
                    const oldIndex = this.currentDecadeIndex;
                    this.currentDecadeIndex = Math.max(0, this.currentDecadeIndex - 1);
                    if (oldIndex !== this.currentDecadeIndex) {
                        console.log('[RadialSpectrum] Previous button clicked, index:', this.currentDecadeIndex);
                        this.drawChart();
                    }
                });

            controlsDiv.append('span')
                .text('  ')
                .style('margin', '0 10px');

            controlsDiv.append('button')
                .attr('id', 'next-decade')
                .text('Next ▶')
                .on('click', () => {
                    const oldIndex = this.currentDecadeIndex;
                    this.currentDecadeIndex = Math.min(this.data.length - 1, this.currentDecadeIndex + 1);
                    if (oldIndex !== this.currentDecadeIndex) {
                        console.log('[RadialSpectrum] Next button clicked, index:', this.currentDecadeIndex);
                        this.drawChart();
                    }
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
        if (this.data && !this.isDrawing) {
            console.log('[RadialSpectrum] Resizing chart');
            this.setupSVG();
            const container = d3.select(`#${this.containerId}`);
            if (container.select('.radial-controls').empty()) {
                this.addControls();
            }
            this.drawChart();
        }
    }
}
