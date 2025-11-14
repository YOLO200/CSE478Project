# CSE 478 Project - Work in Progress Report

**Project Title:** Sonic Evolution: How Music Has Changed Over Time

**Team Members:** Ashmit Arya, Nathan Yee, Sarjan Patel, Yashvi Jasani

**Date:** November 2024

---

## 1. Project Status: Tasks Completed and Remaining

### Completed Tasks ✓

1. **Project Setup and Infrastructure**
   - Created project structure with proper directory organization (css, js, data, assets)
   - Set up HTML5 template with scrollytelling framework
   - Integrated D3.js v7 and Scrollama.js libraries
   - Configured responsive design system

2. **Data Processing and Preparation**
   - Downloaded Spotify Tracks Dataset (SpotifyFeatures.csv, ~33MB) and music dataset (music.csv, ~3MB)
   - Created Python data processing script (`data/process_data.py`)
   - Generated processed JSON files for all visualizations:
     - `by_decade.json` - Popularity trends by decade
     - `by_genre.json` - Genre composition by decade
     - `energy_danceability.json` - Energy and danceability data points
     - `top_artists.json` - Top artists by decade
     - `radial_data.json` - Audio features for radial visualization

3. **Core Visualizations Implemented**
   - **Line Chart**: Popularity trends over time by decade with interactive tooltips
   - **Stacked Bar Chart**: Genre composition across decades with hover interactions and legend filtering
   - **Scatterplot**: Energy vs. Danceability relationship with decade filtering
   - **Bubble Chart**: Top artists by decade with force-directed layout and decade selection
   - **Radial Sound Spectrum**: Innovative visualization combining energy, tempo, valence, and loudness

4. **Interactivity Features**
   - Implemented hover tooltips for all visualizations
   - Added decade/genre filtering controls where applicable
   - Created smooth transitions and animations
   - Integrated scroll-triggered updates using Scrollama.js

5. **Scrollytelling Framework**
   - Implemented scroll management system with Scrollama.js
   - Created narrative text sections for each visualization
   - Set up scroll-triggered animations and section activation

6. **Styling and Design**
   - Developed consistent color palette and typography
   - Implemented responsive design for mobile, tablet, and desktop
   - Added accessibility features (ARIA labels, keyboard navigation)
   - Created smooth animations and visual transitions

7. **Documentation**
   - Created comprehensive README.md with setup instructions
   - Documented data processing steps
   - Added code comments where necessary

### Remaining Tasks

1. **Data Integration**
   - Obtain and integrate actual Spotify Tracks Dataset (160,000+ songs)
   - Run data processing script on real dataset
   - Validate data quality and handle edge cases
   - Update JSON files with real processed data

2. **Visualization Refinement**
   - Test all visualizations with real data and adjust scales as needed
   - Fine-tune color schemes and visual aesthetics
   - Optimize performance for large datasets
   - Add more data points to scatterplot and other visualizations

3. **Scrollytelling Polish**
   - Enhance scroll animations and transitions
   - Refine narrative text for each section
   - Test scroll behavior across different browsers
   - Optimize scroll performance

4. **Testing and Quality Assurance**
   - Cross-browser testing (Chrome, Firefox, Safari, Edge)
   - Mobile device testing and responsive design verification
   - Performance optimization for large datasets
   - Accessibility testing and improvements

5. **Innovative Visualization Enhancement**
   - Refine radial spectrum visualization encoding
   - Add more interactive features to innovative view
   - Create better legend/guide for radial visualization
   - Test innovative view with real audio feature data

6. **Final Documentation**
   - Complete project writeup with all required sections
   - Create poster materials for presentation
   - Finalize README with complete setup instructions
   - Prepare final code documentation

---

## 2. Changes Since Proposal

### Design Changes

1. **Radial Sound Spectrum Visualization**
   - **Original Plan**: Custom radial encoding with energy, tempo, valence, loudness
   - **Current Implementation**: Enhanced with concentric rings showing evolution across decades
   - **Reason**: Better visualizes the temporal evolution while maintaining the innovative multi-feature encoding

2. **Scatterplot Enhancement**
   - **Original Plan**: Basic energy vs. danceability scatterplot
   - **Current Implementation**: Added size encoding for popularity and decade filtering
   - **Reason**: Provides more information density and better user control

3. **Bubble Chart Implementation**
   - **Original Plan**: Static bubble chart by decade
   - **Current Implementation**: Force-directed layout with smooth transitions between decades
   - **Reason**: More dynamic and visually engaging, better shows relationships between artists

4. **Navigation and Interaction**
   - **Original Plan**: Scroll-based navigation
   - **Current Implementation**: Added explicit filtering controls for scatterplot and bubble chart
   - **Reason**: Better user experience allows direct decade selection without scrolling

### Interaction Changes

1. **Tooltip System**
   - Added comprehensive tooltips across all visualizations
   - Unified tooltip styling for consistency
   - Enhanced tooltip content with more detailed information

2. **Legend Interactions**
   - Stacked bar chart legend now highlights genres on hover
   - Color-coded legends for easier identification
   - Interactive legend filtering for better data exploration

3. **Chart Responsiveness**
   - All charts now resize properly on window resize
   - Improved mobile responsiveness
   - Better handling of container visibility during scroll

### Technical Changes

1. **Data Structure**
   - Moved from single dataset to processed JSON files per visualization
   - Added fallback data generation for development/testing
   - Implemented robust error handling for missing data

2. **Code Organization**
   - Separated each visualization into its own class file
   - Created modular data loader system
   - Implemented singleton patterns for managers

