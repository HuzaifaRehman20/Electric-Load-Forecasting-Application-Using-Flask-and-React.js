from flask_cors import CORS
from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.model_selection import train_test_split
import json
from datetime import timedelta

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

# Sample data: Replace with actual data processing in your project
def load_data():
    try:
        # Load your actual dataset
        df = pd.read_csv('electric_load_and_weather_data.csv')  # replace with your actual data
        # Ensure 'Timestamp' column is parsed as datetime
        df['Timestamp'] = pd.to_datetime(df['Timestamp'], errors='coerce')
        return df
    except Exception as e:
        print(f"Error loading data: {e}")
        # Create synthetic data for testing if file is not found
        dates = pd.date_range(start='2018-01-01', end='2018-12-31', freq='H')
        cities = ['phoenix', 'nyc', 'seattle', 'houston', 'dallas', 'san antonio', 'san jose', 'la', 'philadelphia']
        
        data = []
        for city in cities:
            for date in dates:
                hour = date.hour
                month = date.month
                temp = 60 + 20 * np.sin(month/12 * np.pi) + 10 * np.sin(hour/24 * 2 * np.pi) + np.random.normal(0, 5)
                humidity = 50 + 20 * np.sin(month/6 * np.pi) + np.random.normal(0, 10)
                wind = 5 + 3 * np.sin(hour/12 * np.pi) + np.random.normal(0, 2)
                
                # Create demand based on temperature, time of day, and random factor
                demand = 500 + 200 * np.sin(hour/24 * 2 * np.pi) + 100 * np.sin(month/12 * np.pi) + 0.5 * temp + np.random.normal(0, 50)
                
                data.append({
                    'Timestamp': date,
                    'city': city,
                    'temperature': temp,
                    'humidity': humidity,
                    'windSpeed': wind,
                    'demand': demand
                })
        
        return pd.DataFrame(data)

def xgb_forecast(df, start_date, end_date, k):
    # Filter data based on selected date range
    df = df[(df['Timestamp'] >= start_date) & (df['Timestamp'] <= end_date)]
    if df.empty:
        return {"error": "No data available for the selected date range."}

    # Feature Engineering
    df['hour'] = df['Timestamp'].dt.hour
    df['dayofweek'] = df['Timestamp'].dt.dayofweek
    df['month'] = df['Timestamp'].dt.month
    df['season'] = ((df['month'] % 12) // 3) + 1
    X = df[['temperature', 'humidity', 'windSpeed', 'hour', 'dayofweek', 'month', 'season']]
    y = df['demand']

    # Scaling features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Train-test split for validation
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

    # Model training
    model = xgb.XGBRegressor(objective='reg:squarederror', n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    # Model evaluation
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))  # RMSE calculation
    mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100  # MAPE calculation

    # Create formatted forecast data for the frontend
    forecast_results = []
    
    # Get indices for the test set
    test_indices = np.arange(len(X))[X_train.shape[0]:]
    
    for i, idx in enumerate(test_indices):
        forecast_results.append({
            'timestamp': df.iloc[idx]['Timestamp'].strftime('%Y-%m-%d %H:%M'),
            'actual': float(y_test.iloc[i]),
            'predicted': float(y_pred[i])
        })

    # Return combined data for frontend
    return {
        'forecast': forecast_results,
        'metrics': {
            'mae': float(mae),
            'rmse': float(rmse),
            'mape': float(mape)
        }
    }

