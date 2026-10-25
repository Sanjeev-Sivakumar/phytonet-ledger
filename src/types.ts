/**
 * PhytoNet Ledger (PNL) — Complete TypeScript Type Definitions
 * IEEE ClimateChain Global Hackathon — Final Production Architecture
 */

export interface GeoLocation {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  source: string;
}

export interface LiveEnvironment {
  temperature_c: number;
  humidity_pct: number;
  par_ppfd_umol: number;
  solar_radiation_w_m2: number;
  soil_moisture_m3_m3: number;
  soil_temp_c: number;
  last_synced_at?: string | null;
  provider: string;
}

export interface LiveMarketData {
  nct_usd: number;
  nct_24h_vol: number;
  nct_24h_change: number;
  klima_usd: number;
  klima_24h_vol: number;
  provider: string;
  last_synced_at?: string | null;
}

export interface LiveAirQuality {
  carbon_monoxide_ug_m3: number;
  nitrogen_dioxide_ug_m3: number;
  sulphur_dioxide_ug_m3: number;
  pm2_5_ug_m3: number;
  pm10_ug_m3: number;
  station_name: string;
  provider: string;
  last_synced_at?: string | null;
}

export interface TelemetryData {
  seq: number;
  timestamp: string;
  sap_current_mv: number;
  cellular_impedance_kohm: number;
  phase_shift_deg: number;
  photosynthesis_rate_ps: number;
  temp_c: number;
  humidity_pct: number;
  ppfd_umol: number;
  biological_nonce: string;
  povi_valid: boolean;
  failure_mode: string;
  operating_mode?: string;
  dataset_name?: string;
  geo_location?: GeoLocation;
  environment?: LiveEnvironment;
}

export interface PoVIResult {
  povi_valid?: boolean;
  is_slashed?: boolean;
  success?: boolean;
  status?: string;
  slashed?: boolean;
  violation_reason?: string | null;
  active_asset_valuation?: number;
  token_mint_rate?: number;
  multiplier?: number;
  contract_address?: string;
  authority_address?: string;
  stage_gates?: Record<string, { name: string; passed: boolean; detail: string }>;
}

export interface GeminiEvaluation {
  carbon_sequestration_g_per_hr: number;
  annual_co2_metric_tons_est: number;
  dynamic_asset_multiplier: number;
  biophysical_health_index: number;
  stomatal_conductance_mol_m2_s: number;
  vascular_transpiration_velocity_cm_hr: number;
  oracle_confidence_pct: number;
  biophysical_reasoning: string;
  oracle_signature: string;
  timestamp: string;
  model_used: string;
  oracle_status: string;
  biological_nonce: string;
}

export interface ForecastPoint {
  day: number;
  projected_yield_kg: number;
  soil_sequestration_tons: number;
  stability_index: number;
  upper_bound: number;
  lower_bound: number;
}

export interface ForecastData {
  day_30: { soil_sequestration_tons: number; ecosystem_stability_idx: number; carbon_yield_kg: number; cavitation_risk_pct: number };
  day_60: { soil_sequestration_tons: number; ecosystem_stability_idx: number; carbon_yield_kg: number; cavitation_risk_pct: number };
  day_90: { soil_sequestration_tons: number; ecosystem_stability_idx: number; carbon_yield_kg: number; cavitation_risk_pct: number };
  confidence_interval_pct: number;
  trend_summary: string;
  timestamp: string;
  model_used: string;
  time_series: ForecastPoint[];
}

export interface SaturationBreakthrough {
  breakthrough_date: string;
  days_to_saturation: number;
  max_soil_capacity_metric_tons: number;
  current_saturation_pct: number;
  mycorrhizal_sink_velocity_rate: string;
}

export interface VascularStressAnomaly48h {
  risk_score_0_100: number;
  anomaly_tier: 'THRIVING' | 'METABOLIC_SLOWDOWN' | 'ANOMALY_DETECTED';
  confidence_rating_pct: number;
  tamper_or_detachment_probability_pct: number;
  root_cause_diagnosis: string;
  recommended_mitigation: string;
}

export interface ProjectedYieldDay {
  day: number;
  expected_credits: number;
  lower_bound: number;
  upper_bound: number;
  cumulative_carbon_tons: number;
}

export interface ProjectedYieldCurve90d {
  daily_yields: ProjectedYieldDay[];
  total_90d_credits_est: number;
  growth_rate_trend: string;
}

export interface PredictiveCarbonFluxResponse {
  saturation_breakthrough: SaturationBreakthrough;
  vascular_stress_anomaly_48h: VascularStressAnomaly48h;
  projected_yield_curve_90d: ProjectedYieldCurve90d;
  ml_model_metadata: {
    algorithm: string;
    training_window_days: number;
    horizon_days: number;
    r_squared_score: number;
    live_rain_30d_mm?: number;
    live_solar_avg_mj?: number;
  };
  timestamp: string;
  model_used: string;
  operating_stress_mode: string;
  historical_30d_summary?: any[];
}

export interface FactoryNode {
  id: string;
  name: string;
  type: string;
  co2_emission_rate_kg_hr: number;
  ch4_emission_rate_g_hr: number;
  pm25_level?: number;
  co_ug_m3?: number;
  so2_ug_m3?: number;
  stack_temp_c?: number;
  scrubber_efficiency_pct?: number;
  status: string;
  last_audit_hash: string;
}

