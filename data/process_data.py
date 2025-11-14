#!/usr/bin/env python3
"""
Data Processing Script for Sonic Evolution Project
Processes Spotify Tracks Dataset and Million Song Dataset
"""

import pandas as pd
import json
import numpy as np
from pathlib import Path

def load_spotify_data(filepath):
    """Load Spotify tracks dataset"""
    print(f"Loading Spotify data from {filepath}...")
    df = pd.read_csv(filepath)
    print(f"Loaded {len(df)} records")
    return df

def load_music_data(filepath):
    """Load Million Song Dataset"""
    print(f"Loading Million Song Dataset from {filepath}...")
    df = pd.read_csv(filepath)
    print(f"Loaded {len(df)} records")
    
    # Rename columns to match our expected format
    df = df.rename(columns={
        'song.year': 'year',
        'artist.name': 'artist_name',
        'song.title': 'track_name',
        'song.tempo': 'tempo',
        'song.loudness': 'loudness',
        'song.key': 'key',
        'song.mode': 'mode',
        'song.time_signature': 'time_signature',
        'song.duration': 'duration_ms',
        'song.hotttnesss': 'popularity'
    })
    
    # Convert year to numeric, handling 0 and invalid years
    df['year'] = pd.to_numeric(df['year'], errors='coerce')
    df = df[df['year'] > 0]
    
    # Scale popularity (hotttnesss is 0-1, convert to 0-100 scale)
    # Handle negative values and missing data
    if 'popularity' in df.columns:
        # Convert to numeric, handling any string values
        df['popularity'] = pd.to_numeric(df['popularity'], errors='coerce')
        # Clip negative values to 0, scale to 0-100
        df['popularity'] = df['popularity'].clip(lower=0) * 100
        df['popularity'] = df['popularity'].fillna(0)
    
    # Add missing columns with default/calculated values
    if 'energy' not in df.columns:
        # Estimate energy from loudness (normalize -60 to 0 db range to 0-1)
        df['energy'] = ((df['loudness'] + 60) / 60).clip(0, 1).fillna(0.5)
    
    if 'danceability' not in df.columns:
        # Estimate danceability from tempo (higher tempo = more danceable, but in reasonable range)
        df['danceability'] = ((df['tempo'] - 60) / 140).clip(0, 1).fillna(0.5)
    
    if 'valence' not in df.columns:
        # Set default valence
        df['valence'] = 0.5
    
    if 'acousticness' not in df.columns:
        df['acousticness'] = 0.5
    
    if 'genre' not in df.columns:
        # Extract genre from artist terms if available
        if 'artist.terms' in df.columns:
            df['genre'] = df['artist.terms'].fillna('Unknown')
        else:
            df['genre'] = 'Unknown'
    
    return df

def clean_data(df):
    """Clean the dataset"""
    print("Cleaning data...")
    # Remove null values in critical columns (year is required, others can have defaults)
    df = df.dropna(subset=['year'])
    
    # Fill missing values for other columns
    df['popularity'] = df['popularity'].fillna(0)
    df['energy'] = df['energy'].fillna(0.5)
    df['danceability'] = df['danceability'].fillna(0.5)
    df['valence'] = df['valence'].fillna(0.5)
    df['tempo'] = df['tempo'].fillna(120)
    df['loudness'] = df['loudness'].fillna(-12)
    
    # Filter years 1960-2024
    df = df[(df['year'] >= 1960) & (df['year'] <= 2024)]
    
    print(f"After cleaning: {len(df)} records")
    return df

def aggregate_by_decade(df):
    """Aggregate popularity by decade"""
    decades = {
        '1960s': (1960, 1969),
        '1970s': (1970, 1979),
        '1980s': (1980, 1989),
        '1990s': (1990, 1999),
        '2000s': (2000, 2009),
        '2010s': (2010, 2019),
        '2020s': (2020, 2024)
    }
    
    result = []
    for decade, (start, end) in decades.items():
        decade_data = df[(df['year'] >= start) & (df['year'] <= end)]
        if len(decade_data) > 0:
            result.append({
                'decade': decade,
                'startYear': start,
                'endYear': end,
                'avgPopularity': float(decade_data['popularity'].mean()),
                'count': int(len(decade_data)),
                'minYear': int(decade_data['year'].min()),
                'maxYear': int(decade_data['year'].max())
            })
    
    return result

