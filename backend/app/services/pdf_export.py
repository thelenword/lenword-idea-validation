from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfgen import canvas
from app.models.schemas import ValidationReport

from app.services.pdf_components.styles import get_base_styles
from app.services.pdf_components.executive_summary import create_executive_summary
from app.services.pdf_components.score_gauge import create_score_gauge
from app.services.pdf_components.charts import create_radar_chart, create_dimension_bar_chart
from app.services.pdf_components.dimension_cards import create_dimension_cards
from app.services.pdf_components.risk_matrix import create_risk_matrix_section
from app.services.pdf_components.failure_modes import create_failure_modes_section
from app.services.pdf_components.action_roadmap import create_action_roadmap_section
from app.services.pdf_components.report_section import (
    center_drawing, create_divider, create_callout_box, 
    create_swot_card, create_signature_block
)

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, startup_id=None, **kwargs):
        super().__init__(*args, **kwargs)
        self.startup_id = startup_id
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_decorations(self, page_count):
        if self._pageNumber == 1:
            return
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#6C3EF6"))
        self.drawString(54, 755, "LENWORD VALIDATE — EXPERT REPORT")
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#718096"))
        startup_id_str = self.startup_id if self.startup_id else "N/A"
        self.drawRightString(558, 755, f"Startup ID: {startup_id_str}")
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.75)
        self.line(54, 747, 558, 747)
        self.line(54, 45, 558, 45)
        self.setFont("Helvetica", 8)
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 32, page_text)
        self.restoreState()

def parse_bullet_points(text, style):
    from reportlab.platypus import Paragraph
    from reportlab.lib.styles import ParagraphStyle
    bullet_style = ParagraphStyle(
        "Bullet_" + style.name,
        parent=style,
        leftIndent=12,
        firstLineIndent=-12
    )
    flowables = []
    for line in text.split('\n'):
        line = line.strip()
        if not line: continue
        if line.startswith('-'):
            line = line[1:].strip()
            flowables.append(Paragraph(f"&bull; {line}", bullet_style))
        else:
            flowables.append(Paragraph(line, style))
    return flowables

