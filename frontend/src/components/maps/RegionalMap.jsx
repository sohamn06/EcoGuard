import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Circle, Marker, Popup, useMap, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import { Layers, AlertTriangle, Eye, ZoomIn } from 'lucide-react';
import { RiskBadge } from '../common/Common';

// Fix leaflet icon asset paths for Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Helper component to auto-pan and fly-to region on selection
const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || 12, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
};

export const RegionalMap = ({ region, riskData = null, showDisturbanceHotspots = true }) => {
  const [mapType, setMapType] = useState('terrain'); // 'terrain' or 'satellite'
  const [showBoundary, setShowBoundary] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);

  if (!region) return null;

  const center = [region.lat, region.lng];
  const zoom = region.zoom || 12;

  // Extract coordinates from geojson polygon
  const coordinates = region.geojson?.geometry?.coordinates?.[0]?.map(coord => [coord[1], coord[0]]) || [
    [region.lat - 0.04, region.lng - 0.05],
    [region.lat - 0.04, region.lng + 0.05],
    [region.lat + 0.04, region.lng + 0.05],
    [region.lat + 0.04, region.lng - 0.05]
  ];

  // Disturbance hotspot simulation within the region
  const hotspots = [
    {
      id: 'hs1',
      lat: region.lat + 0.012,
      lng: region.lng - 0.015,
      radius: 900,
      label: 'Core Disturbance Sector (Mining & Heavy Clearing)',
      severity: 'Critical',
      color: '#ef4444'
    },
    {
      id: 'hs2',
      lat: region.lat - 0.018,
      lng: region.lng + 0.02,
      radius: 650,
      label: 'Linear Infrastructure Corridor (Road Expansion)',
      severity: 'High',
      color: '#f97316'
    }
  ];

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-lg overflow-hidden border border-slate-200 shadow-xs bg-slate-100">
      {/* Map Layer Controls Bar */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-xs p-1.5 rounded-md border border-slate-200 shadow-md flex items-center space-x-2 text-xs">
        <button
          onClick={() => setMapType(mapType === 'terrain' ? 'satellite' : 'terrain')}
          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center space-x-1 transition-colors"
        >
          <Layers className="w-3.5 h-3.5 text-emerald-600" />
          <span>{mapType === 'terrain' ? 'Satellite View' : 'Terrain View'}</span>
        </button>
        <button
          onClick={() => setShowBoundary(!showBoundary)}
          className={`px-2 py-1 rounded text-xs font-medium border ${
            showBoundary ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-50 text-slate-500 border-slate-200'
          }`}
        >
          Boundary
        </button>
        <button
          onClick={() => setShowHotspots(!showHotspots)}
          className={`px-2 py-1 rounded text-xs font-medium border ${
            showHotspots ? 'bg-rose-50 text-rose-800 border-rose-300' : 'bg-slate-50 text-slate-500 border-slate-200'
          }`}
        >
          Hotspots
        </button>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-xs px-3 py-2 rounded-md border border-slate-200 shadow-md text-[11px] text-slate-700 space-y-1">
        <div className="font-semibold text-slate-900 border-b border-slate-200 pb-1">GIS Map Legend</div>
        <div className="flex items-center space-x-2">
          <span className="w-3.5 h-2 bg-emerald-600/30 border border-emerald-600 rounded-xs"></span>
          <span>Buffer Zone Boundary</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
          <span>Critical Disturbance Hotspot</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
          <span>Linear Corridor Stress</span>
        </div>
      </div>

      {/* Leaflet Map */}
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} className="w-full h-full">
        <MapController center={center} zoom={zoom} />
        {mapType === 'terrain' ? (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        ) : (
          <TileLayer
            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        )}

        {/* Region Boundary GeoJSON Polygon */}
        {showBoundary && (
          <Polygon
            positions={coordinates}
            pathOptions={{
              color: '#059669',
              weight: 2.5,
              dashArray: '4, 4',
              fillColor: '#10b981',
              fillOpacity: 0.12
            }}
          >
            <Popup>
              <div className="p-1 space-y-1 text-xs">
                <div className="font-bold text-slate-900">{region.name}</div>
                <div className="text-slate-600">{region.ecosystem_type}</div>
                <div className="text-slate-500 font-mono text-[10px]">Area: {region.area_sqkm} sq km</div>
                {riskData && (
                  <div className="pt-1 border-t border-slate-200 flex items-center justify-between">
                    <span className="font-medium text-slate-700">Risk Score:</span>
                    <RiskBadge level={riskData.risk_level} score={riskData.overall_risk_score} size="sm" />
                  </div>
                )}
              </div>
            </Popup>
          </Polygon>
        )}

        {/* Disturbance Hotspots */}
        {showHotspots && hotspots.map((hs) => (
          <Circle
            key={hs.id}
            center={[hs.lat, hs.lng]}
            radius={hs.radius}
            pathOptions={{
              color: hs.color,
              weight: 2,
              fillColor: hs.color,
              fillOpacity: 0.25
            }}
          >
            <Popup>
              <div className="p-1 space-y-1 text-xs">
                <div className="font-semibold text-rose-900">{hs.label}</div>
                <div className="text-[11px] text-slate-600">Severity: {hs.severity}</div>
                <div className="text-[10px] text-slate-400 font-mono">Radius: {hs.radius}m footprint</div>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Center Marker */}
        <Marker position={center}>
          <Popup>
            <div className="p-1 text-xs space-y-1">
              <div className="font-bold text-slate-900">{region.name}</div>
              <div className="text-slate-600 font-mono text-[11px]">Lat: {region.lat.toFixed(4)}, Lng: {region.lng.toFixed(4)}</div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

