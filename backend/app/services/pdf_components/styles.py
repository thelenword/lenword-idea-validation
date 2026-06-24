from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def get_base_styles():
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle("Title", parent=styles["Heading1"], fontSize=28, textColor=colors.HexColor("#0D0B1E"), spaceAfter=20, alignment=1)
    h2_style = ParagraphStyle("H2", parent=styles["Heading2"], fontSize=15, textColor=colors.HexColor("#6C3EF6"), spaceBefore=18, spaceAfter=10, borderPadding=10, keepWithNext=True)
    body_style = ParagraphStyle("Body", parent=styles["Normal"], fontSize=10, leading=15, textColor=colors.HexColor("#2D3748"), spaceAfter=10)
    label_style = ParagraphStyle("Label", parent=body_style, fontName="Helvetica-Bold", fontSize=8.5, textColor=colors.HexColor("#718096"), spaceAfter=4, keepWithNext=True)
    quote_style = ParagraphStyle("Quote", parent=body_style, fontName="Helvetica-Oblique", leftIndent=20, rightIndent=20, textColor=colors.HexColor("#4A5568"))

    return {
        "styles": styles,
        "title_style": title_style,
        "h2_style": h2_style,
        "body_style": body_style,
        "label_style": label_style,
        "quote_style": quote_style
    }
