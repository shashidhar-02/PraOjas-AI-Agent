import base64
import json
import urllib.request
import os
import xml.etree.ElementTree as ET

mermaid_code = """flowchart TD
    %% Global Styling
    classDef default fill:#ffffff,stroke:#e2e8f0,stroke-width:2px,color:#1e293b,font-family:Inter;
    
    classDef user fill:#eff6ff,stroke:#3b82f6,stroke-width:2px,color:#1e3a8a,font-size:14px,font-weight:bold,rx:8,ry:8;
    classDef coord fill:#f0fdf4,stroke:#22c55e,stroke-width:3px,color:#14532d,font-size:15px,font-weight:bold,rx:8,ry:8;
    classDef agent fill:#fff1f2,stroke:#f43f5e,stroke-width:2px,color:#881337,font-size:14px,font-weight:bold,rx:5,ry:5;
    classDef llm fill:#faf5ff,stroke:#a855f7,stroke-width:3px,color:#581c87,font-size:14px,font-weight:bold,stroke-dasharray: 4 4,rx:8,ry:8;
    classDef db fill:#fffbeb,stroke:#f59e0b,stroke-width:2px,color:#78350f,font-size:13px,font-weight:bold;
    classDef ui fill:#f8fafc,stroke:#64748b,stroke-width:2px,color:#0f172a,font-size:14px,font-weight:bold,rx:8,ry:8;

    %% Nodes (Simplified for easier understanding)
    User([👤 USER REQUEST]):::user
    Coord{🧠 COORDINATOR AGENT}:::coord
    
    Doc[📄 DOCUMENT PARSER]:::agent
    NLP[📝 CLINICAL NLP]:::agent
    
    Pred[⚡ PREDICTION AGENT]:::agent
    Memory[(💾 MEMORY AGENT)]:::db
    GemS[✨ GEMINI 1.5 PRO]:::llm
    
    Know[📚 MEDICAL KNOWLEDGE]:::agent
    Rep[📋 CLINICAL REPORT]:::agent
    
    Formatter[⚙️ RESPONSE FORMATTER]:::ui
    Dash([💻 FRONTEND DASHBOARD]):::ui

    %% Connections
    User ==>|Vitals & Docs| Coord
    
    Coord ==>|Parse| Doc
    Coord ==>|Analyze| Pred
    
    Doc -->|Extract Text| NLP
    
    Memory -.->|History| Pred
    Pred ==>|Risk Data| GemS
    
    GemS ==>|Risk Scoring| Know
    NLP -->|Entities| Know
    
    Know ==>|Treatment Plan| Rep
    Rep ==>|Summary| Formatter
    
    Formatter ==>|Update UI| Dash
"""

# Create state object
state = {
    "code": mermaid_code,
    "mermaid": {
        "theme": "base",
        "themeVariables": {
            "fontFamily": "Inter, Roboto, sans-serif",
            "primaryColor": "#ffffff",
            "edgeLabelBackground": "#ffffff",
            "tertiaryColor": "#f8fafc",
            "lineColor": "#64748b",
            "textColor": "#0f172a",
            "background": "#ffffff",
            "mainBkg": "#ffffff"
        }
    }
}

# Encode state to base64
json_str = json.dumps(state)
b64 = base64.urlsafe_b64encode(json_str.encode('utf-8')).decode('utf-8').rstrip("=")

# Download as SVG
url = f"https://mermaid.ink/svg/{b64}?bgColor=ffffff"

print(f"Downloading from: {url}")

req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as response:
    original_svg = response.read().decode('utf-8')

# We will parse the viewBox of the original SVG to find its exact Width and Height
import re
viewbox_match = re.search(r'viewBox="([\d\.\-\s]+)"', original_svg)
if not viewbox_match:
    print("Could not find viewBox")
    exit(1)

parts = viewbox_match.group(1).split()
orig_w = float(parts[2])
orig_h = float(parts[3])

# Calculate a wide rectangular aspect ratio (e.g. 16:9 or 2:1)
# The flow is TD, so orig_h is likely larger than orig_w.
# We want the final canvas to be a wide rectangle (width > height)
new_w = max(orig_w * 2, orig_h * 1.5) # Force width to be larger than height by 1.5x
new_h = orig_h + 100 # Add slight vertical padding

x_offset = (new_w - orig_w) / 2
y_offset = (new_h - orig_h) / 2

# Wrap the original SVG in a new wide rectangular SVG canvas!
wrapped_svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {new_w} {new_h}" width="100%" height="100%">
    <!-- White background for the wide rectangle -->
    <rect width="100%" height="100%" fill="#ffffff" />
    
    <!-- Centered original diagram -->
    <svg x="{x_offset}" y="{y_offset}" width="{orig_w}" height="{orig_h}">
        {original_svg}
    </svg>
</svg>'''

os.makedirs('assets', exist_ok=True)
with open('assets/workflow.svg', 'w', encoding='utf-8') as f:
    f.write(wrapped_svg)

print("Successfully saved wide rectangular SVG to assets/workflow.svg")
