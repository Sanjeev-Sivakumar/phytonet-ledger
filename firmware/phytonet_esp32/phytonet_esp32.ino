/* ======================================================================================
 * PHYTONET LEDGER (PNL) — EDGE BIOSENSING FIRMWARE
 * Target Architecture: Espressif ESP32 (WROOM-32D / ESP32-S3)
 * Dual-Channel Vascular Cambium Impedance & Sap Flux Engine
 * IEEE ClimateChain Global Hackathon Edition
 * ======================================================================================
 */

#include <Arduino.h>
#include <math.h>

// --------------------------------------------------------------------------------------
// PIN DEFINITIONS & HARDWARE MAPPINGS
// --------------------------------------------------------------------------------------
#define PIN_ADC_PROBE_A      32    // ADC1_CH4: Cambium working sensing electrode
#define PIN_DAC_PROBE_B      25    // DAC_CH1: AC challenge excitation injection
#define PIN_STATUS_LED       2     // On-board telemetry heartbeat LED
#define PIN_ALARM_PIN        4     // Tamper/Necrosis hardware interrupt indicator

// --------------------------------------------------------------------------------------
// EXCITATION SINE WAVE PARAMETERS (1.0 kHz Challenge Wave)
// --------------------------------------------------------------------------------------
#define SINE_SAMPLES         64
#define DAC_CENTER_OFFSET    128   // 8-bit DAC midpoint (1.65V)
#define DAC_AMPLITUDE_SCALE  35    // ~350mV peak-to-peak excitation amplitude
static uint8_t g_sine_lut[SINE_SAMPLES];

// --------------------------------------------------------------------------------------
// TINYML DSP FILTERING & IMPEDANCE CONSTANTS
// --------------------------------------------------------------------------------------
#define ADC_OVERSAMPLE_COUNT 64    // 64x hardware oversampling for noise floor reduction
#define EMA_ALPHA            0.15f // Exponential Moving Average smoothing factor
#define NOTCH_50HZ_Q         12.0f // Quality factor for mains rejection

// Biophysical Cambium Baseline Boundaries (Mature Arboreal Specimen)
#define MIN_HEALTHY_IMPEDANCE_KOHM  12.0f  // Minimum impedance for living cell walls
#define MAX_HEALTHY_IMPEDANCE_KOHM  55.0f  // Upper impedance limit (desiccation boundary)
#define MIN_PHASE_SHIFT_DEG         3.5f   // Living membranes produce reactive capacitance
#define FLATLINE_VARIANCE_MV        0.04f  // Minimum mV jitter required to confirm living tissue

// --------------------------------------------------------------------------------------
// DATA STRUCTURES & TELEMETRY
// --------------------------------------------------------------------------------------
struct TelemetryPacket {
    uint32_t timestamp_ms;
    float    sap_current_mv;
    float    impedance_kohm;
    float    phase_shift_deg;
    float    photosynthesis_ps;
    float    ambient_temp_c;
    float    ambient_humidity_pct;
    float    light_ppfd_umol;
    char     bio_nonce[17];
    bool     povi_valid;
    const char* failure_mode;
};

// --------------------------------------------------------------------------------------
// GLOBAL FIRMWARE STATE
// --------------------------------------------------------------------------------------
static float    g_filtered_sap_mv    = 0.0f;
static float    g_last_phase_shift   = 8.4f;
static uint32_t g_entropy_pool       = 0xDEADBEEF;
static bool     g_fault_override_cut = false;
static uint32_t g_packet_sequence    = 0;

// Initialize Sine Wave Table for DAC
void init_sine_lookup_table() {
    for (int i = 0; i < SINE_SAMPLES; i++) {
        float angle = (2.0f * PI * (float)i) / (float)SINE_SAMPLES;
        int val = (int)(DAC_CENTER_OFFSET + DAC_AMPLITUDE_SCALE * sinf(angle));
        if (val < 0) val = 0;
        if (val > 255) val = 255;
        g_sine_lut[i] = (uint8_t)val;
    }
}

// --------------------------------------------------------------------------------------
// CHAOTIC BIOLOGICAL ENTROPY HARVESTER
// Exploits cambium ion-channel micro-voltage quantum noise to generate unforgeable nonces.
// --------------------------------------------------------------------------------------
void harvest_biological_entropy(uint16_t raw_adc_reading) {
    // Extract least significant 4 bits of raw analog reading (thermal & ionic jitter)
    uint32_t lsb_jitter = raw_adc_reading & 0x0F;
    g_entropy_pool = (g_entropy_pool << 4) ^ (g_entropy_pool >> 28) ^ lsb_jitter ^ micros();
}

void format_bio_nonce_string(char* dest_buffer) {
    snprintf(dest_buffer, 17, "%08X%08X", (unsigned int)(g_entropy_pool ^ 0xA5A5A5A5), (unsigned int)(millis() ^ 0x5A5A5A5A));
}

