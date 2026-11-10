import api from './client';

export const ecoguardApi = {
  // System & Overview
  getHealth: () => api.get('/health').then(res => res.data),
  getOverview: (regionId = null) =>
    api.get('/overview', { params: regionId ? { region_id: regionId } : {} }).then(res => res.data),

  // Regions
  getRegions: () => api.get('/regions').then(res => res.data),
  getRegionDetail: (id) => api.get(`/regions/${id}`).then(res => res.data),

  // Environmental Monitoring
  getObservations: (regionId) =>
    api.get('/monitoring/observations', { params: { region_id: regionId } }).then(res => res.data),

  getNdvi: (regionId, slot = 't2') =>
    api.get('/monitoring/ndvi', { params: { region_id: regionId, slot } }).then(res => res.data),

  getChangeDetection: (regionId) =>
    api.get('/monitoring/change-detection', { params: { region_id: regionId } }).then(res => res.data),

  // Risk Engine
  analyzeRisk: (regionId, customWeights = null) => {
    if (customWeights) {
      return api.post('/risk/analyze', { region_id: regionId, weights: customWeights }).then(res => res.data);
    }
    return api.get('/risk/analyze', { params: { region_id: regionId } }).then(res => res.data);
  },

  // Ecological Dependency Graph
  getEcologicalGraph: (regionId) =>
    api.get('/graph', { params: { region_id: regionId } }).then(res => res.data),

  // Intervention Simulator
  runSimulation: (regionId, interventions, timeframeYears = 5) =>
    api.post('/simulations/run', {
      region_id: regionId,
      interventions,
      timeframe_years: timeframeYears
    }).then(res => res.data),

  // Alerts & Reports
  getAlerts: (severity = null, regionId = null) => {
    const params = {};
    if (severity && severity !== 'all') params.severity = severity;
    if (regionId && regionId !== 'all') params.region_id = regionId;
    return api.get('/alerts', { params }).then(res => res.data);
  },

  updateAlertStatus: (alertId, status) =>
    api.patch(`/alerts/${alertId}`, { status }).then(res => res.data),

  exportReportUrl: (regionId, format = 'csv') =>
    `/api/reports/export?region_id=${encodeURIComponent(regionId)}&export_format=${encodeURIComponent(format)}`,

  // Data Sources & Transparency
  getDataSources: () => api.get('/data-sources/status').then(res => res.data),
};

