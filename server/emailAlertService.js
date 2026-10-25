/**
 * PhytoNet Ledger (PNL) — Authenticated SMTP Alert Service
 * Dispatches real-time cryptographic security and physical wire severance alerts
 * IEEE ClimateChain Global Hackathon
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export class EmailAlertService {
  constructor() {
    this.emailAddress = process.env.EMAIL_ADDRESS || 'samplebot.reply@gmail.com';
    this.emailPassword = process.env.EMAIL_PASSWORD || 'hznvmalrvtwmpzgu';
    this.recipientEmail = process.env.ALERT_RECIPIENT || 'sanjeevkumaredu8@gmail.com';

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.emailAddress,
        pass: this.emailPassword
      }
    });

    this.alertHistory = [];
    this.lastDispatchedTime = 0;
    this.cooldownMs = 60000; // 1-minute cooldown between repeated automatic alerts

    console.log(`[SMTP Alert Service] Configured: ${this.emailAddress} -> ${this.recipientEmail}`);
  }

  /**
   * Send high-priority biophysical severance alert to recipient
   */
  async sendTamperAlert(data = {}) {
    const nodeId = data.nodeId || 'ALOE-01';
    const impedance = data.impedance_kohm || 99999.0;
    const phaseLag = data.phase_deg || 0.0;
    const blockNumber = data.blockNumber || 104892;
    const timestamp = new Date().toISOString();
    const gps = data.gps || '11.0102° N, 76.9701° E';

    const subject = `[CRITICAL SECURITY ALERT] PhytoNet Bio-Node #${nodeId} Biophysical Severance`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; background: #ffffff; border: 1.5px solid #DC2626; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(220, 38, 38, 0.15);">
        <div style="background: #DC2626; color: #ffffff; padding: 18px 24px; display: flex; align-items: center; justify-content: space-between;">
          <h2 style="margin: 0; font-size: 20px; letter-spacing: 0.02em;">PHYTONET LEDGER &bull; TAMPER DETECTED</h2>
          <span style="background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold;">LIVE DISPATCH</span>
        </div>
        
        <div style="padding: 24px;">
          <div style="background: #FFF1F2; border: 1px solid #FECDD3; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px;">
            <p style="margin: 0; color: #991B1B; font-size: 14.5px; font-weight: bold;">
              EXCLUSION EVENT: Living Cambium Vascular Circuit Severed
            </p>
            <p style="margin: 6px 0 0 0; color: #B91C1C; font-size: 13px;">
              Sub-second Cole-Cole spectroscopy detected open-circuit impedance spike. All pending minting operations have been atomically frozen and validator stake has been slashed.
            </p>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 13.5px; margin-bottom: 20px;">
            <tr style="border-bottom: 1px solid #E5E7EB;">
              <td style="padding: 10px 0; font-weight: bold; color: #4B5563;">Node Identifier:</td>
              <td style="padding: 10px 0; color: #111827; font-family: monospace;">#${nodeId} (Living Aloe Vera Probes)</td>
            </tr>
            <tr style="border-bottom: 1px solid #E5E7EB;">
              <td style="padding: 10px 0; font-weight: bold; color: #4B5563;">Cellular Impedance:</td>
              <td style="padding: 10px 0; color: #DC2626; font-family: monospace; font-weight: bold;">${impedance} k&Omega; (CRITICAL OPEN CIRCUIT)</td>
            </tr>
            <tr style="border-bottom: 1px solid #E5E7EB;">
              <td style="padding: 10px 0; font-weight: bold; color: #4B5563;">Reactive Phase Lag:</td>
              <td style="padding: 10px 0; color: #DC2626; font-family: monospace;">${phaseLag}&deg; (COLLAPSED TO 0.0&deg;)</td>
            </tr>
            <tr style="border-bottom: 1px solid #E5E7EB;">
              <td style="padding: 10px 0; font-weight: bold; color: #4B5563;">Ledger Action:</td>
              <td style="padding: 10px 0; color: #DC2626; font-weight: bold;">MINT_FROZEN &bull; 50.0 PNL SLASHED</td>
            </tr>
            <tr style="border-bottom: 1px solid #E5E7EB;">
              <td style="padding: 10px 0; font-weight: bold; color: #4B5563;">State Block Hash:</td>
              <td style="padding: 10px 0; color: #1F2937; font-family: monospace; font-size: 12px;">#${blockNumber} (0x7a3f...b891)</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-weight: bold; color: #4B5563;">GPS Anchor:</td>
              <td style="padding: 10px 0; color: #4B5563;">${gps}</td>
            </tr>
          </table>

          <div style="background: #F9FAFB; border-radius: 8px; padding: 12px 16px; font-size: 12px; color: #6B7280;">
            This automated emergency dispatch was sealed deterministically by the Proof-of-Vascular-Integrity Gateway for the IEEE ClimateChain Global Hackathon.
          </div>
        </div>

        <div style="background: #F3F4F6; padding: 12px 24px; text-align: center; font-size: 11.5px; color: #9CA3AF; border-top: 1px solid #E5E7EB;">
          Sender: ${this.emailAddress} &bull; Recipient: ${this.recipientEmail} &bull; PhytoNet Protocol 2026
        </div>
      </div>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: `"PhytoNet Security Gateway" <${this.emailAddress}>`,
        to: this.recipientEmail,
        subject,
        html,
        text: `CRITICAL SECURITY ALERT: PhytoNet Bio-Node #${nodeId} Biophysical Severance detected. Impedance spiked to ${impedance} kOhm. Block #${blockNumber}. Action: MINT_FROZEN.`
      });

      console.log(`[SMTP Alert] Alert email dispatched successfully! Message ID: ${info.messageId}`);

      const record = {
        messageId: info.messageId,
        nodeId,
        recipient: this.recipientEmail,
        timestamp,
        status: 'DISPATCHED',
        blockNumber
      };

      this.alertHistory.unshift(record);
      if (this.alertHistory.length > 20) this.alertHistory.pop();
      this.lastDispatchedTime = Date.now();

      return { success: true, messageId: info.messageId, record };
    } catch (err) {
      console.error('[SMTP Alert Error]:', err.message);
      return { success: false, error: err.message };
    }
  }

  getAlertHistory() {
    return this.alertHistory;
  }
}
