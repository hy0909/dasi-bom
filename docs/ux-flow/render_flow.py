#!/usr/bin/env python3
"""uxflow-generator 플로우 JSON → HTML(SVG) → PNG.

hy0909/uxflow-figjam-plugin 의 drawUxFlow 레이아웃·색 규칙을 그대로 따라 그린다.
  python3 render_flow.py flow.json            # flow.html + flow.png 생성
"""
import html
import json
import subprocess
import sys
from pathlib import Path

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

L = dict(COL_W=340, ROW_H=320, NODE_W=240, NODE_H=96, DECISION_W=240, DECISION_H=130, PAD=80, HEADER_GAP=40)
FILL = dict(happy="#F6F6F8", error="#FDECEC", exception="#FFF4E5", api="#EAF2FE", decision="#FFFBEB", start="#E8F7EE", note="#FFF3A3")
STROKE = dict(happy="#B0B0B5", error="#E5484D", exception="#E8940A", api="#4C8DF6", decision="#D4A72C", start="#34A853", note="#E3CF5A")
TEXT = "#1D1D1F"
EDGE = dict(yes="#34A853", no="#E5484D", default="#8E8E93")
YES = {"yes", "y", "예", "네", "ok", "성공"}
NO = {"no", "n", "아니오", "아니요", "실패", "오류"}


def case_key(n):
    t = n["type"]
    if t == "api":
        return "api"
    if t == "decision":
        return "decision"
    if t == "note":
        return "note"
    c = n.get("case", "happy")
    if t in ("start", "end"):
        return c if c != "happy" and c in FILL else "start"
    return c if c in FILL else "happy"


def esc(s):
    return html.escape(str(s), quote=True)


def label_html(n):
    label = str(n.get("label", ""))
    if label.rstrip().endswith("*"):
        return esc(label.rstrip()[:-1].rstrip()) + ' <span class="req">(필수항목)</span>'
    if label.rstrip().endswith("(선택)"):
        return esc(label.rstrip()[:-4].rstrip()) + ' <span class="opt">(선택항목)</span>'
    return esc(label)


def badges(n):
    b = []
    if n.get("owner"):
        b.append("[" + n["owner"] + "]")
    if n.get("role"):
        b.append("👤 " + n["role"])
    if n.get("state"):
        b.append("· " + n["state"])
    return " ".join(b)


def edge_color(label):
    if not label:
        return EDGE["default"]
    l = str(label).strip().lower()
    if l in YES:
        return EDGE["yes"]
    if l in NO:
        return EDGE["no"]
    return EDGE["default"]


def shape_svg(t, x, y, w, h, fill, stroke):
    if t in ("start", "end"):
        return f'<ellipse cx="{x + w / 2}" cy="{y + h / 2}" rx="{w / 2}" ry="{h / 2}" fill="{fill}" stroke="{stroke}"/>'
    if t == "decision":
        pts = f"{x + w / 2},{y} {x + w},{y + h / 2} {x + w / 2},{y + h} {x},{y + h / 2}"
        return f'<polygon points="{pts}" fill="{fill}" stroke="{stroke}"/>'
    if t == "api":
        k = 22
        pts = f"{x + k},{y} {x + w},{y} {x + w - k},{y + h} {x},{y + h}"
        return f'<polygon points="{pts}" fill="{fill}" stroke="{stroke}"/>'
    if t == "action":
        return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="18" fill="{fill}" stroke="{stroke}"/>'
    if t == "note":
        return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="4" fill="{fill}" stroke="{stroke}" filter="url(#shadow)"/>'
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="{stroke}"/>'


