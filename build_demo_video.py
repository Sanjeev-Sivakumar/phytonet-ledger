"""
PhytoNet Ledger — End-to-End 1080p Synchronized Demo Video & Subtitle Pipeline
Strict Audio-First Architecture:
1. Synthesize female US English narration (en-US-JennyNeural) via edge-tts.
2. Probe exact durations with ffprobe.
3. Record high-definition 1080p (1920x1080) browser sessions using Playwright with Chrome.
4. Scale and prepare live physical hardware footage (plant.mp4).
5. Concat video clips, mux high-fidelity audio, generate subtitle.srt, and produce subtitled master video.
Zero Emojis, Zero Gemini mentions, Pure IEEE ClimateChain standard.
"""

import os
import sys
import json
import asyncio
import subprocess
import time
import edge_tts
from playwright.async_api import async_playwright

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
WORKSPACE = r"D:\Projects\IEEE Climate"
OUTPUT_DIR = os.path.join(WORKSPACE, "demo_production")
SLIDES_DIR = os.path.join(WORKSPACE, "slides")
PLANT_VIDEO = os.path.join(WORKSPACE, "plant.mp4")

os.makedirs(OUTPUT_DIR, exist_ok=True)

# --------------------------------------------------------------------------------------
# 1. NARRATION SCRIPT SEGMENTS (Female US English: en-US-JennyNeural)
# --------------------------------------------------------------------------------------
SCRIPT_SEGMENTS = [
    {
        "id": "01_title",
        "type": "slide",
        "url": f"file:///{SLIDES_DIR.replace(os.sep, '/')}/title.html",
        "text": "Welcome to PhytoNet Ledger, an autonomous bio-digital infrastructure developed for the IEEE ClimateChain Global Hackathon. Today's carbon markets and sustainability frameworks suffer from a deep structural crisis known as the Oracle Problem. We built PhytoNet Ledger to eliminate this trust gap by interfacing directly with living plant vascular tissue, transforming natural electrophysiology into an unforgeable cryptographic authority."
    },
    {
        "id": "02_problem",
        "type": "slide",
        "url": f"file:///{SLIDES_DIR.replace(os.sep, '/')}/problem.html",
        "text": "Today's sustainability frameworks suffer from five fundamental structural failures. Point one: The Fundamental Oracle Disconnect, where carbon credits exist on centralized servers untethered from real-time plant biology. Point two: Eighteen to thirty-six month verification delays, leaving registries blind to tree mortality. Point three: Vulnerability to sensor spoofing, because conventional environmental loggers lack physical botanical proof. Point four: Over two point four billion dollars in phantom greenwashed offsets circulating globally. And point five: Broken additionality and double-counting across fragmented carbon registries."
    },
    {
        "id": "03_questions",
        "type": "slide",
        "url": f"file:///{SLIDES_DIR.replace(os.sep, '/')}/questions.html",
        "text": "To rebuild absolute trust, we must confront four critical structural questions that the current paradigm completely fails to answer. First: Is it real? Can we verify active biological carbon absorption in real time? Second: Is it authentic? How do we prevent adversarial actors from spoofing IoT telemetry? Third: What about double counting? Can supply chains validate digital product passports without human friction? And fourth: What if the sensor is cut? How do we safeguard markets if a device is physically unplugged or replaced?"
    },
    {
        "id": "04_architecture",
        "type": "slide",
        "url": f"file:///{SLIDES_DIR.replace(os.sep, '/')}/architecture.html",
        "text": "Our technical architecture flows seamlessly from biology to verifiable enterprise markets. First, microneedles interface with Living Cambium inside Aloe Vera leaf tissue. The Edge Bio-Node performs sixty-four-times oversampled TinyML signal processing. Directly above, our AI and ML Oracle injects live Open-Meteo microclimate and photosynthetic flux models. This feeds into our Proof-of-Vascular-Integrity Gateway, validating cellular impedance and phase lag. State Ledger anchors the cryptographic record with SHA-256 biological nonces and automated slashing. Finally, Enterprise Digital Product Passports allow third-party verifiers to audit carbon claims through open APIs with zero trust friction."
    },
    {
        "id": "05_hardware_plant",
        "type": "hardware_insert",
        "text": "Here is our live physical bio-node in action. Microneedles are inserted into living Aloe Vera leaf tissue, streaming sub-second cellular impedance directly into our software with zero simulation."
    },
    {
        "id": "06_overview_page",
        "type": "webapp",
        "url": "http://localhost:3000/",
        "text": "Entering our primary monitoring console, we observe real-time data streaming directly from our living plant bio-node. The interface displays phloem sap micro-potentials alongside continuous 13.47 kilo-ohm cellular impedance and a 7.5 degree reactive phase lag. Below, our machine learning non-linear regression model ingests live Open-Meteo micro-climate irradiance to project thirty-day carbon sequestration curves with empirical accuracy."
    },
    {
        "id": "07_emissions_page",
        "type": "webapp",
        "url": "http://localhost:3000/emissions",
        "text": "Navigating to our real-time emissions tracking interface, the platform matches continuous industrial factory outputs against the plant's live biological absorption rates to compute immediate net balances. To ensure absolute compliance, our decentralized smart contracts enforce strict anti-double-counting locks, rejecting any duplicate credit claim instantaneously."
    },
    {
        "id": "08_supply_chain_page",
        "type": "webapp",
        "url": "http://localhost:3000/supply-chain",
        "text": "In our sustainable supply chain module, we inspect fully integrated Digital Product Passports. Each batch record tracks raw timber harvest bounds, manufacturing custody handovers, and circular economy recycling validation. By scanning our dynamic cryptographic QR codes, downstream stakeholders can claim verified recycling rewards directly to their address."
    },
    {
        "id": "09_trading_page",
        "type": "webapp",
        "url": "http://localhost:3000/trading",
        "text": "Our decentralized carbon trading terminal tokenizes verified ecological absorption into dynamic assets. Pricing is tied directly to living cambium health and verified soil stability. Automated market-maker liquidity pools allow frictionless green bond settlements without centralized intermediary markups."
    },
    {
        "id": "10_terminal_blockchain",
        "type": "webapp",
        "url": "http://localhost:3000/terminal",
        "text": "Finally, we inspect the hardware terminal and cryptographic trust ledger. Every validation block is sealed with a unique biological nonce harvested from the chaotic ion flux of the living Aloe Vera. By querying the transaction block, the system returns the SHA-256 state hash, proving immutable blockchain storage and deterministic physical auditability."
    },
    {
        "id": "11_innovation_slide",
        "type": "slide",
        "url": f"file:///{SLIDES_DIR.replace(os.sep, '/')}/innovation_comparison.html",
        "text": "Comparing our solution against the legacy paradigm: where traditional frameworks rely on delayed satellite passes and corruptible paper reports, PhytoNet Ledger provides sub-second cellular impedance streaming, quantum biological entropy nonces, deterministic smart contract anti-double-counting, and automated slashing upon wire severance."
    },
    {
        "id": "12_scalability_slide",
        "type": "slide",
        "url": f"file:///{SLIDES_DIR.replace(os.sep, '/')}/scalability_forests.html",
        "text": "To address forest-scale scalability without probing every single tree, PhytoNet deploys the Sentinel Cluster Model. One to three mature sentinel trees act as cryptographic ground-truth anchors for thousands of hectares. Solar canopy mesh nodes capture micro-climate variance, while satellite cross-validation achieves 99.4 percent cost reduction at less than 45 dollars per bio-node."
    },
    {
        "id": "13_tamper_slide",
        "type": "slide",
        "url": f"file:///{SLIDES_DIR.replace(os.sep, '/')}/tamper_alert.html",
        "text": "When physical tampering or probe pull-out occurs, cellular impedance immediately collapses. The Proof-of-Vascular-Integrity engine detects the exception in sub-seconds, freezing active minting, slashing on-chain stakes, and dispatching automated emergency alerts through authenticated SMTP protocols."
    },
    {
        "id": "14_conclusion_slide",
        "type": "slide",
        "url": f"file:///{SLIDES_DIR.replace(os.sep, '/')}/conclusion.html",
        "text": "By anchoring cryptographic trust directly inside physical biology, PhytoNet Ledger has cleanly answered all four foundational questions. It guarantees biological reality, eradicates database spoofing, locks against double-counting, and automatically defends itself when disconnected. PhytoNet Ledger: The Living Trust Network. Thank you."
    }
]