def aggregate_genres(df):
    """Aggregate genre distributions by decade"""
    decades = {
        '1960s': (1960, 1969),
        '1970s': (1970, 1979),
        '1980s': (1980, 1989),
        '1990s': (1990, 1999),
        '2000s': (2000, 2009),
        '2010s': (2010, 2019),
        '2020s': (2020, 2024)
    }
    
    result = []
    for decade, (start, end) in decades.items():
        decade_data = df[(df['year'] >= start) & (df['year'] <= end)]
        if len(decade_data) > 0:
            # Handle genre column - might be string or need to be converted
            genre_col = 'genre'
            if genre_col not in decade_data.columns:
                genre_col = 'artist.terms'  # Fallback for Million Song Dataset
            
            if genre_col in decade_data.columns:
                # Clean genre data - some might be lists or have extra characters
                genre_series = decade_data[genre_col].astype(str)
                # Remove quotes and clean up
                genre_series = genre_series.str.replace('"', '').str.strip()
                
                # Get genre counts
                genre_counts = genre_series.value_counts().head(10).to_dict()
                total = len(decade_data)
                # Convert to proportions (0-1) instead of percentages
                genre_percentages = {k: float(v / total) for k, v in genre_counts.items() if k and k != 'nan' and k != '0'}
                
                # If no genres found, add a default
                if not genre_percentages:
                    genre_percentages = {'Unknown': 1.0}
            else:
                genre_percentages = {'Unknown': 1.0}
                total = len(decade_data)
            
            result.append({
                'decade': decade,
                'genres': genre_percentages,
                'total': int(total)
            })
    
    return result

def aggregate_energy_danceability(df, sample_size=500):
    """Sample energy and danceability data"""
    df_sample = df.sample(min(sample_size, len(df)), random_state=42)
    
    result = []
    for _, row in df_sample.iterrows():
        # Determine decade
        year = int(row['year'])
        if 1960 <= year <= 1969:
            decade = '1960s'
        elif 1970 <= year <= 1979:
            decade = '1970s'
        elif 1980 <= year <= 1989:
            decade = '1980s'
        elif 1990 <= year <= 1999:
            decade = '1990s'
        elif 2000 <= year <= 2009:
            decade = '2000s'
        elif 2010 <= year <= 2019:
            decade = '2010s'
        else:
            decade = '2020s'
        
        result.append({
            'decade': decade,
            'energy': float(row['energy']),
            'danceability': float(row['danceability']),
            'popularity': float(row['popularity']),
            'genre': str(row['genre']) if pd.notna(row['genre']) else 'Unknown',
            'year': int(year)
        })
    
    return result

def aggregate_top_artists(df, top_n=10):
    """Aggregate top artists by decade"""
    decades = {
        '1960s': (1960, 1969),
        '1970s': (1970, 1979),
        '1980s': (1980, 1989),
        '1990s': (1990, 1999),
        '2000s': (2000, 2009),
        '2010s': (2010, 2019),
        '2020s': (2020, 2024)
    }
    
    result = []
    for decade, (start, end) in decades.items():
        decade_data = df[(df['year'] >= start) & (df['year'] <= end)]
        if len(decade_data) > 0:
            # Get top artists by average popularity
            top_artists = (decade_data.groupby('artist_name')
                          .agg({
                              'popularity': ['mean', 'count'],
                              'genre': lambda x: x.mode()[0] if len(x.mode()) > 0 else 'Unknown'
                          })
                          .reset_index())
            
            top_artists.columns = ['artist_name', 'avg_popularity', 'hit_count', 'genre']
            top_artists = top_artists.sort_values('avg_popularity', ascending=False).head(top_n)
            
            for _, row in top_artists.iterrows():
                result.append({
                    'name': str(row['artist_name']),
                    'decade': decade,
                    'popularity': float(row['avg_popularity']),
                    'genre': str(row['genre']),
                    'hitCount': int(row['hit_count'])
                })
    
    return result

