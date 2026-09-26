import os

BACKGROUNDS = {
    "district_federal.svg": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#020617"/>
      <stop offset="50%" stop-color="#0a192f"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="gridGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#0284c7" stop-opacity="0.0"/>
    </linearGradient>
    <linearGradient id="monolithGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#091428"/>
      <stop offset="50%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#skyGrad)"/>
  <!-- Constellations & Space Particles -->
  <circle cx="200" cy="150" r="1.5" fill="#38bdf8" opacity="0.6"/>
  <circle cx="850" cy="90" r="2" fill="#e0f2fe" opacity="0.8"/>
  <circle cx="1400" cy="180" r="1.2" fill="#0ea5e9" opacity="0.5"/>
  <circle cx="1700" cy="120" r="2.5" fill="#bae6fd" opacity="0.7"/>
  <!-- Planet in sky -->
  <circle cx="1650" cy="220" r="120" fill="#0369a1" opacity="0.15"/>
  <circle cx="1650" cy="220" r="140" fill="none" stroke="#38bdf8" stroke-width="1" opacity="0.2"/>
  <!-- Skyline / Megastructures -->
  <polygon points="100,1080 180,450 320,420 400,1080" fill="url(#monolithGrad)" opacity="0.85"/>
  <polygon points="350,1080 480,300 620,280 750,1080" fill="url(#monolithGrad)" opacity="0.95"/>
  <polygon points="700,1080 880,180 1040,160 1220,1080" fill="#0b1329" opacity="0.98"/>
  <polygon points="1150,1080 1300,320 1440,300 1600,1080" fill="url(#monolithGrad)" opacity="0.9"/>
  <polygon points="1520,1080 1650,480 1780,460 1880,1080" fill="url(#monolithGrad)" opacity="0.8"/>
  <!-- Architectural Light Strips -->
  <line x1="960" y1="160" x2="960" y2="1080" stroke="#00f0ff" stroke-width="2" opacity="0.6"/>
  <line x1="550" y1="280" x2="550" y2="1080" stroke="#38bdf8" stroke-width="1.5" opacity="0.4"/>
  <line x1="1370" y1="300" x2="1370" y2="1080" stroke="#38bdf8" stroke-width="1.5" opacity="0.4"/>
  <!-- Ground Esplanade & Hologram Grid -->
  <polygon points="0,850 1920,850 1920,1080 0,1080" fill="#030712" opacity="0.8"/>
  <path d="M 0,850 L 960,1080 M 1920,850 L 960,1080 M 480,850 L 720,1080 M 1440,850 L 1200,1080" stroke="#0284c7" stroke-width="1" opacity="0.25"/>
  <line x1="0" y1="850" x2="1920" y2="850" stroke="#00f0ff" stroke-width="2" opacity="0.5"/>
</svg>''',

    "interior_economy.svg": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGradEco" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0f0c05"/>
      <stop offset="60%" stop-color="#1c160a"/>
      <stop offset="100%" stop-color="#080602"/>
    </linearGradient>
    <linearGradient id="goldBeam" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#d97706" stop-opacity="0.0"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bgGradEco)"/>
  <!-- Brutalist Columns -->
  <rect x="80" y="0" width="160" height="1080" fill="#141108" stroke="#d97706" stroke-opacity="0.2"/>
  <rect x="320" y="0" width="120" height="1080" fill="#19150b" stroke="#d97706" stroke-opacity="0.15"/>
  <rect x="1480" y="0" width="120" height="1080" fill="#19150b" stroke="#d97706" stroke-opacity="0.15"/>
  <rect x="1680" y="0" width="160" height="1080" fill="#141108" stroke="#d97706" stroke-opacity="0.2"/>
  <!-- Central Stock Market Hologram Chamber -->
  <ellipse cx="960" cy="540" rx="480" ry="240" fill="none" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="10 15" opacity="0.4"/>
  <ellipse cx="960" cy="540" rx="360" ry="180" fill="none" stroke="#f59e0b" stroke-width="1" opacity="0.3"/>
  <ellipse cx="960" cy="540" rx="200" ry="100" fill="none" stroke="#fbbf24" stroke-width="2" opacity="0.6"/>
  <!-- Gold Hologram Ray -->
  <polygon points="800,0 1120,0 1280,1080 640,1080" fill="url(#goldBeam)"/>
  <!-- Financial Data Tickers in Background -->
  <path d="M 500,420 L 700,380 L 850,450 L 1050,340 L 1250,390 L 1420,310" fill="none" stroke="#fbbf24" stroke-width="3" opacity="0.5"/>
  <line x1="0" y1="920" x2="1920" y2="920" stroke="#d97706" stroke-width="2" opacity="0.4"/>
</svg>''',

    "interior_defense.svg": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGradDef" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0f0505"/>
      <stop offset="50%" stop-color="#1f0909"/>
      <stop offset="100%" stop-color="#090202"/>
    </linearGradient>
    <radialGradient id="alertGlow" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#ef4444" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#991b1b" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bgGradDef)"/>
  <rect width="100%" height="100%" fill="url(#alertGlow)"/>
  <!-- Bunker Blast Shield Pillars -->
  <polygon points="0,0 280,0 180,1080 0,1080" fill="#140707" stroke="#ef4444" stroke-opacity="0.3"/>
  <polygon points="1920,0 1640,0 1740,1080 1920,1080" fill="#140707" stroke="#ef4444" stroke-opacity="0.3"/>
  <!-- Tactical Hexagonal War Grid -->
  <polygon points="960,260 1180,380 1180,620 960,740 740,620 740,380" fill="#1c0707" stroke="#ef4444" stroke-width="2" opacity="0.6"/>
  <circle cx="960" cy="500" r="160" fill="none" stroke="#f87171" stroke-width="1.5" stroke-dasharray="6 8" opacity="0.5"/>
  <line x1="740" y1="500" x2="1180" y2="500" stroke="#ef4444" stroke-width="1" opacity="0.4"/>
  <line x1="960" y1="260" x2="960" y2="740" stroke="#ef4444" stroke-width="1" opacity="0.4"/>
  <!-- Tactical Radar Rings -->
  <circle cx="960" cy="500" r="60" fill="#ef4444" opacity="0.1"/>
  <line x1="0" y1="920" x2="1920" y2="920" stroke="#ef4444" stroke-width="2" opacity="0.5"/>
</svg>''',

    "interior_science.svg": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGradSci" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#02141f"/>
      <stop offset="50%" stop-color="#05283b"/>
      <stop offset="100%" stop-color="#010c14"/>
    </linearGradient>
    <radialGradient id="fusionGlow" cx="50%" cy="50%" r="40%">
      <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.3"/>
      <stop offset="60%" stop-color="#06b6d4" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#02141f" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bgGradSci)"/>
  <circle cx="960" cy="500" r="380" fill="url(#fusionGlow)"/>
  <!-- Cleanroom Glass Dome Ribs -->
  <path d="M 300,1080 Q 960,100 1620,1080" fill="none" stroke="#22d3ee" stroke-width="2" opacity="0.4"/>
  <path d="M 480,1080 Q 960,250 1440,1080" fill="none" stroke="#06b6d4" stroke-width="1.5" opacity="0.3"/>
  <line x1="960" y1="180" x2="960" y2="1080" stroke="#22d3ee" stroke-width="1" opacity="0.3"/>
  <!-- Quantum Core Rings -->
  <circle cx="960" cy="500" r="140" fill="none" stroke="#67e8f9" stroke-width="2" stroke-dasharray="12 8" opacity="0.7"/>
  <circle cx="960" cy="500" r="70" fill="#0891b2" opacity="0.2"/>
  <line x1="0" y1="920" x2="1920" y2="920" stroke="#22d3ee" stroke-width="2" opacity="0.5"/>
</svg>''',

    "interior_culture.svg": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGradCult" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#14091f"/>
      <stop offset="50%" stop-color="#25103b"/>
      <stop offset="100%" stop-color="#0a0412"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bgGradCult)"/>
  <!-- Neo-Classical Ionic Space Columns -->
  <rect x="220" y="80" width="80" height="840" fill="#1c0c2e" stroke="#c084fc" stroke-opacity="0.3"/>
  <rect x="420" y="140" width="70" height="780" fill="#170926" stroke="#c084fc" stroke-opacity="0.2"/>
  <rect x="1430" y="140" width="70" height="780" fill="#170926" stroke="#c084fc" stroke-opacity="0.2"/>
  <rect x="1620" y="80" width="80" height="840" fill="#1c0c2e" stroke="#c084fc" stroke-opacity="0.3"/>
  <!-- Imperial Arch & Hologram Halo -->
  <path d="M 600,920 C 600,320 1320,320 1320,920" fill="none" stroke="#c084fc" stroke-width="2" opacity="0.5"/>
  <circle cx="960" cy="460" r="150" fill="none" stroke="#e879f9" stroke-width="1.5" stroke-dasharray="8 6" opacity="0.6"/>
  <line x1="0" y1="920" x2="1920" y2="920" stroke="#c084fc" stroke-width="2" opacity="0.5"/>