# --------------------------------------------------------------------------------------
# 2. AUDIO SYNTHESIS VIA EDGE-TTS
# --------------------------------------------------------------------------------------
async def synthesize_all_audio():
    print("[Audio Synthesis] Starting edge-tts synthesis with voice: en-US-JennyNeural...")
    for idx, seg in enumerate(SCRIPT_SEGMENTS):
        mp3_path = os.path.join(OUTPUT_DIR, f"{seg['id']}.mp3")
        if not os.path.exists(mp3_path) or os.path.getsize(mp3_path) < 1000:
            print(f"[{idx+1}/{len(SCRIPT_SEGMENTS)}] Generating: {seg['id']}...")
            comm = edge_tts.Communicate(seg['text'], "en-US-JennyNeural")
            await comm.save(mp3_path)
        else:
            print(f"[{idx+1}/{len(SCRIPT_SEGMENTS)}] Verified existing audio: {seg['id']}...")
        
        # Probe duration using ffprobe
        cmd = [
            "ffprobe", "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            mp3_path
        ]
        res = subprocess.run(cmd, capture_output=True, text=True, check=True)
        dur = float(res.stdout.strip())
        seg['audio_path'] = mp3_path
        seg['duration'] = dur
        print(f"   Duration: {dur:.2f} seconds")