def naive_forecast(df, start_date, end_date):
    """Generate naive forecast using previous day's value"""
    # Filter data based on selected date range
    df = df[(df['Timestamp'] >= start_date) & (df['Timestamp'] <= end_date)]
    if df.empty:
        return {"error": "No data available for the selected date range."}
    
    # Resample to hourly if needed and ensure data is sorted by timestamp
    df = df.sort_values('Timestamp')
    
    # Create a shifted version of the demand (naive forecast)
    # Using 24-hour lag for daily seasonality
    df['predicted'] = df['demand'].shift(24)
    
    # Drop rows with NaN values (first 24 hours will have NaN predictions)
    df_forecast = df.dropna()
    
    # Prepare forecast results in the format expected by frontend
    forecast_results = []
    for _, row in df_forecast.iterrows():
        forecast_results.append({
            'timestamp': row['Timestamp'].strftime('%Y-%m-%d %H:%M'),
            'actual': float(row['demand']),
            'predicted': float(row['predicted'])
        })
    
    # Calculate metrics
    actuals = df_forecast['demand'].values
    predictions = df_forecast['predicted'].values
    mae = mean_absolute_error(actuals, predictions)
    rmse = np.sqrt(mean_squared_error(actuals, predictions))
    mape = np.mean(np.abs((actuals - predictions) / actuals)) * 100
    
    return {
        'forecast': forecast_results,
        'metrics': {
            'mae': float(mae), 
            'rmse': float(rmse),
            'mape': float(mape)
        }
    }

# Clustering function using KMeans
def clustering(df, start_date, end_date, k):
    # Filter data based on selected date range
    df = df[(df['Timestamp'] >= start_date) & (df['Timestamp'] <= end_date)]
    if df.empty:
        return {"error": "No data available for the selected date range."}

    # Feature Engineering for Clustering
    df['hour'] = df['Timestamp'].dt.hour
    df['dayofweek'] = df['Timestamp'].dt.dayofweek
    df['month'] = df['Timestamp'].dt.month
    df['season'] = ((df['month'] % 12) // 3) + 1
    X = df[['temperature', 'humidity', 'windSpeed', 'hour', 'dayofweek', 'month', 'season']]
    
    # Scaling features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # PCA for dimensionality reduction (optional)
    pca = PCA(n_components=2)
    X_pca = pca.fit_transform(X_scaled)
    
    # KMeans clustering
    kmeans = KMeans(n_clusters=k, random_state=42)
    clusters = kmeans.fit_predict(X_scaled)
    
    # Prepare clustering results in the format expected by frontend
    cluster_results = []
    for i in range(len(clusters)):
        cluster_results.append({
            'x': float(X_pca[i, 0]),  # PCA dimension 1
            'y': float(X_pca[i, 1]),  # PCA dimension 2
            'cluster': int(clusters[i]),
            'demand': float(df.iloc[i]['demand']),
            'temperature': float(df.iloc[i]['temperature'])
        })
    
    return cluster_results

@app.route('/api/data', methods=['GET'])
def get_data():
    # Extract query parameters
    city = request.args.get('city', 'phoenix')
    start_date = request.args.get('start', '2018-07-01')
    end_date = request.args.get('end', '2018-07-07')
    k = int(request.args.get('k', 4))
    model = request.args.get('model', 'xgb')
    
    print(f"Received request with params: city={city}, start={start_date}, end={end_date}, k={k}, model={model}")
    
    # Convert start and end date to datetime format
    try:
        start_date = pd.to_datetime(start_date)
        end_date = pd.to_datetime(end_date)
    except Exception as e:
        return jsonify({"error": f"Invalid date format. Use 'YYYY-MM-DD'. Error: {str(e)}"})

    # Load data (this should ideally come from a preprocessed dataset)
    df = load_data()
    
    if df.empty:
        return jsonify({"error": "Data could not be loaded or is empty."})
    
    # Filter data by city
    city_df = df[df['city'] == city]
    
    if city_df.empty:
        return jsonify({"error": f"No data available for {city}."})
    
    # Generate clustering data
    clusters = clustering(city_df, start_date, end_date, k)
    
    # Generate forecast data based on selected model
    if model == 'xgb':
        forecast_data = xgb_forecast(city_df, start_date, end_date, k)
        forecast_results = forecast_data.get('forecast', [])
    elif model == 'naive':
        naive_data = naive_forecast(city_df, start_date, end_date)
        forecast_results = naive_data.get('forecast', [])
    else:
        return jsonify({"error": f"Unknown model type: {model}"})
    
    # Return combined data
    return jsonify({
        'clusters': clusters,
        'forecast': forecast_results
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)