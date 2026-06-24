from reportlab.platypus import Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors

def create_action_roadmap_section(product_roadmap, next_moves, base_styles):
    story = []
    body_style = base_styles["body_style"]
    label_style = base_styles["label_style"]
    h2_style = base_styles["h2_style"]
    
    story.append(Paragraph("9.0 ROADMAP & ACTION PLAN", h2_style))
    story.append(Paragraph(product_roadmap.strategic_direction, body_style))
    story.append(Spacer(1, 10))
    
    roadmap_cards = []
    for p in product_roadmap.phases:
        milestone_paragraphs = []
        for m in p.milestones:
            milestone_paragraphs.append(f"• {m}")
            
        phase_content = [
            Paragraph(f"<b>{p.phase.upper()} ({p.timeline})</b>", label_style),
            Paragraph("<br/>".join(milestone_paragraphs), body_style)
        ]
        
        phase_card = Table([[phase_content]], colWidths=[242])
        phase_card.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8F6FF")),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))
        roadmap_cards.append(phase_card)
        
    if roadmap_cards:
        roadmap_grid_data = []
        for i in range(0, len(roadmap_cards), 2):
            if i + 1 < len(roadmap_cards):
                roadmap_grid_data.append([roadmap_cards[i], "", roadmap_cards[i+1]])
            else:
                roadmap_grid_data.append([roadmap_cards[i], "", ""])
                
        roadmap_grid_table = Table(roadmap_grid_data, colWidths=[242, 20, 242])
        roadmap_grid_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('LEFTPADDING', (0,0), (-1,-1), 0),
            ('RIGHTPADDING', (0,0), (-1,-1), 0),
            ('TOPPADDING', (0,0), (-1,-1), 0),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(roadmap_grid_table)
    else:
        story.append(Paragraph("No roadmap phases defined.", body_style))
        
    story.append(Spacer(1, 15))
    
    # Immediate Action Plan
    story.append(Paragraph("IMMEDIATE ACTION PLAN", h2_style))
    for move in next_moves:
        move_content = [
            Paragraph(f"<b>ACTION #{move.id}: {move.title.upper()}</b>", label_style),
            Paragraph(f"<i>Target Timeline: {move.timeline}</i>", ParagraphStyle(f"MoveTime_{move.id}", parent=body_style, fontSize=7.5, leading=10, spaceAfter=2)),
            Paragraph(move.description, body_style)
        ]
        move_card = Table([[move_content]], colWidths=[504])
        move_card.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8F6FF")),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
            ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ]))
        story.append(move_card)
        story.append(Spacer(1, 8))
        
    return story
