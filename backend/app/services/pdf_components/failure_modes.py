from reportlab.platypus import Paragraph, Table, TableStyle
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors

def create_failure_modes_section(failure_modes, base_styles):
    body_style = base_styles["body_style"]
    label_style = base_styles["label_style"]
    
    fail_cards = []
    for f in failure_modes:
        fail_content = [
            Paragraph(f"<b>#{f.rank}: {f.title.upper()}</b>", label_style),
            Paragraph(f.description, body_style),
            Paragraph(
                f"<b>Risk Impact: {f.impact}/5</b>", 
                ParagraphStyle(f"FailImpact_{f.rank}", parent=body_style, fontSize=7.5, textColor=colors.HexColor("#E24B4A"))
            )
        ]
        fail_card = Table([[fail_content]], colWidths=[242])
        fail_card.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8F6FF")),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))
        fail_cards.append(fail_card)
        
    if not fail_cards:
        return Paragraph("No existential failure modes identified.", body_style)
        
    fail_grid_data = []
    for i in range(0, len(fail_cards), 2):
        if i + 1 < len(fail_cards):
            fail_grid_data.append([fail_cards[i], "", fail_cards[i+1]])
        else:
            fail_grid_data.append([fail_cards[i], "", ""])
            
    fail_grid_table = Table(fail_grid_data, colWidths=[242, 20, 242])
    fail_grid_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    
    return fail_grid_table