</svg>''',

    "interior_infra.svg": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGradInfra" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#04140e"/>
      <stop offset="50%" stop-color="#0a261c"/>
      <stop offset="100%" stop-color="#020d09"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bgGradInfra)"/>
  <!-- Megastructure Cargo Cranes & Trusses -->
  <line x1="120" y1="0" x2="480" y2="920" stroke="#10b981" stroke-width="2" opacity="0.3"/>
  <line x1="480" y1="0" x2="120" y2="920" stroke="#10b981" stroke-width="2" opacity="0.3"/>
  <line x1="1800" y1="0" x2="1440" y2="920" stroke="#10b981" stroke-width="2" opacity="0.3"/>
  <line x1="1440" y1="0" x2="1800" y2="920" stroke="#10b981" stroke-width="2" opacity="0.3"/>
  <!-- Space Logistics Rail -->
  <line x1="0" y1="420" x2="1920" y2="420" stroke="#34d399" stroke-width="3" opacity="0.4"/>
  <line x1="0" y1="450" x2="1920" y2="450" stroke="#059669" stroke-width="1.5" opacity="0.3"/>
  <circle cx="960" cy="435" r="30" fill="#10b981" opacity="0.3"/>
  <line x1="0" y1="920" x2="1920" y2="920" stroke="#10b981" stroke-width="2" opacity="0.5"/>
</svg>''',

    "interior_intel.svg": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGradIntel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#060814"/>
      <stop offset="50%" stop-color="#0c1126"/>
      <stop offset="100%" stop-color="#03040a"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bgGradIntel)"/>
  <!-- Encrypted Data Waterfall Stream -->
  <line x1="300" y1="0" x2="300" y2="920" stroke="#6366f1" stroke-width="1" stroke-dasharray="4 12" opacity="0.4"/>
  <line x1="500" y1="0" x2="500" y2="920" stroke="#818cf8" stroke-width="1.5" stroke-dasharray="8 8" opacity="0.3"/>
  <line x1="1420" y1="0" x2="1420" y2="920" stroke="#818cf8" stroke-width="1.5" stroke-dasharray="8 8" opacity="0.3"/>
  <line x1="1620" y1="0" x2="1620" y2="920" stroke="#6366f1" stroke-width="1" stroke-dasharray="4 12" opacity="0.4"/>
  <!-- Central Decryption Matrix -->
  <rect x="760" y="320" width="400" height="280" rx="12" fill="#0c102b" stroke="#6366f1" stroke-width="2" opacity="0.6"/>
  <circle cx="960" cy="460" r="80" fill="none" stroke="#a5b4fc" stroke-width="1.5" stroke-dasharray="6 6" opacity="0.6"/>
  <circle cx="960" cy="460" r="20" fill="#4f46e5" opacity="0.5"/>
  <line x1="0" y1="920" x2="1920" y2="920" stroke="#6366f1" stroke-width="2" opacity="0.5"/>
</svg>'''
}

out_dir = r"public\backgrounds\government"
os.makedirs(out_dir, exist_ok=True)
for filename, content in BACKGROUNDS.items():
    filepath = os.path.join(out_dir, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content.strip())
    print(f"Creado {filepath} ({len(content)} bytes)")
