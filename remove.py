import re

with open('src/routes/validate.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

def get_block_lines(start_regex):
    start_idx = -1
    for i, line in enumerate(lines):
        if re.search(start_regex, line):
            start_idx = i
            break
            
    if start_idx == -1: return None
    
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
            
    return (start_idx, end_idx)

# Find all blocks to remove
blocks = []
components = [
    r'export interface ValidationReport',
    r'function ScoreGauge',
    r'function RadarChart',
    r'function RiskMatrix',
    r'function BulletText',
    r'export function ReportSection',
    r'function SwotCard',
    r'function DimBar'
]

for comp in components:
    res = get_block_lines(comp)
    if res:
        blocks.append(res)

# Sort blocks by start_idx descending so we can delete from bottom up
blocks.sort(key=lambda x: x[0], reverse=True)

for start, end in blocks:
    del lines[start:end+1]

# Add import at the top (after other imports)
import_stmt = 'import { ReportSection, ValidationReport } from "@/components/ReportSection";\n'
# find last import
last_import = 0
for i, line in enumerate(lines):
    if line.startswith('import '):
        last_import = i

lines.insert(last_import + 1, import_stmt)

with open('src/routes/validate.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('Done removing from validate.tsx!')
