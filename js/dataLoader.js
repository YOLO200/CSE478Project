class DataLoader {
    constructor() {
        this.spotifyData = null;
        this.processedData = null;
    }

    async loadAll() {
        console.log('[DataLoader] Starting to load all data...');
        try {
            await this.loadSampleData();
            console.log('[DataLoader] Data files loaded');
            this.processData();
            console.log('[DataLoader] Data processing complete');
            console.log('[DataLoader] Processed data summary:', {
                popularity: this.processedData?.popularity?.length || 0,
                genres: this.processedData?.genres?.length || 0,
                energyDanceability: this.processedData?.energyDanceability?.length || 0,
                topArtists: this.processedData?.topArtists?.length || 0,
                radialData: this.processedData?.radialData?.length || 0
            });
            return this.processedData;
        } catch (error) {
            console.error('[DataLoader] ERROR loading data:', error);
            throw error;
        }
    }

    async loadSampleData() {
        console.log('[DataLoader] Loading JSON data files...');
        try {
            console.log('[DataLoader] Loading by_decade.json...');
            const byDecade = await this.loadFromJSON('data/processed/by_decade.json');
            console.log('[DataLoader] by_decade.json loaded:', byDecade?.length || 0, 'records');
            
            console.log('[DataLoader] Loading by_genre.json...');
            const byGenre = await this.loadFromJSON('data/processed/by_genre.json');
            console.log('[DataLoader] by_genre.json loaded:', byGenre?.length || 0, 'records');
            
            console.log('[DataLoader] Loading energy_danceability.json...');
            const energyDanceability = await this.loadFromJSON('data/processed/energy_danceability.json');
            console.log('[DataLoader] energy_danceability.json loaded:', energyDanceability?.length || 0, 'records');
            
            console.log('[DataLoader] Loading top_artists.json...');
            const topArtists = await this.loadFromJSON('data/processed/top_artists.json');
            console.log('[DataLoader] top_artists.json loaded:', topArtists?.length || 0, 'records');
            
            console.log('[DataLoader] Loading radial_data.json...');
            const radialData = await this.loadFromJSON('data/processed/radial_data.json');
            console.log('[DataLoader] radial_data.json loaded:', radialData?.length || 0, 'records');

            this.spotifyData = {
                byDecade,
                byGenre,
                energyDanceability,
                topArtists,
                radialData
            };
            console.log('[DataLoader] All JSON files loaded successfully');
        } catch (error) {
            console.error('[DataLoader] ERROR: Could not load JSON files:', error);
            console.error('[DataLoader] Please run: python3 data/process_data.py to generate data files');
            throw new Error('Data files not found. Please process the dataset first.');
        }
    }

    processData() {
        console.log('[DataLoader] Processing data...');
        if (!this.spotifyData) {
            console.warn('[DataLoader] WARNING: No spotify data available');
            return;
        }

        console.log('[DataLoader] Aggregating by decade...');
        const popularity = this.aggregateByDecade('popularity');
        console.log('[DataLoader] Popularity data:', popularity?.length || 0, 'records');
        
        console.log('[DataLoader] Aggregating genres...');
        const genres = this.aggregateGenres();
        console.log('[DataLoader] Genres data:', genres?.length || 0, 'records');
        
        console.log('[DataLoader] Aggregating energy/danceability...');
        const energyDanceability = this.aggregateEnergyDanceability();
        console.log('[DataLoader] Energy/Danceability data:', energyDanceability?.length || 0, 'records');
        
        console.log('[DataLoader] Aggregating top artists...');
        const topArtists = this.aggregateTopArtists();
        console.log('[DataLoader] Top artists data:', topArtists?.length || 0, 'records');
        
        console.log('[DataLoader] Preparing radial data...');
        const radialData = this.prepareRadialData();
        console.log('[DataLoader] Radial data:', radialData?.length || 0, 'records');

        this.processedData = {
            popularity,
            genres,
            energyDanceability,
            topArtists,
            radialData
        };
        
        console.log('[DataLoader] Data processing complete');
    }

    aggregateByDecade(metric = 'popularity') {
        if (this.spotifyData && this.spotifyData.byDecade && this.spotifyData.byDecade.length > 0) {
            return this.spotifyData.byDecade;
        }
        console.error('[DataLoader] ERROR: No decade data available');
        return [];
    }

    aggregateGenres() {
        if (this.spotifyData && this.spotifyData.byGenre && this.spotifyData.byGenre.length > 0) {
            return this.spotifyData.byGenre;
        }
        console.error('[DataLoader] ERROR: No genre data available');
        return [];
    }

    aggregateEnergyDanceability() {
        if (this.spotifyData && this.spotifyData.energyDanceability && this.spotifyData.energyDanceability.length > 0) {
            return this.spotifyData.energyDanceability;
        }
        console.error('[DataLoader] ERROR: No energy/danceability data available');
        return [];
    }

    aggregateTopArtists() {
        if (this.spotifyData && this.spotifyData.topArtists && this.spotifyData.topArtists.length > 0) {
            return this.spotifyData.topArtists;
        }
        console.error('[DataLoader] ERROR: No top artists data available');
        return [];
    }

    prepareRadialData() {
        if (this.spotifyData && this.spotifyData.radialData && this.spotifyData.radialData.length > 0) {
            return this.spotifyData.radialData;
        }
        console.error('[DataLoader] ERROR: No radial data available');
        return [];
    }

    async loadFromJSON(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error loading JSON from ${url}:`, error);
            throw error;
        }
    }
}

const dataLoader = new DataLoader();
