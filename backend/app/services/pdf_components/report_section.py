from reportlab.graphics.shapes import Drawing, Line
from reportlab.lib.colors import HexColor
from reportlab.platypus import Table, TableStyle, Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors

def center_drawing(drawing) -> Table:
    t = Table([[drawing]], colWidths=[drawing.width])
    t.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    return t

def create_divider() -> Drawing:
    d = Drawing(504, 10)
    d.add(Line(0, 5, 504, 5, strokeColor=HexColor("#E2E8F0"), strokeWidth=1))
    return d

def create_callout_box(title: str, lines: list, background_color: str, border_color: str, title_color: str, styles) -> Table:
    title_style = ParagraphStyle(
        f"CallTitle_{title.replace(' ', '_')}",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=13,
        textColor=colors.HexColor(title_color),
        spaceAfter=6,
        keepWithNext=True
    )
    body_style = ParagraphStyle(
        f"CallBody_{title.replace(' ', '_')}",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=11.5,
        textColor=colors.HexColor("#4A5568"),
        spaceAfter=4
    )
    
    content = [Paragraph(title.upper(), title_style)]
    for line in lines:
        content.append(Paragraph(line, body_style))
        
    t = Table([[content]], colWidths=[504])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor(background_color)),
        ('BOX', (0,0), (-1,-1), 0.75, colors.HexColor(border_color)),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
    ]))
    return t

def create_signature_block(styles) -> Table:
    body_style = ParagraphStyle(
        "SigBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#4A5568")
    )
    title_style = ParagraphStyle(
        "SigTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#0D0B1E")
    )
    
    content = [
        Paragraph("VALIDATION COMMITMENT", title_style),
        Paragraph("By generating this report, the founders acknowledge that they must actively validate assumptions through experiments rather than building blindly.", body_style)
    ]
    t = Table([[content]], colWidths=[504])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8F6FF")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#D3D1C7")),
        ('TOPPADDING', (0,0), (-1,-1), 12),
        ('BOTTOMPADDING', (0,0), (-1,-1), 12),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
    ]))
    return t

def create_swot_card(title: str, items: list, bg_hex: str, border_hex: str, title_hex: str, styles) -> Table:
    title_style = ParagraphStyle(f"SWOTTitle_{title}", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=8.5, leading=11, textColor=colors.HexColor(title_hex), spaceAfter=6)
    body_style = ParagraphStyle(f"SWOTBody_{title}", parent=styles["Normal"], fontName="Helvetica", fontSize=7.5, leading=10, textColor=colors.HexColor("#2D3748"), spaceAfter=2)
    
    content = [Paragraph(title.upper(), title_style)]
    for item in items:
        content.append(Paragraph(f"• {item}", body_style))
        
    t = Table([[content]], colWidths=[242])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor(bg_hex)),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor(border_hex)),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'TOP')
    ]))
    return t