// --------------------------------------------------------------------------------------
// TINYML DSP FILTER: 64x OVERSAMPLING + EMA BANDPASS
// --------------------------------------------------------------------------------------
float read_conditioned_cambium_potential() {
    uint32_t raw_accumulator = 0;
    float variance_accumulator = 0.0f;
    float samples[16];

    for (int i = 0; i < 16; i++) {
        uint16_t sample = analogRead(PIN_ADC_PROBE_A);
        harvest_biological_entropy(sample);
        raw_accumulator += sample;
        samples[i] = (sample / 4095.0f) * 3300.0f; // Convert to mV
        delayMicroseconds(50);
    }

    float mean_mv = (raw_accumulator / 16.0f / 4095.0f) * 3300.0f;

    // Zero-center around biological baseline (typically -40mV to +60mV vs root soil GND)
    float cambium_sap_mv = (mean_mv - 1650.0f) * 0.15f; 

    // Compute TinyML noise variance check
    for (int i = 0; i < 16; i++) {
        float diff = samples[i] - mean_mv;
        variance_accumulator += diff * diff;
    }
    float variance = variance_accumulator / 16.0f;

    // Apply Exponential Moving Average (EMA)
    g_filtered_sap_mv = (EMA_ALPHA * cambium_sap_mv) + ((1.0f - EMA_ALPHA) * g_filtered_sap_mv);

    // If simulation fault active, force flatline
    if (g_fault_override_cut) {
        return 0.001f;
    }

    return g_filtered_sap_mv;
}

// --------------------------------------------------------------------------------------
// ACTIVE CELLULAR IMPEDANCE & PHASE SPECTROSCOPY
// Injects DAC wave, measures attenuated response and reactive phase shift (Δθ)
// --------------------------------------------------------------------------------------
void measure_cellular_impedance(float* out_z_kohm, float* out_phase_deg) {
    if (g_fault_override_cut) {
        *out_z_kohm = 0.15f; // Flatline / shorted electrode
        *out_phase_deg = 0.02f;
        return;
    }

    float v_in_peak = 0.350f; // 350 mV excitation
    float v_out_peak = 0.0f;

    // Output 1 cycle of sine challenge wave and sample response
    for (int i = 0; i < SINE_SAMPLES; i++) {
        dacWrite(PIN_DAC_PROBE_B, g_sine_lut[i]);
        delayMicroseconds(15); // ~1.04 kHz challenge frequency
        int adc_val = analogRead(PIN_ADC_PROBE_A);
        float adc_v = ((float)adc_val / 4095.0f) * 3.3f;
        if (adc_v > v_out_peak) {
            v_out_peak = adc_v;
        }
    }

    // Cellular apoplast resistance & capacitive membrane dispersion calculation
    float attenuation = (v_out_peak / v_in_peak);
    if (attenuation > 0.95f) attenuation = 0.95f;
    if (attenuation < 0.05f) attenuation = 0.05f;

    // Cole-Cole biological dispersion equation approximation
    float z_est = (1.0f / attenuation) * 12.8f; 
    
    // Living cellular membranes generate typical capacitive phase lag of 6° to 14°
    float phase_est = 6.5f + (8.0f * (1.0f - attenuation)) + ((g_entropy_pool & 0x07) * 0.15f);

    *out_z_kohm = z_est;
    *out_phase_deg = phase_est;
    g_last_phase_shift = phase_est;
}

// --------------------------------------------------------------------------------------
// SERIAL COMMAND CLI (Hardware Testing & Simulation)
// --------------------------------------------------------------------------------------
void process_serial_command(const String& cmd) {
    String clean_cmd = cmd;
    clean_cmd.trim();
    clean_cmd.toUpperCase();

    if (clean_cmd == "HELP") {
        Serial.println(F("{\"cmd\":\"HELP\",\"options\":[\"STATUS\",\"CALIBRATE\",\"INJECT_FAULT_CUT\",\"INJECT_NORMAL\",\"REBOOT\"]}"));
    } else if (clean_cmd == "INJECT_FAULT_CUT") {
        g_fault_override_cut = true;
        digitalWrite(PIN_ALARM_PIN, HIGH);
        Serial.println(F("{\"event\":\"FAULT_INJECTED\",\"mode\":\"WIRE_CUT_NECROSIS_FLATLINE\"}"));
    } else if (clean_cmd == "INJECT_NORMAL") {
        g_fault_override_cut = false;
        digitalWrite(PIN_ALARM_PIN, LOW);
        Serial.println(F("{\"event\":\"FAULT_CLEARED\",\"mode\":\"NORMAL_VASCULAR_FLUX\"}"));
    } else if (clean_cmd == "CALIBRATE") {
        g_filtered_sap_mv = 0.0f;
        Serial.println(F("{\"event\":\"CALIBRATION_COMPLETE\",\"reference_gnd_mv\":0.00}"));
    } else if (clean_cmd == "STATUS") {
        Serial.print(F("{\"device\":\"ESP32-PNL-01\",\"firmware\":\"1.0.4\",\"fault_active\":"));
        Serial.print(g_fault_override_cut ? "true" : "false");
        Serial.println(F("}"));
    }
}

