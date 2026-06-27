import re

with open('src/routes/validate.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

def get_block(pattern):
    match = re.search(pattern, content, re.DOTALL)
    return match.group(0) if match else ''

validation_report = get_block(r'export interface ValidationReport \{.*?\n\}')

# Since braces are nested, regex is bad. Let's do a simple bracket-counting parser.
def extract_function(name):
    start = content.find(f'export function {name}')
    if start == -1: return ''
    
    # find first opening brace
    brace_idx = content.find('{', start)
    if brace_idx == -1: return ''
    
    count = 1
    idx = brace_idx + 1
    while count > 0 and idx < len(content):
        if content[idx] == '{':
            count += 1
        elif content[idx] == '}':
            count -= 1
        idx += 1
        
    return content[start:idx]

score_gauge = extract_function('ScoreGauge')
radar_chart = extract_function('RadarChart')
risk_matrix = extract_function('RiskMatrix')
bullet_text = extract_function('BulletText')
report_section = extract_function('ReportSection')
swot_card = extract_function('SwotCard')
dim_bar = extract_function('DimBar')

imports = """import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { AlertTriangle, Check, Brain, Download, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

"""

final_code = imports + validation_report + '\n\n' + score_gauge + '\n\n' + radar_chart + '\n\n' + risk_matrix + '\n\n' + bullet_text + '\n\n' + report_section + '\n\n' + swot_card + '\n\n' + dim_bar + '\n'

with open('src/components/ReportSection.tsx', 'w', encoding='utf-8') as f:
    f.write(final_code)

print("Extraction complete!")
