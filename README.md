# Sonic Evolution: How Music Has Changed Over Time

An interactive scrollytelling web application that visualizes the evolution of popular music from the 1960s to today, using D3.js and data from Spotify and Million Song datasets.

## Project Overview

This project tells the visual data story of how popular music has transformed over the decades, exploring changes in rhythm, energy, loudness, emotional tone, and genre composition. The application features 5 distinct visualization techniques, including an innovative radial sound spectrum visualization that combines multiple audio features in a novel encoding.

## Team Members

- Ashmit Arya
- Nathan Yee
- Sarjan Patel
- Yashvi Jasani

## Features

- **5 Different Visualization Techniques:**
  1. Line Chart - Popularity trends over time by decade
  2. Stacked Bar Chart - Genre composition across decades
  3. Scatterplot - Energy vs. Danceability correlation
  4. Bubble Chart - Top artists by decade (force-directed layout)
  5. Radial Sound Spectrum - Innovative visualization combining energy, tempo, valence, and loudness

- **Interactive Features:**
  - Hover tooltips on all visualizations
  - Decade filtering for scatterplot and bubble chart
  - Smooth animations and transitions
  - Responsive design for mobile, tablet, and desktop

- **Scrollytelling Experience:**
  - Smooth scroll-triggered animations
  - Narrative text integrated with visualizations
  - Progressive revelation of insights

## Technologies Used

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Visualization:** D3.js v7
- **Scrollytelling:** Scrollama.js
- **Data Processing:** Python (Pandas) for data preprocessing

## Dataset Sources

1. **Spotify Tracks Dataset**
   - Source: https://www.kaggle.com/datasets/zaheenhamidani/ultimate-spotify-tracks-db
   - Size: 160,000+ songs
   - Key attributes: track_name, artist_name, genre, year, popularity, danceability, energy, valence, loudness, tempo, acousticness

2. **Million Song Dataset**
   - Source: https://corgis-edu.github.io/corgis/csv/music/
   - Purpose: Validation and additional temporal analysis

## Setup and Installation

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (VS Code Live Server, Python http.server, or similar)

### Installation Steps

1. **Navigate to the project directory:**
   ```bash
   cd CSE478Project
   ```

2. **Data Processing (Optional):**
   If you have the raw Spotify dataset, you can process it:
   ```bash
   cd data
   python3 process_data.py
   ```
   
   Note: The project includes pre-processed JSON data files in `data/processed/` that can be used directly.

3. **Start a local web server:**
   
   **Option 1: Using Python**
   ```bash
   python3 -m http.server 8000
   ```
   
   **Option 2: Using VS Code Live Server**
   - Install the "Live Server" extension
   - Right-click on `index.html` and select "Open with Live Server"
   
   **Option 3: Using Node.js http-server**
   ```bash
   npx http-server -p 8000
   ```

4. **Open in browser:**
   Navigate to `http://localhost:8000` in your web browser

## Project Structure

```
CSE478Project/
├── index.html                 # Main HTML page
├── css/
│   └── styles.css            # Main stylesheet
├── js/
│   ├── main.js               # Main application logic
│   ├── scrollytelling.js     # Scroll management
│   ├── dataLoader.js         # Data loading and processing
│   └── visualizations/
│       ├── lineChart.js      # Popularity vs. Time
│       ├── stackedBar.js     # Genre share
│       ├── scatterplot.js    # Energy vs. Danceability
│       ├── bubbleChart.js    # Top Artists
│       └── radialSpectrum.js # Innovative radial view
├── data/
│   ├── process_data.py       # Data processing script
│   └── processed/            # Pre-processed JSON files
│       ├── by_decade.json
│       ├── by_genre.json
│       ├── energy_danceability.json
│       ├── top_artists.json
│       └── radial_data.json
├── assets/                   # Images, fonts, etc.
└── README.md                 # This file
```

## Data Processing

The `data/process_data.py` script performs the following operations:

1. Loads and cleans the Spotify dataset
2. Filters data by year (1960-2024)
3. Aggregates data by decade
4. Calculates statistics for audio features
5. Extracts genre distributions
6. Identifies top artists per decade
7. Exports processed data to JSON format

To run the data processing:
```bash
cd data
python3 process_data.py
```

Make sure to place the raw CSV file (`spotify_tracks.csv`) in the `data/` directory before running the script.

## Visualization Details

### 1. Line Chart - Popularity Over Time
Shows the average popularity score of tracks across decades, revealing trends in music consumption patterns.

**Interactivity:**
- Hover over data points to see decade statistics
- Interactive tooltips with detailed information

### 2. Stacked Bar Chart - Genre Composition
Visualizes the percentage distribution of genres across decades, showing how musical styles have shifted over time.

**Interactivity:**
- Hover to highlight specific genres
- Click legend items to filter
- Tooltips show genre percentages

### 3. Scatterplot - Energy vs. Danceability
Explores the relationship between energy and danceability, with color encoding by decade.

**Interactivity:**
- Decade filter dropdown
- Hover for song details
- Color legend by decade

### 4. Bubble Chart - Top Artists
Force-directed bubble chart showing top artists by decade, with bubble size representing popularity.

**Interactivity:**
- Decade selector to filter artists
- Hover for artist information
- Force simulation for natural layout

### 5. Radial Sound Spectrum (Innovative View)
Custom radial visualization that encodes:
- **Radial Distance:** Energy level
- **Angle:** Tempo (mapped to clock position)
- **Color:** Valence (emotional tone)
- **Thickness:** Loudness

**Innovation:** This visualization combines multiple audio features in a novel radial encoding that allows direct comparison across decades. The concentric rings show the evolution of the "sonic fingerprint" over time.

**Interactivity:**
- Previous/Next buttons to navigate decades
- Hover over rings to see details
- Click rings to switch active decade

## Browser Compatibility

Tested and working on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Considerations

- Data is pre-processed to minimize client-side computation
- Visualizations use efficient D3.js data binding
- SVG rendering is optimized for smooth interactions
- Responsive design adapts to different screen sizes

## Accessibility Features

- ARIA labels on all visualizations
- Semantic HTML structure
- Keyboard navigation support
- Colorblind-friendly color palettes
- Screen reader friendly tooltips

## Future Improvements

- Real-time data updates
- Additional filtering options
- Export visualizations as images
- More detailed genre breakdowns
- Artist comparison across decades
- Playlist generation based on visualization selections

## License

This project is created for educational purposes as part of CSE 478 course requirements.

## Acknowledgments

- Spotify for providing the tracks dataset
- CORGIS for the Million Song Dataset
- D3.js community for excellent documentation
- Scrollama.js for scrollytelling functionality

## Contact

For questions or issues, please contact the project team members or open an issue in the repository.
