from reportlab.graphics.shapes import Drawing, Circle, String, Wedge
from reportlab.lib.colors import HexColor

def create_score_gauge(score: float) -> Drawing:
    size = 120
    cx, cy = size / 2, size / 2
    r_outer = 50
    r_inner = 40
    
    d = Drawing(size, size)
    
    # Inactive base ring
    d.add(Circle(cx, cy, r_outer, fillColor=HexColor("#E8E4F8"), strokeColor=None))
    
    # Active wedge
    pct = min(max(score / 10.0, 0.0), 1.0)
    deg = pct * 360.0
    
    d.add(Wedge(cx, cy, r_outer, 90, 90 + deg, fillColor=HexColor("#6C3EF6"), strokeColor=None))
    
    # Inner masking circle matching the card's background color (#F8F6FF)
    d.add(Circle(cx, cy, r_inner, fillColor=HexColor("#F8F6FF"), strokeColor=None))
    
    # Text in center
    d.add(String(cx, cy - 5, f"{score:.1f}", fontName="Helvetica-Bold", fontSize=18, fillColor=HexColor("#0D0B1E"), textAnchor="middle"))
    d.add(String(cx, cy - 18, "/ 10", fontName="Helvetica", fontSize=8, fillColor=HexColor("#718096"), textAnchor="middle"))
    
    return d
