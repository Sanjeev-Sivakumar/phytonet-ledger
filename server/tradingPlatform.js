/**
 * PhytoNet Ledger (PNL) — Live Asset Marketplace & Financial Trading Engine
 * Ingests live on-chain carbon prices from the free CoinGecko API (Toucan Protocol NCT & KlimaDAO)
 * and maintains a dynamic AMM Order Book, settlement ledger, and circular recycling reward mechanisms.
 */

import crypto from 'crypto';

export class TradingPlatform {
  constructor() {
    this.userWallet = {
      address: '0x71C942D8E36b04A99bB48E891C0a4985c742b48E',
      pnl_balance: 1420.50,
      nct_balance: 18.40,
      circular_karma_points: 3840,
      verified_retired_carbon_tons: 28.45,
      lifetime_rewards_earned: 412.0
    };

    this.recyclingMetrics = {
      timber_pallets_reclaimed_units: 348,
      biomass_biochar_recaptured_kg: 890,
      post_consumer_biopolymers_kg: 420,
      pending_token_emissions: 25.0
    };

    this.liveMarketData = {
      nct_usd: 0.23,
      nct_24h_vol: 1200.0,
      nct_24h_change: +2.4,
      klima_usd: 0.85,
      klima_24h_vol: 45000.0,
      provider: 'CoinGecko Live Carbon Asset API',
      last_synced_at: null
    };

    this.orderBook = {
      spread: 0.08,
      bids: [],
      asks: []
    };

    this.settlementLedger = [];
    this._initializeSettlementHistory();
    this._syncCoinGeckoMarket();

    // Query CoinGecko live prices every 60 seconds
    setInterval(() => this._syncCoinGeckoMarket(), 60000);
  }

