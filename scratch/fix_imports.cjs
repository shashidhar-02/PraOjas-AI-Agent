const fs = require('fs');
const path = require('path');

const appTsx = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(appTsx, 'utf8');

const toExport = [
  'function Sparkline',
  'function RadialGauge',
  'function VitalsBadge',
  'function ThemeSwitcher',
  'interface DecisionLogEntry'
];

toExport.forEach(str => {
  content = content.replace(str, 'export ' + str);
});

fs.writeFileSync(appTsx, content);
console.log('App.tsx exports fixed');

// Fix LandingPage.tsx
const landingTsx = path.join(__dirname, '../src/pages/LandingPage.tsx');
let landingContent = fs.readFileSync(landingTsx, 'utf8');
landingContent = landingContent.replace('import React from', 'import React, { useState } from');
landingContent = landingContent.replace('} from "lucide-react";', 'ArrowRight } from "lucide-react";');
landingContent = landingContent.replace('} from "../App";', '} from "../App";\nimport { useTheme, ThemeSwitcher } from "../App";');
fs.writeFileSync(landingTsx, landingContent);
console.log('LandingPage fixed');

// Fix RosterView.tsx
const rosterTsx = path.join(__dirname, '../src/pages/RosterView.tsx');
let rosterContent = fs.readFileSync(rosterTsx, 'utf8');
rosterContent = rosterContent.replace('import { StatusPill, VitalsBadge, RadialGauge, Sparkline } from "../App";', 'import { StatusPill, VitalsBadge, RadialGauge, Sparkline, getVitalStatus, getInitials } from "../App";');
rosterContent = rosterContent.replace('} from "lucide-react";', 'TrendingUp, Filter } from "lucide-react";');
fs.writeFileSync(rosterTsx, rosterContent);
console.log('RosterView fixed');

// Fix PatientDashboard.tsx
const dashTsx = path.join(__dirname, '../src/pages/PatientDashboard.tsx');
let dashContent = fs.readFileSync(dashTsx, 'utf8');
dashContent = dashContent.replace('import { useTheme, StatusPill, RadialGauge, Sparkline, generateVitalsHistory, getInitials, getVitalStatus, formatTs } from "../App";', 'import { useTheme, StatusPill, RadialGauge, Sparkline, generateVitalsHistory, getInitials, getVitalStatus, formatTs, VitalsBadge, DecisionLogEntry } from "../App";');
dashContent = dashContent.replace('} from "lucide-react";', 'TestTube, Stethoscope, ClipboardList, Syringe, Bell, Clock } from "lucide-react";');
dashContent = `import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";\n` + dashContent;
fs.writeFileSync(dashTsx, dashContent);
console.log('PatientDashboard fixed');
