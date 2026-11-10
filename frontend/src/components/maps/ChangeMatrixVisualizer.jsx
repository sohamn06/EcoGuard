import React, { useState } from 'react';

export const ChangeMatrixVisualizer = ({ changeMatrix, baselineDate, comparisonDate }) => {
  const [hoveredCell, setHoveredCell] = useState(null);

  if (!changeMatrix || changeMatrix.length === 0) {
    return <div className="text-xs text-slate-400 p-6 text-center">No change detection raster available.</div>;
  }

  const rows = changeMatrix.length;
  const cols = changeMatrix[0].length;

  const getChangeColor = (val) => {
    if (val < -0.20) return '#b91c1c'; // Deep Red: Severe Decline
    if (val < -0.08) return '#f97316'; // Orange: Moderate Decline
    if (val <= 0.08) return '#94a3b8'; // Slate/Grey: Stable
    if (val <= 0.20) return '#4ade80'; // Light Green: Moderate Recovery
    return '#15803d'; // Deep Green: Significant Regrowth
  };

  const getChangeClass = (val) => {
    if (val < -0.20) return 'Severe Canopy Loss (dNDVI < -0.20)';
    if (val < -0.08) return 'Moderate Thinning (-0.20 <= dNDVI < -0.08)';
    if (val <= 0.08) return 'Stable Canopy Cover';
    if (val <= 0.20) return 'Moderate Regrowth (+0.08 < dNDVI <= 0.20)';
    return 'Significant Afforestation / Regrowth (dNDVI > 0.20)';
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Multi-Temporal Vegetation Shift (dNDVI)
          </h4>
          <p className="text-[11px] text-slate-500 font-mono">
            {baselineDate} &rarr; {comparisonDate}
          </p>
        </div>
        <div className="text-[11px] font-mono text-slate-500">
          Resolution: 10m Ground Sample Distance
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
          {changeMatrix.map((row, rIdx) =>
            row.map((val, cIdx) => (
              <div
                key={`${rIdx}-${cIdx}`}
                className="w-full h-full rounded-xs transition-all hover:scale-125 hover:z-20 hover:ring-2 hover:ring-white"
                style={{ backgroundColor: getChangeColor(val) }}
                onMouseEnter={() => setHoveredCell({ r: rIdx, c: cIdx, val, class: getChangeClass(val) })}
                onMouseLeave={() => setHoveredCell(null)}
              />
            ))
          )}
        </div>
      </div>

      {/* Hover Inspection */}
      <div className="min-h-[28px] px-3 py-1 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-xs">
        {hoveredCell ? (
          <div className="flex items-center space-x-3 text-slate-800">
            <span className="font-mono text-[11px] text-slate-500">Cell [{hoveredCell.r},{hoveredCell.c}]</span>
            <span className={`font-mono font-bold ${hoveredCell.val < -0.08 ? 'text-rose-600' : hoveredCell.val > 0.08 ? 'text-emerald-700' : 'text-slate-600'}`}>
              dNDVI: {hoveredCell.val > 0 ? `+${hoveredCell.val.toFixed(3)}` : hoveredCell.val.toFixed(3)}
            </span>
            <span className="text-[11px] font-medium text-slate-600 truncate">{hoveredCell.class}</span>
          </div>
        ) : (
          <span className="text-slate-400 text-[11px] italic">Hover over cells to identify spatial disturbance clusters</span>
        )}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-600 pt-1">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-xs bg-red-700"></span>
          <span>Severe Decline</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-xs bg-orange-500"></span>
          <span>Moderate Decline</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-xs bg-slate-400"></span>
          <span>Stable Canopy</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400"></span>
          <span>Moderate Recovery</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-700"></span>
          <span>Regrowth</span>
        </div>
      </div>
    </div>
  );
};