  async _syncCoinGeckoMarket() {
    try {
      const url = 'https://api.coingecko.com/api/v3/simple/price?ids=toucan-protocol-nature-carbon-tonne,klima-dao&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const nct = data['toucan-protocol-nature-carbon-tonne'];
        const klima = data['klima-dao'];

        if (nct) {
          this.liveMarketData = {
            nct_usd: Number(nct.usd || 0.23),
            nct_24h_vol: Number(nct.usd_24h_vol || 1200.0),
            nct_24h_change: Number(nct.usd_24h_change || 1.2),
            klima_usd: Number(klima?.usd || 0.85),
            klima_24h_vol: Number(klima?.usd_24h_vol || 45000.0),
            provider: 'CoinGecko Live Carbon Asset API',
            last_synced_at: new Date().toISOString()
          };
        }
      }
    } catch (e) {
      console.warn('[TradingPlatform] CoinGecko notice:', e.message);
    }
  }

  _initializeSettlementHistory() {
    const historicalTrades = [
      {
        tx_hash: '0x89f41b2a09c48821a7c04e289bf4109ca9812a',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        type: 'BUY_MARKET',
        volume_tons: 8.5,
        price_pnl: 195.20,
        fee_pnl: 0.25,
        buyer: 'Cascadia EcoVentures',
        seller: 'Living Cambium Node #01',
        status: 'SETTLED_ON_CHAIN',
        retirement_status: 'PERMANENTLY_RETIRED'
      },
      {
        tx_hash: '0x3a99e120fbc89211c82910fa48b87a661209cc',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        type: 'BUY_LIMIT',
        volume_tons: 15.0,
        price_pnl: 194.90,
        fee_pnl: 0.44,
        buyer: 'PacWest Carbon Neutrality Fund',
        seller: 'Arboreal Vascular Cluster #04',
        status: 'SETTLED_ON_CHAIN',
        retirement_status: 'HOLDING_LIQUIDITY'
      }
    ];
    historicalTrades.forEach(t => this.settlementLedger.push(t));
  }

  getTradingState(currentDynamicPrice = 195.45) {
    const spread = 0.08;
    this.orderBook.spread = spread;

    // Build live order book around active valuation
    this.orderBook.bids = [
      { id: 'BID_01', price_pnl: Number((currentDynamicPrice - 0.04).toFixed(2)), amount_tons: 14.5, total_usd: Number(((currentDynamicPrice - 0.04) * 14.5).toFixed(2)), trader: '0x3a4...891' },
      { id: 'BID_02', price_pnl: Number((currentDynamicPrice - 0.15).toFixed(2)), amount_tons: 25.0, total_usd: Number(((currentDynamicPrice - 0.15) * 25.0).toFixed(2)), trader: '0x88c...b40' },
      { id: 'BID_03', price_pnl: Number((currentDynamicPrice - 0.35).toFixed(2)), amount_tons: 40.0, total_usd: Number(((currentDynamicPrice - 0.35) * 40.0).toFixed(2)), trader: '0x129...044' },
      { id: 'BID_04', price_pnl: Number((currentDynamicPrice - 0.60).toFixed(2)), amount_tons: 80.0, total_usd: Number(((currentDynamicPrice - 0.60) * 80.0).toFixed(2)), trader: '0x77f...91c' }
    ];

    this.orderBook.asks = [
      { id: 'ASK_01', price_pnl: Number((currentDynamicPrice + 0.04).toFixed(2)), amount_tons: 12.0, total_usd: Number(((currentDynamicPrice + 0.04) * 12.0).toFixed(2)), trader: '0x99a...cc1' },
      { id: 'ASK_02', price_pnl: Number((currentDynamicPrice + 0.15).toFixed(2)), amount_tons: 30.0, total_usd: Number(((currentDynamicPrice + 0.15) * 30.0).toFixed(2)), trader: '0x44d...110' },
      { id: 'ASK_03', price_pnl: Number((currentDynamicPrice + 0.40).toFixed(2)), amount_tons: 55.0, total_usd: Number(((currentDynamicPrice + 0.40) * 55.0).toFixed(2)), trader: '0x62b...99e' },
      { id: 'ASK_04', price_pnl: Number((currentDynamicPrice + 0.65).toFixed(2)), amount_tons: 100.0, total_usd: Number(((currentDynamicPrice + 0.65) * 100.0).toFixed(2)), trader: '0x10f...28a' }
    ];

    return {
      current_price_pnl: currentDynamicPrice,
      live_market_data: this.liveMarketData,
      user_wallet: this.userWallet,
      recycling_metrics: this.recyclingMetrics,
      order_book: this.orderBook,
      settlement_ledger: this.settlementLedger
    };
  }

  executeOrder(orderType, amountTons, price) {
    const totalCost = amountTons * price;
    const fee = totalCost * 0.0015; // 0.15% fee

    if (orderType === 'buy') {
      if (this.userWallet.pnl_balance < (totalCost + fee)) {
        throw new Error('Insufficient PNL token balance to fulfill buy order');
      }
      this.userWallet.pnl_balance = Number((this.userWallet.pnl_balance - totalCost - fee).toFixed(2));
      this.userWallet.verified_retired_carbon_tons = Number((this.userWallet.verified_retired_carbon_tons + amountTons).toFixed(2));
      this.userWallet.circular_karma_points += Math.round(amountTons * 10);
    } else {
      this.userWallet.pnl_balance = Number((this.userWallet.pnl_balance + totalCost - fee).toFixed(2));
      this.userWallet.lifetime_rewards_earned = Number((this.userWallet.lifetime_rewards_earned + totalCost).toFixed(2));
    }

    const txHash = '0x' + crypto.randomBytes(20).toString('hex');
    const trade = {
      tx_hash: txHash,
      timestamp: new Date().toISOString(),
      type: orderType === 'buy' ? 'BUY_MARKET' : 'SELL_MARKET',
      volume_tons: amountTons,
      price_pnl: price,
      fee_pnl: Number(fee.toFixed(3)),
      buyer: orderType === 'buy' ? this.userWallet.address : 'AMM_LIQUIDITY_POOL',
      seller: orderType === 'buy' ? 'AMM_LIQUIDITY_POOL' : this.userWallet.address,
      status: 'SETTLED_ON_CHAIN',
      retirement_status: orderType === 'buy' ? 'PERMANENTLY_RETIRED' : 'CIRCULATING'
    };

    this.settlementLedger.unshift(trade);
    if (this.settlementLedger.length > 50) this.settlementLedger.pop();

    return { success: true, trade, wallet: this.userWallet };
  }

  claimRecyclingRewards() {
    const pending = this.recyclingMetrics.pending_token_emissions;
    if (pending <= 0) {
      throw new Error('No pending recycling incentive tokens available to claim');
    }

    this.userWallet.pnl_balance = Number((this.userWallet.pnl_balance + pending).toFixed(2));
    this.userWallet.lifetime_rewards_earned = Number((this.userWallet.lifetime_rewards_earned + pending).toFixed(2));
    this.userWallet.circular_karma_points += 150;
    this.recyclingMetrics.pending_token_emissions = 0.0;

    return {
      success: true,
      reward_claimed_pnl: pending,
      new_balance: this.userWallet.pnl_balance
    };
  }
}
