from fastapi import APIRouter, HTTPException, Query, Response
from typing import Optional
from ..services.risk_engine import risk_engine
from ..services.change_detection import change_detection_service
from ..services.satellite_service import satellite_service

router = APIRouter(prefix="/reports")

@router.get("/export")
def export_report(
    region_id: str = Query("aravalli_ridge", description="Region identifier"),
    export_format: str = Query("csv", description="Export format: 'csv', 'html', or 'json'")
):
    region = satellite_service.get_region_by_id(region_id)
    if not region:
        raise HTTPException(status_code=404, detail="Region not found")

    assessment = risk_engine.analyze_region(region_id)
    changes = change_detection_service.detect_changes(region_id)

    if export_format.lower() == "csv":
        csv_rows = [
            "EcoGuard Environmental Intelligence Platform - Assessment Report",
            f"Region Name,{region['name']}",
            f"Region ID,{region['id']}",
            f"State / Country,{region['state']} / {region['country']}",
            f"Ecosystem Type,{region['ecosystem_type']}",
            f"Total Area (sq km),{region['area_sqkm']}",
            f"Observation Timestamp,{assessment.timestamp}",
            f"Overall Environmental Risk Score,{assessment.overall_risk_score}",
            f"Risk Level,{assessment.risk_level}",
            f"Confidence Score,{assessment.confidence_score}",
            f"Statistical Anomaly Detected,{assessment.anomaly_detected}",
            f"Anomaly Score,{assessment.anomaly_score}",
            f"Anomaly Method,{assessment.anomaly_method}",
            "",
            "FACTOR BREAKDOWN",
            "Factor Key,Factor Name,Raw Value,Normalized (0-1),Weight,Weighted Contribution,Unit,Interpretation"
        ]

        for f in assessment.factors:
            csv_rows.append(
                f"{f.factor_key},\"{f.name}\",{f.raw_value},{f.normalized_score},{f.weight},{f.weighted_contribution},\"{f.unit}\",\"{f.interpretation}\""
            )

        csv_rows.extend([
            "",
            "VEGETATION CHANGE DETECTION SUMMARY",
            f"Baseline Date,{changes.baseline_date}",
            f"Comparison Date,{changes.comparison_date}",
            f"Severe Decline Cells (%),{changes.severe_decline_pct}%",
            f"Moderate Decline Cells (%),{changes.moderate_decline_pct}%",
            f"Stable Cells (%),{changes.stable_pct}%",
            f"Regrowth Cells (%),{changes.significant_regrowth_pct}%",
            f"Net Canopy Shift (ha),{changes.net_vegetation_shift_ha} ha",
            f"Summary,\"{changes.summary}\"",
            "",
            "RECOMMENDED INTERVENTIONS",
        ])

        for idx, act in enumerate(assessment.recommended_actions, 1):
            csv_rows.append(f"{idx},\"{act}\"")

        content = "\n".join(csv_rows)
        return Response(
            content=content,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=ecoguard_report_{region_id}.csv"}
        )

    elif export_format.lower() == "html":
        # Formatted Executive Brief with print stylesheet
        factor_rows_html = "".join([
            f"""<tr>
                <td style="padding: 8px 12px; font-weight: 600; border-bottom: 1px solid #e2e8f0;">{f.name}</td>
                <td style="padding: 8px 12px; font-family: monospace; border-bottom: 1px solid #e2e8f0;">{f.raw_value} {f.unit}</td>
                <td style="padding: 8px 12px; font-family: monospace; border-bottom: 1px solid #e2e8f0;">{f.normalized_score:.3f}</td>
                <td style="padding: 8px 12px; font-family: monospace; border-bottom: 1px solid #e2e8f0;">{int(f.weight * 100)}%</td>
                <td style="padding: 8px 12px; font-family: monospace; font-weight: bold; color: #047857; border-bottom: 1px solid #e2e8f0;">{f.weighted_contribution:.1f} pts</td>
                <td style="padding: 8px 12px; font-size: 11px; color: #475569; border-bottom: 1px solid #e2e8f0;">{f.interpretation}</td>
            </tr>""" for f in assessment.factors
        ])

        recommendations_html = "".join([
            f"""<li style="margin-bottom: 6px; color: #1e293b;">{act}</li>"""
            for act in assessment.recommended_actions
        ])

        risk_color = "#dc2626" if assessment.risk_level == "Critical" else "#ea580c" if assessment.risk_level == "High" else "#d97706" if assessment.risk_level == "Moderate" else "#059669"
        risk_bg = "#fef2f2" if assessment.risk_level == "Critical" else "#fff7ed" if assessment.risk_level == "High" else "#fffbeb" if assessment.risk_level == "Moderate" else "#f0fdf4"

        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>EcoGuard Executive Environmental Brief - {region['name']}</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; color: #0f172a; margin: 0; padding: 40px; background: #f8fafc; }}
        .sheet {{ max-width: 860px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }}
        .header {{ display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; }}
        .badge {{ display: inline-block; padding: 4px 12px; font-weight: 700; border-radius: 9999px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }}
        .metric-box {{ background: #f1f5f9; padding: 16px; border-radius: 6px; margin-bottom: 20px; }}
        table {{ width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 12px; }}
        th {{ background: #f8fafc; text-align: left; padding: 8px 12px; font-size: 11px; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #cbd5e1; font-family: monospace; }}
        @media print {{
            body {{ background: #ffffff; padding: 0; }}
            .sheet {{ box-shadow: none; border: none; padding: 0; }}
            .no-print {{ display: none; }}
        }}
    </style>
</head>
<body>
    <div class="sheet">
        <div class="no-print" style="margin-bottom: 16px; text-align: right;">
            <button onclick="window.print()" style="padding: 8px 16px; background: #059669; color: white; border: none; border-radius: 4px; font-weight: 600; cursor: pointer;">Print / Save as PDF</button>
        </div>
        <div class="header">
            <div>
                <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #0f172a;">EcoGuard Environmental Intelligence Platform</h1>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Executive Environmental Audit & Risk Assessment Dossier</p>
            </div>
            <div style="text-align: right;">
                <span class="badge" style="background: {risk_bg}; color: {risk_color}; border: 1px solid {risk_color};">
                    {assessment.risk_level} Risk &bull; {assessment.overall_risk_score:.1f}/100
                </span>
                <div style="font-size: 11px; color: #64748b; margin-top: 4px; font-family: monospace;">Observed: {assessment.timestamp}</div>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px;">
                <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 600;">Landscape Sector</div>
                <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px;">{region['name']}</div>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px;">
                <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 600;">Ecosystem Biome</div>
                <div style="font-size: 12px; font-weight: 600; color: #0f172a; margin-top: 2px;">{region['ecosystem_type']}</div>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px;">
                <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 600;">Total Monitored Area</div>
                <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px;">{region['area_sqkm']} km²</div>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px;">
                <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 600;">Net Canopy Shift</div>
                <div style="font-size: 13px; font-weight: 700; color: {'#dc2626' if changes.net_vegetation_shift_ha < 0 else '#059669'}; margin-top: 2px;">
                    {changes.net_vegetation_shift_ha} ha
                </div>
            </div>
        </div>

        <div class="metric-box">
            <h3 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em;">Diagnostic Finding & Executive Synthesis</h3>
            <p style="margin: 0; font-size: 12px; color: #334155; line-height: 1.6;">{assessment.plain_english_summary}</p>
        </div>

        <h3 style="font-size: 13px; font-weight: 700; color: #0f172a; text-transform: uppercase; margin: 24px 0 8px 0; letter-spacing: 0.05em;">Quantitative Risk Indicator Ledger</h3>
        <table>
            <thead>
                <tr>
                    <th>Indicator Component</th>
                    <th>Observed Metric</th>
                    <th>Normalized (0-1)</th>
                    <th>Weight</th>
                    <th>Contribution</th>
                    <th>Physical Assessment</th>
                </tr>
            </thead>
            <tbody>
                {factor_rows_html}
            </tbody>
        </table>

        <div style="margin-top: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 6px;">
                <h4 style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; color: #0f172a; font-weight: 700;">Multi-Temporal Change Breakdown</h4>
                <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155; line-height: 1.6;">
                    <li>Severe Canopy Loss: <strong>{changes.severe_decline_pct}%</strong> of cells</li>
                    <li>Moderate Canopy Thinning: <strong>{changes.moderate_decline_pct}%</strong> of cells</li>
                    <li>Stable Contiguous Forest: <strong>{changes.stable_pct}%</strong> of cells</li>
                    <li>Regrowth / Canopy Recovery: <strong>{changes.significant_regrowth_pct}%</strong> of cells</li>
                </ul>
            </div>
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 6px;">
                <h4 style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; color: #065f46; font-weight: 700;">Action Directives for Decision-Makers</h4>
                <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #166534; line-height: 1.6;">
                    {recommendations_html}
                </ul>
            </div>
        </div>

        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; font-family: monospace; display: flex; justify-content: space-between;">
            <span>EcoGuard v1.0 &bull; ESA Copernicus Sentinel-2 MSI Level-2A Ingestion Core</span>
            <span>Generated: {assessment.timestamp} &bull; Document Classification: OFFICIAL RESTRICTED</span>
        </div>
    </div>
</body>
</html>"""
        return Response(content=html_content, media_type="text/html")

    # JSON export
    return {
        "report_metadata": {
            "platform": "EcoGuard AI Environmental Early-Warning System",
            "generated_at": assessment.timestamp,
            "region": region
        },
        "risk_assessment": assessment.model_dump(),
        "change_detection": changes.model_dump()
    }


