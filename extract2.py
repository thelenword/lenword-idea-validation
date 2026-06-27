import re

with open('src/routes/validate.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

def get_block_lines(start_regex):
    start_idx = -1
    for i, line in enumerate(lines):
        if re.search(start_regex, line):
            start_idx = i
            break
            
    if start_idx == -1: return []
    
    brace_count = 0
    started = False
    end_idx = start_idx
    
    for i in range(start_idx, len(lines)):
        line = lines[i]
        brace_count += line.count('{') - line.count('}')
        if '{' in line:
            started = True
            
        if started and brace_count == 0:
            end_idx = i
            break
            
    return lines[start_idx:end_idx+1]

vr = get_block_lines(r'export interface ValidationReport')
sg = get_block_lines(r'function ScoreGauge')
rc = get_block_lines(r'function RadarChart')
rm = get_block_lines(r'function RiskMatrix')
bt = get_block_lines(r'function BulletText')
rs = get_block_lines(r'export function ReportSection')
sc = get_block_lines(r'function SwotCard')
db = get_block_lines(r'function DimBar')

imports = """import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { AlertTriangle, Check, Brain, Download, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";\n\n"""

# Need to make sure components are exported
def ensure_export(lines):
    if not lines: return lines
    if lines[0].startswith('function '):
        lines[0] = 'export ' + lines[0]
    return lines

all_lines = [imports] + vr + ['\n\n'] + ensure_export(sg) + ['\n\n'] + ensure_export(rc) + ['\n\n'] + ensure_export(rm) + ['\n\n'] + ensure_export(bt) + ['\n\n'] + ensure_export(sc) + ['\n\n'] + ensure_export(db) + ['\n\n'] + ensure_export(rs)

with open('src/components/ReportSection.tsx', 'w', encoding='utf-8') as f:
    f.writelines(all_lines)

print('Done extracting to ReportSection.tsx!')
