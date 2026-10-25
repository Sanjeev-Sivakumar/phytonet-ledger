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
OUTPUT_DIR = os.path.join(WORKSPACE, "demo_production2")
SLIDES_DIR = os.path.join(WORKSPACE, "slides")
PLANT_VIDEO = os.path.join(WORKSPACE, "plant.mp4")
OUTPUT_VIDEO = os.path.join(WORKSPACE, "video2.mp4")

os.makedirs(OUTPUT_DIR, exist_ok=True)

# --------------------------------------------------------------------------------------
# Concise, punchy narration script (Total duration: ~3.8 to 4.2 minutes, under 5 mins)
# --------------------------------------------------------------------------------------
SCRIPT_SEGMENTS = [
    {
        "id": "01_title",
        "type": "slide",
        "url": f"file:///{SLIDES_DIR.replace(os.sep, '/')}/title.html",
        "text": "Welcome to PhytoNet Ledger, an autonomous bio-digital trust network developed for the IEEE ClimateChain Global Hackathon. We interface directly with living plant vascular tissue to solve the oracle problem."
    },
    {
        "id": "02_problem",
        "type": "slide",
        "url": f"file:///{SLIDES_DIR.replace(os.sep, '/')}/problem.html",
        "text": "The status quo suffers from five major flaws: oracle disconnect from biology, 18-month audit delays, sensor spoofing, over 2.4 billion dollars in phantom offsets, and broken additionality."
    },
    {
        "id": "03_questions",
        "type": "slide",
        "url": f"file:///{SLIDES_DIR.replace(os.sep, '/')}/questions.html",
        "text": "Our mission answers four questions: Can we verify biological absorption in real time? Can we prevent spoofing? Can supply chains lock against double counting? And what if a sensor is cut?"
    },
    {
        "id": "04_architecture",
        "type": "slide",
        "url": f"file:///{SLIDES_DIR.replace(os.sep, '/')}/architecture.html",
        "text": "Our architecture links living cambium to edge bio-nodes, fed by AI and ML atmospheric flux oracles, anchored by Proof-of-Vascular-Integrity into immutable digital product passports."
    },
    {
        "id": "05_hardware_plant",
        "type": "hardware_insert",
        "text": "Here is our live physical bio-node in action. Microneedles embedded in living Aloe Vera tissue capture real cellular impedance and sap potentials with zero simulation."
    },
    {
        "id": "06_overview_page",
        "type": "webapp",
        "tab": "overview",
        "url": "http://localhost:3000/?tab=overview",
        "text": "On our primary dashboard, live phloem potentials stream alongside 13.47 kilo-ohm cellular impedance. Below, our 30-day machine learning model forecasts verified carbon sequestration curves."
    },
    {
        "id": "07_emissions_page",
        "type": "webapp",
        "tab": "emissions",
        "url": "http://localhost:3000/?tab=emissions",
        "text": "In our emissions engine, real-time industrial smokestack outputs are continuously balanced against verified biological absorption, protected by strict anti-double-counting locks."
    },
    {
        "id": "08_supply_chain_page",
        "type": "webapp",
        "tab": "supplychain",
        "url": "http://localhost:3000/?tab=supplychain",
        "text": "In the supply chain module, digital product passports track biomass harvest and processing. Scanning cryptographic QR codes verifies custody and releases circular recycling incentives."
    },
    {
        "id": "09_trading_page",
        "type": "webapp",
        "tab": "trading",
        "url": "http://localhost:3000/?tab=trading",
        "text": "In carbon trading, verified ecological absorption is dynamically priced. Automated market maker liquidity pools settle green credits cleanly without intermediary markups."
    },
    {
        "id": "10_terminal_blockchain",
        "type": "webapp",
        "tab": "terminal",
        "url": "http://localhost:3000/?tab=terminal",
        "text": "The hardware terminal streams low-level ESP32 UART diagnostics, oversampling living ion flux to generate unforgeable biological entropy nonces."
    },
    {
        "id": "11_cmd_blockchain",
        "type": "slide",
        "url": f"file:///{SLIDES_DIR.replace(os.sep, '/')}/cmd_terminal.html",
        "text": "Inspecting the blockchain evidence in command line: querying the decentralized ledger returns only the deterministic SHA-256 state hash, proving unforgeable physical auditability."
    },
    {
        "id": "12_evidence_page",
        "type": "webapp",
        "tab": "evidence",
        "url": "http://localhost:3000/?tab=evidence",
        "text": "In the security and evidence tab, we audit biophysical wire severance pathology. When a probe is detached, impedance collapses, smart contract slashes stakes, and emergency SMTP alerts dispatch immediately."
    },
    {
        "id": "13_innovation_slide",
        "type": "slide",
        "url": f"file:///{SLIDES_DIR.replace(os.sep, '/')}/innovation_comparison.html",
        "text": "Comparing innovation: unlike paper reports, PhytoNet Ledger provides sub-second cellular impedance, biological entropy, deterministic anti-double counting, and automated slashing."
    },
    {
        "id": "14_scalability_slide",
        "type": "slide",
        "url": f"file:///{SLIDES_DIR.replace(os.sep, '/')}/scalability_forests.html",
        "text": "For forest-scale scalability, sentinel trees anchor cryptographic ground truth. Solar canopy mesh and satellite cross-validation achieve 99.4 percent cost reduction at 45 dollars per node."
    },
    {
        "id": "15_tamper_slide",
        "type": "slide",
        "url": f"file:///{SLIDES_DIR.replace(os.sep, '/')}/tamper_alert.html",
        "text": "Upon physical severance, our slasher burns validator stakes and dispatches verified incident logs directly via authenticated Google SMTP protocols."
    },
    {
        "id": "16_conclusion_slide",
        "type": "slide",
        "url": f"file:///{SLIDES_DIR.replace(os.sep, '/')}/conclusion.html",
        "text": "By anchoring trust directly inside living biology, PhytoNet Ledger guarantees reality, eliminates spoofing, and prevents double counting. PhytoNet Ledger: The Living Trust Network. Thank you."
    }
]