def export_report_to_pdf(startup_name: str, report: ValidationReport) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=letter, 
        rightMargin=54, leftMargin=54, 
        topMargin=54, bottomMargin=54
    )
    
    base_styles = get_base_styles()
    styles = base_styles["styles"]
    body_style = base_styles["body_style"]
    label_style = base_styles["label_style"]
    h2_style = base_styles["h2_style"]
    
    story = []
    
    # 1. Executive Summary Page
    gauge = create_score_gauge(report.scorecard.overall_score)
    story.extend(create_executive_summary(report, base_styles, gauge))
    
    # 2. Dimensions & Analysis
    story.append(PageBreak())
    story.append(Paragraph("2.0 DIMENSIONAL ANALYSIS", h2_style))
    story.append(Paragraph("Breakdown of the 6 core validation dimensions.", body_style))
    story.append(Spacer(1, 10))
    
    radar = create_radar_chart(report.dimensions)
    bar_chart = create_dimension_bar_chart(report.dimensions)
    
    chart_table = Table([[radar, bar_chart]], colWidths=[200, 260])
    chart_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(chart_table)
    story.append(Spacer(1, 15))
    
    dim_cards_grid = create_dimension_cards(report.dimensions, base_styles)
    story.extend(dim_cards_grid)
    story.append(Spacer(1, 10))
    story.append(create_divider())
    story.append(Spacer(1, 15))
    
    # 3. Market & Problem Validation
    story.append(Paragraph("3.0 MARKET VALIDATION", h2_style))
    story.extend(parse_bullet_points(report.market_validation.analysis, body_style))
    story.append(Spacer(1, 10))
    story.append(create_callout_box("Recommended Experiments", report.market_validation.recommended_experiments, "#F8F6FF", "#E1D7FF", "#6C3EF6", styles))
    story.append(Spacer(1, 15))
    story.append(create_divider())
    story.append(Spacer(1, 15))
    
    story.append(Paragraph("4.0 SOLUTION FEASIBILITY", h2_style))
    story.extend(parse_bullet_points(report.solution_feasibility.analysis, body_style))
    story.append(Spacer(1, 10))
    
    build_path_lines = report.solution_feasibility.build_path.split('\n')
    story.append(create_callout_box(f"Technical Complexity: {report.solution_feasibility.technical_complexity}", build_path_lines, "#F1F5F9", "#CBD5E1", "#334155", styles))
    story.append(Spacer(1, 15))
    story.append(create_divider())
    story.append(Spacer(1, 15))
    
    # Competitive Landscape
    story.append(Paragraph("5.0 COMPETITIVE LANDSCAPE", h2_style))
    story.extend(parse_bullet_points(report.competitive_landscape.analysis, body_style))
    story.append(Spacer(1, 10))
    
    comp_data = [
        [Paragraph("COMPETITOR", label_style), Paragraph("THEIR ADVANTAGE", label_style), Paragraph("THEIR WEAKNESS", label_style)]
    ]
    for comp in report.competitive_landscape.competitors:
        comp_data.append([
            Paragraph(f"<b>{comp.name}</b>", body_style),
            Paragraph(comp.advantage, body_style),
            Paragraph(comp.weakness, body_style)
        ])
        
    comp_table = Table(comp_data, colWidths=[124, 190, 190])
    comp_table.setStyle(TableStyle([
        ('LINEBELOW', (0,0), (-1,0), 1, colors.HexColor("#E2E8F0")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(comp_table)
    story.append(Spacer(1, 15))
    story.append(create_divider())
    story.append(Spacer(1, 15))
    
    # 6. Risk Matrix & Assumptions
    story.append(Paragraph("6.0 RISK MATRIX", h2_style))
    story.append(Paragraph("Assumptions mapped by likelihood and impact.", body_style))
    story.append(Spacer(1, 10))
    
    story.append(create_risk_matrix_section(report.assumptions_risk_matrix, base_styles))
    story.append(Spacer(1, 15))
    story.append(create_divider())
    story.append(Spacer(1, 15))
    
    # 7. Failure Modes
    story.append(Paragraph("7.0 EXISTENTIAL FAILURE MODES", h2_style))
    story.append(create_failure_modes_section(report.failure_modes, base_styles))
    story.append(Spacer(1, 25))
    story.append(create_divider())
    story.append(Spacer(1, 25))
    
    # 8. SWOT
    story.append(Paragraph("8.0 SWOT ANALYSIS", h2_style))
    s_card = create_swot_card("Strengths", report.swot.strengths, "#EAF3DE", "#D1E7B4", "#3B6D11", styles)
    w_card = create_swot_card("Weaknesses", report.swot.weaknesses, "#FCEBEB", "#F8C1C1", "#E24B4A", styles)
    o_card = create_swot_card("Opportunities", report.swot.opportunities, "#FAEEDA", "#F7D8A7", "#BA7517", styles)
    t_card = create_swot_card("Threats", report.swot.threats, "#F8F6FF", "#E1D7FF", "#6C3EF6", styles)
    
    swot_grid = Table([[s_card, "", w_card], ["", "", ""], [o_card, "", t_card]], colWidths=[242, 20, 242], rowHeights=[None, 12, None])
    swot_grid.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP')]))
    story.append(swot_grid)
    story.append(Spacer(1, 25))
    story.append(create_divider())
    story.append(Spacer(1, 25))
    
    # 9. Roadmap
    story.extend(create_action_roadmap_section(report.product_roadmap, report.next_moves, base_styles))
    
    story.append(Spacer(1, 10))
    story.append(create_signature_block(styles))
    
    story.append(Spacer(1, 10))
    story.append(Paragraph("This report is generated by LENWORD Validate. Adapt and execute fast.", ParagraphStyle("FootText", parent=body_style, fontSize=7.5, leading=10, textColor=colors.HexColor("#718096"), alignment=1)))

    canvasmaker = lambda *args, **kwargs: NumberedCanvas(*args, startup_id=report.meta.id, **kwargs)
    doc.build(story, canvasmaker=canvasmaker)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
