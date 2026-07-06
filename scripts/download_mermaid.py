import base64
import json
import urllib.request
import os

mermaid_code = """flowchart TD
    User([USER REQUEST <br/> Patient Data, Clinical Context]) --> Coord{COORDINATOR AGENT <br/> Main Router}
    
    %% Document Parsing Flow
    Coord --> Doc[DOCUMENT PARSING AGENT <br/> PDF/CSV/Text]
    Doc --> NLP[Clinical NLP <br/> Entity Extract]
    
    %% Prediction Flow with Memory
    Coord --> Pred[PREDICTION AGENT]
    Memory[(MEMORY AGENT <br/> Past & Upcoming Data)] -.->|Historical Context| Pred
    Pred --> GemS[Gemini <br/> Sepsis / Mortality]
    
    %% Interaction convergence (Prediction feeds into Knowledge)
    GemS --> Know[Medical Knowledge Agent]
    NLP --> Know
    
    %% Final output
    Know --> Rep[Clinical Report Agent]
    Rep --> Formatter[RESPONSE FORMATTING <br/> JSON Response]
    
    Formatter --> Dash([FRONTEND DASHBOARD <br/> Visualization])"""

# Create state object
state = {
    "code": mermaid_code,
    "mermaid": {"theme": "default"}
}

# Encode state to base64
json_str = json.dumps(state)
# Needs to be base64url encoded for mermaid.ink
b64 = base64.urlsafe_b64encode(json_str.encode('utf-8')).decode('utf-8').rstrip("=")

url = f"https://mermaid.ink/img/{b64}"

print(f"Downloading from: {url}")

req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as response:
    os.makedirs('assets', exist_ok=True)
    with open('assets/workflow.png', 'wb') as f:
        f.write(response.read())

print("Successfully saved to assets/workflow.png")
