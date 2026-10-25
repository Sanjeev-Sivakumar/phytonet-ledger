# PhytoNet Ledger (PNL) 🌿⚡
### Proof-of-Vascular-Integrity (PoVI) Decentralized Bio-Carbon Ledger
**Built for 1st Place in the IEEE ClimateChain Global Hackathon**

[![Architecture: Production Grade](https://img.shields.io/badge/Architecture-Production--Grade-2E5A36.svg)](#)
[![Hardware: ESP32-WROOM-32D](https://img.shields.io/badge/Hardware-ESP32--WROOM--32D-4E8752.svg)](#)
[![AI Engine: Google Gemini 3.8 Flash](https://img.shields.io/badge/Oracle-Gemini--3.8--Flash-blue.svg)](#)
[![Consensus: PoVI Slashing](https://img.shields.io/badge/Consensus-PoVI--Slashing--Active-success.svg)](#)
[![EU ESPR 2026: DPP Compliant](https://img.shields.io/badge/Standard-EU--DPP--Compliant-success.svg)](#)

---

## 1. Executive Summary

**PhytoNet Ledger (PNL)** is a bio-digital Web3 infrastructure that transforms living arboreal specimens into self-authenticating, non-fungible biological nodes. By interfacing directly with the cambium vascular layer of trees (xylem and phloem), PNL captures endogenous electro-ionic action potentials and conducts microscopic alternating-current cellular impedance spectroscopy (EIS).

Every gram of sequestered carbon is:
1. **Physical Anti-Spoofing:** Bound to a high-entropy **Biological Nonce** harvested from chaotic plant micro-voltages.
2. **Biophysical Verification:** Validated through **Proof-of-Vascular-Integrity (PoVI)**—if an electrode is detached, a wire is cut, or tissue dies, the system asserts an instant consensus exception that permanently burns the dynamic asset valuation to `$0.00`.
3. **AI Carbon Flux Oracle & Time-Series Predictions:** Evaluated in real time by the **Google Gemini API** (`gemini-3.8-flash`) to compute carbon yields and forecast 30/60/90-day soil sequestration and ecosystem stability trajectories.
4. **Industrial Emissions & Anti-Double-Counting Audits:** Balances factory smokestack $CO_2/CH_4$ emissions side-by-side with living absorption, enforcing smart contract logic gates that block double-counting.
5. **Digital Product Passports (DPP) & Circular Traceability:** Tracks sustainable bio-composites from living extraction to post-consumer recirculation.
6. **Transparent Carbon Trading & Recycling Incentives:** Live AMM order book with automated utility token emission mechanisms rewarding verified material recycling.

---

## 2. Five-Page Ecosystem Architecture

### PAGE 1: System Overview & Biological Ingestion
- **Twin 60fps Real-Time Canvases:** Live streaming plots mapping *Phloem Sap Micro-voltage Currents (mV)* and *Active Photosynthesis (PS)*.
- **Financial Candlestick / Trading Chart:** Interactive HTML5 Canvas chart displaying historical OHLC fluctuations, moving averages (MA7, MA25), volume bars, and multi-timeframe toggles (1H, 24H, 7D, 30D).
- **Predictive Analytics Core:** Client-side time-series forecasting widget querying Gemini 3.8 Flash to project Soil Sequestration Capacities, Ecosystem Stability Indices, and carbon yields for 30/60/90 days based on active micro-probe stress metrics.
- **Dynamic Asset Valuation Banner:** Displays real-time `$PNL/unit` valuation and chaotic **Biological Nonce** ticker.

### PAGE 2: Real-Time Emissions Engine & Blockchain Verification
- **Industrial Smokestack Telemetry:** Real-time monitoring of industrial nodes (Cement Works, Steel Smelter, Petrochemical Facility) tracking $CO_2$ ($kg/hr$) and $CH_4$ ($g/hr$).
- **Net-Carbon Dynamic Delta:** Computes $Net = Absorption - FactoryEmissions$ with live surplus/deficit gauges.
- **Web3 Smart Contract Net-Carbon Audits:**
  - *Gate A (Physical Binding):* Binds credits to living cambium micro-voltage nonces.
  - *Gate B (Anti-Double-Count):* Cross-checks serial roots against Verra, Gold Standard, and ClimateChain registries.
  - *Gate C (Auto-Slash & Freeze):* Automatically freezes tokens and triggers burn surcharges if emissions exceed absorption or probe fails.
  - *Interactive Test:* "Simulate Double-Count Attack" button demonstrates the smart contract rejecting duplicate minting requests.

### PAGE 3: Sustainable Supply Chains & Digital Product Passports (DPP)
- **Product Lifecycle Pipeline:** 4-stage stepper tracking products from Raw Biomass Extraction $\to$ Low-Carbon Processing $\to$ Electrified Shipping $\to$ Distribution.
- **Interactive DPP Registry:**
  - *Bio-Lignin Carbon Fiber Panel (Batch #DPP-8821)*: Net Embodied Carbon: -12.4 kg $CO_2e$
  - *Structural Cross-Laminated Timber (CLT) Beam (Batch #DPP-4019)*: Net Embodied Carbon: -45.8 kg $CO_2e$
  - *Mycelium Acoustic Tile (Batch #DPP-9204)*: Net Embodied Carbon: -4.2 kg $CO_2e$
  - Click any card to view verified GPS coordinates, thermal kiln logs, Merkle proof hashes, and custodial ownership chains.
- **Circular Recycling Traceability System:** Structural network graph tracking materials returning from post-consumer collection lines back into manufacturing assembly queues (78.4% recirculation rate).

### PAGE 4: Circular Economy Incentive & Platform Trading
- **Transparent Carbon Trading Platform:**
  - Live Order Book layout with mock buy/sell bid logs, bid depth, and spread ($0.08 PNL).
  - Transaction fee schedule (0.15% rebated to recycling liquidity pool).
  - Interactive order form (Market Buy / Market Sell) with instant on-chain execution.
  - Settlement ledger tracking rows with transaction hashes, buyer/seller addresses, and permanent retirement proofs.
- **Circular Economy Incentive Platform:**
  - User wallet profile (`0x71C...b48E`, balance, Circular Karma points).
  - Material recycling returns tracking meters (reclaimed pallets, biochar recaptured, biopolymers).
  - Automated Utility Token Emission mechanism: "Claim Pending +25.0 PNL" button distributes trading credits for verified recycling returns.

### PAGE 5: Hardware Terminal & Firmware Definitions
- **Exact Physical Pin Mapping:**
  - **GPIO Pin 32:** Connect via Jumper to **Probe A** (Xylem/Phloem cambium bundle for analog sap current capture).
  - **GPIO Pin 25:** Connect via Jumper to **Probe B** (1.04kHz AC excitation wave via 100nF DC blocking capacitor).
  - **GND Pin:** Connect via Jumper to **Rhizosphere Copper Stake** (30cm root-zone ground reference $< 2.1\Omega$).
- **ESP32 Arduino/C++ Firmware:** Complete production code with 64x oversampling, 50/60 Hz notch filtering, Cole-Cole impedance extraction, chaotic biological entropy harvesting, and JSON serialization.
- **Interactive UART Serial Console:** Live terminal supporting `HELP`, `STATUS`, `CALIBRATE`, `INJECT WIRE_CUT`, `INJECT NORMAL`, `POVI VERIFY`, `GEMINI QUERY`, and `FORECAST`.

---

## 3. Directory Structure

```
d:\Projects\IEEE Climate\
├── .env                              # Pre-configured environment with Gemini API Key
├── .env.example                      # Environment template
├── HARDWARE_SPECIFICATION.md         # Full physical wiring & pinout matrix
├── README.md                         # Comprehensive architecture whitepaper
├── package.json                      # Unified scripts & dev dependencies
├── tsconfig.json                     # Strict ES2022 TypeScript configuration
├── vite.config.ts                    # Vite build & proxy configuration
├── index.html                        # HTML5 shell loading Roboto font (100, 300, 400)
├── firmware/
│   └── phytonet_esp32.ino            # Complete production C++/Arduino ESP32 firmware
├── server/
│   ├── index.js                      # Express REST API & WebSocket server (5 Hz)
│   ├── geminiOracle.js               # Gemini 3.8 Flash Carbon Flux & 30/60/90d forecast engine
│   ├── emissionsEngine.js            # Industrial factory emissions & double-counting audit engine
│   ├── dppRegistry.js                # Digital Product Passports & circular recycling network
│   ├── tradingPlatform.js            # Live carbon order book & circular recycling rewards
│   ├── poviEngine.js                 # PoVI cryptographic state ledger & consensus slashing
│   ├── telemetrySimulator.js         # ESP32 bio-potential physics & fault injector
│   └── sampleSignals.json            # Pre-recorded authentic field datasets
└── src/
    ├── main.tsx                      # React root entrypoint
    ├── App.tsx                       # Dashboard layout shell coordinating all 5 modules
    ├── index.css                     # Forest Theme tokens & daylight chart styling
    ├── types.ts                      # Strict TypeScript data models for all 5 pages
    ├── services/
    │   └── api.ts                    # REST & WebSocket client service with auto-reconnect
    ├── components/
    │   ├── TopNav.tsx                # Ultra-minimal outline navigation bar (zero text labels)
    │   ├── MetricCard.tsx            # Compact scannable metric card
    │   ├── WaveformCanvas.tsx        # High-performance 60fps canvas wave visualizer
    │   ├── ValuationMeter.tsx        # Prominent Dynamic Asset Valuation banner ($PNL)
    │   ├── StabilityEnvelope.tsx     # Biophysical boundary & stability envelope widget
    │   ├── AnomalyController.tsx     # Fault injector matrix (Wire cut, dead tissue, solar noon)
    │   ├── CandlestickChart.tsx      # Spot financial candlestick trading chart (Page 1)
    │   └── PredictiveForecastingWidget.tsx # AI time-series prediction widget (Page 1)
    └── pages/
        ├── OverviewPage.tsx          # Page 1: System Overview & Biological Ingestion
        ├── EmissionsVerificationPage.tsx # Page 2: Real-Time Emissions & Net Audits
        ├── SupplyChainDPPPage.tsx    # Page 3: Sustainable Supply Chains & DPP
        ├── CircularTradingPage.tsx   # Page 4: Carbon Trading & Circular Incentives
        └── HardwareTerminalPage.tsx  # Page 5: Hardware Terminal & Firmware
```

---

## 4. Quick Start & Execution

```bash
# 1. Install dependencies
npm install

# 2. Launch full development suite (Backend port 5000 + Frontend port 3000)
npm run dev

# 3. Build production bundle (Validates TypeScript & Vite bundling)
npm run build
```
- **Backend API & WebSocket Server:** `http://localhost:5000`
- **Frontend Dashboard:** `http://localhost:3000`

---
**IEEE ClimateChain Global Hackathon — PhytoNet Ledger Team**
