# Shared tokens + building blocks for the Quad Volunteers mockups.
C = dict(g900='#12181c', g800='#252d33', g700='#3a4750', g600='#5c6b75', g500='#a1a9af',
         g400='#dfe6eb', g300='#eef4f8', w='#ffffff', r600='#9c1128', r500='#b9122d', r400='#d0012b',
         y600='#ffe478', y500='#ffcd00', y400='#dcb100',
         # derived tints (not in the source palette)
         rtint='#fdf0f2', ytint='#fff7d1')
FONT = "font-family: Geist, ui-sans-serif, system-ui, -apple-system, sans-serif"
SHADOW = "box-shadow: 0 1px 2px rgba(18,24,28,0.06)"
SHADOW_POP = "box-shadow: 0 6px 16px rgba(18,24,28,0.10), 0 1px 2px rgba(18,24,28,0.06)"

ICONS = {
 'calendar': '<rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M16 2v4"></path><path d="M8 2v4"></path><path d="M3 10h18"></path>',
 'calendar-check': '<rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M16 2v4"></path><path d="M8 2v4"></path><path d="M3 10h18"></path><path d="m9 16 2 2 4-4"></path>',
 'calendar-x': '<rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M16 2v4"></path><path d="M8 2v4"></path><path d="M3 10h18"></path><path d="m14 14-4 4"></path><path d="m10 14 4 4"></path>',
 'clock': '<circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path>',
 'map-pin': '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path><circle cx="12" cy="10" r="3"></circle>',
 'users': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
 'search': '<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path>',
 'check': '<path d="M20 6 9 17l-5-5"></path>',
 'chevron-down': '<path d="m6 9 6 6 6-6"></path>',
 'chevron-right': '<path d="m9 18 6-6-6-6"></path>',
 'menu': '<path d="M4 6h16"></path><path d="M4 12h16"></path><path d="M4 18h16"></path>',
 'plus': '<path d="M5 12h14"></path><path d="M12 5v14"></path>',
 'pencil': '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path><path d="m15 5 4 4"></path>',
 'trash': '<path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><path d="M10 11v6"></path><path d="M14 11v6"></path>',
 'x': '<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>',
 'alert': '<circle cx="12" cy="12" r="10"></circle><path d="M12 8v4"></path><path d="M12 16h.01"></path>',
 'info': '<circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>',
 'arrow-left': '<path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path>',
 'lock': '<rect width="18" height="11" x="3" y="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>',
 'user-x': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="m17 8 5 5"></path><path d="m22 8-5 5"></path>',
 'history': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M12 7v5l4 2"></path>',
}

def icon(name, size=16, color='currentColor', sw=1.75):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" '
            f'stroke="{color}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" '
            f'style="flex: none">{ICONS[name]}</svg>')

