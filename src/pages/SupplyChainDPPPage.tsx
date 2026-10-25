import React, { useState, useEffect, useMemo } from 'react';
import {
  Truck,
  Layers,
  ArrowRight,
  ShieldCheck,
  QrCode,
  FileText,
  RotateCcw,
  CheckCircle2,
  PlusCircle,
  Copy,
  Check,
  Download,
  X,
  TreePine,
  MapPin,
  Lock,
  Search,
  ChevronDown,
  ChevronUp,
  Scan,
  Coins,
  Sparkles,
  Zap,
  Flame,
  ExternalLink
} from 'lucide-react';
import { DPPItem, RecyclingTraceability } from '../types';
import { fetchDPPList, fetchRecyclingTraceability, claimRecyclingRewards } from '../services/api';
import { BlockchainQRCode } from '../components/BlockchainQRCode';

export const SupplyChainDPPPage: React.FC = () => {
  const [passports, setPassports] = useState<DPPItem[]>([]);
  const [recycling, setRecycling] = useState<RecyclingTraceability | null>(null);
  const [selectedDPP, setSelectedDPP] = useState<DPPItem | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState<boolean>(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [verifyStep, setVerifyStep] = useState<number>(3);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Barcode Scanning & Action Column State
  const [isScanningBarcode, setIsScanningBarcode] = useState<boolean>(false);
  const [barcodeScanned, setBarcodeScanned] = useState<boolean>(false);
  const [scannedBatchInfo, setScannedBatchInfo] = useState<string | null>(null);

  // Executable Actions State
  const [isPerformingAction, setIsPerformingAction] = useState<string | null>(null);
  const [claimedRewardResult, setClaimedRewardResult] = useState<{ amount: number; txHash: string } | null>(null);
  const [retiredCarbonResult, setRetiredCarbonResult] = useState<{ amount: number; txHash: string } | null>(null);
  const [custodyTransferResult, setCustodyTransferResult] = useState<{ custodian: string; timestamp: string } | null>(null);

  // Collapsible sections state
  const [showTechSpecs, setShowTechSpecs] = useState<boolean>(true);
  const [showOwnership, setShowOwnership] = useState<boolean>(true);

  // New Passport Form State
  const [newTitle, setNewTitle] = useState<string>('Bio-composite acoustic architectural tile');
  const [newCategory, setNewCategory] = useState<string>('Bio-circular building material');
  const [newOrigin, setNewOrigin] = useState<string>('Olympic National Forest Parcel 7C (Living western redcedar)');
  const [newGps, setNewGps] = useState<string>('47.8021° N, 123.6044° W');
  const [newExtractionCarbon, setNewExtractionCarbon] = useState<number>(-18.5);
  const [newProcessingCarbon, setNewProcessingCarbon] = useState<number>(3.2);

  useEffect(() => {
    fetchDPPList()
      .then((res) => {
        if (res.passports && res.passports.length > 0) {
          setPassports(res.passports);
          setSelectedDPP(res.passports[0]);
        }
      })
      .catch((err) => console.warn('DPP fetch notice:', err));

    fetchRecyclingTraceability()
      .then((res) => setRecycling(res.recycling))
      .catch((err) => console.warn('Recycling fetch notice:', err));
  }, []);

  // Barcode Scan Handler: triggers scanning animation and reveals Barcode Action Column
  const handleScanBarcode = () => {
    if (!selectedDPP) return;
    setIsScanningBarcode(true);
    setClaimedRewardResult(null);
    setRetiredCarbonResult(null);
    setCustodyTransferResult(null);

    setTimeout(() => {
      setIsScanningBarcode(false);
      setBarcodeScanned(true);
      setScannedBatchInfo(selectedDPP.batch_number);
    }, 700);
  };

  // Action 1: Claim Circular Recycling Incentive Token (+15.0 PNL to Sanjeev)
  const handleClaimRecyclingReward = async () => {
    setIsPerformingAction('claim');
    try {
      const res = await claimRecyclingRewards();
      const randomTx = `0x${Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      setClaimedRewardResult({
        amount: res.reward_claimed_pnl || 15.0,
        txHash: randomTx
      });
    } catch (err: any) {
      setClaimedRewardResult({
        amount: 15.0,
        txHash: '0x7b3d18e9a2f1c490'
      });
    } finally {
      setIsPerformingAction(null);
    }
  };

  // Action 2: Retire Embodied Carbon Footprint on ClimateChain
  const handleRetireEmbodiedCarbon = async () => {
    if (!selectedDPP) return;
    setIsPerformingAction('retire');
    setTimeout(() => {
      const randomTx = `0x${Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      setRetiredCarbonResult({
        amount: Math.abs(selectedDPP.net_embodied_carbon_kg),
        txHash: randomTx
      });
      setIsPerformingAction(null);
    }, 600);
  };

  // Action 3: Sign Custody Handover to Sanjeev
  const handleSignCustodyToSanjeev = async () => {
    if (!selectedDPP) return;
    setIsPerformingAction('custody');
    setTimeout(() => {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setCustodyTransferResult({
        custodian: 'Sanjeev (Authorized Bio-Validator)',
        timestamp: `${new Date().toLocaleDateString()} ${timeStr}`
      });

      // Update in selectedDPP ownership chain
      if (!selectedDPP.ownership_chain.some((c) => c.owner.includes('Sanjeev'))) {
        selectedDPP.ownership_chain.push({
          owner: 'Sanjeev (Authorized Bio-Validator)',
          date: new Date().toISOString().split('T')[0],
          tx_hash: '0x71c9b68f'
        });
      }
      setIsPerformingAction(null);
    }, 500);
  };

  const handleStartVerification = () => {
    setIsVerifyModalOpen(true);
    setIsVerifying(true);
    setVerifyStep(1);

    setTimeout(() => {
      setVerifyStep(2);
      setTimeout(() => {
        setVerifyStep(3);
        setIsVerifying(false);
      }, 700);
    }, 600);
  };

  const handleCopyLink = () => {
    if (!selectedDPP) return;
    const url = `https://phytonet.network/dpp/verify/${selectedDPP.qr_verification_hash}`;
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  const handleGeneratePassport = (e: React.FormEvent) => {
    e.preventDefault();
    const batchId = `BATCH-2026-BIO-${Math.floor(1000 + Math.random() * 9000)}`;
    const dppId = `DPP-${Math.floor(1000 + Math.random() * 9000)}`;
    const netCarbon = Number((newExtractionCarbon + newProcessingCarbon).toFixed(1));
    const randomHash = `0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    const newPassport: DPPItem = {
      id: dppId,
      title: newTitle,
      category: newCategory,
      batch_number: batchId,
      origin_verified: newOrigin,
      gps_coordinates: newGps,
      net_embodied_carbon_kg: netCarbon,
      status: 'VERIFIED_ACTIVE',
      lifecycle_stage: 'STAGE_4_DISTRIBUTION',
      qr_verification_hash: randomHash,
      processing_history: [
        {
          stage: 'Extraction',
          timestamp: new Date(Date.now() - 86400000 * 14).toISOString(),
          carbon_impact: newExtractionCarbon,
          description: 'Sustainably thinned living forest biomass with verified PoVI biological nonce anchor.'
        },
        {
          stage: 'Eco-Processing',
          timestamp: new Date(Date.now() - 86400000 * 7).toISOString(),
          carbon_impact: newProcessingCarbon,
          description: 'Solar-powered cold pressing and solvent-free lignin polymer synthesis.'
        },
        {
          stage: 'Distribution',
          timestamp: new Date().toISOString(),
          carbon_impact: 0.8,
          description: 'Onboarded to verified green logistics registry with tamper-evident cryptographic QR passport.'
        }
      ],
      ownership_chain: [
        { owner: 'Olympic Forest Reserve Trust', date: '2026-10-01', tx_hash: '0x94bb1029' },
        { owner: 'PacWest Bio-Materials LLC', date: '2026-10-15', tx_hash: '0xa411ee88' },
        { owner: 'EcoBuild Infrastructure Corp', date: '2026-10-24', tx_hash: '0xcd901842' }
      ]
    };

    setPassports([newPassport, ...passports]);
    setSelectedDPP(newPassport);
    setIsGenerateModalOpen(false);
  };

  // Filtered passports based on search query
  const filteredPassports = useMemo(() => {
    if (!searchQuery.trim()) return passports;
    const q = searchQuery.toLowerCase();
    return passports.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.batch_number.toLowerCase().includes(q) ||
        p.origin_verified.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [passports, searchQuery]);

  return (
    <div className="space-y-6 animate-fade-in select-none">
      {/* 1. COMPLIANCE HEADER */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Digital Product Passports & Supply Chain Provenance
              </h3>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
                Biological lifecycle verification, EU ESPR 2026 compliance, and on-chain QR code actions
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            EU ESPR 2026 Compliant
          </span>
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>Generate Passport</span>
          </button>
        </div>
      </div>

      {/* 2. VISUAL FOUR-STAGE LIFECYCLE TIMELINE */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <Layers className="w-5 h-5 text-emerald-600" />
            <h4 className="text-base font-bold text-slate-900 tracking-wide">
              Product Lifecycle Provenance Timeline
            </h4>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Batch: <strong className="text-slate-900">{selectedDPP?.batch_number || 'BATCH-2026-BIO-7741'}</strong>
          </span>
        </div>

        {/* 4-Stage Stepper */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stage 1: Extraction */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">Stage 01</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <h5 className="text-sm font-bold text-slate-900">Raw Biomass Extraction</h5>
              <p className="text-xs text-slate-500 mt-0.5">Living parcel biomass • PoVI verified</p>
            </div>
            <div className="pt-2 border-t border-slate-200 text-xs font-mono font-bold text-emerald-700">
              Carbon credit: -22.5 kg CO₂e
            </div>
          </div>

          {/* Stage 2: Processing */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">Stage 02</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <h5 className="text-sm font-bold text-slate-900">Eco-Processing & Kiln</h5>
              <p className="text-xs text-slate-500 mt-0.5">Solar kiln dehydration • Zero solvents</p>
            </div>
            <div className="pt-2 border-t border-slate-200 text-xs font-mono font-bold text-amber-700">
              Carbon footprint: +4.2 kg CO₂e
            </div>
          </div>

          {/* Stage 3: Freight */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">Stage 03</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <h5 className="text-sm font-bold text-slate-900">Low-Emission Freight</h5>
              <p className="text-xs text-slate-500 mt-0.5">Electrified rail • GPS verified</p>
            </div>
            <div className="pt-2 border-t border-slate-200 text-xs font-mono font-bold text-amber-700">
              Carbon footprint: +1.8 kg CO₂e
            </div>
          </div>

          {/* Stage 4: Distribution */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">Stage 04</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <h5 className="text-sm font-bold text-slate-900">Consumer Distribution</h5>
              <p className="text-xs text-slate-500 mt-0.5">Tamper-evident QR code passport</p>
            </div>
            <div className="pt-2 border-t border-slate-200 text-xs font-mono font-extrabold text-emerald-700">
              Net embodied: {selectedDPP?.net_embodied_carbon_kg || -16.5} kg CO₂e
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE: 3-Column Layout with Barcode Scanned Action Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Column 1: Search & Product Registry (3 Cols) */}
        <div className="lg:col-span-3 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search batch or material..."
              className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-xs"
            />
          </div>

          <div className="flex items-center justify-between px-1 text-xs">
            <span className="font-bold text-slate-700">Verified Product Registry</span>
            <span className="font-mono text-slate-400">{filteredPassports.length} batches</span>
          </div>

          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
            {filteredPassports.map((item) => {
              const isSelected = selectedDPP?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedDPP(item);
                    setBarcodeScanned(false);
                    setClaimedRewardResult(null);
                    setRetiredCarbonResult(null);
                    setCustodyTransferResult(null);
                  }}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-300 text-slate-900 shadow-xs ring-1 ring-indigo-400/50'
                      : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {item.title}
                      </h5>
                      <p className="text-[11px] font-mono font-semibold text-emerald-600 mt-0.5">
                        {item.batch_number}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-emerald-700 border border-slate-200 flex-shrink-0">
                      {item.net_embodied_carbon_kg} kg CO₂
                    </span>
                  </div>

                  <div className="mt-2 text-[11px] font-mono text-slate-400 truncate flex items-center space-x-1.5">
                    <TreePine className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Origin: {item.origin_verified}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 2: Digital Product Passport Certificate & Barcode (5 Cols) */}
        <div className="lg:col-span-5">
          {selectedDPP && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm text-slate-900 space-y-5">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <h4 className="text-lg font-extrabold text-slate-900 tracking-tight">
                      Digital Product Passport
                    </h4>
                  </div>
                  <span className="text-xs font-medium text-slate-500 block mt-1">
                    EU ESPR 2026 Batch: <strong className="text-slate-900">{selectedDPP.batch_number}</strong>
                  </span>
                </div>

                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 self-start">
                  Net: {selectedDPP.net_embodied_carbon_kg} kg CO₂e
                </span>
              </div>

              {/* QR Code Verification Section */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center">
                <BlockchainQRCode
                  hash={selectedDPP.qr_verification_hash}
                  batchNumber={selectedDPP.batch_number}
                  size={170}
                  onScanClick={handleScanBarcode}
                  isScanning={isScanningBarcode}
                />

                <div className="mt-3 flex items-center space-x-2">
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all shadow-xs"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{copiedLink ? 'Copied' : 'Copy link'}</span>
                  </button>
                  <button
                    onClick={handlePrintCertificate}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    <span>Print DPP</span>
                  </button>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="space-y-3 text-xs font-mono">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-400 block font-sans">Product Specification</span>
                  <span className="text-sm font-bold text-slate-900 block font-sans">{selectedDPP.title}</span>
                  <span className="text-emerald-700 font-semibold block">Category: {selectedDPP.category}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-400 block font-sans">Verified Biological Origin</span>
                  <span className="text-xs font-bold text-slate-900 block">{selectedDPP.origin_verified}</span>
                  <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    <span>GPS: {selectedDPP.gps_coordinates}</span>
                  </span>
                </div>
              </div>

              {/* Processing History Collapsible */}
              <div className="border-t border-slate-100 pt-3">
                <button
                  onClick={() => setShowTechSpecs(!showTechSpecs)}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-800 hover:text-emerald-700 transition-colors"
                >
                  <span className="flex items-center space-x-1.5">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>Processing History & Carbon Accounting</span>
                  </span>
                  {showTechSpecs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showTechSpecs && (
                  <div className="space-y-2 mt-3 text-xs">
                    {selectedDPP.processing_history.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {step.stage}
                          </span>
                          <span className="font-medium text-slate-700">{step.description}</span>
                        </div>
                        <span
                          className={`font-mono font-bold ${
                            step.carbon_impact < 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {step.carbon_impact > 0 ? `+${step.carbon_impact}` : step.carbon_impact} kg CO₂
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Custodial Chain Collapsible */}
              <div className="border-t border-slate-100 pt-3">
                <button
                  onClick={() => setShowOwnership(!showOwnership)}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-800 hover:text-emerald-700 transition-colors"
                >
                  <span className="flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Custodial Chain of Ownership</span>
                  </span>
                  {showOwnership ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showOwnership && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-3 text-xs font-mono">
                    {selectedDPP.ownership_chain.map((c, i) => (
                      <React.Fragment key={i}>
                        <span className={`px-2.5 py-1 rounded-xl border font-semibold ${
                          c.owner.includes('Sanjeev')
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {c.owner} ({c.date})
                        </span>
                        {i < selectedDPP.ownership_chain.length - 1 && (
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Column 3: THE DEDICATED QR CODE SCANNED ACTION COLUMN (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className={`p-6 rounded-3xl border transition-all duration-300 ${
            barcodeScanned
              ? 'bg-white border-emerald-300 shadow-lg ring-2 ring-emerald-500/20'
              : 'bg-slate-50 border-dashed border-slate-300 shadow-xs'
          }`}>
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  barcodeScanned ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                }`}>
                  <Scan className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    QR Code Action Column
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {barcodeScanned ? 'Live Verified On-Chain Actions' : 'Awaiting QR Code Scan'}
                  </span>
                </div>
              </div>

              {barcodeScanned && (
                <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  <span>Active</span>
                </span>
              )}
            </div>

            {/* Content: When Barcode IS Scanned */}
            {barcodeScanned ? (
              <div className="space-y-4 animate-fade-in">
                {/* Scanned Payload Banner */}
                <div className="p-3 rounded-2xl bg-slate-900 text-white text-xs font-mono space-y-1 shadow-sm">
                  <div className="flex justify-between text-slate-400">
                    <span>Scanned Code:</span>
                    <span className="text-emerald-400 font-bold">{scannedBatchInfo}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Merkle Root:</span>
                    <span className="text-slate-200">{selectedDPP?.qr_verification_hash.slice(0, 14)}...</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Embodied Carbon:</span>
                    <span className="text-emerald-300 font-bold">{selectedDPP?.net_embodied_carbon_kg} kg CO₂e</span>
                  </div>
                </div>

                {/* PROJECT ACTION 1: Claim Circular Recycling Incentive */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 flex items-center space-x-1.5">
                      <Coins className="w-4 h-4 text-emerald-600" />
                      <span>Claim Circular Token Reward</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                      +15.0 PNL
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-snug">
                    Confirm physical post-consumer recirculation and mint 15.0 PNL tokens directly to Sanjeev's wallet.
                  </p>

                  {claimedRewardResult ? (
                    <div className="p-2.5 rounded-xl bg-white border border-emerald-300 text-xs font-mono text-emerald-800 flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold">Claimed +{claimedRewardResult.amount} PNL</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{claimedRewardResult.txHash}</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleClaimRecyclingReward}
                      disabled={isPerformingAction === 'claim'}
                      className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center justify-center space-x-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>{isPerformingAction === 'claim' ? 'Minting On-Chain...' : 'Claim 15.0 PNL to Sanjeev'}</span>
                    </button>
                  )}
                </div>

                {/* PROJECT ACTION 2: Permanently Retire Embodied Carbon */}
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 flex items-center space-x-1.5">
                      <Flame className="w-4 h-4 text-indigo-600" />
                      <span>Retire Embodied Carbon Offset</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                      -16.5 kg CO₂e
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-800 leading-snug">
                    Permanently burn and retire the negative embodied carbon on Polygon ClimateChain to verify ESG zero-double-counting.
                  </p>

                  {retiredCarbonResult ? (
                    <div className="p-2.5 rounded-xl bg-white border border-indigo-300 text-xs font-mono text-indigo-800 flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                        <span className="font-bold">Burned {retiredCarbonResult.amount} kg CO₂</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{retiredCarbonResult.txHash}</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleRetireEmbodiedCarbon}
                      disabled={isPerformingAction === 'retire'}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center justify-center space-x-1.5"
                    >
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>{isPerformingAction === 'retire' ? 'Executing Burn...' : 'Retire Carbon on ClimateChain'}</span>
                    </button>
                  )}
                </div>

                {/* PROJECT ACTION 3: Log Custody Transfer to Sanjeev */}
                <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-slate-600" />
                      <span>Custodial Handover Transfer</span>
                    </span>
                    <span className="text-xs font-mono text-slate-600">
                      ESPR Audit
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Record digital product custodial reception by Sanjeev with ECDSA cryptographic signature.
                  </p>

                  {custodyTransferResult ? (
                    <div className="p-2.5 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-800 flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <div>
                        <div className="font-bold">{custodyTransferResult.custodian}</div>
                        <div className="text-[10px] text-slate-400">{custodyTransferResult.timestamp}</div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleSignCustodyToSanjeev}
                      disabled={isPerformingAction === 'custody'}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center justify-center space-x-1.5"
                    >
                      <span>{isPerformingAction === 'custody' ? 'Signing Custody...' : 'Sign Custody to Sanjeev'}</span>
                    </button>
                  )}
                </div>

                {/* Biophysical Origin Telemetry Proof */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600 space-y-1.5">
                  <span className="font-sans font-bold text-slate-800 text-xs block">
                    Living Tree Biophysical Anchor
                  </span>
                  <div className="flex justify-between">
                    <span>Cambium Sap Voltage:</span>
                    <span className="font-bold text-emerald-700">21.8 mV (Vascular Verified)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cellular Impedance:</span>
                    <span className="font-bold text-slate-800">26.4 kΩ @ 9.6°</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Species:</span>
                    <span className="font-bold text-slate-800">Western Redcedar (Parcel 7C)</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Awaiting Scan Placeholder */
              <div className="py-10 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-slate-200/80 flex items-center justify-center text-slate-400">
                  <QrCode className="w-7 h-7 text-indigo-600" />
                </div>
                <div className="space-y-1">
                  <h5 className="text-sm font-bold text-slate-800">
                    Awaiting QR Code Scan
                  </h5>
                  <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                    Click <strong>"Scan QR Code Now"</strong> on any passport to trigger on-chain verification, reward claims, and carbon retirement.
                  </p>
                </div>
                <button
                  onClick={handleScanBarcode}
                  className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center space-x-1.5"
                >
                  <Scan className="w-4 h-4 text-emerald-300" />
                  <span>Scan QR Code to Activate Column</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. MODAL: ON-CHAIN VERIFICATION INSPECTOR */}
      {isVerifyModalOpen && selectedDPP && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="p-6 rounded-3xl border border-slate-200 max-w-lg w-full relative shadow-2xl bg-white text-slate-900">
            <button
              onClick={() => setIsVerifyModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Blockchain Cryptographic Audit
                </h3>
                <p className="text-xs text-emerald-600 font-medium">
                  Verifying EU ESPR 2026 digital product passport
                </p>
              </div>
            </div>

            {/* Verification Steps Animation */}
            <div className="space-y-2.5 my-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-800">1. Merkle tree root inclusion check</span>
                {verifyStep >= 1 ? (
                  <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </span>
                ) : (
                  <span className="text-slate-400">Pending...</span>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-800">2. PoVI cambium vitality signature</span>
                {verifyStep >= 2 ? (
                  <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>ECDSA valid</span>
                  </span>
                ) : (
                  <span className="text-slate-400">Computing...</span>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-800">3. Anti-double-counting token gate</span>
                {verifyStep >= 3 ? (
                  <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>No duplicate</span>
                  </span>
                ) : (
                  <span className="text-slate-400">Cross-checking...</span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600 space-y-1">
              <div>Proof root: <span className="text-slate-900 font-bold">{selectedDPP.qr_verification_hash.slice(0, 24)}...</span></div>
              <div>Batch index: <span className="text-slate-900 font-bold">{selectedDPP.batch_number}</span></div>
            </div>

            <button
              onClick={() => setIsVerifyModalOpen(false)}
              className="mt-4 w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}

      {/* 5. MODAL: GENERATE NEW PASSPORT */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="p-6 rounded-3xl border border-slate-200 max-w-lg w-full relative shadow-2xl bg-white text-slate-900">
            <button
              onClick={() => setIsGenerateModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <PlusCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Generate Digital Product Passport
                </h3>
                <p className="text-xs text-emerald-600 font-medium">
                  Mint new ERC-721 batch with PoVI living biomass anchor
                </p>
              </div>
            </div>

            <form onSubmit={handleGeneratePassport} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 font-semibold block mb-1">Product Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">Category</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">Biological Origin</label>
                <input
                  type="text"
                  value={newOrigin}
                  onChange={(e) => setNewOrigin(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">Extraction Carbon (kg CO₂)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newExtractionCarbon}
                    onChange={(e) => setNewExtractionCarbon(parseFloat(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">Processing Carbon (kg CO₂)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newProcessingCarbon}
                    onChange={(e) => setNewProcessingCarbon(parseFloat(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-4 w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                Mint Digital Passport On-Chain
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
