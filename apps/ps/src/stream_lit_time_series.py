import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from datetime import datetime

# Sample data generation
def generate_sample_data():
    dates = pd.date_range(start="2020-01-01", end="2020-12-31", freq='D')
    data = pd.DataFrame({'Date': dates, 'Value': np.random.randn(len(dates))})
    return data

# Create a time series chart
def plot_time_series(data, start_date, end_date):
    filtered_data = data[(data['Date'] >= start_date) & (data['Date'] <= end_date)]
    plt.figure(figsize=(10, 4))
    plt.plot(filtered_data['Date'], filtered_data['Value'], marker='o')
    plt.xlabel('Date')
    plt.ylabel('Value')
    plt.title('Time Series Chart')
    plt.grid(True)
    plt.tight_layout()
    return plt

# Main app
def main():
    st.title('Streamlit Date Picker with Time Series Chart')

    # Load or generate data
    data = generate_sample_data()

    # Sidebar date picker for date range selection
    st.sidebar.title("Settings")
    start_date = pd.to_datetime(st.sidebar.date_input("Start date", data['Date'].min()))
    end_date = pd.to_datetime(st.sidebar.date_input("End date", data['Date'].max()))

    # Validate date range
    if start_date > end_date:
        st.sidebar.error('Error: End date must fall after start date.')

    # Plotting
    fig = plot_time_series(data, start_date, end_date)
    st.pyplot(fig)

if __name__ == "__main__":
    main()
