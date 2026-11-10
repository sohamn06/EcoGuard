import React, { createContext, useContext, useState, useEffect } from 'react';
import { ecoguardApi } from '../api/ecoguardApi';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [regions, setRegions] = useState([]);
  const [selectedRegionId, setSelectedRegionId] = useState('aravalli_ridge');
  const [selectedSlot, setSelectedSlot] = useState('t2'); // 't1' or 't2'
  const [observationsMeta, setObservationsMeta] = useState(null);
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);
  const [isAlertDrawerOpen, setIsAlertDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [regionsData, alertsData] = await Promise.all([
          ecoguardApi.getRegions(),
          ecoguardApi.getAlerts()
        ]);
        setRegions(regionsData);
        if (regionsData.length > 0 && !selectedRegionId) {
          setSelectedRegionId(regionsData[0].id);
        }
        const activeCount = alertsData.filter(a => a.status === 'Active').length;
        setActiveAlertsCount(activeCount);
      } catch (err) {
        console.error('Initialization error:', err);
        setError('Failed to connect to EcoGuard backend service.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!selectedRegionId) return;
    let active = true;
    ecoguardApi.getObservations(selectedRegionId)
      .then((data) => {
        if (active) setObservationsMeta(data);
      })
      .catch((err) => {
        console.error('Observation metadata error:', err);
      });
    return () => { active = false; };
  }, [selectedRegionId]);

  const currentRegion = regions.find(r => r.id === selectedRegionId) || regions[0] || null;

  return (
    <AppContext.Provider
      value={{
        regions,
        selectedRegionId,
        setSelectedRegionId,
        selectedSlot,
        setSelectedSlot,
        observationsMeta,
        currentRegion,
        activeAlertsCount,
        setActiveAlertsCount,
        isAlertDrawerOpen,
        setIsAlertDrawerOpen,
        loading,
        error
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