---

## 3. Screenshots

### Screenshot 1: Overview of All Visualizations

[Note: Please take a screenshot showing all visualizations implemented so far. Include:
- Hero section
- Line chart (Popularity Over Time)
- Stacked bar chart (Genre Composition)
- Scatterplot (Energy vs. Danceability)
- Bubble chart (Top Artists)
- Radial spectrum (Innovative View)]

**Instructions for Screenshot:**
1. Open the project in a web browser (using Live Server or local server)
2. Scroll through the entire page
3. Take screenshots of each visualization section
4. Combine into a single document or provide multiple screenshots
5. Ensure all visualizations are visible and properly rendered

---

## 4. Data Sources and Preprocessing

### Original Data Source

**Primary Dataset: Spotify Tracks Dataset**
- **URL**: https://www.kaggle.com/datasets/zaheenhamidani/ultimate-spotify-tracks-db
- **Description**: Contains over 160,000 songs with metadata (artist, genre, release year) and audio features such as energy, danceability, valence, tempo, loudness, and acousticness
- **License**: Public dataset available on Kaggle
- **Key Attributes Used**:
  - track_name
  - artist_name
  - genre
  - year
  - popularity
  - danceability
  - energy
  - valence
  - loudness
  - tempo
  - acousticness

**Secondary Dataset: Million Song Dataset**
- **URL**: https://corgis-edu.github.io/corgis/csv/music/
- **Description**: Metadata and audio features for 1 million popular tracks
- **Purpose**: Validation and additional temporal analysis
- **Status**: Referenced for validation, primarily using Spotify dataset

### Data Preprocessing

**Processing Script**: `data/process_data.py`

**Preprocessing Steps:**

1. **Data Cleaning**
   - Removed records with missing values in critical columns (year, popularity, energy, danceability, valence, tempo, loudness)
   - Filtered data to years 1960-2024
   - Validated data types and ranges

2. **Decade Aggregation**
   - Grouped data into decades: 1960s, 1970s, 1980s, 1990s, 2000s, 2010s, 2020s
   - Calculated average popularity scores per decade
   - Aggregated genre distributions as percentages per decade

3. **Feature Extraction**
   - Extracted energy-danceability pairs for scatterplot visualization
   - Sampled data points for performance (500-1000 points per visualization)
   - Calculated top artists by popularity per decade

4. **Radial Data Preparation**
   - Computed average audio features per decade:
     - Energy (0-1 scale)
     - Tempo (BPM)
     - Valence (0-1 scale, emotional tone)
     - Loudness (dB)
     - Acousticness (0-1 scale)

5. **Data Export**
   - Exported processed data to JSON format optimized for D3.js
   - Created separate JSON files for each visualization type
   - Maintained data structure compatible with D3 data binding patterns

**Preprocessing Challenges:**
- Handling missing values in audio features
- Normalizing different data scales (tempo, loudness, popularity)
- Sampling large datasets while maintaining statistical significance
- Ensuring data consistency across decades

**Current Status:**
- CSV files are present in project directory (SpotifyFeatures.csv, music.csv)
- Processing script is ready to run on actual data
- JSON files currently use sample/placeholder data for development
- Need to run preprocessing script on actual CSV files to generate final JSON data

**Next Steps for Data Integration:**
- Run preprocessing script (`python3 data/process_data.py`) on actual CSV files
- Verify processed data quality and statistics
- Update JSON files in `data/processed/` with real processed data
- Adjust visualization scales based on actual data ranges
- Test all visualizations with real data

---

## 5. Current Project State

The project is approximately **75% complete**. All core visualizations have been implemented with their basic functionality. The main remaining work involves:

1. Integrating real data from the Spotify dataset
2. Fine-tuning visualizations with actual data
3. Performance optimization
4. Final polish and testing
5. Documentation completion

The codebase is well-organized and ready for data integration. All visualization classes are modular and can easily accommodate real data once the preprocessing is complete with the actual dataset.

---

## 6. Timeline

**Completed:**
- ✓ Project setup and infrastructure
- ✓ All 5 visualizations implemented
- ✓ Scrollytelling framework
- ✓ Interactivity features
- ✓ Responsive design
- ✓ Basic documentation

**In Progress:**
- ○ Data integration with real dataset
- ○ Visualization refinement
- ○ Performance optimization

**Remaining:**
- ○ Final testing and QA
- ○ Project writeup completion
- ○ Poster creation
- ○ Final presentation preparation

---

## 7. Instructions for PDF Conversion

To convert this markdown file to PDF, you can use one of these methods:

1. **Using VS Code**:
   - Install the "Markdown PDF" extension
   - Open WIP_Report.md
   - Right-click and select "Markdown PDF: Export (pdf)"

2. **Using Pandoc** (if installed):
   ```bash
   pandoc WIP_Report.md -o WIP_Report.pdf
   ```

3. **Using online converter**:
   - Upload WIP_Report.md to https://www.markdowntopdf.com/
   - Download the converted PDF

4. **Using browser print**:
   - Open the markdown file in a markdown viewer
   - Print to PDF (Ctrl/Cmd + P, then Save as PDF)

---

**Note**: This report reflects the current state of the project as of November 2024. 

**Action Required Before Submission:**
1. Take screenshots of all visualizations showing them rendered in the browser
2. Insert screenshots into this document (replace the placeholder text in Section 3)
3. Convert this markdown file to PDF using one of the methods above
4. Submit the PDF to Canvas

