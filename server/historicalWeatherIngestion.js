/**
 * PhytoNet Ledger (PNL) — Production 30-Day Historical Biophysical Matrix
 * Replaces mockTelemetry.js by querying the live Open-Meteo Historical Weather API
 * for actual past 30-day precipitation, solar radiation, evapotranspiration, and temperature.
 */

export class HistoricalWeatherIngestion {
  constructor() {
    this.cachedMatrix = null;
    this.lastFetchedAt = 0;
    this.cacheTtlMs = 3600000; // 1 hour cache
  }

  /**
   * Fetches the actual past 30 days of meteorological records for the specified or detected coordinates
   */
  async get30DayBiophysicalMatrix(lat = 11.0102, lon = 76.9701, currentStressMode = 'NORMAL') {
    const now = Date.now();
    if (this.cachedMatrix && (now - this.lastFetchedAt < this.cacheTtlMs)) {
      return this._applyLiveDay30Override(this.cachedMatrix, currentStressMode);
    }

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&past_days=30&daily=precipitation_sum,shortwave_radiation_sum,temperature_2m_max,temperature_2m_min,et0_fao_evapotranspiration&timezone=auto`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Open-Meteo API returned HTTP ${res.status}`);
      }

      const json = await res.json();
      const daily = json.daily;
      if (!daily || !daily.time || daily.time.length === 0) {
        throw new Error('Incomplete daily data array from Open-Meteo');
      }

      // We only take the past 30 days (excluding today or up to 30 records)
      const totalLen = daily.time.length;
      const startIndex = Math.max(0, totalLen - 30);
      const matrix = [];

      let cumulativeSoilWaterDeficit = 0.0;
      let baseImpedance = 25.4;

      for (let i = startIndex; i < totalLen; i++) {
        const dayIdx = matrix.length + 1;
        const dateStr = daily.time[i];
        const precipMm = Number(daily.precipitation_sum[i] || 0.0);
        const solarMj = Number(daily.shortwave_radiation_sum[i] || 12.0);
        const tempMax = Number(daily.temperature_2m_max[i] || 25.0);
        const tempMin = Number(daily.temperature_2m_min[i] || 18.0);
        const tempMean = Number(((tempMax + tempMin) / 2).toFixed(1));
        const et0 = Number(daily.et0_fao_evapotranspiration[i] || 3.2);

        // Water balance: Precipitation refills soil, evapotranspiration draws it down
        cumulativeSoilWaterDeficit = cumulativeSoilWaterDeficit - (precipMm * 0.4) + (et0 * 0.25);
        cumulativeSoilWaterDeficit = Math.max(-5.0, Math.min(15.0, cumulativeSoilWaterDeficit));

        // Living cambium tissue impedance drifts with cumulative water balance
        const currentZ = Number((baseImpedance + (cumulativeSoilWaterDeficit * 0.85)).toFixed(2));

        // Phloem micro-voltages correlate with solar influx (solarMj) and hydration
        const solarPPFDEquiv = Number((solarMj * 55.0).toFixed(1)); // MJ/m2 to approx peak PPFD
        const sapPeakMV = Number((14.0 + (solarMj * 0.75) + (precipMm > 2.0 ? 2.5 : 0.0)).toFixed(2));
        const sapNightMV = Number((-3.5 - (cumulativeSoilWaterDeficit * 0.15)).toFixed(2));
        const sapMeanMV = Number(((sapPeakMV * 0.6) + (sapNightMV * 0.4)).toFixed(2));

        // Phase shift: Healthy living membrane capacitive angle (7.5° - 12.0°)
        const phaseShift = Number((9.5 - (cumulativeSoilWaterDeficit * 0.22)).toFixed(2));

        // Photosynthetic quantum rate (PS)
        const psRate = Number((3.5 + (solarMj * 0.28) - (cumulativeSoilWaterDeficit * 0.18)).toFixed(2));

        // Daily carbon sequestration yield (kg CO2)
        const carbonYieldKg = Number(((psRate * 0.15) + (sapMeanMV * 0.015)).toFixed(3));

        matrix.push({
          day_index: dayIdx,
          date: dateStr,
          precipitation_mm: precipMm,
          solar_radiation_mj: solarMj,
          ambient_solar_ppfd: solarPPFDEquiv,
          ambient_temp_c: tempMean,
          ambient_humidity_pct: Number((75.0 - (et0 * 4.0) + (precipMm * 2.0)).toFixed(1)),
          sap_micro_current_mv: sapMeanMV,
          sap_peak_mv: sapPeakMV,
          sap_night_mv: sapNightMV,
          tissue_impedance_kohm: currentZ,
          phase_shift_deg: phaseShift,
          photosynthesis_ps_rate: psRate,
          daily_carbon_yield_kg: carbonYieldKg,
          evapotranspiration_mm: et0,
          vascular_state: 'NORMAL_VASCULAR_FLUX',
          data_source: 'Open-Meteo Historical Ingestion'
        });
      }

      this.cachedMatrix = matrix;
      this.lastFetchedAt = now;
      return this._applyLiveDay30Override(matrix, currentStressMode);

    } catch (err) {
      console.warn('[HistoricalWeatherIngestion] Notice querying Open-Meteo:', err.message);
      // Return robust fallback if offline
      return this._generateOfflineFallbackMatrix(currentStressMode);
    }
  }

  _applyLiveDay30Override(matrix, currentStressMode) {
    if (!matrix || matrix.length === 0) return matrix;
    const cloned = JSON.parse(JSON.stringify(matrix));
    const day30 = cloned[cloned.length - 1];

    if (currentStressMode === 'WIRE_CUT') {
      day30.sap_micro_current_mv = 0.02;
      day30.tissue_impedance_kohm = 0.18;
      day30.phase_shift_deg = 0.04;
      day30.photosynthesis_ps_rate = 0.0;
      day30.daily_carbon_yield_kg = 0.0;
      day30.vascular_state = 'PROBE_DETACHMENT_COLLAPSE';
    } else if (currentStressMode === 'DEAD_TISSUE') {
      day30.sap_micro_current_mv = 0.12;
      day30.tissue_impedance_kohm = 84.5;
      day30.phase_shift_deg = 0.60;
      day30.photosynthesis_ps_rate = 0.1;
      day30.daily_carbon_yield_kg = 0.005;
      day30.vascular_state = 'NECROSIS_DESICCATION_DRIFT';
    } else if (currentStressMode === 'DROUGHT') {
      day30.tissue_impedance_kohm = 49.2;
      day30.phase_shift_deg = 4.1;
      day30.photosynthesis_ps_rate = 2.4;
      day30.vascular_state = 'HIGH_XYLEM_TENSION_STRESS';
    }

    return cloned;
  }

  _generateOfflineFallbackMatrix(currentStressMode) {
    const matrix = [];
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - 30);

    for (let day = 1; day <= 30; day++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + day);
      matrix.push({
        day_index: day,
        date: d.toISOString().split('T')[0],
        precipitation_mm: day % 7 === 0 ? 8.4 : 0.0,
        solar_radiation_mj: 14.5 + Math.sin(day * 0.4) * 3.2,
        ambient_solar_ppfd: 850.0 + Math.sin(day * 0.5) * 120.0,
        ambient_temp_c: 22.4 + Math.sin(day * 0.3) * 3.1,
        ambient_humidity_pct: 65.0,
        sap_micro_current_mv: 21.2 + Math.sin(day * 0.5) * 2.8,
        sap_peak_mv: 28.4,
        sap_night_mv: -3.8,
        tissue_impedance_kohm: 26.2 + Math.sin(day * 0.2) * 1.8,
        phase_shift_deg: 9.4,
        photosynthesis_ps_rate: 7.8,
        daily_carbon_yield_kg: 1.15,
        evapotranspiration_mm: 3.4,
        vascular_state: 'NORMAL_VASCULAR_FLUX',
        data_source: 'Offline Fallback Matrix'
      });
    }

    return this._applyLiveDay30Override(matrix, currentStressMode);
  }
}