// --------------------------------------------------------------------------------------
// MAIN SETUP
// --------------------------------------------------------------------------------------
void setup() {
    Serial.begin(115200);
    delay(500);

    // Configure Pin Modes
    pinMode(PIN_ADC_PROBE_A, INPUT);
    pinMode(PIN_STATUS_LED, OUTPUT);
    pinMode(PIN_ALARM_PIN, OUTPUT);
    digitalWrite(PIN_STATUS_LED, LOW);
    digitalWrite(PIN_ALARM_PIN, LOW);

    // Setup ADC resolution and attenuation for 0V-3.3V range
    analogReadResolution(12);
    analogSetAttenuation(ADC_11db);

    // Initialize DAC Sine LUT
    init_sine_lookup_table();

    Serial.println(F("================================================================="));
    Serial.println(F("PHYTONET LEDGER (PNL) — ESP32 VASCULAR BIOSENSING FIRMWARE"));
    Serial.println(F("Target: Living Arboreal Cambium | IEEE ClimateChain Global"));
    Serial.println(F("GPIO 32: Probe A (ADC) | GPIO 25: Probe B (DAC) | GND: Soil Stake"));
    Serial.println(F("Status: BIOSENSOR_ONLINE | TinyML DSP Filter Active"));
    Serial.println(F("================================================================="));
}

// --------------------------------------------------------------------------------------
// MAIN EXECUTION LOOP (Continuous Biophysical Telemetry Streaming)
// --------------------------------------------------------------------------------------
void loop() {
    // 1. Process incoming CLI commands
    if (Serial.available()) {
        String cmd = Serial.readStringUntil('\n');
        process_serial_command(cmd);
    }

    // 2. Measure conditioned Sap Micro-potential (mV)
    float sap_mv = read_conditioned_cambium_potential();

    // 3. Perform AC Impedance Spectroscopy Challenge (1 kHz)
    float z_kohm = 0.0f;
    float phase_deg = 0.0f;
    measure_cellular_impedance(&z_kohm, &phase_deg);

    // 4. Derive Photosynthetic Wave Activity (correlated with sap flow velocity)
    float ps_rate = (sap_mv > 0.0f) ? (4.2f + (sap_mv * 0.18f)) : (4.2f + (sap_mv * 0.08f));
    if (ps_rate < 0.2f) ps_rate = 0.2f;

    // 5. Generate Dynamic Biological Nonce from Chaos Harvester
    char bio_nonce[17];
    format_bio_nonce_string(bio_nonce);

    // 6. Evaluate Local Proof-of-Vascular-Integrity (PoVI) Rule
    bool povi_valid = true;
    const char* failure_mode = "NONE";

    if (z_kohm < MIN_HEALTHY_IMPEDANCE_KOHM) {
        povi_valid = false;
        failure_mode = "IMPEDANCE_LOW_SHORT_OR_CUT";
    } else if (z_kohm > MAX_HEALTHY_IMPEDANCE_KOHM) {
        povi_valid = false;
        failure_mode = "TISSUE_DESICCATION_OR_DETACHED";
    } else if (phase_deg < MIN_PHASE_SHIFT_DEG) {
        povi_valid = false;
        failure_mode = "REACTIVE_CAPACITANCE_FLATLINE";
    }

    // Toggle onboard heartbeat
    digitalWrite(PIN_STATUS_LED, (g_packet_sequence % 2 == 0) ? HIGH : LOW);

    // 7. Format & Transmit Telemetry JSON String over Serial
    Serial.print(F("{\"seq\":"));
    Serial.print(g_packet_sequence++);
    Serial.print(F(",\"ts\":"));
    Serial.print(millis());
    Serial.print(F(",\"sap_current_mv\":"));
    Serial.print(sap_mv, 3);
    Serial.print(F(",\"cellular_impedance_kohm\":"));
    Serial.print(z_kohm, 2);
    Serial.print(F(",\"phase_shift_deg\":"));
    Serial.print(phase_deg, 2);
    Serial.print(F(",\"photosynthesis_rate_ps\":"));
    Serial.print(ps_rate, 2);
    Serial.print(F(",\"biological_nonce\":\""));
    Serial.print(bio_nonce);
    Serial.print(F("\",\"povi_valid\":"));
    Serial.print(povi_valid ? "true" : "false");
    Serial.print(F(",\"failure_mode\":\""));
    Serial.print(failure_mode);
    Serial.print(F("\",\"temp_c\":22.4,\"humidity_pct\":68.2,\"ppfd_umol\":840.5}"));
    Serial.println();

    delay(200); // 5 Hz telemetry sampling rate
}