# --------------------------------------------------------------------------------------
# 3. RECORD BROWSER SESSIONS VIA ASYNC PLAYWRIGHT CHROME AT 1080P
# --------------------------------------------------------------------------------------
async def record_browser_segments():
    print("\n[Screen Recording] Launching Playwright Chrome @ 1920x1080...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            executable_path=CHROME_PATH,
            headless=True,
            args=["--disable-web-security", "--allow-file-access-from-files"]
        )

        for idx, seg in enumerate(SCRIPT_SEGMENTS):
            if seg['type'] == 'hardware_insert':
                continue

            target_duration = seg['duration']
            rec_id = f"rec_{seg['id']}"
            raw_video_dir = os.path.join(OUTPUT_DIR, f"raw_{seg['id']}")
            os.makedirs(raw_video_dir, exist_ok=True)

            print(f"[{idx+1}/{len(SCRIPT_SEGMENTS)}] Recording {seg['id']} for {target_duration:.2f}s...")
            context = await browser.new_context(
                viewport={"width": 1920, "height": 1080},
                record_video_dir=raw_video_dir,
                record_video_size={"width": 1920, "height": 1080}
            )
            page = await context.new_page()

            # Load page
            await page.goto(seg['url'], wait_until="networkidle")
            await page.wait_for_timeout(400)

            # Synchronized section cues: exact seconds to transition, and exact scroll Y position
            # Holds completely steady on each section while spoken, zero random scrolling!
            WEBAPP_CUES = {
                "06_overview_page": [(0.0, 0), (17.85, 550)],
                "07_emissions_page": [(0.0, 0), (12.18, 500)],
                "08_supply_chain_page": [(0.0, 0), (14.91, 480)],
                "09_trading_page": [(0.0, 0), (12.34, 500)],
                "10_terminal_blockchain": [(0.0, 0), (12.61, 520)]
            }

            if seg['type'] == 'slide':
                # Hold slide steady for target duration so animations play synchronized with audio
                await page.wait_for_timeout(int(target_duration * 1000))
            elif seg['type'] == 'webapp':
                cues = WEBAPP_CUES.get(seg['id'], [(0.0, 0)])
                start_time = time.time()
                current_cue_idx = 0

                # Initially ensure page is at top section
                await page.evaluate("window.scrollTo({ top: 0, behavior: 'instant' });")

                while (time.time() - start_time) < target_duration:
                    elapsed = time.time() - start_time
                    # When narration reaches next section, smoothly scroll there and HOLD
                    if current_cue_idx + 1 < len(cues) and elapsed >= cues[current_cue_idx + 1][0]:
                        current_cue_idx += 1
                        target_y = cues[current_cue_idx][1]
                        print(f"   [Sync Scroll] {seg['id']} transitioning to section y={target_y} at {elapsed:.2f}s")
                        await page.evaluate(f"window.scrollTo({{ top: {target_y}, behavior: 'smooth' }});")
                    await asyncio.sleep(0.05)

            # Close page to flush video
            await page.close()
            await context.close()

            # Identify recorded webm file
            recorded_files = [f for f in os.listdir(raw_video_dir) if f.endswith('.webm')]
            if recorded_files:
                raw_webm = os.path.join(raw_video_dir, recorded_files[0])
                trimmed_mp4 = os.path.join(OUTPUT_DIR, f"{seg['id']}_clip.mp4")
                
                # Transcode and enforce exact duration and 30fps 1080p
                cmd = [
                    "ffmpeg", "-y", "-i", raw_webm,
                    "-t", f"{target_duration:.3f}",
                    "-vf", "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30",
                    "-c:v", "libx264", "-preset", "fast", "-crf", "18", "-pix_fmt", "yuv420p",
                    trimmed_mp4
                ]
                subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                seg['clip_path'] = trimmed_mp4
                print(f"   Saved video clip: {trimmed_mp4}")

        await browser.close()

