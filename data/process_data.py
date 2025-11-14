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

def clean_data(df):
    """Clean the dataset"""
    print("Cleaning data...")
    # Remove null values in critical columns
    df = df.dropna(subset=['year', 'popularity', 'energy', 'danceability', 'valence', 'tempo', 'loudness'])
    
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
            # Get genre counts
            genre_counts = decade_data['genre'].value_counts().to_dict()
            total = len(decade_data)
            genre_percentages = {k: float((v / total) * 100) for k, v in genre_counts.items()}
            
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
    data_dir = Path(__file__).parent
    processed_dir = data_dir / 'processed'
    processed_dir.mkdir(exist_ok=True)
    
    # Check if data file exists
    spotify_file = data_dir / 'spotify_tracks.csv'
    
    if not spotify_file.exists():
        print(f"Warning: {spotify_file} not found. Creating sample data structure.")
        print("Please download the dataset from: https://www.kaggle.com/datasets/zaheenhamidani/ultimate-spotify-tracks-db")
        print("Place it in the data/ directory as 'spotify_tracks.csv'")
        
        # Create sample data structure
        sample_data = {
            'by_decade': [
                {'decade': '1960s', 'startYear': 1960, 'endYear': 1969, 'avgPopularity': 35},
                {'decade': '1970s', 'startYear': 1970, 'endYear': 1979, 'avgPopularity': 40},
                {'decade': '1980s', 'startYear': 1980, 'endYear': 1989, 'avgPopularity': 45},
                {'decade': '1990s', 'startYear': 1990, 'endYear': 1999, 'avgPopularity': 50},
                {'decade': '2000s', 'startYear': 2000, 'endYear': 2009, 'avgPopularity': 55},
                {'decade': '2010s', 'startYear': 2010, 'endYear': 2019, 'avgPopularity': 60},
                {'decade': '2020s', 'startYear': 2020, 'endYear': 2024, 'avgPopularity': 65}
            ]
        }
    else:
        # Load and process actual data
        df = load_spotify_data(spotify_file)
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