async def synthesize_audio():
    print("[1/4] Synthesizing crisp audio with edge-tts (en-US-JennyNeural)...")
    for idx, seg in enumerate(SCRIPT_SEGMENTS):
        mp3_path = os.path.join(OUTPUT_DIR, f"{seg['id']}.mp3")
        if not os.path.exists(mp3_path):
            comm = edge_tts.Communicate(seg['text'], "en-US-JennyNeural")
            await comm.save(mp3_path)
        
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
        print(f"   [{idx+1}/{len(SCRIPT_SEGMENTS)}] {seg['id']}: {dur:.2f}s")
    
    total_sec = sum(s['duration'] for s in SCRIPT_SEGMENTS)
    print(f"\n>> Total Narration Duration: {total_sec:.2f}s ({total_sec/60:.2f} mins) [UNDER 5 MIN TARGET]<<\n")

def prepare_hardware_clip():
    print("[2/4] Scaling physical plant video (plant.mp4)...")
    hw_seg = next(s for s in SCRIPT_SEGMENTS if s['type'] == 'hardware_insert')
    target_duration = hw_seg['duration']
    out_hw_mp4 = os.path.join(OUTPUT_DIR, "05_hardware_plant_clip.mp4")

    cmd = [
        "ffmpeg", "-y", "-i", PLANT_VIDEO,
        "-t", f"{target_duration:.3f}",
        "-vf", "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30",
        "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p",
        out_hw_mp4
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    hw_seg['clip_path'] = out_hw_mp4

async def record_screen_segments():
    print("[3/4] Recording browser segments with Playwright Chrome @ 1920x1080...")
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
            trimmed_mp4 = os.path.join(OUTPUT_DIR, f"{seg['id']}_clip.mp4")
            if os.path.exists(trimmed_mp4) and os.path.getsize(trimmed_mp4) > 10000:
                print(f"   [{idx+1}/{len(SCRIPT_SEGMENTS)}] Skipping already recorded {seg['id']}...")
                seg['clip_path'] = trimmed_mp4
                continue

            raw_dir = os.path.join(OUTPUT_DIR, f"raw_{seg['id']}")
            os.makedirs(raw_dir, exist_ok=True)

            print(f"   [{idx+1}/{len(SCRIPT_SEGMENTS)}] Recording {seg['id']} ({target_duration:.2f}s)...")
            context = await browser.new_context(
                viewport={"width": 1920, "height": 1080},
                record_video_dir=raw_dir,
                record_video_size={"width": 1920, "height": 1080}
            )
            page = await context.new_page()
            await page.goto(seg['url'], wait_until="domcontentloaded", timeout=15000)

            # If webapp, explicitly click the tab to force view render
            if seg['type'] == 'webapp':
                tab_name = seg.get('tab')
                if tab_name:
                    btn = page.locator(f"#nav-tab-{tab_name}")
                    if await btn.count() > 0:
                        await btn.first.click()
                await page.wait_for_timeout(400)

            # Hold steady for segment duration
            await page.wait_for_timeout(int(target_duration * 1000))

            await page.close()
            await context.close()

            # Transcode webm to mp4
            files = [f for f in os.listdir(raw_dir) if f.endswith('.webm')]
            if files:
                raw_webm = os.path.join(raw_dir, files[0])
                trimmed_mp4 = os.path.join(OUTPUT_DIR, f"{seg['id']}_clip.mp4")
                cmd = [
                    "ffmpeg", "-y", "-i", raw_webm,
                    "-t", f"{target_duration:.3f}",
                    "-vf", "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30",
                    "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p",
                    trimmed_mp4
                ]
                subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                seg['clip_path'] = trimmed_mp4

        await browser.close()

def assemble_final_video():
    print("[4/4] Muxing clips into final video2.mp4...")
    video_list = os.path.join(OUTPUT_DIR, "video_list.txt")
    with open(video_list, "w", encoding="utf-8") as f:
        for seg in SCRIPT_SEGMENTS:
            f.write(f"file '{seg['clip_path'].replace(os.sep, '/')}'\n")

    audio_list = os.path.join(OUTPUT_DIR, "audio_list.txt")
    with open(audio_list, "w", encoding="utf-8") as f:
        for seg in SCRIPT_SEGMENTS:
            f.write(f"file '{seg['audio_path'].replace(os.sep, '/')}'\n")

    master_audio = os.path.join(OUTPUT_DIR, "narration.aac")
    cmd_aud = [
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", audio_list,
        "-c:a", "aac", "-b:a", "192k",
        master_audio
    ]
    subprocess.run(cmd_aud, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    cmd_mux = [
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0", "-i", video_list,
        "-i", master_audio,
        "-c:v", "copy",
        "-c:a", "aac", "-b:a", "192k",
        "-shortest",
        OUTPUT_VIDEO
    ]
    subprocess.run(cmd_mux, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"\n>> SUCCESS: {OUTPUT_VIDEO} generated successfully! <<\n")

async def main():
    await synthesize_audio()
    prepare_hardware_clip()
    await record_screen_segments()
    assemble_final_video()

if __name__ == "__main__":
    asyncio.run(main())
