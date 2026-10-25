/**
 * PhytoNet Ledger (PNL) — Simulated Time-Series Data Matrix
 * Generates 30 distinct days of high-fidelity arboreal cambium telemetry
 * featuring cyclical diurnal rhythms, photosynthetic sunlight peaks,
 * micro-voltage night drops, and monthly cellular impedance drift trends.
 */

export function generate30DayHistoricalMatrix(currentStressMode = 'NORMAL') {
  const history = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 30);

  // Baseline variables for a 120-year-old living Douglas Fir cambium cluster
  let baselineImpedance = 24.5; // kΩ
  let soilHydrationTrend = 0.0;

  for (let day = 1; day <= 30; day++) {
    const dayDate = new Date(baseDate);
    dayDate.setDate(dayDate.getDate() + day);
    const dateStr = dayDate.toISOString().split('T')[0];

    // Seasonal / Weekly weather cycles (simulating sunny spells, cloud cover, and rain events)
    const rainEvent = (day >= 7 && day <= 9) || (day >= 21 && day <= 22);
    const heatWave = (day >= 14 && day <= 17);

    // Subtle monthly impedance drift (apoplastic electrolyte concentration & soil moisture shifts)
    if (rainEvent) {
      soilHydrationTrend -= 0.6; // Rain lowers tissue resistance slightly (higher ion mobility)
    } else if (heatWave) {
      soilHydrationTrend += 0.8; // Transpiration water loss elevates cellular impedance
    } else {
      soilHydrationTrend += (Math.random() - 0.45) * 0.15;
    }
    const currentDayImpedance = Number((baselineImpedance + soilHydrationTrend + Math.sin(day * 0.3) * 1.2).toFixed(2));

    // Solar PAR Influx (midday peaks)
    let solarPeakPPFD = 980.0;
    if (rainEvent) solarPeakPPFD = 380.0;
    if (heatWave) solarPeakPPFD = 1250.0;
    solarPeakPPFD += (Math.random() - 0.5) * 60.0;

    // Phloem Sap Micro-voltages: Endogenous electro-ionic transport
    // Correlates with solar flux & sucrose-proton symport
    const sapPeakMV = Number((18.5 + (solarPeakPPFD / 1000) * 14.2 + (Math.sin(day * 0.5) * 2.1)).toFixed(2));
    const sapNightMV = Number((-4.5 + (Math.random() - 0.5) * 1.8).toFixed(2));
    const sapMeanMV = Number(((sapPeakMV * 0.6) + (sapNightMV * 0.4)).toFixed(2));

    // Phase shift angle Δθ (reactive capacitance across cell membranes: healthy 7.5° - 12.0°)
    const phaseShiftMean = Number((9.2 + Math.cos(day * 0.4) * 1.4 + (rainEvent ? 0.8 : 0.0)).toFixed(2));

    // Photosynthetic activity rate (PS)
    const psMean = Number((4.2 + (sapMeanMV * 0.18) + (solarPeakPPFD / 350.0)).toFixed(2));

    // Carbon sequestration yield (kg CO2 per day for tree cluster)
    const dailyCarbonYieldKg = Number(((psMean * 0.14) + (sapMeanMV * 0.02) + (solarPeakPPFD * 0.0004)).toFixed(3));

    // Ambient sensors
    const tempC = Number((heatWave ? 28.5 : rainEvent ? 16.8 : 21.4 + Math.sin(day * 0.8) * 2.5).toFixed(1));
    const humidityPct = Number((rainEvent ? 86.0 : heatWave ? 42.0 : 66.5 + Math.cos(day * 0.6) * 8.0).toFixed(1));

    // Check if Day 30 should reflect live operational stress override
    let finalSap = sapMeanMV;
    let finalZ = currentDayImpedance;
    let finalPhase = phaseShiftMean;
    let anomalyNote = 'NORMAL_VASCULAR_FLUX';

    if (day === 30) {
      if (currentStressMode === 'WIRE_CUT') {
        finalSap = 0.02;
        finalZ = 0.18;
        finalPhase = 0.04;
        anomalyNote = 'PROBE_DETACHMENT_COLLAPSE';
      } else if (currentStressMode === 'DEAD_TISSUE') {
        finalSap = 0.12;
        finalZ = 84.5;
        finalPhase = 0.60;
        anomalyNote = 'NECROSIS_DESICCATION_DRIFT';
      } else if (currentStressMode === 'DROUGHT') {
        finalZ = 49.2;
        finalPhase = 4.1;
        anomalyNote = 'HIGH_XYLEM_TENSION_STRESS';
      }
    }

    history.push({
      day_index: day,
      date: dateStr,
      sap_micro_current_mv: finalSap,
      sap_peak_mv: sapPeakMV,
      sap_night_mv: sapNightMV,
      tissue_impedance_kohm: finalZ,
      phase_shift_deg: finalPhase,
      ambient_solar_ppfd: Number(solarPeakPPFD.toFixed(1)),
      ambient_temp_c: tempC,
      ambient_humidity_pct: humidityPct,
      photosynthesis_ps_rate: psMean,
      daily_carbon_yield_kg: dailyCarbonYieldKg,
      vascular_state: anomalyNote
    });
  }

  return history;
}
