# -*- coding: utf-8 -*-
"""
modules/exporter.py: Multi-Format Report Exporter (HTML, CSV, JSON).
Department 02: Solution Architecture & Systems Engineering.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

import csv
import json
import os
import time
from typing import Dict, Any, List, Optional

from .storage import StorageManager
from .analytics import AnalyticsEngine, format_duration_hms, format_duration_hud


class ReportExporter:
    """
    Generates exportable audit reports across JSON, CSV, and self-contained Cyber-Glass HTML
    with pure inline SVG visualizations and zero external CDN dependencies (100% offline).
    """

    def __init__(self, analytics: AnalyticsEngine, storage: Optional[StorageManager] = None):
        self.analytics = analytics
        self.storage = storage or analytics.storage
        _m_dir = os.path.dirname(os.path.abspath(__file__))
        _p_dir = os.path.dirname(_m_dir)
        _r_dir = os.path.dirname(_p_dir) if os.path.basename(_p_dir).lower() == "src" else _p_dir
        self.default_reports_dir = os.path.join(_r_dir, "reports")
        os.makedirs(self.default_reports_dir, exist_ok=True)

    def _resolve_filepath(self, filepath: Optional[str], extension: str, prefix: str = "video_sentinel_report") -> str:
        """Resolves target export file path and ensures parent directory exists."""
        if not filepath:
            ts = time.strftime("%Y-%m-%d_%H-%M-%S")
            filename = f"{prefix}_{ts}.{extension}"
            filepath = os.path.join(self.default_reports_dir, filename)
        else:
            filepath = os.path.abspath(filepath)
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
        return filepath

    def export_json(self, filepath: Optional[str] = None) -> str:
        """
        Dumps daily, weekly, per-app breakdown, 24h heatmap, and recent sessions as structured JSON.
        Returns the absolute filepath of the generated file.
        """
        target_path = self._resolve_filepath(filepath, "json")

        now = time.time()
        now_str = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(now))
        today_str = time.strftime("%Y-%m-%d", time.localtime(now))

        daily = self.analytics.get_daily_summary(today_str)
        weekly = self.analytics.get_weekly_summary(today_str)
        per_app = self.analytics.get_per_app_breakdown(days=7)
        heatmap = self.analytics.get_24h_heatmap(today_str)
        peak = self.analytics.get_peak_usage_hour(today_str)
        top_plat = self.analytics.get_top_platform(days=7)
        sessions = self.storage.get_sessions(limit=100)

        payload = {
            "metadata": {
                "report_title": "Windows Video Inactivity Sentinel - Analytics & Audit Report",
                "generated_at": now_str,
                "timestamp": now,
                "developer": "Atul Verma (aiprincekumar)",
                "schema_version": "2.0.0"
            },
            "kpi_summary": {
                "total_watch_time_today": daily["video_formatted"],
                "total_watch_time_today_hud": daily["video_hud_formatted"],
                "pure_audio_time_today": daily["audio_formatted"],
                "idle_time_today": daily["idle_formatted"],
                "peak_usage_hour": peak["hour_range"],
                "peak_usage_video_time": peak["video_formatted"],
                "top_platform": top_plat["platform"],
                "top_platform_duration": top_plat["formatted"]
            },
            "daily_summary": daily,
            "weekly_summary": weekly,
            "per_app_breakdown_7d": per_app,
            "hourly_heatmap_24h": heatmap,
            "recent_watch_sessions": sessions
        }

        # Write with UTF-8 BOM standard
        with open(target_path, "w", encoding="utf-8-sig") as f:
            json.dump(payload, f, indent=2, ensure_ascii=False)

        return target_path

    def export_csv(self, filepath: Optional[str] = None) -> str:
        """
        Generates standard CSV containing all recorded watch sessions.
        Returns the absolute filepath of the generated file.
        """
        target_path = self._resolve_filepath(filepath, "csv", prefix="video_sentinel_sessions")

        sessions = self.storage.get_sessions(limit=5000)

        headers = [
            "id",
            "session_start",
            "session_end",
            "duration_seconds",
            "duration_formatted",
            "duration_hud",
            "app_name",
            "platform",
            "window_title",
            "media_category"
        ]

        # Write with UTF-8 BOM so Microsoft Excel loads symbols and Hindi text seamlessly
        with open(target_path, "w", encoding="utf-8-sig", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(headers)
            for s in sessions:
                dur = int(s.get("duration_seconds", 0))
                writer.writerow([
                    s.get("id", ""),
                    s.get("session_start", ""),
                    s.get("session_end", ""),
                    dur,
                    format_duration_hms(dur),
                    format_duration_hud(dur),
                    s.get("app_name", ""),
                    s.get("platform", ""),
                    s.get("window_title", ""),
                    s.get("media_category", "")
                ])

        return target_path

    def export_html(self, filepath: Optional[str] = None) -> str:
        """
        Generates a standalone, self-contained single-file HTML report:
          - Embedded Cyber-Glass dark theme (#0F172A, #10B981, #06B6D4, #1E293B).
          - Pure inline SVG bar charts for 24-hour activity distribution and per-app breakdown.
          - Summary KPI cards: Total Watch Time, Peak Usage Hour, Top Platform.
          - 100% offline viewable with zero external CDN scripts or stylesheet links.
        Returns the absolute filepath of the generated file.
        """
        target_path = self._resolve_filepath(filepath, "html")

        now = time.time()
        now_str = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(now))
        today_str = time.strftime("%Y-%m-%d", time.localtime(now))

        daily = self.analytics.get_daily_summary(today_str)
        weekly = self.analytics.get_weekly_summary(today_str)
        per_app = self.analytics.get_per_app_breakdown(days=7)
        heatmap = self.analytics.get_24h_heatmap(today_str)
        peak = self.analytics.get_peak_usage_hour(today_str)
        top_plat = self.analytics.get_top_platform(days=7)
        sessions = self.storage.get_sessions(limit=50)

        # Build pure inline SVG for 24-hour Activity Distribution
        svg_heatmap = self._render_svg_heatmap(heatmap)

        # Build pure inline SVG for Per-App Breakdown
        svg_per_app = self._render_svg_per_app(per_app)

        # Build table rows for recent sessions
        session_rows_html = []
        for s in sessions:
            cat = s.get("media_category", "VIDEO")
            badge_class = "badge-video" if cat == "VIDEO" else "badge-audio"
            dur = int(s.get("duration_seconds", 0))
            session_rows_html.append(f"""
                <tr>
                    <td>#{s.get('id', '')}</td>
                    <td>{s.get('session_start', '')}</td>
                    <td>{s.get('session_end', '')}</td>
                    <td><strong>{format_duration_hms(dur)}</strong></td>
                    <td><span class="app-tag">{s.get('app_name', 'Unknown')}</span></td>
                    <td><span class="platform-tag">{s.get('platform', 'Unknown')}</span></td>
                    <td class="cell-title" title="{s.get('window_title', '')}">{s.get('window_title', '')}</td>
                    <td><span class="badge {badge_class}">{cat}</span></td>
                </tr>
            """)
        sessions_table_content = "\n".join(session_rows_html) if session_rows_html else """
            <tr><td colspan="8" style="text-align:center; padding: 24px; color: #64748B;">No recorded watch sessions yet today.</td></tr>
        """

        # Build Past 7-Day Trend Table Rows
        weekly_rows_html = []
        for d in weekly["days"]:
            weekly_rows_html.append(f"""
                <tr>
                    <td><strong>{d['date']}</strong></td>
                    <td style="color:#06B6D4;"><strong>{d['video_formatted']}</strong></td>
                    <td style="color:#F59E0B;">{d['audio_formatted']}</td>
                    <td style="color:#64748B;">{d['idle_formatted']}</td>
                </tr>
            """)
        weekly_table_content = "\n".join(weekly_rows_html)

        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Video Inactivity Sentinel - Analytics Audit Report</title>
    <style>
        /* Cyber-Glass Clean Production Dark Theme (Zero External CDN) */
        :root {{
            --bg-primary: #0B0F17;
            --bg-secondary: #0F172A;
            --card-bg: rgba(30, 41, 59, 0.7);
            --card-border: rgba(255, 255, 255, 0.08);
            --accent-green: #10B981;
            --accent-cyan: #06B6D4;
            --accent-amber: #F59E0B;
            --accent-purple: #8B5CF6;
            --text-primary: #F8FAFC;
            --text-secondary: #94A3B8;
            --text-muted: #64748B;
        }}
        * {{
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }}
        body {{
            background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
            color: var(--text-primary);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            min-height: 100vh;
            padding: 32px 24px;
        }}
        .container {{
            max-width: 1200px;
            margin: 0 auto;
        }}
        /* Header Banner */
        .header {{
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            flex-wrap: wrap;
            gap: 16px;
            margin-bottom: 28px;
            padding-bottom: 20px;
            border-bottom: 1px solid var(--card-border);
        }}
        .header-title h1 {{
            font-size: 26px;
            font-weight: 700;
            letter-spacing: -0.02em;
            background: linear-gradient(90deg, #38BDF8 0%, #10B981 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }}
        .header-title p {{
            font-size: 14px;
            color: var(--text-secondary);
            margin-top: 4px;
        }}
        .header-meta {{
            text-align: right;
            font-size: 13px;
            color: var(--text-muted);
        }}
        .header-meta strong {{
            color: var(--text-secondary);
        }}

        /* KPI Cards Grid */
        .kpi-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 16px;
            margin-bottom: 28px;
        }}
        .card {{
            background: var(--card-bg);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid var(--card-border);
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
        }}
        .kpi-label {{
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--text-muted);
            font-weight: 600;
            margin-bottom: 8px;
        }}
        .kpi-value {{
            font-size: 30px;
            font-weight: 800;
            line-height: 1.1;
        }}
        .kpi-subtext {{
            font-size: 12px;
            color: var(--text-secondary);
            margin-top: 6px;
        }}

        /* Chart Sections */
        .section-title {{
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        }}
        .chart-card {{
            margin-bottom: 28px;
        }}
        .svg-container {{
            width: 100%;
            overflow-x: auto;
        }}
        svg {{
            display: block;
            max-width: 100%;
            height: auto;
        }}

        /* Split Row */
        .split-grid {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 28px;
        }}
        @media (max-width: 860px) {{
            .split-grid {{
                grid-template-columns: 1fr;
            }}
        }}

        /* Tables */
        table {{
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }}
        th {{
            text-align: left;
            padding: 12px 14px;
            background: rgba(15, 23, 42, 0.6);
            color: var(--text-muted);
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.05em;
            border-bottom: 1px solid var(--card-border);
        }}
        td {{
            padding: 12px 14px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.04);
            color: var(--text-secondary);
        }}
        tr:hover td {{
            background: rgba(255, 255, 255, 0.02);
            color: var(--text-primary);
        }}
        .cell-title {{
            max-width: 260px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }}
        .badge {{
            display: inline-block;
            padding: 3px 8px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.04em;
        }}
        .badge-video {{
            background: rgba(6, 182, 212, 0.15);
            color: #38BDF8;
            border: 1px solid rgba(6, 182, 212, 0.3);
        }}
        .badge-audio {{
            background: rgba(245, 158, 11, 0.15);
            color: #FBBF24;
            border: 1px solid rgba(245, 158, 11, 0.3);
        }}
        .platform-tag {{
            display: inline-block;
            padding: 2px 7px;
            border-radius: 4px;
            background: rgba(139, 92, 246, 0.15);
            color: #C084FC;
            font-size: 11px;
            font-weight: 600;
        }}
        .app-tag {{
            font-family: monospace;
            font-size: 12px;
            color: #E2E8F0;
        }}

        /* Legend */
        .chart-legend {{
            display: flex;
            gap: 20px;
            margin-top: 12px;
            font-size: 12px;
            color: var(--text-secondary);
        }}
        .legend-item {{
            display: flex;
            align-items: center;
            gap: 6px;
        }}
        .legend-color {{
            width: 12px;
            height: 12px;
            border-radius: 3px;
        }}

        /* Footer */
        .footer {{
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid var(--card-border);
            text-align: center;
            font-size: 12px;
            color: var(--text-muted);
        }}
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <header class="header">
            <div class="header-title">
                <h1>Windows Video Inactivity Sentinel</h1>
                <p>Analytics, Watch-Time Metrics & Historical Playback Audit Report</p>
            </div>
            <div class="header-meta">
                <div>Generated: <strong>{now_str}</strong></div>
                <div>Author: <strong>Atul Verma (aiprincekumar)</strong></div>
                <div>Format: <strong>Standalone Cyber-Glass HTML</strong></div>
            </div>
        </header>

        <!-- KPI Cards Grid -->
        <div class="kpi-grid">
            <div class="card">
                <div class="kpi-label">Today's Watch Time</div>
                <div class="kpi-value" style="color: var(--accent-cyan);">{daily['video_formatted']}</div>
                <div class="kpi-subtext">HUD: <strong>{daily['video_hud_formatted']}</strong></div>
            </div>
            <div class="card">
                <div class="kpi-label">Pure Audio Streamed</div>
                <div class="kpi-value" style="color: var(--accent-amber);">{daily['audio_formatted']}</div>
                <div class="kpi-subtext">Ignored as idle (non-blocking)</div>
            </div>
            <div class="card">
                <div class="kpi-label">Peak Usage Hour</div>
                <div class="kpi-value" style="color: var(--accent-green);">{peak['hour_range']}</div>
                <div class="kpi-subtext">Peak Watch: {peak['video_formatted']}</div>
            </div>
            <div class="card">
                <div class="kpi-label">Top Platform (7d)</div>
                <div class="kpi-value" style="color: var(--accent-purple); font-size: 24px;">{top_plat['platform']}</div>
                <div class="kpi-subtext">Total: {top_plat['formatted']}</div>
            </div>
        </div>

        <!-- Section 1: 24-Hour Activity Heatmap -->
        <div class="card chart-card">
            <div class="section-title">
                <span>⏱️</span> 24-Hour Activity Distribution ({today_str})
            </div>
            <div class="svg-container">
                {svg_heatmap}
            </div>
            <div class="chart-legend">
                <div class="legend-item">
                    <span class="legend-color" style="background:#06B6D4;"></span>
                    <span>Active Video Playback</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background:#F59E0B;"></span>
                    <span>Pure Audio Stream</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background:#334155;"></span>
                    <span>System Monitored Idle</span>
                </div>
            </div>
        </div>

        <!-- Split Grid: Per-App Breakdown + Past 7-Day Trend -->
        <div class="split-grid">
            <div class="card">
                <div class="section-title">
                    <span>📱</span> Per-App Playback Breakdown (Past 7 Days)
                </div>
                <div class="svg-container">
                    {svg_per_app}
                </div>
            </div>

            <div class="card">
                <div class="section-title">
                    <span>📅</span> 7-Day Watch Trend
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Video Time</th>
                            <th>Audio Time</th>
                            <th>Idle Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {weekly_table_content}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Section 3: Recorded Watch Sessions -->
        <div class="card">
            <div class="section-title">
                <span>🎬</span> Recorded Watch Sessions (Audit Trail)
            </div>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Session Start</th>
                        <th>Session End</th>
                        <th>Duration</th>
                        <th>App Name</th>
                        <th>Platform</th>
                        <th>Media Title</th>
                        <th>Category</th>
                    </tr>
                </thead>
                <tbody>
                    {sessions_table_content}
                </tbody>
            </table>
        </div>

        <!-- Footer -->
        <footer class="footer">
            Windows Video-Only Inactivity Sentinel &bull; Engineered by Atul Verma &bull; 100% Offline Standalone Report &bull; Zero External CDNs
        </footer>
    </div>
</body>
</html>
"""

        with open(target_path, "w", encoding="utf-8-sig") as f:
            f.write(html_content)

        return target_path

    def _render_svg_heatmap(self, heatmap: List[Dict[str, Any]]) -> str:
        """
        Renders a pure inline SVG bar chart representing the 24 hourly buckets.
        Dimensions: 960 x 240 pixels with 24 columns.
        """
        w = 960
        h = 240
        padding_left = 40
        padding_right = 20
        padding_top = 20
        padding_bottom = 35

        chart_w = w - padding_left - padding_right
        chart_h = h - padding_top - padding_bottom

        # Max seconds scale: at least 3600 seconds (1 hour) or maximum observed
        max_sec = 3600
        for b in heatmap:
            tot = b["video_sec"] + b["audio_sec"]
            if tot > max_sec:
                max_sec = tot

        col_w = chart_w / 24.0
        bar_w = max(4.0, col_w - 6.0)

        svg_parts = [
            f'<svg viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg" style="background: rgba(15, 23, 42, 0.4); border-radius: 8px;">'
        ]

        # Horizontal Gridlines (0%, 50%, 100%)
        for pct, label in [(0.0, "0m"), (0.5, f"{int(max_sec * 0.5 // 60)}m"), (1.0, f"{int(max_sec // 60)}m")]:
            y_pos = padding_top + chart_h - (chart_h * pct)
            svg_parts.append(
                f'<line x1="{padding_left}" y1="{y_pos}" x2="{w - padding_right}" y2="{y_pos}" '
                f'stroke="rgba(255,255,255,0.06)" stroke-width="1" />'
            )
            svg_parts.append(
                f'<text x="{padding_left - 8}" y="{y_pos + 4}" fill="#64748B" font-size="10" '
                f'text-anchor="end" font-family="monospace">{label}</text>'
            )

        # Draw 24 columns
        for i, b in enumerate(heatmap):
            x_col = padding_left + (i * col_w) + (col_w - bar_w) / 2.0
            v_sec = b["video_sec"]
            a_sec = b["audio_sec"]
            total_active = v_sec + a_sec

            v_h = (v_sec / float(max_sec)) * chart_h
            a_h = (a_sec / float(max_sec)) * chart_h

            y_base = padding_top + chart_h

            # Video Bar (Cyan)
            if v_h > 0:
                y_v = y_base - v_h
                svg_parts.append(
                    f'<rect x="{x_col:.1f}" y="{y_v:.1f}" width="{bar_w:.1f}" height="{v_h:.1f}" '
                    f'fill="#06B6D4" rx="2">'
                    f'<title>Hour {b["hour"]:02d}:00 &bull; Video: {b["video_formatted"]} &bull; Audio: {b["audio_formatted"]}</title>'
                    f'</rect>'
                )

            # Audio Bar (Amber) stacked on top of Video
            if a_h > 0:
                y_a = y_base - v_h - a_h
                svg_parts.append(
                    f'<rect x="{x_col:.1f}" y="{y_a:.1f}" width="{bar_w:.1f}" height="{a_h:.1f}" '
                    f'fill="#F59E0B" rx="2">'
                    f'<title>Hour {b["hour"]:02d}:00 &bull; Audio: {b["audio_formatted"]}</title>'
                    f'</rect>'
                )

            # Background subtle placeholder bar when empty
            if total_active == 0:
                svg_parts.append(
                    f'<rect x="{x_col:.1f}" y="{y_base - 3:.1f}" width="{bar_w:.1f}" height="3" '
                    f'fill="#1E293B" rx="1">'
                    f'<title>Hour {b["hour"]:02d}:00 &bull; Idle (0m active)</title>'
                    f'</rect>'
                )

            # Hour label on X-axis (every 2 hours to prevent crowding)
            if i % 2 == 0 or i == 23:
                svg_parts.append(
                    f'<text x="{x_col + bar_w / 2.0:.1f}" y="{h - 12}" fill="#64748B" font-size="10" '
                    f'text-anchor="middle" font-family="monospace">{b["hour"]:02d}h</text>'
                )

        svg_parts.append('</svg>')
        return "".join(svg_parts)

    def _render_svg_per_app(self, per_app: List[Dict[str, Any]]) -> str:
        """
        Renders a pure inline SVG horizontal bar chart for per-app playback distribution.
        """
        if not per_app:
            return '<div style="padding: 24px; text-align:center; color:#64748B;">No recorded app playback sessions yet.</div>'

        # Show top 5 apps
        top_apps = per_app[:5]
        max_dur = max(a["duration_seconds"] for a in top_apps)
        if max_dur == 0:
            max_dur = 1

        row_h = 36
        chart_h = max(120, len(top_apps) * row_h + 20)
        w = 520
        label_w = 150
        bar_max_w = 260

        svg_parts = [
            f'<svg viewBox="0 0 {w} {chart_h}" xmlns="http://www.w3.org/2000/svg" style="background: rgba(15, 23, 42, 0.4); border-radius: 8px;">'
        ]

        for i, a in enumerate(top_apps):
            y = 16 + i * row_h
            dur = a["duration_seconds"]
            bw = (dur / float(max_dur)) * bar_max_w
            app_label = a["app_name"]
            if len(app_label) > 16:
                app_label = app_label[:14] + ".."

            # App Label
            svg_parts.append(
                f'<text x="14" y="{y + 14}" fill="#E2E8F0" font-size="12" '
                f'font-family="monospace">{app_label}</text>'
            )

            # Horizontal Bar
            svg_parts.append(
                f'<rect x="{label_w}" y="{y}" width="{max(4.0, bw):.1f}" height="20" '
                f'fill="#06B6D4" rx="4">'
                f'<title>{a["app_name"]} ({a["platform"]}) - {a["duration_formatted"]}</title>'
                f'</rect>'
            )

            # Duration Text
            svg_parts.append(
                f'<text x="{label_w + max(4.0, bw) + 10:.1f}" y="{y + 14}" fill="#94A3B8" '
                f'font-size="11" font-family="monospace">{a["duration_hud"]}</text>'
            )

        svg_parts.append('</svg>')
        return "".join(svg_parts)