export interface EmissionsSnapshot {
  timestamp: string;
  live_air_quality?: LiveAirQuality;
  factory_nodes: FactoryNode[];
  total_gross_industrial_co2_kg_hr?: number;
  total_biological_absorption_kg_hr?: number;
  net_carbon_balance_kg_hr?: number;
  total_factory_co2_kg_hr?: number;
  total_factory_ch4_g_hr?: number;
  arboreal_absorption_kg_hr?: number;
  net_carbon_delta_kg_hr?: number;
  audit_status?: string;
  smart_contract_status?: string;
  is_net_deficit: boolean;
  smart_contract?: {
    smart_contract_address: string;
    double_counting_prevention: {
      global_registry_hash_sync: boolean;
      serial_deduplication_active: boolean;
      blocked_duplicate_attempts_count: number;
    };
    net_audit_rules: {
      auto_freeze_on_deficit: boolean;
      auto_burn_on_tamper: boolean;
      current_status: string;
    };
  };
  contract_audit_state?: {
    smart_contract_address: string;
    double_counting_prevention: {
      global_registry_hash_sync: boolean;
      serial_deduplication_active: boolean;
      blocked_duplicate_attempts_count: number;
    };
    net_audit_rules: {
      auto_freeze_on_deficit: boolean;
      auto_burn_on_tamper: boolean;
      current_status: string;
    };
  };
  audit_history?: Array<{
    id: string;
    timestamp: string;
    event_type: string;
    details: string;
    tx_hash: string;
    result: string;
    severity: string;
  }>;
  audit_logs?: Array<{
    id: string;
    timestamp: string;
    event_type: string;
    details: string;
    tx_hash: string;
    result: string;
    severity: string;
  }>;
}

export interface DPPItem {
  id: string;
  title: string;
  category: string;
  batch_number: string;
  origin_verified: string;
  gps_coordinates: string;
  net_embodied_carbon_kg: number;
  status: string;
  lifecycle_stage: string;
  qr_verification_hash: string;
  processing_history: Array<{
    stage: string;
    timestamp: string;
    carbon_impact: number;
    description: string;
  }>;
  ownership_chain: Array<{
    owner: string;
    date: string;
    tx_hash: string;
  }>;
}

export interface RecyclingTraceability {
  overall_recirculation_rate_pct: number;
  total_materials_reclaimed_metric_tons: number;
  avoided_virgin_carbon_footprint_tons: number;
  nodes: Array<{
    id: string;
    name: string;
    type: string;
    volume_kg_day: number;
    efficiency: number;
  }>;
  flow_streams: Array<{
    from: string;
    to: string;
    rate_kg_hr: number;
    purity: number;
  }>;
}

export interface OrderBookItem {
  id: string;
  price_pnl: number;
  amount_tons: number;
  total_usd: number;
  trader: string;
}

export interface TradeItem {
  tx_hash: string;
  timestamp: string;
  type: string;
  volume_tons: number;
  price_pnl: number;
  fee_pnl: number;
  buyer: string;
  seller: string;
  status: string;
  retirement_status: string;
}

export interface TradingState {
  current_price_pnl: number;
  live_market_data?: LiveMarketData;
  user_wallet: {
    address: string;
    pnl_balance: number;
    nct_balance?: number;
    circular_karma_points: number;
    verified_retired_carbon_tons: number;
    lifetime_rewards_earned: number;
  };
  recycling_metrics: {
    timber_pallets_reclaimed_units: number;
    biomass_biochar_recaptured_kg: number;
    post_consumer_biopolymers_kg: number;
    pending_token_emissions: number;
  };
  order_book: {
    spread: number;
    bids: OrderBookItem[];
    asks: OrderBookItem[];
  };
  settlement_ledger: TradeItem[];
}

export interface LedgerBlock {
  index: number;
  timestamp: string;
  previous_hash: string;
  block_hash?: string;
  hash?: string;
  biological_nonce: string;
  merkle_root: string;
  sap_current_mv: number;
  cellular_impedance_kohm: number;
  carbon_sequestration_g_hr: number;
  dynamic_asset_valuation: number;
  token_mint_rate: number;
  povi_status: string;
  signer_address?: string;
  oracle_model?: string;
  oracle_confidence?: number;
}

export interface LedgerState {
  contract_address: string;
  authority_address: string;
  active_valuation: number;
  token_mint_rate: number;
  is_slashed: boolean;
  slash_reason?: string | null;
  last_slash_reason?: string | null;
  total_blocks: number;
  chain_height?: number;
  latest_block?: LedgerBlock;
  recent_blocks: LedgerBlock[];
  audit_logs: any[];
  audit_ledger?: any[];
  credit_batches: any[];
  registered_count: number;
  stage_gates: Record<string, { name: string; passed: boolean; detail: string }>;
  stage_gate_pipeline?: any;
}

export interface TerminalLog {
  id: string;
  timestamp: string;
  category: string;
  message: string;
}

export interface SampleDataset {
  id: string;
  name: string;
  species: string;
  ambient: {
    temperature_c: number;
    humidity_pct: number;
    ppfd_umol: number;
    soil_moisture_pct?: number;
  };
  data: Array<{
    timestamp_offset_s: number;
    sap_current_mv: number;
    impedance_kohm: number;
    phase_shift_deg: number;
    ps_rate: number;
    ambient_ppfd: number;
  }>;
}
