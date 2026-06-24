import math
from reportlab.graphics.shapes import Drawing, Circle, Line, Polygon, String, Rect
from reportlab.lib.colors import HexColor
from reportlab.lib import colors

def create_radar_chart(dimensions) -> Drawing:
    size = 160
    cx, cy = size / 2, size / 2
    r = 45
    n = len(dimensions)
    
    d = Drawing(size, size)
    if n < 3:
        return d
    
    def angle_for(i):
        return (math.pi * 2 * i) / n - math.pi / 2
        
    for gl in [2, 4, 6, 8, 10]:
        pts = []
        for i in range(n):
            a = angle_for(i)
            rv = (gl / 10.0) * r
            pts.extend([cx + rv * math.cos(a), cy + rv * math.sin(a)])
        d.add(Polygon(pts, strokeColor=HexColor("#D3D1C7"), strokeWidth=0.5, fillColor=None))
        
    for i in range(n):
        a = angle_for(i)
        x2 = cx + r * math.cos(a)
        y2 = cy + r * math.sin(a)
        d.add(Line(cx, cy, x2, y2, strokeColor=HexColor("#D3D1C7"), strokeWidth=0.5))
        
    data_pts = []
    for i, dim in enumerate(dimensions):
        a = angle_for(i)
        rv = (dim.score / 10.0) * r
        data_pts.extend([cx + rv * math.cos(a), cy + rv * math.sin(a)])
        
    data_fill = colors.Color(108/255.0, 62/255.0, 246/255.0, alpha=0.15)
    d.add(Polygon(data_pts, strokeColor=HexColor("#6C3EF6"), strokeWidth=2.0, fillColor=data_fill))
    
    for i, dim in enumerate(dimensions):
        a = angle_for(i)
        rv = (dim.score / 10.0) * r
        x = cx + rv * math.cos(a)
        y = cy + rv * math.sin(a)
        d.add(Circle(x, y, 2.5, fillColor=HexColor("#6C3EF6"), strokeColor=None))
        
        lr = r + 12
        lx = cx + lr * math.cos(a)
        ly = cy + lr * math.sin(a)
        
        if lx < cx - 5:
            anchor = "end"
        elif lx > cx + 5:
            anchor = "start"
        else:
            anchor = "middle"
            
        label_text = dim.label
        if len(label_text) > 16:
            label_text = label_text[:14] + ".."
            
        d.add(String(lx, ly - 3, label_text.upper(), fontName="Helvetica-Bold", fontSize=6.5, fillColor=HexColor("#5F5E5A"), textAnchor=anchor))
        
    return d

def create_dimension_bar_chart(dimensions) -> Drawing:
    width = 240
    height = 160
    d = Drawing(width, height)
    
    n = len(dimensions)
    if n == 0:
        return d
        
    bar_height = 8
    spacing = (height - 20) / n
    start_y = height - 20
    
    # Draw scale
    d.add(Line(80, start_y + 10, 80, 10, strokeColor=HexColor("#E2E8F0"), strokeWidth=1))
    
    for i, dim in enumerate(dimensions):
        y = start_y - i * spacing
        
        # Label
        label_text = dim.label
        if len(label_text) > 18:
            label_text = label_text[:16] + ".."
        d.add(String(75, y, label_text, fontName="Helvetica", fontSize=7, fillColor=HexColor("#4A5568"), textAnchor="end"))
        
        # Background bar
        d.add(Rect(80, y - 2, 140, bar_height, fillColor=HexColor("#F8F6FF"), strokeColor=None))
        
        # Value bar
        val_width = (dim.score / 10.0) * 140
        d.add(Rect(80, y - 2, val_width, bar_height, fillColor=HexColor("#6C3EF6"), strokeColor=None))
        
        # Score text
        d.add(String(80 + val_width + 5, y, f"{dim.score:.1f}", fontName="Helvetica-Bold", fontSize=7, fillColor=HexColor("#0D0B1E"), textAnchor="start"))
        
    return d
