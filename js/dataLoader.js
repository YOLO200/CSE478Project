class DataLoader {
    constructor() {
        this.spotifyData = null;
        this.processedData = null;
    }

    async loadAll() {
        try {
            await this.loadSampleData();
            this.processData();
            return this.processedData;
        } catch (error) {
            console.error('Error loading data:', error);
            throw error;
        }
    }

    async loadSampleData() {
        try {
            const byDecade = await this.loadFromJSON('data/processed/by_decade.json');
            const byGenre = await this.loadFromJSON('data/processed/by_genre.json');
            const energyDanceability = await this.loadFromJSON('data/processed/energy_danceability.json');
            const topArtists = await this.loadFromJSON('data/processed/top_artists.json');
            const radialData = await this.loadFromJSON('data/processed/radial_data.json');

            this.spotifyData = {
                byDecade,
                byGenre,
                energyDanceability,
                topArtists,
                radialData
            };
        } catch (error) {
            console.warn('Could not load JSON files, using fallback data:', error);
            this.spotifyData = {
                byDecade: [],
                byGenre: [],
                energyDanceability: [],
                topArtists: [],
                radialData: []
            };
        }
    }

    processData() {
        if (!this.spotifyData) return;

        this.processedData = {
            popularity: this.aggregateByDecade('popularity'),
            genres: this.aggregateGenres(),
            energyDanceability: this.aggregateEnergyDanceability(),
            topArtists: this.aggregateTopArtists(),
            radialData: this.prepareRadialData()
        };
    }

    aggregateByDecade(metric = 'popularity') {
        if (this.spotifyData && this.spotifyData.byDecade && this.spotifyData.byDecade.length > 0) {
            return this.spotifyData.byDecade;
        }
        
        const decades = ['1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];
        const yearRanges = {
            '1960s': [1960, 1969],
            '1970s': [1970, 1979],
            '1980s': [1980, 1989],
            '1990s': [1990, 1999],
            '2000s': [2000, 2009],
            '2010s': [2010, 2019],
            '2020s': [2020, 2024]
        };

        return decades.map(decade => {
            const [start, end] = yearRanges[decade];
            return {
                decade,
                startYear: start,
                endYear: end,
                avgPopularity: Math.random() * 40 + 30 + (decades.indexOf(decade) * 5)
            };
        });
    }

    aggregateGenres() {
        if (this.spotifyData && this.spotifyData.byGenre && this.spotifyData.byGenre.length > 0) {
            return this.spotifyData.byGenre;
        }
        
        const decades = ['1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];
        const genres = ['Pop', 'Rock', 'Hip-Hop', 'Electronic', 'R&B', 'Country', 'Jazz', 'Other'];

        return decades.map(decade => {
            const genreCounts = {};
            genres.forEach(genre => {
                genreCounts[genre] = Math.random() * 30 + Math.random() * 20;
            });
            
            const total = Object.values(genreCounts).reduce((a, b) => a + b, 0);
            const genrePercentages = {};
            genres.forEach(genre => {
                genrePercentages[genre] = (genreCounts[genre] / total) * 100;
            });

            return {
                decade,
                genres: genrePercentages,
                total: total
            };
        });
    }

    aggregateEnergyDanceability() {
        if (this.spotifyData && this.spotifyData.energyDanceability && this.spotifyData.energyDanceability.length > 0) {
            return this.spotifyData.energyDanceability;
        }
        
        const points = [];
        const decades = ['1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];
        
        decades.forEach(decade => {
            for (let i = 0; i < 100; i++) {
                points.push({
                    decade,
                    energy: Math.random(),
                    danceability: Math.random(),
                    popularity: Math.random() * 100,
                    genre: ['Pop', 'Rock', 'Hip-Hop', 'Electronic'][Math.floor(Math.random() * 4)]
                });
            }
        });

        return points;
    }

    aggregateTopArtists() {
        if (this.spotifyData && this.spotifyData.topArtists && this.spotifyData.topArtists.length > 0) {
            return this.spotifyData.topArtists;
        }
        
        const decades = ['1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];
        const sampleArtists = {
            '1960s': ['The Beatles', 'The Rolling Stones', 'Bob Dylan', 'Jimi Hendrix', 'The Doors'],
            '1970s': ['Led Zeppelin', 'Queen', 'Pink Floyd', 'David Bowie', 'Fleetwood Mac'],
            '1980s': ['Michael Jackson', 'Madonna', 'Prince', 'The Cure', 'U2'],
            '1990s': ['Nirvana', 'Radiohead', 'Tupac', 'The Notorious B.I.G.', 'Britney Spears'],
            '2000s': ['Eminem', 'Beyoncé', 'OutKast', 'Coldplay', 'Alicia Keys'],
            '2010s': ['Taylor Swift', 'Drake', 'Adele', 'Ed Sheeran', 'Billie Eilish'],
            '2020s': ['The Weeknd', 'Olivia Rodrigo', 'Bad Bunny', 'Dua Lipa', 'Harry Styles']
        };

        return decades.map(decade => {
            return sampleArtists[decade].map((artist, index) => ({
                name: artist,
                decade,
                popularity: 90 - (index * 10) + Math.random() * 10,
                genre: ['Pop', 'Rock', 'Hip-Hop', 'Electronic'][Math.floor(Math.random() * 4)],
                hitCount: 5 - index + Math.floor(Math.random() * 3)
            }));
        }).flat();
    }

    prepareRadialData() {
        if (this.spotifyData && this.spotifyData.radialData && this.spotifyData.radialData.length > 0) {
            return this.spotifyData.radialData;
        }
        
        const decades = ['1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];
        
        return decades.map((decade, index) => {
            return {
                decade,
                energy: 0.4 + (index * 0.05) + Math.random() * 0.1,
                tempo: 100 + (index * 5) + Math.random() * 20,
                valence: 0.5 + Math.sin(index * 0.5) * 0.2 + Math.random() * 0.1,
                loudness: -10 - (index * 1) + Math.random() * 2,
                acousticness: 0.5 - (index * 0.05) + Math.random() * 0.1
            };
        });
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
