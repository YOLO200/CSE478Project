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

1. **Million Song Dataset (Primary)**
   - Source: https://corgis-edu.github.io/corgis/csv/music/
   - File: `music.csv` (10,000 records)
   - Key attributes: artist_name, song.title, song.year, song.tempo, song.loudness, song.duration, song.hotttnesss
   - **Status:** Currently in use - provides year data required for temporal analysis

2. **Spotify Tracks Dataset (Available)**
   - Source: https://www.kaggle.com/datasets/zaheenhamidani/ultimate-spotify-tracks-db
   - File: `SpotifyFeatures.csv` (232,725 records)
   - Key attributes: track_name, artist_name, genre, popularity, danceability, energy, valence, loudness, tempo, acousticness
   - **Note:** Available in project but missing `year` column, so currently not used as primary dataset

## Setup and Installation

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3.x with pandas, numpy, and python-dateutil (for data processing)
- A local web server (VS Code Live Server, Python http.server, or similar)
- `music.csv` file in the project root directory

### Installation Steps

1. **Navigate to the project directory:**
   ```bash
   cd CSE478Project
   ```

2. **Data Processing (Required):**
   The project uses real data from `music.csv`. Process it before running:
   ```bash
   python3 data/process_data.py
   ```
   
   This will:
   - Load `music.csv` from the project root
   - Process and aggregate data by decade
   - Generate JSON files in `data/processed/`
   
   **Requirements:**
   ```bash
   pip3 install pandas numpy python-dateutil
   ```
   
   **Note:** The script will automatically use `music.csv` if available. Make sure `music.csv` is in the project root directory.

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
│   ├── process_data.py       # Data processing script (Python)
│   └── processed/            # Generated JSON files (after processing)
│       ├── by_decade.json    # Popularity trends by decade
│       ├── by_genre.json     # Genre distributions by decade
│       ├── energy_danceability.json  # Sample points for scatterplot
│       ├── top_artists.json  # Top artists per decade
│       └── radial_data.json  # Aggregated features for radial chart
├── music.csv                 # Million Song Dataset (source data)
├── SpotifyFeatures.csv       # Spotify dataset (available but not used)
├── WIP_Report.md             # Work-in-progress report
└── README.md                 # This file
```

## Data Processing

The `data/process_data.py` script performs the following operations:

1. **Loads data:** Reads `music.csv` from the project root directory
2. **Cleans data:** Removes invalid years, handles missing values
3. **Converts data:** Maps Million Song Dataset columns to expected format
   - `song.year` → `year`
   - `artist.name` → `artist_name`
   - `song.title` → `track_name`
   - `song.hotttnesss` → `popularity` (scaled 0-100)
   - Calculates missing features (energy, danceability) from available data
4. **Filters by year:** Keeps only records from 1960-2024
5. **Aggregates by decade:** Groups data into 1960s, 1970s, 1980s, 1990s, 2000s, 2010s
6. **Generates visualizations data:**
   - Popularity trends by decade
   - Genre distributions (from artist.terms)
   - Energy vs. Danceability samples
   - Top artists per decade
   - Radial spectrum aggregations
7. **Exports JSON:** Saves processed data to `data/processed/` directory

### Processing Statistics
After processing, you should see:
- **Processed records:** ~4,600+ songs (from 10,000 total)
- **Decades covered:** 1960s through 2010s
- **Genres identified:** 30+ distinct genres

### Running Data Processing:
```bash
# Install dependencies
pip3 install pandas numpy python-dateutil

# Run processing script
python3 data/process_data.py
```

**Important:** Place `music.csv` in the project root directory (not in `data/`) before running the script. The script will automatically detect and use it.

## Visualization Details

### 1. Line Chart - Popularity Over Time
Shows the average popularity score of tracks across decades, revealing trends in music consumption patterns.

**Interactivity:**
- Hover over data points to see decade statistics
- Interactive tooltips with detailed information

### 2. Stacked Bar Chart - Genre Composition
Visualizes the percentage distribution of genres across decades, showing how musical styles have shifted over time. Each bar represents a decade and shows the proportional share of different genres.

**Features:**
- Multi-column legend organized alphabetically
- "Other" category for genres not in top 10
- All bars stack to 100%

**Interactivity:**
- Hover over legend items to highlight specific genres in the chart
- Hover over bars to see genre percentages in tooltips
- Interactive legend with visual feedback

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
Custom radial visualization that encodes multiple audio features in a novel radial encoding:
- **Radial Distance:** Energy level (outer radius represents higher energy)
- **Angle:** Tempo (mapped to clock position, indicating song pace)
- **Color:** Valence (emotional tone - warmer colors for positive, cooler for negative)
  - Uses Viridis color scheme for better readability
- **Thickness:** Loudness (thicker lines indicate louder tracks)
- **Center Circle:** Current decade with energy value display

**Innovation:** This visualization combines multiple audio features in a novel radial encoding that allows direct comparison across decades. The concentric rings show the evolution of the "sonic fingerprint" over time. Each ring represents a different decade, with the active decade highlighted at full opacity.

**Features:**
- All decades visible simultaneously with varying opacity
- Active decade highlighted with increased opacity and white stroke
- Enhanced text shadows for better readability
- Smooth transitions between decades

**Interactivity:**
- Previous/Next buttons to navigate decades
- Hover over rings to switch to that decade
- Active ring highlighted with increased opacity and shadow
- Tooltips show decade statistics

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
- Debug logging available in browser console for troubleshooting

## Current Data Status

**✅ Processed and Active:**
- Using real data from `music.csv` (Million Song Dataset)
- ~4,634 valid records spanning 1960s-2010s
- All visualizations use actual processed data

**Data Files:**
- `music.csv` - Source data with year information (required)
- `data/processed/*.json` - Generated visualization data (auto-created by script)

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

## Troubleshooting

### Charts Not Rendering
1. Check browser console for error messages
2. Verify data files exist in `data/processed/`
3. Run `python3 data/process_data.py` to regenerate data files
4. Ensure you're using a local web server (not opening `index.html` directly)

### Data Issues
- If charts show "0%" or negative values, check that `music.csv` is in the project root
- Verify Python dependencies are installed: `pip3 install pandas numpy python-dateutil`
- Check console logs for data loading debug information

### Layout Issues
- Legend may appear in multiple columns if there are many genres
- Chart width automatically adjusts to accommodate legend
- On smaller screens, visualizations will stack vertically

## Acknowledgments

- **CORGIS** for the Million Song Dataset (primary data source)
- **Spotify** for providing audio feature data standards
- **D3.js** community for excellent documentation and examples
- **Scrollama.js** for scrollytelling functionality

## Contact

For questions or issues, please contact the project team members or open an issue in the repository.
