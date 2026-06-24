from reportlab.platypus import Paragraph, Table, TableStyle
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors

def create_dimension_cards(dimensions, base_styles):
    styles = base_styles["styles"]
    
    dim_cards = []
    for i, d in enumerate(dimensions):
        title_style = ParagraphStyle(
            f"DimTitle_{d.id}",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=10.5,
            leading=14,
            textColor=colors.HexColor("#0D0B1E")
        )
        
        score_color = "#6C3EF6"
        if d.score >= 7.5:
            score_color = "#3B6D11"
        elif d.score >= 6.0:
            score_color = "#BA7517"
        else:
            score_color = "#E24B4A"
            
        score_style = ParagraphStyle(
            f"DimScore_{d.id}",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=9,
            leading=11,
            textColor=colors.HexColor(score_color),
            alignment=2
        )
        

        
        body_style = ParagraphStyle(
            f"DimBody_{d.id}",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=12,
            textColor=colors.HexColor("#4A5568"),
            spaceBefore=4,
            spaceAfter=4
        )
        
        bullet_style = ParagraphStyle(
            f"DimBullet_{d.id}",
            parent=body_style,
            leftIndent=12,
            firstLineIndent=-12
        )
        
        fix_title_style = ParagraphStyle(
            f"DimFixTitle_{d.id}",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=6,
            leading=8,
            textColor=colors.HexColor("#2DD4BF"),
            spaceAfter=3
        )
        
        fix_style = ParagraphStyle(
            f"DimFix_{d.id}",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8,
            leading=11,
            textColor=colors.HexColor("#0D0B1E")
        )
        
        header_table = Table([[
            Paragraph(f"<font color='#E2E8F0'>{str(i+1).zfill(2)}</font>", ParagraphStyle("num", fontName="Helvetica-Bold", fontSize=18)),
            Paragraph(d.label, title_style), 
            Paragraph(f"{d.score:.1f}<font size='7' color='#718096'>/10</font>", score_style)
        ]], colWidths=[30, 390, 80])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('LEFTPADDING', (0,0), (-1,-1), 0),
            ('RIGHTPADDING', (0,0), (-1,-1), 0),
            ('TOPPADDING', (0,0), (-1,-1), 0),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ]))
        
        content = [header_table]
        
        for line in d.analysis.split('\n'):
            line = line.strip()
            if not line: continue
            if line.startswith('-'):
                line = line[1:].strip()
                content.append(Paragraph(f"&bull; {line}", bullet_style))
            else:
                content.append(Paragraph(line, body_style))
                
        # Recommendation block
        rec_content = [
            Paragraph("RECOMMENDATION", fix_title_style),
            Paragraph(d.fix, fix_style)
        ]
        rec_table = Table([[rec_content]], colWidths=[480])
        rec_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F0FDF4")),
            ('LINELEFT', (0,0), (0,0), 3, colors.HexColor("#2DD4BF")),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))
        
        from reportlab.platypus import Spacer
        content.append(Spacer(1, 8))
        content.append(rec_table)
        content.append(Spacer(1, 20))
        
        dim_cards.extend(content)
        
    return dim_cards