def doc(title, body, w, h, root_style):
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&amp;display=swap">
<style>
body{{margin:0}}
a{{color:#d0012b}}a:hover{{color:#9c1128}}
</style>
</helmet>
<div style="{root_style}; {FONT}">
{body}
</div>
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

# ---------- theme (light / dark) ----------
def theme(dark=False):
    if not dark:
        return dict(bg=C['g300'], surface=C['w'], text=C['g900'], text2=C['g700'], muted=C['g600'],
                    border=C['g400'], strong_border=C['g500'], subtle=C['g300'], date=C['r500'],
                    header=C['w'], track=C['g300'])
    return dict(bg=C['g900'], surface=C['g800'], text=C['g300'], text2=C['g400'], muted=C['g500'],
                border=C['g700'], strong_border=C['g600'], subtle='#1b2328', date=C['y600'],
                header=C['g800'], track=C['g700'])

# ---------- primitives ----------
def badge(kind, text, dark=False):
    t = theme(dark)
    styles = {
        'in':    (f"background: {C['y500']}; color: {C['g900']}; border: 1px solid {C['y400']}", 'check'),
        'few':   (f"background: {t['surface']}; color: {C['r500'] if not dark else C['y600']}; border: 1px solid {C['r400']}", 'clock'),
        'full':  (f"background: {C['g800'] if not dark else C['g300']}; color: {C['w'] if not dark else C['g900']}; border: 1px solid {C['g800'] if not dark else C['g300']}", None),
        'plain': (f"background: {t['subtle']}; color: {t['text2']}; border: 1px solid {t['border']}", None),
        'open':  (f"background: {t['surface']}; color: {t['text2']}; border: 1px solid {t['strong_border']}", 'users'),
        'ended': (f"background: {t['subtle']}; color: {t['muted']}; border: 1px solid {t['border']}", 'history'),
        'role-admin': (f"background: {C['rtint']}; color: {C['r600']}; border: 1px solid {C['r400']}", None),
        'role-organizer': (f"background: {C['ytint']}; color: {C['g900']}; border: 1px solid {C['y400']}", None),
        'role-volunteer': (f"background: {t['subtle']}; color: {t['text2']}; border: 1px solid {t['border']}", None),
    }
    st, ic = styles[kind]
    ic_html = icon(ic, 13, 'currentColor', 2.25) if ic else ''
    return (f'<span style="display: inline-flex; align-items: center; gap: 5px; height: 24px; padding: 0 10px; '
            f'border-radius: 999px; font-size: 12px; font-weight: 600; white-space: nowrap; {st}">{ic_html}{text}</span>')

def btn(kind, text, ic=None, full=False, size='md', label=None, href=None, dark=False):
    t = theme(dark)
    h = {'md': 44, 'sm': 36}[size]
    styles = {
        'primary': f"background: {C['r400']}; color: {C['w']}; border: 1px solid {C['r500']}; box-shadow: 0 1px 2px rgba(156,17,40,0.25)",
        'secondary': f"background: {t['surface']}; color: {t['text']}; border: 1px solid {t['strong_border']}; {SHADOW}",
        'danger-outline': f"background: {t['surface']}; color: {C['r500']}; border: 1px solid {C['r400']}",
        'danger': f"background: {C['r600']}; color: {C['w']}; border: 1px solid {C['r600']}",
        'ghost': f"background: transparent; color: {t['text2']}; border: 1px solid transparent",
        'dark': f"background: {C['g900']}; color: {C['w']}; border: 1px solid {C['g900']}",
    }
    pad = '0 14px' if text else '0'
    width = 'width: 100%;' if full else (f'width: {h}px;' if not text else '')
    inner = (icon(ic, 18 if size == 'md' else 16) if ic else '') + (text or '')
    aria = f' aria-label="{label}"' if label else ''
    common = (f"display: inline-flex; align-items: center; justify-content: center; gap: 8px; {width} min-height: {h}px; "
              f"padding: {pad}; border-radius: 6px; font-size: {15 if size == 'md' else 14}px; font-weight: 600; "
              f"text-decoration: none; cursor: pointer; box-sizing: border-box; font-family: inherit; {styles[kind]}")
    if href:
        return f'<a href="{href}"{aria} style="{common}">{inner}</a>'
    return f'<button type="button"{aria} style="{common}">{inner}</button>'

def avatar(initials, size=30, kind='neutral'):
    bg = {'neutral': (C['g300'], C['g800'], C['g400']), 'gold': (C['y500'], C['g900'], C['y400']),
          'red': (C['r400'], C['w'], C['r500'])}[kind]
    return (f'<span style="display: inline-flex; align-items: center; justify-content: center; width: {size}px; height: {size}px; '
            f'border-radius: 999px; background: {bg[0]}; color: {bg[1]}; border: 1px solid {bg[2]}; font-size: {round(size*0.4)}px; '
            f'font-weight: 600; flex: none">{initials}</span>')

def logo(dark=False, compact=False):
    t = theme(dark)
    mark = (f'<span style="display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 7px; '
            f'background: {C["r400"]}; color: {C["w"]}; font-size: 14px; font-weight: 700; letter-spacing: -0.02em; position: relative">qv'
            f'<span style="position: absolute; right: -3px; top: -3px; width: 9px; height: 9px; border-radius: 999px; background: {C["y500"]}; border: 2px solid {t["header"]}"></span></span>')
    return (f'<a href="#" aria-label="Quad Volunteers home" style="display: inline-flex; align-items: center; gap: 10px; text-decoration: none; color: {t["text"]}">'
            f'{mark}<span style="font-size: 17px; font-weight: 600; letter-spacing: -0.01em">Quad Volunteers</span></a>')

USERS = {
    'volunteer': ('MC', 'Maya Chen', 'Volunteer'),
    'organizer': ('JE', 'Jordan Ellis', 'Organizer'),
    'admin': ('PN', 'Priya Natarajan', 'Admin'),
}
NAV = [('Events', 'volunteer'), ('My sign-ups', 'volunteer'), ('Manage events', 'organizer'), ('Manage users', 'admin')]
RANK = {'volunteer': 0, 'organizer': 1, 'admin': 2}

def header_desktop(active, role='volunteer', dark=False):
    t = theme(dark)
    ini, name, rl = USERS[role]
    links = ''
    for label, need in NAV:
        if RANK[role] < RANK[need]:
            continue
        on = label == active
        cur = ' aria-current="page"' if on else ''
        links += (f'<a href="#"{cur} style="display: inline-flex; align-items: center; height: 100%; padding: 0 12px; box-sizing: border-box; '
                  f'border-bottom: 2px solid {C["r400"] if on else "transparent"}; color: {t["text"] if on else t["text2"]}; '
                  f'font-size: 14px; font-weight: {600 if on else 500}; text-decoration: none">{label}</a>')
    picker = (f'<div style="display: flex; align-items: center; gap: 10px">'
              f'<span style="font-size: 13px; color: {t["muted"]}">Viewing as</span>'
              f'<button type="button" aria-haspopup="listbox" aria-label="Viewing as {name}, {rl.lower()}. Change user" '
              f'style="display: inline-flex; align-items: center; gap: 10px; min-height: 40px; padding: 4px 10px 4px 5px; border-radius: 6px; '
              f'border: 1px solid {t["border"]}; background: {t["surface"]}; color: {t["text"]}; font-family: inherit; cursor: pointer; {SHADOW}">'
              f'{avatar(ini, 28, "gold" if role != "volunteer" else "neutral")}'
              f'<span style="display: flex; flex-direction: column; align-items: flex-start; line-height: 1.15">'
              f'<span style="font-size: 13px; font-weight: 600">{name}</span>'
              f'<span style="font-size: 12px; color: {t["muted"]}">{rl}</span></span>'
              f'{icon("chevron-down", 16, t["muted"])}</button></div>')
    return (f'<header style="background: {t["header"]}; border-top: 3px solid {C["r400"]}; border-bottom: 1px solid {t["border"]}">'
            f'<div style="max-width: 1160px; margin: 0 auto; padding: 0 32px; min-height: 64px; display: flex; align-items: stretch; gap: 28px; flex-wrap: wrap">'
            f'<div style="display: flex; align-items: center">{logo(dark)}</div>'
            f'<nav aria-label="Main" style="display: flex; align-items: stretch; gap: 2px">{links}</nav>'
            f'<div style="flex: 1 1 auto"></div>'
            f'<div style="display: flex; align-items: center">{picker}</div>'
            f'</div></header>')

def header_mobile(role='volunteer', dark=False, menu_open=False):
    t = theme(dark)
    ini, name, rl = USERS[role]
    return (f'<header style="background: {t["header"]}; border-top: 3px solid {C["r400"]}; border-bottom: 1px solid {t["border"]}; '
            f'height: 60px; box-sizing: border-box; padding: 0 12px 0 16px; display: flex; align-items: center; gap: 8px">'
            f'{logo(dark)}<div style="flex: 1 1 auto"></div>'
            f'<button type="button" aria-label="Viewing as {name}, {rl.lower()}. Change user" style="display: inline-flex; align-items: center; '
            f'justify-content: center; width: 44px; height: 44px; border: none; background: transparent; cursor: pointer; padding: 0">'
            f'{avatar(ini, 30, "gold" if role != "volunteer" else "neutral")}</button>'
            f'<button type="button" aria-label="{"Close menu" if menu_open else "Open menu"}" aria-expanded="{"true" if menu_open else "false"}" '
            f'style="display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 6px; '
            f'border: 1px solid {t["border"] if not menu_open else t["strong_border"]}; background: {t["surface"]}; color: {t["text"]}; cursor: pointer; padding: 0">'
            f'{icon("x" if menu_open else "menu", 20)}</button></header>')

def capacity_bar(taken, cap, dark=False, height=6):
    t = theme(dark)
    if cap is None:
        return ''
    pct = min(100, round(100 * taken / cap))
    fill = C['g800'] if taken >= cap and not dark else (C['g400'] if taken >= cap else C['y400'])
    return (f'<div role="img" aria-label="{taken} of {cap} spots taken" style="height: {height}px; border-radius: 999px; background: {t["track"]}; overflow: hidden">'
            f'<div style="width: {pct}%; height: 100%; border-radius: 999px; background: {fill}"></div></div>')

def spots_badge(e, dark=False):
    taken, cap = e['taken'], e['cap']
    if e.get('ended'):
        return badge('ended', 'Ended', dark)
    if cap is None:
        return badge('open', 'Open to all', dark)
    left = cap - taken
    if left <= 0:
        return badge('full', 'Full', dark)
    if left <= 3:
        return badge('few', f'Only {left} left' if left > 1 else 'Last spot', dark)
    return badge('plain', f'{left} spots left', dark)

def meta_row(ic, text, dark=False, size=14):
    t = theme(dark)
    return (f'<div style="display: flex; align-items: center; gap: 8px; font-size: {size}px; color: {t["text2"]}">'
            f'{icon(ic, 16, t["muted"])}<span>{text}</span></div>')

def event_card(e, dark=False):
    t = theme(dark)
    top_badge = badge('in', "You're in", dark) if e.get('in') else ''
    taken, cap = e['taken'], e['cap']
    count = f'{taken} of {cap} signed up' if cap is not None else f'{taken} signed up'
    return (f'<a href="#" style="display: flex; flex-direction: column; gap: 14px; padding: 20px; background: {t["surface"]}; '
            f'border: 1px solid {t["border"]}; border-radius: 8px; {SHADOW}; text-decoration: none; color: {t["text"]}; min-width: 0">'
            f'<div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 24px">'
            f'<span style="font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: {t["date"]}">{e["day"]}</span>{top_badge}</div>'
            f'<div style="font-size: 18px; font-weight: 600; line-height: 1.3; letter-spacing: -0.01em">{e["title"]}</div>'
            f'<div style="display: flex; flex-direction: column; gap: 6px">{meta_row("clock", e["time"], dark)}{meta_row("map-pin", e["where"], dark)}</div>'
            f'<div style="display: flex; flex-direction: column; gap: 10px; padding-top: 14px; border-top: 1px solid {t["border"]}; margin-top: auto">'
            f'<div style="display: flex; align-items: center; justify-content: space-between; gap: 8px">'
            f'<span style="font-size: 13px; color: {t["muted"]}">{count}</span>{spots_badge(e, dark)}</div>'
            f'{capacity_bar(taken, cap, dark)}</div></a>')

def field(label, value='', kind='text', error=None, hint=None, placeholder='', required=False, fid='f', textarea=False, dark=False, icon_left=None):
    t = theme(dark)
    border = C['r400'] if error else C['g500']
    req = f' <span aria-hidden="true" style="color: {C["r500"]}">*</span>' if required else ''
    desc_ids = []
    if hint: desc_ids.append(f'{fid}-hint')
    if error: desc_ids.append(f'{fid}-err')
    described = f' aria-describedby="{" ".join(desc_ids)}"' if desc_ids else ''
    inv = ' aria-invalid="true"' if error else ''
    reqa = ' required=""' if required else ''
    pl = f' placeholder="{placeholder}"' if placeholder else ''
    pad_left = '38px' if icon_left else '12px'
    base = (f"width: 100%; box-sizing: border-box; padding: 10px 12px 10px {pad_left}; border: 1px solid {border}; border-radius: 6px; "
            f"background: {t['surface']}; color: {t['text']}; font-size: 15px; font-family: inherit; "
            f"{'box-shadow: 0 0 0 3px ' + C['rtint'] if error else ''}")
    if textarea:
        control = f'<textarea id="{fid}" rows="4"{described}{inv}{pl} style="{base}; min-height: 104px; resize: vertical; line-height: 1.5">{value}</textarea>'
    else:
        control = f'<input id="{fid}" type="{kind}" value="{value}"{described}{inv}{reqa}{pl} style="{base}; min-height: 44px">'
    if icon_left:
        control = (f'<div style="position: relative">'
                   f'<span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); display: flex">{icon(icon_left, 18, t["muted"])}</span>'
                   f'{control}</div>')
    out = (f'<div style="display: flex; flex-direction: column; gap: 6px; min-width: 0">'
           f'<label for="{fid}" style="font-size: 14px; font-weight: 600; color: {t["text"]}">{label}{req}</label>{control}')
    if hint:
        out += f'<span id="{fid}-hint" style="font-size: 13px; color: {t["muted"]}">{hint}</span>'
    if error:
        out += (f'<span id="{fid}-err" style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 500; color: {C["r500"]}">'
                f'{icon("alert", 15, C["r500"])}{error}</span>')
    return out + '</div>'

def message(kind, title, body='', dark=False):
    styles = {
        'success': (C['ytint'], C['y400'], C['g900'], 'check'),
        'error': (C['rtint'], C['r400'], C['r600'], 'alert'),
        'info': (C['w'] if not dark else C['g800'], C['g500'], C['g800'] if not dark else C['g300'], 'info'),
    }
    bg, bd, fg, ic = styles[kind]
    body_html = f'<div style="font-size: 14px; color: {C["g700"] if kind != "error" else C["r600"]}; margin-top: 2px">{body}</div>' if body else ''
    return (f'<div role="status" aria-live="polite" style="display: flex; gap: 10px; align-items: flex-start; padding: 12px 14px; '
            f'border-radius: 6px; border: 1px solid {bd}; background: {bg}; color: {fg}">'
            f'<span style="display: flex; padding-top: 1px">{icon(ic, 18, fg, 2)}</span>'
            f'<div><div style="font-size: 14px; font-weight: 600">{title}</div>{body_html}</div></div>')

def segmented(options, active, dark=False):
    t = theme(dark)
    items = ''
    for o in options:
        on = o == active
        cur = ' aria-current="page"' if on else ''
        items += (f'<a href="#"{cur} style="display: inline-flex; align-items: center; min-height: 36px; padding: 0 14px; border-radius: 5px; '
                  f'font-size: 14px; font-weight: {600 if on else 500}; text-decoration: none; '
                  f'color: {t["text"] if on else t["text2"]}; background: {t["surface"] if on else "transparent"}; '
                  f'{SHADOW + "; border: 1px solid " + t["border"] if on else "border: 1px solid transparent"}">{o}</a>')
    return (f'<nav aria-label="Event timing" style="display: inline-flex; gap: 2px; padding: 3px; border-radius: 7px; '
            f'background: {t["subtle"] if not dark else C["g900"]}; border: 1px solid {t["border"]}">{items}</nav>')

def h1(text, sub=None, dark=False, size=30):
    t = theme(dark)
    s = (f'<div style="display: flex; flex-direction: column; gap: 6px">'
         f'<h1 style="margin: 0; font-size: {size}px; line-height: 1.15; font-weight: 600; letter-spacing: -0.02em; color: {t["text"]}">{text}</h1>')
    if sub:
        s += f'<p style="margin: 0; font-size: 15px; color: {t["muted"]}">{sub}</p>'
    return s + '</div>'

def confirm_box(question, consequence, yes, no, dark=False):
    t = theme(dark)
    return (f'<div role="group" aria-label="{question}" style="display: flex; flex-direction: column; gap: 12px; padding: 14px; border-radius: 8px; '
            f'border: 1px solid {C["r400"]}; background: {C["rtint"]}">'
            f'<div><div style="font-size: 15px; font-weight: 600; color: {C["g900"]}">{question}</div>'
            f'<div style="font-size: 14px; color: {C["g700"]}; margin-top: 2px">{consequence}</div></div>'
            f'<div style="display: flex; gap: 8px; flex-wrap: wrap">{btn("danger", yes)}{btn("secondary", no)}</div></div>')

EVENTS = [
    dict(day='Sat · Oct 10', date='Saturday, October 10', time='9:00 AM – 12:00 PM', title='Arboretum Trail Cleanup',
         where='Campus Arboretum, North Gate', cap=20, taken=7, **{'in': True}),
    dict(day='Tue · Oct 13', date='Tuesday, October 13', time='4:00 – 6:00 PM', title='Food Pantry Restock',
         where='Student Union, Room 214', cap=8, taken=6),
    dict(day='Fri · Oct 16', date='Friday, October 16', time='11:00 AM – 2:00 PM', title='Homecoming Info Booth',
         where='Main Quad', cap=6, taken=6),
    dict(day='Wed · Oct 21', date='Wednesday, October 21', time='10:00 AM – 3:00 PM', title='Blood Drive Check-in',
         where='Recreation Center, Court 2', cap=None, taken=14),
    dict(day='Sat · Oct 24', date='Saturday, October 24', time='8:00 – 11:00 AM', title='Library Book Sale Setup',
         where='Hale Library, Main Lobby', cap=10, taken=3),
    dict(day='Thu · Oct 29', date='Thursday, October 29', time='6:00 – 8:30 PM', title='Tutoring Night: Intro Chem',
         where='Science Hall 120', cap=12, taken=9, **{'in': True}),
]

def page(header, content, dark=False, minh=900):
    t = theme(dark)
    return (f'<div style="min-height: {minh}px; background: {t["bg"]}; color: {t["text"]}">{header}'
            f'<main style="max-width: 1160px; margin: 0 auto; padding: 36px 32px 64px; box-sizing: border-box; display: flex; flex-direction: column; gap: 28px">'
            f'{content}</main></div>')

def mpage(header, content, dark=False):
    t = theme(dark)
    return (f'<div style="background: {t["bg"]}; color: {t["text"]}; min-height: 100%">{header}'
            f'<main style="padding: 20px 16px 40px; display: flex; flex-direction: column; gap: 20px">{content}</main></div>')