# --------------------------------------------------------------------------------------
# 4. PREPARE LIVE HARDWARE CLIP (plant.mp4 with 1080p scaling & badge overlay)
# --------------------------------------------------------------------------------------
def prepare_hardware_clip():
    print("\n[Hardware Clip] Scaling plant.mp4 to 1080p 30fps...")
    hw_seg = next(s for s in SCRIPT_SEGMENTS if s['type'] == 'hardware_insert')
    target_duration = hw_seg['duration']

    out_hw_mp4 = os.path.join(OUTPUT_DIR, "05_hardware_plant_clip.mp4")
    vf_filter = "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30"

    cmd = [
        "ffmpeg", "-y", "-i", PLANT_VIDEO,
        "-t", f"{target_duration:.3f}",
        "-vf", vf_filter,
        "-c:v", "libx264", "-preset", "fast", "-crf", "18", "-pix_fmt", "yuv420p",
        out_hw_mp4
    ]
    subprocess.run(cmd, check=True)
    hw_seg['clip_path'] = out_hw_mp4
    print(f"   Hardware clip processed: {out_hw_mp4}")

# --------------------------------------------------------------------------------------
# 5. ASSEMBLE MASTER VIDEO, AUDIO MUX, AND SUBTITLES
# --------------------------------------------------------------------------------------
def assemble_final_master():
    print("\n[Master Assembly] Concatenating clips and muxing audio narration...")
    # 1. Write FFmpeg video concat list
    concat_list_path = os.path.join(OUTPUT_DIR, "video_concat.txt")
    with open(concat_list_path, "w", encoding="utf-8") as f:
        for seg in SCRIPT_SEGMENTS:
            clip = seg['clip_path'].replace("\\", "/")
            f.write(f"file '{clip}'\n")

    # 2. Write FFmpeg audio concat list
    audio_concat_path = os.path.join(OUTPUT_DIR, "audio_concat.txt")
    with open(audio_concat_path, "w", encoding="utf-8") as f:
        for seg in SCRIPT_SEGMENTS:
            aud = seg['audio_path'].replace("\\", "/")
            f.write(f"file '{aud}'\n")

    # 3. Concatenate all audio files into master narration
    master_audio_path = os.path.join(OUTPUT_DIR, "master_narration.aac")
    cmd_audio = [
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", audio_concat_path,
        "-c:a", "aac", "-b:a", "192k",
        master_audio_path
    ]
    subprocess.run(cmd_audio, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    # 4. Concatenate all video clips and mux with audio
    master_video_path = os.path.join(WORKSPACE, "master_demo_video.mp4")
    cmd_mux = [
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0", "-i", concat_list_path,
        "-i", master_audio_path,
        "-c:v", "copy",
        "-c:a", "aac", "-b:a", "192k",
        "-shortest",
        master_video_path
    ]
    subprocess.run(cmd_mux, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"Master demo video created: {master_video_path}")

    # 5. Generate Frame-Accurate Subtitle .srt
    srt_path = os.path.join(WORKSPACE, "subtitle.srt")
    print(f"[Subtitles] Generating frame-accurate subtitle: {srt_path}...")
    current_time_sec = 0.0

    def format_srt_time(sec):
        hrs = int(sec // 3600)
        mins = int((sec % 3600) // 60)
        secs = int(sec % 60)
        millis = int((sec - int(sec)) * 1000)
        return f"{hrs:02d}:{mins:02d}:{secs:02d},{millis:03d}"

    with open(srt_path, "w", encoding="utf-8") as srt_file:
        for idx, seg in enumerate(SCRIPT_SEGMENTS):
            start_str = format_srt_time(current_time_sec)
            end_sec = current_time_sec + seg['duration']
            end_str = format_srt_time(end_sec)
            srt_file.write(f"{idx + 1}\n")
            srt_file.write(f"{start_str} --> {end_str}\n")
            srt_file.write(f"{seg['text']}\n\n")
            current_time_sec = end_sec

    # 6. Skip burning master_demo_video_subtitled.mp4 per user request
    print("[Subtitles] Subtitled video skipped per user request. Only clean master_demo_video.mp4 generated.")

    # Print summary metrics
    total_dur = current_time_sec
    print("\n============================================================")
    print("PHYTONET LEDGER — DEMO VIDEO PRODUCTION COMPLETE")
    print(f"Total Duration: {total_dur:.2f} seconds ({total_dur/60:.2f} minutes)")
    print(f"Resolution: 1920x1080 Full-HD @ 30 FPS")
    print(f"Voiceover: Female US English (en-US-JennyNeural)")
    print(f"Master Video: {master_video_path}")
    print(f"Subtitled Master Video: {subtitled_video_path}")
    print(f"Subtitle File: {srt_path}")
    print("============================================================")

async def main():
    await synthesize_all_audio()
    prepare_hardware_clip()
    await record_browser_segments()
    assemble_final_master()

if __name__ == "__main__":
    asyncio.run(main())
