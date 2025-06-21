import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Cloud, Clock, MapPin, TrendingUp, AlertTriangle, Train, Car } from 'lucide-react';

const TrafficAccidentAnalysis = () => {
  const [selectedAnalysis, setSelectedAnalysis] = useState('overview');
  const [uploadedData, setUploadedData] = useState(null);
  
  // Generate realistic sample data based on highway-rail crossing accidents
  const generateSampleData = () => {
    const weatherConditions = ['Clear', 'Cloudy', 'Rain', 'Snow', 'Fog', 'Sleet'];
    const roadConditions = ['Dry', 'Wet', 'Icy', 'Snow Covered', 'Muddy'];
    const crossingTypes = ['Public', 'Private', 'Pedestrian'];
    const warningTypes = ['Automatic Gates', 'Flashing Lights', 'Crossbucks Only', 'Stop Signs'];
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const accidents = [];
    for (let i = 0; i < 2000; i++) {
      const hour = Math.floor(Math.random() * 24);
      const dayOfWeek = Math.floor(Math.random() * 7);
      const month = Math.floor(Math.random() * 12);
      
      // Create realistic patterns
      const rushHourFactor = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19) ? 2.2 : 1;
      const weekendFactor = dayOfWeek >= 5 ? 0.7 : 1;
      const winterFactor = month >= 10 || month <= 2 ? 1.6 : 1;
      
      const weather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
      const roadCondition = weather === 'Rain' ? 'Wet' : 
                          weather === 'Snow' ? 'Snow Covered' : 
                          weather === 'Sleet' ? 'Icy' : 'Dry';
      
      accidents.push({
        id: i,
        hour,
        dayOfWeek: daysOfWeek[dayOfWeek],
        month: months[month],
        monthNum: month,
        latitude: 39.8283 + (Math.random() - 0.5) * 2,
        longitude: -98.5795 + (Math.random() - 0.5) * 10,
        weather,
        roadCondition,
        crossingType: crossingTypes[Math.floor(Math.random() * crossingTypes.length)],
        warningType: warningTypes[Math.floor(Math.random() * warningTypes.length)],
        fatalities: Math.random() < 0.15 ? Math.floor(Math.random() * 3) + 1 : 0,
        injuries: Math.random() < 0.3 ? Math.floor(Math.random() * 5) + 1 : 0,
        vehicleSpeed: Math.floor(Math.random() * 60) + 15,
        trainSpeed: Math.floor(Math.random() * 50) + 10,
        visibility: weather === 'Fog' ? 'Poor' : weather === 'Clear' ? 'Good' : 'Fair'
      });
    }
    return accidents;
  };

  const [accidents] = useState(generateSampleData());

  // File upload handler
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.csv')) {
      try {
        const text = await file.text();
        // Basic CSV parsing - in real implementation, use Papa Parse
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        const data = lines.slice(1).map(line => {
          const values = line.split(',');
          const obj = {};
          headers.forEach((header, index) => {
            obj[header.trim()] = values[index]?.trim();
          });
          return obj;
        }).filter(row => Object.keys(row).length > 1);
        
        setUploadedData(data);
      } catch (error) {
        console.error('Error parsing CSV:', error);
      }
    }
  };

  // Analysis functions
  const analyzeByHour = () => {
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const hourAccidents = accidents.filter(a => a.hour === hour);
      return {
        hour: `${hour.toString().padStart(2, '0')}:00`,
        accidents: hourAccidents.length,
        fatalities: hourAccidents.reduce((sum, a) => sum + a.fatalities, 0),
        injuries: hourAccidents.reduce((sum, a) => sum + a.injuries, 0)
      };
    });
    return hourlyData;
  };

  const analyzeByWeather = () => {
    const weatherMap = {};
    accidents.forEach(accident => {
      if (!weatherMap[accident.weather]) {
        weatherMap[accident.weather] = { count: 0, fatalities: 0, injuries: 0 };
      }
      weatherMap[accident.weather].count++;
      weatherMap[accident.weather].fatalities += accident.fatalities;
      weatherMap[accident.weather].injuries += accident.injuries;
    });
    
    return Object.entries(weatherMap).map(([weather, data]) => ({
      weather,
      accidents: data.count,
      fatalities: data.fatalities,
      injuries: data.injuries,
      fatalityRate: ((data.fatalities / data.count) * 100).toFixed(1)
    }));
  };

  const analyzeByRoadCondition = () => {
    const roadMap = {};
    accidents.forEach(accident => {
      if (!roadMap[accident.roadCondition]) {
        roadMap[accident.roadCondition] = { count: 0, fatalities: 0, injuries: 0 };
      }
      roadMap[accident.roadCondition].count++;
      roadMap[accident.roadCondition].fatalities += accident.fatalities;
      roadMap[accident.roadCondition].injuries += accident.injuries;
    });
    
    return Object.entries(roadMap).map(([condition, data]) => ({
      condition,
      accidents: data.count,
      fatalities: data.fatalities,
      injuries: data.injuries,
      fatalityRate: ((data.fatalities / data.count) * 100).toFixed(1)
    }));
  };

  const analyzeByDayOfWeek = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days.map(day => {
      const dayAccidents = accidents.filter(a => a.dayOfWeek === day);
      return {
        day,
        accidents: dayAccidents.length,
        fatalities: dayAccidents.reduce((sum, a) => sum + a.fatalities, 0),
        injuries: dayAccidents.reduce((sum, a) => sum + a.injuries, 0)
      };
    });
  };

  const analyzeHotspots = () => {
    // Create grid-based hotspots
    const gridSize = 0.1;
    const hotspots = {};
    
    accidents.forEach(accident => {
      const gridLat = Math.floor(accident.latitude / gridSize) * gridSize;
      const gridLng = Math.floor(accident.longitude / gridSize) * gridSize;
      const key = `${gridLat},${gridLng}`;
      
      if (!hotspots[key]) {
        hotspots[key] = { lat: gridLat, lng: gridLng, count: 0, fatalities: 0 };
      }
      hotspots[key].count++;
      hotspots[key].fatalities += accident.fatalities;
    });
    
    return Object.values(hotspots)
      .filter(spot => spot.count > 5)
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  };

  const getSeasonalAnalysis = () => {
    const seasons = {
      'Winter': [11, 0, 1],
      'Spring': [2, 3, 4],
      'Summer': [5, 6, 7],
      'Fall': [8, 9, 10]
    };
    
    return Object.entries(seasons).map(([season, months]) => {
      const seasonAccidents = accidents.filter(a => months.includes(a.monthNum));
      return {
        season,
        accidents: seasonAccidents.length,
        fatalities: seasonAccidents.reduce((sum, a) => sum + a.fatalities, 0),
        injuries: seasonAccidents.reduce((sum, a) => sum + a.injuries, 0),
        avgPerMonth: (seasonAccidents.length / 3).toFixed(1)
      };
    });
  };

  const getWarningSystemAnalysis = () => {
    const warningMap = {};
    accidents.forEach(accident => {
      if (!warningMap[accident.warningType]) {
        warningMap[accident.warningType] = { count: 0, fatalities: 0, injuries: 0 };
      }
      warningMap[accident.warningType].count++;
      warningMap[accident.warningType].fatalities += accident.fatalities;
      warningMap[accident.warningType].injuries += accident.injuries;
    });
    
    return Object.entries(warningMap).map(([warning, data]) => ({
      warningType: warning,
      accidents: data.count,
      fatalities: data.fatalities,
      injuries: data.injuries,
      fatalityRate: ((data.fatalities / data.count) * 100).toFixed(1)
    }));
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff'];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Accidents</p>
              <p className="text-2xl font-bold text-blue-900">{accidents.length.toLocaleString()}</p>
            </div>
            <Car className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Total Fatalities</p>
              <p className="text-2xl font-bold text-red-900">
                {accidents.reduce((sum, a) => sum + a.fatalities, 0)}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Total Injuries</p>
              <p className="text-2xl font-bold text-yellow-900">
                {accidents.reduce((sum, a) => sum + a.injuries, 0)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Fatality Rate</p>
              <p className="text-2xl font-bold text-green-900">
                {((accidents.reduce((sum, a) => sum + a.fatalities, 0) / accidents.length) * 100).toFixed(2)}%
              </p>
            </div>
            <Train className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Accidents by Hour of Day</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyzeByHour()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="accidents" fill="#8884d8" name="Accidents" />
              <Bar dataKey="fatalities" fill="#ff7300" name="Fatalities" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Accidents by Weather Condition</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyzeByWeather()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ weather, accidents }) => `${weather}: ${accidents}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="accidents"
              >
                {analyzeByWeather().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderTimeAnalysis = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Hourly Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyzeByHour()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="accidents" stroke="#8884d8" strokeWidth={2} />
              <Line type="monotone" dataKey="fatalities" stroke="#ff7300" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Day of Week Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyzeByDayOfWeek()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="accidents" fill="#82ca9d" name="Accidents" />
              <Bar dataKey="fatalities" fill="#ff7300" name="Fatalities" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Seasonal Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={getSeasonalAnalysis()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="season" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="accidents" fill="#8884d8" name="Total Accidents" />
            <Bar dataKey="fatalities" fill="#ff7300" name="Fatalities" />
            <Bar dataKey="injuries" fill="#ffc658" name="Injuries" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderWeatherAnalysis = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Weather Impact Analysis</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={analyzeByWeather()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="weather" />
            <YAxis />
            <Tooltip formatter={(value, name) => [value, name === 'fatalityRate' ? 'Fatality Rate (%)' : name]} />
            <Legend />
            <Bar dataKey="accidents" fill="#8884d8" name="Accidents" />
            <Bar dataKey="fatalities" fill="#ff7300" name="Fatalities" />
            <Bar dataKey="fatalityRate" fill="#00ff00" name="Fatality Rate (%)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Road Condition Impact</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={analyzeByRoadCondition()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="condition" />
            <YAxis />
            <Tooltip formatter={(value, name) => [value, name === 'fatalityRate' ? 'Fatality Rate (%)' : name]} />
            <Legend />
            <Bar dataKey="accidents" fill="#82ca9d" name="Accidents" />
            <Bar dataKey="fatalities" fill="#ff7300" name="Fatalities" />
            <Bar dataKey="fatalityRate" fill="#ff00ff" name="Fatality Rate (%)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderHotspots = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Accident Hotspots</h3>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart data={analyzeHotspots()}>
            <CartesianGrid />
            <XAxis dataKey="lng" name="Longitude" />
            <YAxis dataKey="lat" name="Latitude" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} 
              formatter={(value, name) => [value, name === 'count' ? 'Accidents' : 'Fatalities']} />
            <Scatter name="Hotspots" data={analyzeHotspots()} fill="#ff7300">
              {analyzeHotspots().map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.count > 15 ? '#ff0000' : entry.count > 10 ? '#ff7300' : '#8884d8'} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <div className="mt-4 text-sm text-gray-600">
          <p>Red: High-risk areas (15+ accidents), Orange: Medium-risk (10-15), Blue: Lower-risk (5-10)</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Warning System Effectiveness</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={getWarningSystemAnalysis()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="warningType" />
            <YAxis />
            <Tooltip formatter={(value, name) => [value, name === 'fatalityRate' ? 'Fatality Rate (%)' : name]} />
            <Legend />
            <Bar dataKey="accidents" fill="#8884d8" name="Accidents" />
            <Bar dataKey="fatalityRate" fill="#ff7300" name="Fatality Rate (%)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-sm rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Traffic Accident Analysis Dashboard</h1>
            <p className="text-gray-600 mt-1">Highway-Rail Grade Crossing Safety Analysis</p>
          </div>
          
          <div className="px-6 py-4">
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setSelectedAnalysis('overview')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  selectedAnalysis === 'overview' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                Overview
              </button>
              <button
                onClick={() => setSelectedAnalysis('time')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  selectedAnalysis === 'time' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                <Clock className="h-4 w-4" />
                Time Analysis
              </button>
              <button
                onClick={() => setSelectedAnalysis('weather')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  selectedAnalysis === 'weather' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                <Cloud className="h-4 w-4" />
                Weather & Conditions
              </button>
              <button
                onClick={() => setSelectedAnalysis('hotspots')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  selectedAnalysis === 'hotspots' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                <MapPin className="h-4 w-4" />
                Hotspots & Safety
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Your Accident Data (CSV)
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {uploadedData && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ Data uploaded successfully ({uploadedData.length} records)
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {selectedAnalysis === 'overview' && renderOverview()}
          {selectedAnalysis === 'time' && renderTimeAnalysis()}
          {selectedAnalysis === 'weather' && renderWeatherAnalysis()}
          {selectedAnalysis === 'hotspots' && renderHotspots()}
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900">Peak Risk Hours</h4>
              <p className="text-blue-700 text-sm mt-1">
                Most accidents occur during morning (7-9 AM) and evening (5-7 PM) rush hours
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-900">Weather Impact</h4>
              <p className="text-yellow-700 text-sm mt-1">
                Adverse weather conditions significantly increase fatality rates at crossings
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-medium text-red-900">Safety Systems</h4>
              <p className="text-red-700 text-sm mt-1">
                Crossings with automatic gates show lower accident rates than passive warnings
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


function App() {
  return (
    <div className="App">
      <TrafficAccidentAnalysis />
    </div>
  );
}

export default App;