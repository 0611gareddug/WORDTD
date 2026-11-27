import json, re
SP = json.load(open('sprites.json'))
EL = {'fire':'#f08a24','ice':'#8fd8ff','light':'#ffe680','beast':'#d08a4a','gear':'#5fb8c8','wind':'#6fe3c8','earth':'#b9824e','storm':'#ffd84a','support':'#ffcf3d','poison':'#9be64a','nature':'#4cc35a','food':'#ff7a8a'}
def merge(svg):
    cells = {}
    for x, y, c in re.findall(r'x="(\d+)" y="(\d+)" width="1" height="1" fill="(#[0-9a-fA-F]+)"', svg): cells[(int(x), int(y))] = c
    out = []
    for y in range(16):
        x = 0
        while x < 16:
            c = cells.get((x, y))
            if not c: x += 1; continue
            w = 1
            while cells.get((x + w, y)) == c: w += 1
            out.append(f'<rect x="{x}" y="{y}" width="{w}" height="1" fill="{c}"></rect>'); x += w
    return ''.join(out)
def spr(word, size):
    return f'<svg width="{size}" height="{size}" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true" style="display: block">{merge(SP[word]["svg"])}</svg>'
FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gaegu:wght@400;700&amp;family=Gowun+Dodum&amp;family=Silkscreen:wght@400;700&amp;display=swap">'
def page(title, w, h, body, extra_css=''):
    return f'''<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>{title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
{FONTS}
<style>
body{{margin:0;font-family:"Gowun Dodum",system-ui,sans-serif;color:#2A2D3A}}
a{{color:#3B6FD8}}a:hover{{color:#244fa8}}
button{{font-family:inherit}}
{extra_css}
</style>
</helmet>
{body}
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":{w},"height":{h}}}}}'>
class Component extends DCLogic {{
  renderVals() {{
    return {{}};
  }}
}}
</script>
</body>
</html>
'''
PAPER = 'background-color: #FBF6EA; background-image: linear-gradient(#DCE8F3 1px, transparent 1px), linear-gradient(90deg, #DCE8F3 1px, transparent 1px); background-size: 20px 20px'
def tape(word, typed=0, size=11, rot=-2, bg='#F2D7A6'):
    a = word[:typed]; b = word[typed:]
    t = (f'<span style="color: #E0483E">{a}</span>' if a else '') + b
    return f'<span style="display: inline-block; font-family: Silkscreen, monospace; font-weight: 700; font-size: {size}px; line-height: 1; letter-spacing: 0.04em; padding: 3px 5px 2px; background: {bg}; color: #2A2D3A; transform: rotate({rot}deg); box-shadow: 0 1px 0 rgba(59,63,78,0.25); white-space: nowrap">{t}</span>'
def blob(size=26, col='#3B3F4E'):
    return f'<svg width="{size}" height="{size}" viewBox="0 0 26 26" aria-hidden="true" style="display: block"><path d="M4 18 C2 10 8 4 14 4 C21 4 24 10 23 16 C22 22 17 23 13 23 C8 23 5 22 4 18 Z" fill="{col}" stroke="#2A2D3A" stroke-width="1.5"></path><circle cx="10" cy="12" r="3" fill="#FBF6EA"></circle><circle cx="17" cy="12" r="3" fill="#FBF6EA"></circle><circle cx="10.5" cy="12.5" r="1.4" fill="#2A2D3A"></circle><circle cx="17.5" cy="12.5" r="1.4" fill="#2A2D3A"></circle><path d="M6 23 L5 25 M20 23 L21 25" stroke="#2A2D3A" stroke-width="1.5"></path></svg>'
def plane(size=28):
    return f'<svg width="{size}" height="{size}" viewBox="0 0 28 28" aria-hidden="true" style="display: block"><path d="M2 14 L26 4 L18 24 L14 16 Z" fill="#FBF6EA" stroke="#3B3F4E" stroke-width="1.6" stroke-linejoin="round"></path><path d="M14 16 L26 4" stroke="#3B3F4E" stroke-width="1.2"></path></svg>'
def sticker(word, size, label=True, ring='#ffffff'):
    lab = f'<div style="margin-top: -3px; position: relative">{tape(word, 0, 8, 0, "#F2D7A6")}</div>' if label else ''
    return f'<div style="display: flex; flex-direction: column; align-items: center"><div style="background: {ring}; padding: 2px; border-radius: 4px; box-shadow: 0 2px 0 rgba(59,63,78,0.28)">{spr(word, size)}</div>{lab}</div>'
ICON = {
 'heart':'<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-4.5-9.2-9C1.4 9 3 5 7 5c2 0 3.5 1.2 5 3 1.5-1.8 3-3 5-3 4 0 5.6 4 4.2 7-2.2 4.5-9.2 9-9.2 9z" fill="#FF9EC7" stroke="#2A2D3A" stroke-width="1.6"></path></svg>',
 'coin':'<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="#FFE86B" stroke="#2A2D3A" stroke-width="1.6"></circle><path d="M12 7v10M9.5 9.5h4a1.8 1.8 0 010 3.6h-3a1.8 1.8 0 000 3.6h4" stroke="#2A2D3A" stroke-width="1.4" fill="none"></path></svg>',
 'pause':'<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14" stroke="#2A2D3A" stroke-width="2.4" stroke-linecap="round"></path></svg>',
 'fast':'<svg width="22" height="20" viewBox="0 0 26 24" aria-hidden="true"><path d="M3 5l9 7-9 7zM13 5l9 7-9 7z" fill="none" stroke="#2A2D3A" stroke-width="1.8" stroke-linejoin="round"></path></svg>',
 'nib':'<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l6 8-6 12-6-12z" fill="#3B6FD8" stroke="#2A2D3A" stroke-width="1.5" stroke-linejoin="round"></path><path d="M12 10v6" stroke="#FBF6EA" stroke-width="1.5"></path><circle cx="12" cy="9" r="1.6" fill="#FBF6EA"></circle></svg>',
 'back':'<svg width="22" height="18" viewBox="0 0 26 20" aria-hidden="true"><path d="M8 2h15v16H8L2 10z" fill="none" stroke="#2A2D3A" stroke-width="1.8" stroke-linejoin="round"></path><path d="M12 7l6 6M18 7l-6 6" stroke="#2A2D3A" stroke-width="1.8" stroke-linecap="round"></path></svg>',
}