def prepare_radial_data(df):
    """Prepare data for radial spectrum visualization"""
    decades = {
        '1960s': (1960, 1969),
        '1970s': (1970, 1979),
        '1980s': (1980, 1989),
        '1990s': (1990, 1999),
        '2000s': (2000, 2009),
        '2010s': (2010, 2019),
        '2020s': (2020, 2024)
    }
    
    result = []
    for decade, (start, end) in decades.items():
        decade_data = df[(df['year'] >= start) & (df['year'] <= end)]
        if len(decade_data) > 0:
            result.append({
                'decade': decade,
                'energy': float(decade_data['energy'].mean()),
                'tempo': float(decade_data['tempo'].mean()),
                'valence': float(decade_data['valence'].mean()),
                'loudness': float(decade_data['loudness'].mean()),
                'acousticness': float(decade_data['acousticness'].mean()) if 'acousticness' in decade_data.columns else 0.5
            })
    
    return result

def main():
    """Main processing function"""
    # Setup paths
    data_dir = Path(__file__).parent.parent  # Go up one level from data/ to project root
    processed_dir = data_dir / 'data' / 'processed'
    processed_dir.mkdir(parents=True, exist_ok=True)
    
    # Check for data files in project root
    spotify_file = data_dir / 'SpotifyFeatures.csv'
    music_file = data_dir / 'music.csv'
    
    df = None
    
    # Try to load Spotify dataset first (has all features but no year)
    if spotify_file.exists():
        print(f"Found SpotifyFeatures.csv, but it may be missing year column.")
        try:
            spotify_df = load_spotify_data(spotify_file)
            if 'year' not in spotify_df.columns:
                print("SpotifyFeatures.csv doesn't have 'year' column. Will use music.csv instead.")
            else:
                df = spotify_df
        except Exception as e:
            print(f"Error loading SpotifyFeatures.csv: {e}")
    
    # Try to load Million Song Dataset (has year)
    if df is None and music_file.exists():
        print(f"Using Million Song Dataset (music.csv) which has year information.")
        df = load_music_data(music_file)
    elif df is None:
        print(f"ERROR: No data files found in project root.")
        print(f"Looking for: {spotify_file} or {music_file}")
        print("Please ensure music.csv exists in the project root.")
        return
    
    if df is None or len(df) == 0:
        print("ERROR: No valid data found. Please ensure music.csv or SpotifyFeatures.csv exists in the project root.")
        print("The music.csv file must have 'song.year' column with valid year values (1960-2024).")
        return
    
    # Load and process actual data
    df = clean_data(df)
    
    # Process data
    print("Processing data...")
    sample_data = {
        'by_decade': aggregate_by_decade(df),
        'by_genre': aggregate_genres(df),
        'energy_danceability': aggregate_energy_danceability(df),
        'top_artists': aggregate_top_artists(df),
        'radial_data': prepare_radial_data(df)
    }
    
    # Save processed data
    output_file = processed_dir / 'by_decade.json'
    with open(output_file, 'w') as f:
        json.dump(sample_data['by_decade'], f, indent=2)
    print(f"Saved: {output_file}")
    
    if 'by_genre' in sample_data:
        output_file = processed_dir / 'by_genre.json'
        with open(output_file, 'w') as f:
            json.dump(sample_data['by_genre'], f, indent=2)
        print(f"Saved: {output_file}")
    
    if 'energy_danceability' in sample_data:
        output_file = processed_dir / 'energy_danceability.json'
        with open(output_file, 'w') as f:
            json.dump(sample_data['energy_danceability'], f, indent=2)
        print(f"Saved: {output_file}")
    
    if 'top_artists' in sample_data:
        output_file = processed_dir / 'top_artists.json'
        with open(output_file, 'w') as f:
            json.dump(sample_data['top_artists'], f, indent=2)
        print(f"Saved: {output_file}")
    
    if 'radial_data' in sample_data:
        output_file = processed_dir / 'radial_data.json'
        with open(output_file, 'w') as f:
            json.dump(sample_data['radial_data'], f, indent=2)
        print(f"Saved: {output_file}")
    
    print("Data processing complete!")

if __name__ == '__main__':
    main()

