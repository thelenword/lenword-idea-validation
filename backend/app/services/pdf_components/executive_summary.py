from reportlab.platypus import Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors

def create_executive_summary(report, base_styles, gauge_drawing):
    story = []
    
    # Setup styles
    styles = base_styles["styles"]
    body_style = base_styles["body_style"]
    label_style = base_styles["label_style"]
    quote_style = base_styles["quote_style"]
    h2_style = base_styles["h2_style"]
    
    # 1. Title/Cover Block
    story.append(Spacer(1, 40))
    cover_title_style = ParagraphStyle("CoverTitle", parent=styles["Heading1"], fontSize=32, leading=38, textColor=colors.HexColor("#0D0B1E"), alignment=0, fontName="Helvetica-Bold")
    cover_sub_style = ParagraphStyle("CoverSub", parent=styles["Normal"], fontSize=11, leading=15, textColor=colors.HexColor("#6C3EF6"), fontName="Helvetica-Bold", spaceAfter=20)
    
    cover_data = [
        [Paragraph("LENWORD VALIDATE", cover_sub_style)],
        [Paragraph(f"{report.meta.idea_name}", cover_title_style)],
        [Spacer(1, 8)],
        [Paragraph("VENTURE VALIDATION & STRATEGIC ANALYSIS REPORT", ParagraphStyle("CoverSection", parent=styles["Normal"], fontSize=12, leading=16, textColor=colors.HexColor("#718096"), fontName="Helvetica-Bold"))],
        [Spacer(1, 24)],
        [Paragraph(f"<i>\" {report.meta.idea_one_liner} \"</i>", quote_style)],
        [Spacer(1, 20)],
        [Paragraph(f"Generated for the founder on {report.meta.submitted_at[:10]}", label_style)]
    ]
    
    cover_table = Table([[cover_data]], colWidths=[504])
    cover_table.setStyle(TableStyle([
        ('LINELEFT', (0,0), (-1,-1), 4, colors.HexColor("#6C3EF6")),
        ('LEFTPADDING', (0,0), (-1,-1), 24),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    
    story.append(cover_table)
    story.append(Spacer(1, 20))
    
    # 2. Executive Narrative
    story.append(Paragraph("1.0 ONE LINE SUMMARY", h2_style))
    story.append(Paragraph(report.meta.idea_one_liner, body_style))
    story.append(Spacer(1, 20))
    
    # 3. Overall Score Card
    score_style = ParagraphStyle("Score", parent=body_style, leading=34, spaceBefore=4, spaceAfter=8)
    overall_score_details = [
        [Paragraph("OVERALL SCORE", label_style)],
        [Paragraph(f"<font size=26 color='#6C3EF6'><b>{report.scorecard.overall_score:.1f}</b></font><font size=14 color='#718096'> / 10</font>", score_style)],
        [Paragraph(f"VERDICT: <b>{report.scorecard.verdict}</b>", body_style)]
    ]
    if getattr(report.scorecard, "fatal_flaw", None):
        overall_score_details.append([Spacer(1, 5)])
        overall_score_details.append([Paragraph(f"<b>FATAL FLAW:</b> <font color='#E24B4A'>{report.scorecard.fatal_flaw}</font>", body_style)])

    details_table = Table(overall_score_details, colWidths=[200])
    details_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    
    card_data = [[details_table, gauge_drawing]]
    card_table = Table(card_data, colWidths=[310, 154])
    card_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8F6FF")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (1,0), (1,0), 'RIGHT'),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#6C3EF6")),
        ('TOPPADDING', (0,0), (-1,-1), 12),
        ('BOTTOMPADDING', (0,0), (-1,-1), 12),
        ('LEFTPADDING', (0,0), (-1,-1), 20),
        ('RIGHTPADDING', (0,0), (-1,-1), 20),
    ]))
    story.append(card_table)
    story.append(Spacer(1, 20))
    
    return story
