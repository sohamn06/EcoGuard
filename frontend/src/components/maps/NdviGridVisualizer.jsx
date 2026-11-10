import React, { useState } from 'react';

export const NdviGridVisualizer = ({ ndviMatrix, title = 'Sentinel-2 Surface Reflectance NDVI Grid', observationDate = '' }) => {
  const [hoveredCell, setHoveredCell] = useState(null);

  if (!ndviMatrix || ndviMatrix.length === 0) {
    return <div className="text-xs text-slate-400 p-6 text-center">No NDVI grid raster data available.</div>;
  }

  const rows = ndviMatrix.length;
  const cols = ndviMatrix[0].length;

  // Scientific NDVI color interpolator
  const getNdviColor = (val) => {
    if (val < 0.0) return '#1e40af'; // Blue: water
    if (val < 0.15) return '#e2e8f0'; // Very pale: rock / built-up
    if (val < 0.25) return '#fde047'; // Sand/Khaki: bare soil / clearing
    if (val < 0.40) return '#a3e635'; // Lime: sparse scrub
    if (val < 0.60) return '#22c55e'; // Green: moderate canopy
    return '#15803d'; // Deep forest green: dense canopy
  };

  const getClassification = (val) => {
    if (val < 0.0) return 'Water Body';
    if (val < 0.20) return 'Bare Soil / Excavation / Built-up';
    if (val < 0.40) return 'Sparse / Degraded Scrub';
    if (val < 0.60) return 'Moderate Healthy Vegetation';
    return 'Dense Closed Canopy Forest';
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{title}</h4>
          {observationDate && (
            <p className="text-[11px] text-slate-500 font-mono">Date: {observationDate} &bull; 10m Ground Resolution</p>
          )}
        </div>
        <div className="text-[11px] font-mono text-slate-500">
          Grid: {rows} &times; {cols} ({rows * cols} cells)
        </div>
      </div>

      {/* Grid Canvas */}
      <div className="flex justify-center p-2 bg-slate-950 rounded-md overflow-hidden shadow-inner">
        <div
          className="grid gap-[2px] p-2 bg-slate-900 rounded select-none cursor-crosshair"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            width: '100%',
            maxWidth: '360px',
            aspectRatio: `${cols} / ${rows}`
          }}
        >
          {ndviMatrix.map((row, rIdx) =>
            row.map((val, cIdx) => (
              <div
                key={`${rIdx}-${cIdx}`}
                className="w-full h-full rounded-xs transition-all hover:scale-125 hover:z-20 hover:ring-2 hover:ring-white"
                style={{ backgroundColor: getNdviColor(val) }}
                onMouseEnter={() => setHoveredCell({ r: rIdx, c: cIdx, val, class: getClassification(val) })}
                onMouseLeave={() => setHoveredCell(null)}
              />
            ))
          )}
        </div>
      </div>

      {/* Inspection Hover Tooltip Bar */}
      <div className="min-h-[28px] px-3 py-1 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-xs">
        {hoveredCell ? (
          <div className="flex items-center space-x-3 text-slate-800">
            <span className="font-mono text-[11px] text-slate-500">Cell [{hoveredCell.r},{hoveredCell.c}]</span>
            <span className="font-mono font-bold text-emerald-800">NDVI: {hoveredCell.val.toFixed(3)}</span>
            <span className="text-[11px] font-medium text-slate-600 truncate">{hoveredCell.class}</span>
          </div>
        ) : (
          <span className="text-slate-400 text-[11px] italic">Hover over any raster cell to inspect pixel value & classification</span>
        )}
      </div>

      {/* Color Scale Legend */}
      <div className="space-y-1 pt-1">
        <div className="h-2.5 w-full rounded-full bg-gradient-to-r from-blue-700 via-amber-300 via-lime-400 to-emerald-800 border border-slate-200" />
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>&lt; 0.0 Water</span>
          <span>0.0 Bare Soil</span>
          <span>0.3 Scrub</span>
          <span>0.5 Moderate</span>
          <span>0.8+ Dense Forest</span>
        </div>
      </div>
    </div>
  );
};