def render(flow):
    nodes = flow["nodes"]
    edges = flow.get("edges", [])
    title = flow.get("title") or f"[{flow['page']}] > {flow['feature']}"
    max_col = max(n["col"] for n in nodes)
    max_row = max(n["row"] for n in nodes)

    header_h = 40 + 34 + 12 + 16 + 90  # pad + title + gap + legend
    nodes_top = header_h + L["HEADER_GAP"]
    sec_w = max(L["PAD"] * 2 + (max_col + 1) * L["COL_W"], 800)
    sec_h = max(nodes_top + (max_row + 1) * L["ROW_H"] + L["PAD"], 500)

    boxes = {}
    svg, overlay = [], []
    for n in nodes:
        cx = L["PAD"] + n["col"] * L["COL_W"]
        cy = nodes_top + n["row"] * L["ROW_H"]
        t = n["type"]
        if t == "note":
            w, h = L["NODE_W"], 150
            x, y = cx, cy
        elif t == "decision":
            w, h = L["DECISION_W"], L["DECISION_H"]
            x, y = cx, cy - (h - L["NODE_H"]) / 2
        else:
            w, h = L["NODE_W"], L["NODE_H"]
            x, y = cx, cy
        k = case_key(n)
        boxes[n["id"]] = dict(x=x, y=y, w=w, h=h, col=n["col"], row=n["row"])
        svg.append(shape_svg(t, x, y, w, h, FILL[k], STROKE[k]))
        if t == "note":
            body = "<b>" + esc(n.get("label", "")) + "</b>" + "".join(f"<div>{esc(d)}</div>" for d in n.get("details", []))
            overlay.append(f'<div class="note" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px">{body}</div>')
            continue
        pad = 44 if t == "decision" else 12
        bd = badges(n)
        overlay.append(
            f'<div class="lbl" style="left:{x + pad}px;top:{y}px;width:{w - pad * 2}px;height:{h}px">'
            f'<div class="t">{label_html(n)}</div>' + (f'<div class="bd">{esc(bd)}</div>' if bd else "") + "</div>"
        )
        if n.get("details"):
            items = "".join(f"<div>· {esc(d)}</div>" for d in n["details"])
            overlay.append(f'<div class="det" style="left:{cx}px;top:{cy + L["NODE_H"] + 12}px;width:{L["NODE_W"] + 40}px">{items}</div>')

    # edges — 플러그인 magnet 규칙: 전진=RIGHT→LEFT, 복귀=LEFT→RIGHT, 같은 열=BOTTOM→TOP
    epaths, elabels = [], []
    for e in edges:
        f, t = boxes.get(e["from"]), boxes.get(e["to"])
        if not f or not t:
            continue
        color = edge_color(e.get("label"))
        fx, fy = f["x"] + f["w"] / 2, f["y"] + f["h"] / 2
        tx, ty = t["x"] + t["w"] / 2, t["y"] + t["h"] / 2
        if t["col"] > f["col"]:
            sx, sy = f["x"] + f["w"], fy
            ex, ey = t["x"], ty
            mx = (sx + ex) / 2
            pts = [(sx, sy), (mx, sy), (mx, ey), (ex, ey)] if abs(sy - ey) > 1 else [(sx, sy), (ex, ey)]
            # 라벨은 도착 노드 바로 앞 구간에 — 같은 출발점에서 여러 가지가 뻗어도 어느 노드행인지 명확
            lx, ly = ((mx + ex) / 2, ey - 12) if abs(sy - ey) > 40 else ((sx + ex) / 2, sy - 12)
        elif t["col"] < f["col"]:
            sx, sy = f["x"], fy
            ex, ey = t["x"] + t["w"], ty
            mx = (sx + ex) / 2
            pts = [(sx, sy), (mx, sy), (mx, ey), (ex, ey)] if abs(sy - ey) > 1 else [(sx, sy), (ex, ey)]
            lx, ly = (mx + ex) / 2, ey - 12
        elif t["row"] > f["row"]:
            sx, sy = fx, f["y"] + f["h"]
            ex, ey = tx, t["y"]
            pts = [(sx, sy), (ex, ey)]
            lx, ly = sx + 8, (sy + ey) / 2
        else:
            sx, sy = fx, f["y"]
            ex, ey = tx, t["y"] + t["h"]
            pts = [(sx, sy), (ex, ey)]
            lx, ly = sx + 8, (sy + ey) / 2
        d = "M " + " L ".join(f"{px:.1f} {py:.1f}" for px, py in pts)
        epaths.append(f'<path d="{d}" fill="none" stroke="{color}" stroke-width="1.4" marker-end="url(#arr-{color[1:]})"/>')
        if e.get("label"):
            elabels.append(f'<div class="el" style="left:{lx}px;top:{ly}px;color:{color}">{esc(e["label"])}</div>')

    markers = "".join(
        f'<marker id="arr-{c[1:]}" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse">'
        f'<path d="M1,1 L9,5 L1,9" fill="none" stroke="{c}" stroke-width="1.4"/></marker>'
        for c in set(EDGE.values())
    )

    # legend
    legend_items = [
        ("start", "시작 · 종료", "start"), ("screen", "화면", "happy"), ("action", "액션 · 처리", "happy"),
        ("decision", "분기 YES/NO", "decision"), ("api", "API (BE)", "api"), ("action", "에러 경로", "error"),
        ("action", "예외 경로", "exception"), ("note", "메모", "note"),
    ]
    lx0, ly0 = L["PAD"] * 0.5, 40 + 34 + 12 + 16
    legend_svg, legend_ov = [f'<text x="{lx0}" y="{ly0 + 12}" font-size="12" fill="#6E6E73">범례</text>'], []
    x = lx0 + 46
    for shape, lab, key in legend_items:
        w = 148 if shape == "decision" else 124
        h = 60 if shape == "decision" else 40
        y = ly0 - 10 if shape == "decision" else ly0
        legend_svg.append(shape_svg(shape, x, y, w, h, FILL[key], STROKE[key]))
        legend_ov.append(f'<div class="lg" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px">{esc(lab)}</div>')
        x += w + 16
    legend_svg.append(
        f'<text x="{lx0}" y="{ly0 + 78}" font-size="11" fill="#6E6E73"><tspan fill="{STROKE["error"]}">(필수항목)</tspan> 필수 입력 · (선택항목) 선택 입력 · '
        f'<tspan fill="{EDGE["yes"]}">━ YES/성공</tspan> · <tspan fill="{EDGE["no"]}">━ NO/실패</tspan> · [ ] 페이지·버튼명</text>'
    )

    links = []
    for d in flow.get("docLinks", []) or []:
        links.append("📄 " + d.get("label", "Spec"))
    for d in flow.get("figmaLinks", []) or []:
        links.append("🔗 " + d.get("label", "Figma"))
    links_html = "".join(f'<div class="lk">{esc(l)}</div>' for l in links)

    return f"""<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>{esc(title)}</title>
<style>
html,body{{margin:0;background:#fff}}
body{{width:{sec_w}px;height:{sec_h}px;position:relative;overflow:hidden;font-family:Inter,-apple-system,"Apple SD Gothic Neo","Pretendard","Noto Sans KR",sans-serif;color:{TEXT}}}
.sec{{position:absolute;inset:0;border:1px solid #E5E5EA;border-radius:8px;background:#FAFAFB}}
svg{{position:absolute;left:0;top:0}}
.title{{position:absolute;left:{L["PAD"] * 0.5}px;top:40px;font-size:22px;font-weight:700;letter-spacing:-.3px}}
.links{{position:absolute;right:{L["PAD"] * 0.5}px;top:40px;text-align:right}}
.lk{{font-size:13px;color:#4C8DF6;text-decoration:underline;margin-bottom:6px}}
.lg{{position:absolute;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:500;text-align:center}}
.lbl{{position:absolute;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;line-height:1.3}}
.lbl .t{{font-size:13px;font-weight:500;word-break:keep-all}}
.lbl .bd{{font-size:11px;color:#4A4A50;margin-top:5px}}
.req{{color:{STROKE["error"]}}} .opt{{color:#6E6E73}}
.det{{position:absolute;font-size:11px;line-height:1.5;color:#6E6E73;word-break:keep-all}}
.note{{position:absolute;padding:12px 14px;font-size:11.5px;line-height:1.5;color:#3A3A1E;word-break:keep-all;box-sizing:border-box}}
.note b{{display:block;font-size:12px;margin-bottom:6px}}
.el{{position:absolute;transform:translate(-50%,-50%);padding:1px 6px;border-radius:4px;background:#fff;border:1px solid currentColor;font-size:11px;font-weight:600;white-space:nowrap}}
</style></head><body>
<div class="sec"></div>
<svg width="{sec_w}" height="{sec_h}" viewBox="0 0 {sec_w} {sec_h}">
<defs>{markers}<filter id="shadow" x="-10%" y="-10%" width="130%" height="130%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity=".18"/></filter></defs>
{"".join(legend_svg)}
{"".join(epaths)}
{"".join(svg)}
</svg>
<div class="title">{esc(title)}</div>
<div class="links">{links_html}</div>
{"".join(legend_ov)}
{"".join(overlay)}
{"".join(elabels)}
</body></html>""", sec_w, sec_h


def main():
    for arg in sys.argv[1:]:
        p = Path(arg)
        flow = json.loads(p.read_text(encoding="utf-8"))
        page, w, h = render(flow)
        out_html = p.with_suffix(".html")
        out_png = p.with_suffix(".png")
        out_html.write_text(page, encoding="utf-8")
        subprocess.run(
            [CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=2",
             f"--window-size={w},{h}", f"--screenshot={out_png}", out_html.resolve().as_uri()],
            check=True, capture_output=True,
        )
        print(f"{out_png}  ({w}x{h} @2x)")


if __name__ == "__main__":
    main()
