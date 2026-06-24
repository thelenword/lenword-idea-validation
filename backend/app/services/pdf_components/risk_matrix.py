from reportlab.graphics.shapes import Drawing, Rect, Circle, Line, String
from reportlab.lib.colors import HexColor
from reportlab.lib import colors
from reportlab.platypus import Paragraph, Table, TableStyle
from reportlab.lib.styles import ParagraphStyle

def create_risk_matrix_drawing(assumptions) -> Drawing:
    size = 180
    pad = 25
    w = size - pad * 2
    h = size - pad * 2
    
    d = Drawing(size, size)
    
    quads = [
        (pad, pad, w/2, h/2, HexColor("#EAF3DE")),          # LOW 
        (pad + w/2, pad, w/2, h/2, HexColor("#FAEEDA")),    # WATCH 
        (pad, pad + h/2, w/2, h/2, HexColor("#F1EFE8")),    # MONITOR 
        (pad + w/2, pad + h/2, w/2, h/2, HexColor("#FCEBEB")) # CRITICAL 
    ]
    
    for qx, qy, qw, qh, qc in quads:
        d.add(Rect(qx, qy, qw, qh, fillColor=qc, strokeColor=None))
        
    d.add(Line(pad, pad, pad, pad + h, strokeColor=HexColor("#B4B2A9"), strokeWidth=1))
    d.add(Line(pad, pad, pad + w, pad, strokeColor=HexColor("#B4B2A9"), strokeWidth=1))
    
    d.add(Line(pad + w/2, pad, pad + w/2, pad + h, strokeColor=HexColor("#B4B2A9"), strokeWidth=1, strokeDashArray=[4,3]))
    d.add(Line(pad, pad + h/2, pad + w, pad + h/2, strokeColor=HexColor("#B4B2A9"), strokeWidth=1, strokeDashArray=[4,3]))
    
    d.add(String(pad + w/2, 6, "LIKELIHOOD \u2192", fontName="Helvetica-Bold", fontSize=6, fillColor=HexColor("#888780"), textAnchor="middle"))
    d.add(String(5, pad + h/2 - 2, "IMPACT \u2191", fontName="Helvetica-Bold", fontSize=6, fillColor=HexColor("#888780"), textAnchor="middle"))
    
    d.add(String(pad + w - 5, pad + h - 10, "CRITICAL", fontName="Helvetica-Bold", fontSize=5, fillColor=HexColor("#E24B4A"), textAnchor="end"))
    d.add(String(pad + w - 5, pad + 5, "WATCH", fontName="Helvetica-Bold", fontSize=5, fillColor=HexColor("#BA7517"), textAnchor="end"))
    d.add(String(pad + 5, pad + h - 10, "MONITOR", fontName="Helvetica-Bold", fontSize=5, fillColor=HexColor("#888780"), textAnchor="start"))
    d.add(String(pad + 5, pad + 5, "LOW", fontName="Helvetica-Bold", fontSize=5, fillColor=HexColor("#3B6D11"), textAnchor="start"))
    
    def to_x(l):
        return pad + ((l - 1) / 9.0) * w
    def to_y(im):
        return pad + ((im - 1) / 9.0) * h
        
    for a in assumptions:
        x = to_x(a.likelihood)
        y = to_y(a.impact)
        
        if a.quadrant == "CRITICAL":
            color = HexColor("#E24B4A")
        elif a.quadrant == "WATCH":
            color = HexColor("#BA7517")
        elif a.quadrant == "MONITOR":
            color = HexColor("#185FA5")
        else:
            color = HexColor("#639922")
            
        d.add(Circle(x, y, 6, fillColor=color, strokeColor=None))
        d.add(String(x, y - 2, str(a.id), fontName="Helvetica-Bold", fontSize=6, fillColor=colors.white, textAnchor="middle"))
        
    return d

def create_risk_matrix_section(assumptions, base_styles):
    body_style = base_styles["body_style"]
    label_style = base_styles["label_style"]
    
    drawing = create_risk_matrix_drawing(assumptions)
    
    assumptions_content = [Paragraph("CRITICAL ASSUMPTIONS", label_style)]
    for ass in assumptions:
        assumptions_content.append(
            Paragraph(
                f"<b>#{ass.id}</b>: {ass.assumption} (Impact: <b>{ass.impact}/10</b>, Risk: <b>{ass.quadrant}</b>)", 
                ParagraphStyle(f"Ass_{ass.id}", parent=body_style, fontSize=7.5, leading=10.5, spaceAfter=3)
            )
        )
        
    assumptions_table = Table([[drawing, assumptions_content]], colWidths=[190, 314])
    assumptions_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    
    return assumptions_table
