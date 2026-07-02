const fs = require('fs');
const path = require('path');

const APP_PATH = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(APP_PATH, 'utf-8');

// We will extract these components to src/pages/
const componentsToExtract = [
  'LandingPage',
  'RosterView',
  'PatientDashboard',
  'AIAnalysisView'
];

const IMAGES = {
  LandingPage: `import React from 'react';\nimport { motion, AnimatePresence } from "framer-motion";\nimport { BrainCircuit, FlaskConical, Activity, Check, HeartPulse, X, Mail, Phone, MapPin, ChevronRight, Zap, ShieldCheck } from "lucide-react";\n\n`,
  RosterView: `import React, { useState } from 'react';\nimport { motion, AnimatePresence } from "framer-motion";\nimport { ChevronRight, ArrowDown, ArrowUp, Activity, FlaskConical, Clock, HeartPulse, Stethoscope } from "lucide-react";\nimport { Patient, Theme } from "../App";\nimport { StatusPill, VitalsBadge, RadialGauge, Sparkline } from "../App";\n\n`,
  PatientDashboard: `import React, { useState } from 'react';\nimport { motion, AnimatePresence } from "framer-motion";\nimport { ChevronLeft, BrainCircuit, ArrowRight, Download, Activity, Droplets, Wind, Thermometer, FlaskConical, Pill, ChevronDown, CheckCircle2 } from "lucide-react";\nimport { Patient } from "../App";\nimport { useTheme, StatusPill, RadialGauge, Sparkline, generateVitalsHistory, getInitials, getVitalStatus, formatTs } from "../App";\nimport ManualEntryModal from "../components/ManualEntryModal";\n\n`,
  AIAnalysisView: `import React, { useState, useEffect } from 'react';\nimport { motion, AnimatePresence } from "framer-motion";\nimport { ChevronLeft, BrainCircuit, FileText, AlertTriangle, Check, Droplet, Thermometer, Wind, Zap, Activity, HeartPulse } from "lucide-react";\nimport { Patient } from "../App";\nimport { StatusPill, getInitials, extractDiagnoses, extractSymptoms, PredictionPanel, ExplainabilityPanel } from "../App";\n\n`
};

for (const comp of componentsToExtract) {
  // Simple regex to extract function components (assuming they are named functions and not nested too weirdly)
  // We'll use a balancing group equivalent by finding the start, and counting braces.
  const regex = new RegExp(`(export )?function ${comp}\\s*\\([^]*?\\)\\s*\\{`);
  const match = content.match(regex);
  if (match) {
    const startIndex = match.index;
    let braceCount = 0;
    let i = startIndex + match[0].length - 1; // pointing to the '{'
    
    // Safety check
    if (content[i] !== '{') {
      console.log('Failed to find opening brace for ' + comp);
      continue;
    }

    braceCount = 1;
    i++;
    while (braceCount > 0 && i < content.length) {
      if (content[i] === '{') braceCount++;
      if (content[i] === '}') braceCount--;
      i++;
    }
    
    const endIndex = i;
    let componentCode = content.substring(startIndex, endIndex);
    
    // Write to file
    const targetFile = path.join(__dirname, "../src/pages/" + comp + ".tsx");
    fs.writeFileSync(targetFile, IMAGES[comp] + componentCode.replace(/export function/g, 'export default function').replace(/^function /g, 'export default function '));
    console.log("Extracted " + comp);
    
    // Replace in App.tsx
    content = content.substring(0, startIndex) + `// Extracted ${comp}\n` + content.substring(endIndex);
  } else {
    console.log('Could not find ' + comp);
  }
}

// Add imports to App.tsx
const importStatements = componentsToExtract.map(comp => `import ${comp} from "./pages/${comp}";`).join('\n') + '\n';
// Find where to put it
const lastImportIndex = content.lastIndexOf('import ');
if (lastImportIndex !== -1) {
  const nextNewline = content.indexOf('\n', lastImportIndex);
  content = content.substring(0, nextNewline + 1) + importStatements + content.substring(nextNewline + 1);
}

// Also make sure Patient type and helpers are exported in App.tsx so pages can use them
content = content.replace(/interface Patient /g, 'export interface Patient ');
content = content.replace(/type Theme /g, 'export type Theme ');
content = content.replace(/function extractDiagnoses/g, 'export function extractDiagnoses');
content = content.replace(/function extractSymptoms/g, 'export function extractSymptoms');
content = content.replace(/function generateVitalsHistory/g, 'export function generateVitalsHistory');
content = content.replace(/function getInitials/g, 'export function getInitials');
content = content.replace(/function getVitalStatus/g, 'export function getVitalStatus');
content = content.replace(/function formatTs/g, 'export function formatTs');


fs.writeFileSync(APP_PATH, content);
console.log('Done refactoring.');
