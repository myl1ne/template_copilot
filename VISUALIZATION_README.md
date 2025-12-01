# Shipping Visualization Dashboard

An interactive web-based visualization for shipping data, featuring real-time vessel tracking, route visualization, and temporal analysis.

## 🎯 Features

- **Interactive Map**: Global view of vessel positions and shipping routes using Mapbox GL
- **Timeline Control**: Scrub through time to see vessel movements with D3.js
- **Vessel Tracking**: Real-time positions, status, and detailed information for each vessel
- **Port Monitoring**: Visualize port locations and activity
- **Event Timeline**: Track departures, arrivals, and other shipping events
- **Playback Controls**: Automatic playback with adjustable speed (0.5x to 8x)
- **Fleet Statistics**: Overview of total vessels, in-transit count, and docked vessels

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Mapbox account and API token (free tier available at [mapbox.com](https://mapbox.com))

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/myl1ne/template_copilot.git
   cd template_copilot
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Mapbox Token**:
   - Sign up for a free Mapbox account at [mapbox.com](https://mapbox.com)
   - Get your access token from the Mapbox dashboard
   - Open `src/components/ShippingMap.jsx`
   - Replace the placeholder token with your actual Mapbox token:
     ```javascript
     mapboxgl.accessToken = 'YOUR_MAPBOX_TOKEN_HERE';
     ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open in browser**:
   - The app will automatically open at `http://localhost:3000`
   - If not, navigate to the URL shown in the terminal

### Building for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

To preview the production build:
```bash
npm run preview
```

## 📊 Data Structure

The visualization uses sample shipping data including:

- **8 Major Ports**: Rotterdam, Singapore, Shanghai, Los Angeles, Dubai, Hamburg, Antwerp, Hong Kong
- **5 Vessels**: Container ships, bulk carriers, and cargo ships
- **5 Active Routes**: With realistic trajectories and cargo information
- **Events**: Departure and arrival events with timestamps

### Sample Data Schema

#### Vessel
```javascript
{
  id: 'vessel-1',
  name: 'MV Atlantic Star',
  type: 'Container Ship',
  capacity: 14000,
  imo: 'IMO9234567',
  status: 'in_transit'
}
```

#### Route
```javascript
{
  id: 'route-1',
  vesselId: 'vessel-1',
  origin: 'port-1',
  destination: 'port-4',
  departureTime: '2024-11-01T00:00:00Z',
  arrivalTime: '2024-11-19T00:00:00Z',
  trajectory: [...], // Array of position points
  cargoType: 'Electronics',
  cargoWeight: 12000
}
```

## 🛠 Technology Stack

- **React 19**: UI framework
- **Mapbox GL JS**: Interactive maps and geospatial visualization
- **D3.js**: Timeline control and data visualization
- **Vite**: Build tool and development server
- **date-fns**: Date manipulation and formatting

## 📁 Project Structure

```
template_copilot/
├── src/
│   ├── components/
│   │   ├── ShippingMap.jsx      # Main map component
│   │   ├── ShippingMap.css
│   │   ├── Timeline.jsx          # Timeline control
│   │   ├── Timeline.css
│   │   ├── VesselPanel.jsx       # Vessel list and stats
│   │   └── VesselPanel.css
│   ├── data/
│   │   └── shippingData.js       # Sample data and utilities
│   ├── App.jsx                   # Main application component
│   ├── App.css
│   ├── main.jsx                  # Application entry point
│   └── index.css
├── docs/
│   └── visualization-approaches.md  # Detailed approach analysis
├── index.html
├── vite.config.js
└── package.json
```

## 🎨 Customization

### Adding Your Own Data

1. **Modify data files**: Edit `src/data/shippingData.js` to include your own ports, vessels, and routes
2. **Connect to API**: Replace static data with API calls to your backend
3. **Adjust time ranges**: Update the time range based on your data

### Styling

- Map styles: Edit `src/components/ShippingMap.jsx` to change the Mapbox style
- Color scheme: Modify CSS variables in component stylesheets
- Icons: Replace emoji icons with custom SVGs or icon libraries

### Features to Add

- **Real-time updates**: Connect to WebSocket for live vessel tracking
- **Advanced filters**: Filter by cargo type, vessel type, or route
- **Analytics**: Add charts for shipping volumes, delays, and efficiency
- **Alerts**: Set up notifications for specific events
- **3D visualization**: Enable Mapbox 3D terrain and buildings

## 🔧 Troubleshooting

### Map not loading
- Ensure you've added a valid Mapbox access token
- Check browser console for errors
- Verify network connectivity

### Performance issues
- Reduce the number of trajectory points
- Implement data pagination for large datasets
- Use Mapbox clustering for many vessels

### Build errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Ensure Node.js version is 18 or higher: `node --version`

## 📚 Additional Resources

- [Mapbox GL JS Documentation](https://docs.mapbox.com/mapbox-gl-js/)
- [D3.js Documentation](https://d3js.org/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

## 📖 Documentation

For a detailed analysis of different visualization approaches for shipping data, see:
- [Visualization Approaches](docs/visualization-approaches.md) - Comprehensive comparison of 5 different visualization strategies

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Sample data inspired by real shipping routes
- Built as part of the Complexio data pipeline visualization project
- Uses open-source libraries from the JavaScript ecosystem

---

**Note**: This is a demonstration project. For production use with real shipping data, implement proper authentication, data validation, and security measures.
