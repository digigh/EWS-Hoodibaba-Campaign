import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const STATE_COORDINATES = {
  "Andaman and Nicobar Islands": [11.6670, 92.7359],
  "Andhra Pradesh": [14.7504, 78.5700],
  "Arunachal Pradesh": [27.1003, 93.6166],
  "Assam": [26.7499, 94.2166],
  "Bihar": [25.7854, 87.4799],
  "Chandigarh": [30.7199, 76.7800],
  "Chhattisgarh": [22.0904, 82.1599],
  "Dadra and Nagar Haveli": [20.2665, 73.0166],
  "Daman and Diu": [20.4283, 72.8397],
  "Delhi": [28.6699, 77.2300],
  "Goa": [15.4919, 73.8278],
  "Gujarat": [22.2587, 71.1924],
  "Haryana": [28.4500, 77.0199],
  "Himachal Pradesh": [31.1000, 77.1665],
  "Jammu and Kashmir": [34.2996, 76.5665],
  "Jharkhand": [23.8003, 86.4199],
  "Karnataka": [12.9719, 77.5936],
  "Kerala": [8.9003, 76.5699],
  "Lakshadweep": [10.5625, 72.6368],
  "Madhya Pradesh": [21.3003, 76.1300],
  "Maharashtra": [19.2502, 73.1601],
  "Manipur": [24.7999, 93.9500],
  "Meghalaya": [25.5704, 91.8800],
  "Mizoram": [23.7103, 92.7200],
  "Nagaland": [25.6669, 94.1165],
  "Odisha": [19.8204, 85.9000],
  "Puducherry": [11.9349, 79.8300],
  "Punjab": [31.5199, 75.9800],
  "Rajasthan": [26.4499, 74.6399],
  "Sikkim": [27.3333, 88.6166],
  "Tamil Nadu": [12.9203, 79.1500],
  "Telangana": [17.8748, 78.1008],
  "Tripura": [23.8354, 91.2799],
  "Uttar Pradesh": [27.5999, 78.0500],
  "Uttarakhand": [30.3204, 78.0500],
  "West Bengal": [22.5803, 88.3299]
};

export const MapChart = ({ data }) => {
  // Center of India roughly
  const center = [22.5937, 78.9629];
  
  // Normalize and match coordinates
  const markers = data.map(d => {
    // Find closest state match (case insensitive)
    const stateKey = Object.keys(STATE_COORDINATES).find(k => k.toLowerCase() === d.state.toLowerCase());
    if (stateKey) {
      return {
        ...d,
        coords: STATE_COORDINATES[stateKey]
      };
    }
    return null;
  }).filter(Boolean);

  // Calculate max count for radius scaling
  const maxCount = Math.max(...markers.map(m => m.count), 1);

  return (
    <div style={{ height: '100%', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      <MapContainer center={center} zoom={4} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        {markers.map((marker, i) => (
          <CircleMarker
            key={i}
            center={marker.coords}
            pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.6 }}
            // Scale radius based on max count, min 5px, max 30px
            radius={Math.max(5, (marker.count / maxCount) * 30)}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
              <div style={{ padding: '4px', textAlign: 'center' }}>
                <strong style={{ display: 'block', marginBottom: '4px' }}>{marker.state}</strong>
                <span>{marker.count} Farmers</span>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};
