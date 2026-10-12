import json, datetime
from gen_lib import *

BOARDS = {}   # name -> (title, w, h, html, desktop?)
ROWS = []     # (row title, [names])

def add(name, title, w, h, body, desktop):
    root = (f"width: 100%; min-height: {h}px" if desktop else f"width: {w}px; min-height: {h}px; overflow: hidden")
    BOARDS[name] = (title, w, h, doc(title, body, w, h, root), desktop)
    return name

# ======================= Foundations =======================
def swatch(hexv, name, role, dark_text=False):
    border = f"border-bottom: 1px solid {C['g400']}" if hexv in (C['w'], C['g300']) else ''
    return (f'<div style="display: flex; flex-direction: column; border: 1px solid {C["g400"]}; border-radius: 8px; overflow: hidden; background: {C["w"]}; {SHADOW}">'
            f'<div style="height: 64px; background: {hexv}; {border}"></div>'
            f'<div style="padding: 10px 12px; display: flex; flex-direction: column; gap: 2px">'
            f'<span style="font-size: 13px; font-weight: 600; color: {C["g900"]}">{name}</span>'
            f'<span style="font-size: 12px; color: {C["g600"]}; font-variant-numeric: tabular-nums">{hexv}</span>'
            f'<span style="font-size: 12px; color: {C["g700"]}">{role}</span></div></div>')

def section(title, inner, note=''):
    n = f'<p style="margin: 0; font-size: 14px; color: {C["g600"]}">{note}</p>' if note else ''
    return (f'<section style="display: flex; flex-direction: column; gap: 14px">'
            f'<div style="display: flex; flex-direction: column; gap: 4px"><h2 style="margin: 0; font-size: 13px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: {C["r500"]}">{title}</h2>{n}</div>'
            f'{inner}</section>')

def grid(cols, inner, gap=12):
    return f'<div style="display: grid; grid-template-columns: repeat({cols}, minmax(0, 1fr)); gap: {gap}px">{inner}</div>'

colors = section('Color', 
    grid(6, swatch(C['r400'], 'Red 400', 'Primary action, brand') + swatch(C['r500'], 'Red 500', 'Hover, date labels') +
         swatch(C['r600'], 'Red 600', 'Pressed, destructive') + swatch(C['y500'], 'Gold 500', 'Highlight: You’re in') +
         swatch(C['y400'], 'Gold 400', 'Capacity fill, borders') + swatch(C['y600'], 'Gold 600', 'Gold on dark')) +
    grid(7, swatch(C['g900'], 'Gray 900', 'Text, dark bg') + swatch(C['g800'], 'Gray 800', 'Dark surface, Full') +
         swatch(C['g700'], 'Gray 700', 'Secondary text') + swatch(C['g600'], 'Gray 600', 'Muted text, icons') +
         swatch(C['g500'], 'Gray 500', 'Input borders') + swatch(C['g400'], 'Gray 400', 'Hairlines') +
         swatch(C['g300'], 'Gray 300', 'Page background')) +
    grid(6, swatch(C['w'], 'White', 'Surfaces') + swatch(C['rtint'], 'Red tint', 'Error, confirm bg (derived)') +
         swatch(C['ytint'], 'Gold tint', 'Success bg (derived)')),
    'Red acts, gold highlights, cool grays carry everything else. Gold is never used for text on white.')

def type_row(sample, spec, style):
    return (f'<div style="display: flex; align-items: baseline; gap: 24px; padding: 12px 0; border-bottom: 1px solid {C["g400"]}">'
            f'<span style="width: 190px; flex: none; font-size: 12px; color: {C["g600"]}">{spec}</span>'
            f'<span style="{style}; color: {C["g900"]}">{sample}</span></div>')

typo = section('Type · Geist',
    f'<div style="background: {C["w"]}; border: 1px solid {C["g400"]}; border-radius: 8px; padding: 8px 20px; {SHADOW}">' +
    type_row('Upcoming events', 'Page title · 30 / 600 / -2%', 'font-size: 30px; font-weight: 600; letter-spacing: -0.02em') +
    type_row('Arboretum Trail Cleanup', 'Card title · 18 / 600', 'font-size: 18px; font-weight: 600') +
    type_row('Help restock shelves before the weekend rush.', 'Body · 15 / 400', 'font-size: 15px') +
    type_row('9:00 AM – 12:00 PM · 7 of 20 signed up', 'Meta · 13–14 / 400, gray 600–700', f'font-size: 14px; color: {C["g700"]}') +
    type_row('SAT · OCT 10', 'Eyebrow · 12 / 600 / +6%, red 500', f'font-size: 12px; font-weight: 600; letter-spacing: 0.06em; color: {C["r500"]}') +
    '</div>')

focus_btn = btn('primary', 'Join this event').replace('style="', f'style="outline: 2px solid {C["g900"]}; outline-offset: 2px; ', 1)
spinner = (f'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
           f'<circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.35)" stroke-width="2.5"></circle>'
           f'<path d="M21 12a9 9 0 0 0-9-9" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"></path></svg>')
pending = (f'<button type="button" disabled="" aria-busy="true" style="display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 14px; '
           f'border-radius: 6px; font-size: 15px; font-weight: 600; font-family: inherit; background: {C["r400"]}; color: {C["w"]}; '
           f'border: 1px solid {C["r500"]}; opacity: 0.8">{spinner}Joining…</button>')
def labelled(lbl, el):
    return f'<div style="display: flex; flex-direction: column; gap: 8px; align-items: flex-start"><span style="font-size: 12px; color: {C["g600"]}">{lbl}</span>{el}</div>'

buttons = section('Buttons · 6px radius, 44px tall',
    f'<div style="display: flex; flex-wrap: wrap; gap: 28px; align-items: flex-end; background: {C["w"]}; border: 1px solid {C["g400"]}; border-radius: 8px; padding: 20px; {SHADOW}">' +
    labelled('Primary', btn('primary', 'Join this event')) + labelled('Focus', focus_btn) + labelled('Pending', pending) +
    labelled('Secondary', btn('secondary', 'Edit event', 'pencil')) + labelled('Danger outline', btn('danger-outline', 'Cancel my spot')) +
    labelled('Danger', btn('danger', 'Delete event')) + labelled('Ghost', btn('ghost', 'Cancel')) +
    labelled('Icon · 36', btn('danger-outline', None, 'trash', size='sm', label='Delete event')) + '</div>',
    'One primary (red) action per view. Focus is a 2px gray-900 ring offset 2px, visible on every fill.')

badges = section('Badges',
    f'<div style="display: flex; flex-wrap: wrap; gap: 10px; background: {C["w"]}; border: 1px solid {C["g400"]}; border-radius: 8px; padding: 20px; {SHADOW}">' +
    badge('in', "You're in") + badge('plain', '13 spots left') + badge('few', 'Only 2 left') + badge('full', 'Full') +
    badge('open', 'Open to all') + badge('ended', 'Ended') + badge('role-admin', 'Admin') + badge('role-organizer', 'Organizer') +
    badge('role-volunteer', 'Volunteer') + '</div>',
    'States differ by lightness and icon, not hue alone.')

forms = section('Inputs & messages',
    f'<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; background: {C["w"]}; border: 1px solid {C["g400"]}; border-radius: 8px; padding: 20px; {SHADOW}">' +
    f'<div style="display: flex; flex-direction: column; gap: 16px">' +
    field('Search', '', placeholder='Title or location', fid='sg-search', icon_left='search') +
    field('Location', '', error='Enter a location.', required=True, fid='sg-loc') +
    field('Capacity', '12', kind='number', hint='Leave empty for unlimited.', fid='sg-cap') + '</div>' +
    f'<div style="display: flex; flex-direction: column; gap: 12px">' +
    message('success', "You're in! See you there.", 'We’ll see you at the North Gate at 9:00 AM.') +
    message('error', 'This event is full.', 'Someone took the last spot a moment before you.') +
    message('info', 'This event has started.', 'Sign-ups and cancellations are closed.') +
    f'<div style="display: flex; flex-direction: column; gap: 8px; padding-top: 6px"><span style="font-size: 13px; color: {C["g700"]}">7 of 20 spots taken</span>{capacity_bar(7, 20)}'
    f'<span style="font-size: 13px; color: {C["g700"]}; margin-top: 6px">6 of 6 spots taken</span>{capacity_bar(6, 6)}</div>' +
    '</div></div>')

cards = section('Card & confirm · 8px radius, hairline border, 1px shadow',
    f'<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; align-items: start">' +
    event_card(EVENTS[0]) + event_card(EVENTS[1]) +
    confirm_box('Cancel your spot?', 'You can join again later if there’s still room.', 'Yes, cancel', 'Keep my spot') + '</div>')

main = (f'<div style="background: {C["g300"]}; padding: 56px; display: flex; flex-direction: column; gap: 44px; box-sizing: border-box; min-height: 2080px">'
        f'<div style="display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap">'
        f'{h1("UI foundations", "Campus red, gold highlights and cool grays. Clean outlines, softened by 6–8px corners and hairline shadows.")}'
        f'{logo()}</div>{colors}{typo}{buttons}{badges}{forms}{cards}</div>')
add('Main.dc.html', 'UI foundations', 1280, 2080, main, False)

# Mobile menu open
def menu_item(label, on=False):
    t = theme()
    cur = ' aria-current="page"' if on else ''
    return (f'<a href="#"{cur} style="display: flex; align-items: center; justify-content: space-between; min-height: 48px; padding: 0 12px; border-radius: 6px; '
            f'text-decoration: none; font-size: 16px; font-weight: {600 if on else 500}; color: {C["r500"] if on else t["text"]}; background: {C["rtint"] if on else "transparent"}">'
            f'{label}{icon("chevron-right", 18, C["r500"] if on else t["muted"])}</a>')
def user_opt(key, sel=False):
    ini, name, rl = USERS[key] if key in USERS else key
    return (f'<li role="option" aria-selected="{"true" if sel else "false"}" style="display: flex; align-items: center; gap: 12px; min-height: 52px; padding: 0 12px; '
            f'border-radius: 6px; background: {C["g300"] if sel else "transparent"}; border: 1px solid {C["g400"] if sel else "transparent"}">'
            f'{avatar(ini, 32, "gold" if rl != "Volunteer" else "neutral")}<span style="display: flex; flex-direction: column; flex: 1 1 auto">'
            f'<span style="font-size: 15px; font-weight: 600">{name}</span><span style="font-size: 13px; color: {C["g600"]}">{rl}</span></span>'
            f'{icon("check", 18, C["r400"], 2.25) if sel else ""}</li>')
menu_body = (f'<div style="background: {C["g300"]}; min-height: 844px; position: relative">{header_mobile(menu_open=True)}'
    f'<div style="position: absolute; left: 0; right: 0; top: 60px; bottom: 0; background: rgba(18,24,28,0.35)"></div>'
    f'<nav aria-label="Main" style="position: absolute; left: 0; right: 0; top: 60px; background: {C["w"]}; border-bottom: 1px solid {C["g400"]}; '
    f'{SHADOW_POP}; padding: 12px 12px 16px; display: flex; flex-direction: column; gap: 4px; border-radius: 0 0 10px 10px">'
    f'{menu_item("Events", True)}{menu_item("My sign-ups")}'
    f'<div style="height: 1px; background: {C["g400"]}; margin: 10px 0"></div>'
    f'<div style="font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: {C["g600"]}; padding: 0 12px 6px">Viewing as</div>'
    f'<ul role="listbox" aria-label="Viewing as" style="list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px">'
    f'{user_opt("volunteer", True)}{user_opt(("SR", "Sam Rivera", "Volunteer"))}{user_opt("organizer")}{user_opt("admin")}</ul>'
    f'<p style="margin: 8px 12px 0; font-size: 12px; color: {C["g600"]}">Stand-in for sign-in until accounts exist.</p></nav></div>')
add('MobileMenu.dc.html', 'Mobile menu · viewing as', 390, 844, menu_body, False)
ROWS.append(('Foundations', ['Main.dc.html', 'MobileMenu.dc.html']))

# ======================= Events list =======================
def filters_desktop(dark=False):
    t = theme(dark)
    return (f'<form role="search" style="display: flex; flex-wrap: wrap; gap: 14px; align-items: flex-end; padding: 16px; background: {t["surface"]}; '
            f'border: 1px solid {t["border"]}; border-radius: 8px; {SHADOW}">'
            f'<div style="flex: 3 1 280px; min-width: 0">{field("Search", "", placeholder="Title or location", fid="q", icon_left="search", dark=dark)}</div>'
            f'<div style="flex: 1 1 150px; min-width: 0">{field("From", "", kind="date", fid="from", dark=dark)}</div>'
            f'<div style="flex: 1 1 150px; min-width: 0">{field("To", "", kind="date", fid="to", dark=dark)}</div>'
            f'{btn("secondary", "Search", "search", dark=dark)}</form>')

def events_desktop(dark=False):
    t = theme(dark)
    head = (f'<div style="display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; flex-wrap: wrap">'
            f'{h1("Upcoming events", "Find a way to help out on campus this term.", dark)}{segmented(["Upcoming", "Past"], "Upcoming", dark)}</div>')
    count = f'<div style="font-size: 14px; color: {t["muted"]}; margin-bottom: -12px">6 upcoming events</div>'
    cards_html = ''.join(event_card(e, dark) for e in EVENTS)
    grid_html = f'<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px">{cards_html}</div>'
    return page(header_desktop('Events', dark=dark), head + filters_desktop(dark) + count + grid_html, dark, 1150)

add('EventsDesktop.dc.html', 'Events list · desktop', 1280, 1150, events_desktop(), True)

m_head = (f'{h1("Upcoming events", None, size=26)}'
          f'<div style="display: flex; flex-direction: column; gap: 12px">{segmented(["Upcoming", "Past"], "Upcoming")}'
          f'<form role="search" style="display: flex; flex-direction: column; gap: 10px">'
          f'{field("Search events", "", placeholder="Title or location", fid="mq", icon_left="search")}'
          f'<div style="display: flex; gap: 8px">{btn("secondary", "Any date", "calendar", size="sm")}{btn("secondary", "Search", size="sm")}</div></form></div>')
m_cards = f'<div style="display: flex; flex-direction: column; gap: 14px">{"".join(event_card(e) for e in EVENTS[:4])}</div>'
add('EventsMobile.dc.html', 'Events list · mobile', 390, 1420, mpage(header_mobile(), m_head + m_cards), False)

empty = (f'<div style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; padding: 36px 20px; background: {C["w"]}; '
         f'border: 1px dashed {C["g500"]}; border-radius: 8px">'
         f'<span style="display: inline-flex; align-items: center; justify-content: center; width: 52px; height: 52px; border-radius: 999px; background: {C["g300"]}; border: 1px solid {C["g400"]}">{icon("calendar-x", 24, C["g600"])}</span>'
         f'<div style="font-size: 17px; font-weight: 600">No events match “pottery”</div>'
         f'<p style="margin: 0; font-size: 14px; color: {C["g600"]}; max-width: 260px">Try a different word, or clear your search to see every upcoming event.</p>'
         f'{btn("secondary", "Clear search", "x", size="sm")}</div>')
m_empty_head = (f'{h1("Upcoming events", None, size=26)}'
          f'<div style="display: flex; flex-direction: column; gap: 12px">{segmented(["Upcoming", "Past"], "Upcoming")}'
          f'<form role="search" style="display: flex; flex-direction: column; gap: 10px">'
          f'{field("Search events", "pottery", fid="mq2", icon_left="search")}'
          f'<div style="display: flex; gap: 8px; align-items: center">{btn("secondary", "Any date", "calendar", size="sm")}{btn("secondary", "Search", size="sm")}'
          f'<a href="#" style="margin-left: auto; font-size: 14px; font-weight: 500">Clear</a></div></form></div>')
add('EventsMobileEmpty.dc.html', 'Events list · no results', 390, 844, mpage(header_mobile(), m_empty_head + empty), False)
add('EventsDesktopDark.dc.html', 'Events list · desktop dark', 1280, 1150, events_desktop(True), True)
ROWS.append(('Events list', ['EventsDesktop.dc.html', 'EventsMobile.dc.html', 'EventsMobileEmpty.dc.html', 'EventsDesktopDark.dc.html']))

# ======================= Event detail =======================
BOOK = dict(EVENTS[4]); ARB = dict(EVENTS[0]); HOME = dict(EVENTS[2])
PAST = dict(day='Sat · Aug 22', date='Saturday, August 22', time='8:00 AM – 1:00 PM', title='Welcome Week Move-in Crew',
            where='East Residence Halls', cap=20, taken=18, ended=True)
DESC = {
    BOOK['title']: ['Help the Friends of Hale Library set up for the fall book sale. We’ll unpack donated boxes, sort books by genre and arrange tables in the main lobby.',
                    'Wear comfortable shoes; there’s some lifting. Coffee and pastries provided.'],
    ARB['title']: ['Join Campus Sustainability for a morning on the arboretum trails: clearing litter, pulling invasive ivy and refreshing mulch on the loop path.',
                   'Gloves, bags and tools are provided. Bring water and dress for the weather.'],
    HOME['title']: ['Staff the info booth during Homecoming weekend. Point alumni to events, hand out maps and answer questions about campus today.'],
    PAST['title']: ['Help first-year students carry boxes, find their rooms and settle in during Welcome Week.'],
}

def back_link():
    return (f'<a href="#" style="display: inline-flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 500; text-decoration: none; '
            f'color: {C["g700"]}; min-height: 32px">{icon("arrow-left", 16)}All events</a>')

def detail_info(e, title_size=34):
    paras = ''.join(f'<p style="margin: 0; font-size: 15px; line-height: 1.6; color: {C["g700"]}">{p}</p>' for p in DESC[e['title']])
    return (f'<div style="display: flex; flex-direction: column; gap: 14px">'
            f'<span style="font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: {C["r500"]}">{e["day"]}</span>'
            f'<h1 style="margin: 0; font-size: {title_size}px; line-height: 1.15; font-weight: 600; letter-spacing: -0.02em">{e["title"]}</h1>'
            f'<div style="display: flex; flex-direction: column; gap: 8px; margin-top: 4px">{meta_row("calendar", e["date"], size=15)}'
            f'{meta_row("clock", e["time"], size=15)}{meta_row("map-pin", e["where"], size=15)}</div></div>',
            f'<section style="display: flex; flex-direction: column; gap: 10px"><h2 style="margin: 0; font-size: 18px; font-weight: 600">About this event</h2>{paras}</section>')

def capacity_block(e):
    taken, cap = e['taken'], e['cap']
    return (f'<div style="display: flex; flex-direction: column; gap: 10px">'
            f'<div style="display: flex; align-items: center; justify-content: space-between; gap: 8px">'
            f'<span style="font-size: 14px; color: {C["g700"]}"><strong style="color: {C["g900"]}; font-weight: 600">{taken} of {cap}</strong> spots taken</span>'
            f'{badge("in", "You’re in") if e.get("in") else spots_badge(e)}</div>{capacity_bar(taken, cap, height=8)}</div>')

def action_card(inner):
    return (f'<div style="display: flex; flex-direction: column; gap: 16px; padding: 20px; background: {C["w"]}; border: 1px solid {C["g400"]}; '
            f'border-radius: 8px; {SHADOW}">{inner}</div>')

def note(text):
    return f'<p style="margin: 0; font-size: 13px; color: {C["g600"]}">{text}</p>'

join_inner = capacity_block(BOOK) + btn('primary', 'Join this event', full=True) + note('You can cancel any time before the event starts.')

def detail_desktop(e, side, extra_left='', role='volunteer', minh=900):
    top, about = detail_info(e)
    layout = (f'<div style="display: flex; flex-wrap: wrap; gap: 40px; align-items: flex-start">'
              f'<div style="flex: 999 1 560px; min-width: 0; display: flex; flex-direction: column; gap: 28px">{top}{about}{extra_left}</div>'
              f'<aside style="flex: 1 1 320px; min-width: 0; display: flex; flex-direction: column; gap: 16px">{side}</aside></div>')
    hdr = header_desktop('Events' if role == 'volunteer' else 'Manage events', role=role)
    return page(hdr, back_link() + layout, minh=minh)

add('DetailDesktop.dc.html', 'Event detail · desktop · can join', 1280, 900, detail_desktop(BOOK, action_card(join_inner)), True)

VOLS = [('MC', 'Maya Chen', 'maya.chen@campus.edu', 'Sep 21'), ('LP', 'Lena Park', 'lena.park@campus.edu', 'Sep 22'),
        ('DA', 'Diego Alvarez', 'diego.alvarez@campus.edu', 'Sep 24'), ('AB', 'Aisha Bello', 'aisha.bello@campus.edu', 'Sep 25'),
        ('NF', 'Noah Fischer', 'noah.fischer@campus.edu', 'Sep 27'), ('GM', 'Grace Mbeki', 'grace.mbeki@campus.edu', 'Sep 30'),
        ('SR', 'Sam Rivera', 'sam.rivera@campus.edu', 'Oct 1')]
th = f'text-align: left; font-size: 12px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: {C["g600"]}; padding: 10px 16px; border-bottom: 1px solid {C["g400"]}; background: {C["g300"]}'
td = f'padding: 12px 16px; border-bottom: 1px solid {C["g400"]}; font-size: 14px; color: {C["g700"]}; vertical-align: middle'
def table(head_cells, rows_html, minw=640):
    heads = ''.join(f'<th scope="col" style="{th}{"; text-align: right" if h.startswith("~") else ""}">{h.lstrip("~") or "<span style=" + chr(34) + "position: absolute; width: 1px; height: 1px; overflow: hidden" + chr(34) + ">Actions</span>"}</th>' for h in head_cells)
    return (f'<div style="overflow-x: auto; background: {C["w"]}; border: 1px solid {C["g400"]}; border-radius: 8px; {SHADOW}">'
            f'<table style="width: 100%; min-width: {minw}px; border-collapse: collapse"><thead><tr>{heads}</tr></thead><tbody>{rows_html}</tbody></table></div>')
vol_rows = ''.join(
    f'<tr><td style="{td}"><span style="display: inline-flex; align-items: center; gap: 10px; color: {C["g900"]}; font-weight: 500">{avatar(i, 28)}{n}</span></td>'
    f'<td style="{td}">{m}</td><td style="{td}">{d}</td>'
    f'<td style="{td}; text-align: right">{btn("ghost", "Remove", "user-x", size="sm", label="Remove " + n + " from this event")}</td></tr>'
    for i, n, m, d in VOLS)
vol_section = (f'<section style="display: flex; flex-direction: column; gap: 12px">'
               f'<div style="display: flex; align-items: baseline; justify-content: space-between"><h2 style="margin: 0; font-size: 18px; font-weight: 600">Volunteers <span style="color: {C["g600"]}; font-weight: 500">(7)</span></h2>'
               f'<span style="font-size: 13px; color: {C["g600"]}">Only organizers and admins see this list</span></div>'
               f'{table(["Name", "Email", "Signed up", "~"], vol_rows)}</section>')
staff_side = (action_card(capacity_block(dict(ARB, **{'in': False})) + note('Volunteers see the count only.')) +
              action_card(f'<h2 style="margin: 0; font-size: 15px; font-weight: 600">Organizer tools</h2>'
                          f'<div style="display: flex; gap: 8px; flex-wrap: wrap">{btn("secondary", "Edit event", "pencil")}{btn("danger-outline", "Delete event", "trash")}</div>' +
                          confirm_box('Delete this event?', '7 volunteers are signed up. Their sign-ups will be removed too.', 'Delete event', 'Keep event')))
add('DetailDesktopStaff.dc.html', 'Event detail · desktop · organizer', 1280, 1300,
    detail_desktop(ARB, staff_side, vol_section, role='organizer', minh=1300), True)

def detail_mobile(e, action_html, pre=''):
    top, about = detail_info(e, 26)
    return mpage(header_mobile(), back_link() + top + pre + action_html + about)

add('DetailMobileJoin.dc.html', 'Detail · mobile · can join', 390, 960, detail_mobile(BOOK, action_card(join_inner)), False)
in_card = action_card(capacity_block(ARB) + confirm_box('Cancel your spot?', 'You can join again later if there’s still room.', 'Yes, cancel', 'Keep my spot'))
add('DetailMobileIn.dc.html', 'Detail · mobile · you’re in + cancel', 390, 1080,
    detail_mobile(ARB, in_card, message('success', 'You’re in! See you there.', 'Meet at the North Gate at 9:00 AM.')), False)
full_card = action_card(capacity_block(HOME) +
    f'<div style="display: flex; flex-direction: column; gap: 4px"><div style="font-size: 15px; font-weight: 600">This event is full</div>'
    f'{note("Spots open up if someone cancels, so check back later.")}</div>' + btn('secondary', 'Browse other events', full=True, href='#'))
add('DetailMobileFull.dc.html', 'Detail · mobile · full (409)', 390, 1000,
    detail_mobile(HOME, full_card, message('error', 'The last spot was just taken.', 'Someone joined a moment before you.')), False)
ended_card = action_card(f'<div style="display: flex; align-items: center; justify-content: space-between; gap: 8px">'
    f'<span style="font-size: 14px; color: {C["g700"]}"><strong style="color: {C["g900"]}; font-weight: 600">18 volunteers</strong> helped out</span>{badge("ended", "Ended")}</div>' +
    message('info', 'This event has ended.', 'Sign-ups and cancellations are closed.'))
PAST_E = dict(PAST)
add('DetailMobileEnded.dc.html', 'Detail · mobile · ended', 390, 860, detail_mobile(PAST_E, ended_card), False)
ROWS.append(('Event detail', ['DetailDesktop.dc.html', 'DetailDesktopStaff.dc.html', 'DetailMobileJoin.dc.html',
                              'DetailMobileIn.dc.html', 'DetailMobileFull.dc.html', 'DetailMobileEnded.dc.html']))

# ======================= My sign-ups =======================
def date_tile(month, day):
    return (f'<div aria-hidden="true" style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 56px; height: 60px; flex: none; '
            f'border: 1px solid {C["g400"]}; border-radius: 6px; background: {C["w"]}">'
            f'<span style="font-size: 11px; font-weight: 600; letter-spacing: 0.08em; color: {C["r500"]}">{month}</span>'
            f'<span style="font-size: 22px; font-weight: 600; line-height: 1.1; color: {C["g900"]}">{day}</span></div>')

def signup_row(e, month, day, mobile=False):
    actions = (f'<div style="display: flex; gap: 8px; flex-wrap: wrap{"" if mobile else "; justify-content: flex-end"}">'
               f'{btn("secondary", "View", size="sm", href="#")}{btn("danger-outline", "Cancel my spot", size="sm")}</div>')
    info = (f'<div style="display: flex; flex-direction: column; gap: 6px; min-width: 0; flex: 1 1 240px">'
            f'<a href="#" style="font-size: 17px; font-weight: 600; color: {C["g900"]}; text-decoration: none">{e["title"]}</a>'
            f'{meta_row("clock", e["day"].split(" · ")[0] + ", " + e["time"])}{meta_row("map-pin", e["where"])}</div>')
    return (f'<li style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center; padding: 16px; background: {C["w"]}; border: 1px solid {C["g400"]}; '
            f'border-radius: 8px; {SHADOW}"><div style="display: flex; gap: 16px; align-items: center; flex: 999 1 300px; min-width: 0">{date_tile(month, day)}{info}</div>{actions}</li>')

def past_details(n=5):
    return (f'<details style="background: {C["w"]}; border: 1px solid {C["g400"]}; border-radius: 8px; {SHADOW}">'
            f'<summary style="display: flex; align-items: center; justify-content: space-between; min-height: 52px; padding: 0 16px; cursor: pointer; '
            f'font-size: 15px; font-weight: 600; color: {C["g900"]}; list-style: none"><span style="display: inline-flex; align-items: center; gap: 10px">'
            f'{icon("history", 18, C["g600"])}Past events <span style="color: {C["g600"]}; font-weight: 500">({n})</span></span>{icon("chevron-down", 18, C["g600"])}</summary>'
            f'<div style="padding: 0 16px 16px; font-size: 14px; color: {C["g600"]}">Welcome Week Move-in Crew · Aug 22</div></details>')

def section_title(text, count):
    return f'<h2 style="margin: 0; font-size: 18px; font-weight: 600">{text} <span style="color: {C["g600"]}; font-weight: 500">({count})</span></h2>'

up_rows = signup_row(EVENTS[0], 'OCT', '10') + signup_row(EVENTS[5], 'OCT', '29')
signups_d = (h1('My sign-ups', 'Events you’ve joined as Maya Chen.') +
             f'<section style="display: flex; flex-direction: column; gap: 12px">{section_title("Upcoming", 2)}'
             f'<ul style="list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px">{up_rows}</ul></section>' + past_details())
add('SignupsDesktop.dc.html', 'My sign-ups · desktop', 1280, 760, page(header_desktop('My sign-ups'), signups_d, minh=760), True)

up_rows_m = signup_row(EVENTS[0], 'OCT', '10', True) + signup_row(EVENTS[5], 'OCT', '29', True)
signups_m = (h1('My sign-ups', None, size=26) + message('success', 'Your spot was cancelled.', 'You’re no longer signed up for Food Pantry Restock.') +
             f'<section style="display: flex; flex-direction: column; gap: 12px">{section_title("Upcoming", 2)}'
             f'<ul style="list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px">{up_rows_m}</ul></section>' + past_details())
add('SignupsMobile.dc.html', 'My sign-ups · mobile', 390, 900, mpage(header_mobile(), signups_m), False)

empty_su = (f'<div style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; padding: 40px 20px; background: {C["w"]}; '
            f'border: 1px dashed {C["g500"]}; border-radius: 8px">'
            f'<span style="display: inline-flex; align-items: center; justify-content: center; width: 52px; height: 52px; border-radius: 999px; background: {C["ytint"]}; border: 1px solid {C["y400"]}">{icon("calendar-check", 24, C["g900"])}</span>'
            f'<div style="font-size: 17px; font-weight: 600">You haven’t joined any events yet</div>'
            f'<p style="margin: 0; font-size: 14px; color: {C["g600"]}; max-width: 260px">Find something that fits your schedule. Most events take two to three hours.</p>'
            f'{btn("primary", "Browse events", href="#")}</div>')
add('SignupsMobileEmpty.dc.html', 'My sign-ups · empty', 390, 844,
    mpage(header_mobile(), h1('My sign-ups', None, size=26) + empty_su), False)
ROWS.append(('My sign-ups', ['SignupsDesktop.dc.html', 'SignupsMobile.dc.html', 'SignupsMobileEmpty.dc.html']))

# ======================= Manage =======================
def page_head(title, sub, action):
    return (f'<div style="display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; flex-wrap: wrap">'
            f'{h1(title, sub)}{action}</div>')

def mini_bar(e):
    if e['cap'] is None:
        return f'<span style="font-size: 14px; color: {C["g700"]}">{e["taken"]} · no limit</span>'
    return (f'<div style="display: flex; align-items: center; gap: 10px"><span style="font-size: 14px; color: {C["g900"]}; font-weight: 500; '
            f'font-variant-numeric: tabular-nums; width: 46px">{e["taken"]} / {e["cap"]}</span>'
            f'<div style="width: 80px">{capacity_bar(e["taken"], e["cap"])}</div></div>')

ev_rows = ''.join(
    f'<tr><td style="{td}"><a href="#" style="display: block; font-weight: 600; color: {C["g900"]}; text-decoration: none">{e["title"]}</a>'
    f'<span style="font-size: 13px; color: {C["g600"]}">{e["where"]}</span></td>'
    f'<td style="{td}; white-space: nowrap"><span style="color: {C["g900"]}">{e["day"].replace(" · ", ", ")}</span><br>'
    f'<span style="font-size: 13px; color: {C["g600"]}">{e["time"]}</span></td>'
    f'<td style="{td}">{mini_bar(e)}</td>'
    f'<td style="{td}; text-align: right; white-space: nowrap"><span style="display: inline-flex; gap: 8px">{btn("secondary", "Edit", "pencil", size="sm", href="#")}'
    f'{btn("danger-outline", None, "trash", size="sm", label="Delete " + e["title"])}</span></td></tr>' for e in EVENTS)
manage_ev = (page_head('Manage events', 'Create, edit and remove volunteer events.', btn('primary', 'New event', 'plus', href='#')) +
             message('success', 'Event saved.', 'Arboretum Trail Cleanup was updated.') +
             f'<div>{segmented(["Upcoming", "Past"], "Upcoming")}</div>' + table(['Event', 'Date', 'Sign-ups', '~'], ev_rows, 760))
add('ManageEventsDesktop.dc.html', 'Manage events · desktop', 1280, 960,
    page(header_desktop('Manage events', role='organizer'), manage_ev, minh=960), True)

def event_form(mobile=False):
    t = theme()
    row = 'display: flex; flex-wrap: wrap; gap: 16px'
    col = 'flex: 1 1 220px; min-width: 0'
    summary = message('error', 'Please fix 3 problems before saving.',
                      f'<a href="#location">Location</a> · <a href="#ends">Ends</a> · <a href="#capacity">Capacity</a>')
    fields_html = (field('Title', 'Arboretum Trail Cleanup', required=True, fid='title') +
                   field('Location', '', required=True, error='Enter a location.', fid='location') +
                   f'<div style="{row}"><div style="{col}">{field("Starts", "2026-10-10T09:00", kind="datetime-local", required=True, fid="starts")}</div>'
                   f'<div style="{col}">{field("Ends", "2026-10-10T08:00", kind="datetime-local", required=True, error="End time must be after the start.", fid="ends")}</div></div>' +
                   f'<p style="margin: -6px 0 0; display: flex; align-items: center; gap: 6px; font-size: 13px; color: {C["g600"]}">{icon("info", 15, C["g600"])}Times are in your time zone: America/Chicago</p>' +
                   f'<div style="max-width: 220px">{field("Capacity", "5", kind="number", hint="Leave empty for unlimited.", error="Can’t be lower than the 7 people already signed up.", fid="capacity")}</div>' +
                   field('Description', DESC[ARB['title']][0], textarea=True, fid='desc'))
    actions = (f'<div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap; padding-top: 18px; border-top: 1px solid {C["g400"]}">'
               f'{btn("primary", "Save changes", full=mobile)}{btn("ghost", "Cancel", href="#", full=mobile)}</div>')
    return (f'<form novalidate="" style="display: flex; flex-direction: column; gap: 20px; padding: {20 if mobile else 28}px; background: {C["w"]}; '
            f'border: 1px solid {C["g400"]}; border-radius: 8px; {SHADOW}">{summary}{fields_html}{actions}</form>')

crumbs = (f'<nav aria-label="Breadcrumb" style="display: flex; align-items: center; gap: 6px; font-size: 14px; color: {C["g600"]}">'
          f'<a href="#" style="text-decoration: none; font-weight: 500">Manage events</a>{icon("chevron-right", 14, C["g500"])}<span aria-current="page">Edit event</span></nav>')
form_d = crumbs + h1('Edit event', 'Arboretum Trail Cleanup · 7 volunteers signed up') + f'<div style="max-width: 760px; width: 100%">{event_form()}</div>'
add('EventFormDesktop.dc.html', 'Event form · desktop · errors', 1280, 1180,
    page(header_desktop('Manage events', role='organizer'), form_d, minh=1180), True)

USERS_LIST = [('AB', 'Aisha Bello', 'aisha.bello@campus.edu', 'volunteer'), ('DA', 'Diego Alvarez', 'diego.alvarez@campus.edu', 'volunteer'),
              ('GM', 'Grace Mbeki', 'grace.mbeki@campus.edu', 'organizer'), ('JE', 'Jordan Ellis', 'jordan.ellis@campus.edu', 'organizer'),
              ('LP', 'Lena Park', 'lena.park@campus.edu', 'volunteer'), ('MC', 'Maya Chen', 'maya.chen@campus.edu', 'volunteer'),
              ('NF', 'Noah Fischer', 'noah.fischer@campus.edu', 'volunteer'), ('PN', 'Priya Natarajan', 'priya.natarajan@campus.edu', 'admin')]
u_rows = ''.join(
    f'<tr><td style="{td}"><span style="display: inline-flex; align-items: center; gap: 10px; color: {C["g900"]}; font-weight: 500">'
    f'{avatar(i, 30, "gold" if r != "volunteer" else "neutral")}{n}{" <span style=" + chr(34) + "font-size: 12px; color: " + C["g600"] + chr(34) + ">(you)</span>" if r == "admin" else ""}</span></td>'
    f'<td style="{td}">{m}</td><td style="{td}">{badge("role-" + r, r.capitalize())}</td>'
    f'<td style="{td}; text-align: right; white-space: nowrap"><span style="display: inline-flex; gap: 8px">{btn("secondary", "Edit", "pencil", size="sm", href="#")}'
    f'{btn("danger-outline", None, "trash", size="sm", label="Delete " + n)}</span></td></tr>' for i, n, m, r in USERS_LIST)
users_d = page_head('Manage users', '8 people · roles control what each person can manage.', btn('primary', 'New user', 'plus', href='#')) + table(['Name', 'Email', 'Role', '~'], u_rows, 720)
add('UsersDesktop.dc.html', 'Manage users · desktop', 1280, 900, page(header_desktop('Manage users', role='admin'), users_d, minh=900), True)

form_m = crumbs + h1('Edit event', None, size=26) + event_form(True)
add('EventFormMobile.dc.html', 'Event form · mobile · errors', 390, 1500, mpage(header_mobile('organizer'), form_m), False)

na = (f'<div style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 14px; padding: 44px 20px; background: {C["w"]}; '
      f'border: 1px solid {C["g400"]}; border-radius: 8px; {SHADOW}; margin-top: 24px">'
      f'<span style="display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 999px; background: {C["rtint"]}; border: 1px solid {C["r400"]}">{icon("lock", 24, C["r500"])}</span>'
      f'<h1 style="margin: 0; font-size: 22px; font-weight: 600; letter-spacing: -0.01em">This page is for organizers</h1>'
      f'<p style="margin: 0; font-size: 15px; color: {C["g600"]}; max-width: 280px">You’re viewing as Maya Chen, a volunteer. Switch to an organizer from the menu to manage events.</p>'
      f'{btn("secondary", "Back to events", "arrow-left", href="#")}</div>')
add('NotAllowedMobile.dc.html', 'Not allowed · mobile', 390, 844, mpage(header_mobile(), na), False)
ROWS.append(('Manage', ['ManageEventsDesktop.dc.html', 'EventFormDesktop.dc.html', 'UsersDesktop.dc.html',
                        'EventFormMobile.dc.html', 'NotAllowedMobile.dc.html']))

# ======================= canvas.json =======================
boards, order, notes = {}, [], {}
y = 0
for idx, (rtitle, names) in enumerate(ROWS):
    x = 0
    maxh = 0
    for n in names:
        title, w, h, html, desktop = BOARDS[n]
        entry = {'x': x, 'y': y, 'w': w, 'h': h, 'title': title}
        if desktop:
            entry['expand'] = 'fill'
        boards[n] = entry
        order.append(n)
        x += w + 80
        maxh = max(maxh, h)
        open(f'out/project/{n}', 'w').write(html)
    notes[f'row{idx}'] = {'x': 0, 'y': y - 260, 'text': rtitle, 'kind': 'title1', 'maxW': x - 80}
    y += maxh + 120 + 300

canvas = {'v': 3, 'createdOnFiles': {'v': 1, 'at': datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')},
          'title': 'Quad Volunteers mockups', 'launch': {'view': 'canvas'}, 'pages': [],
          'boards': boards, 'order': order, 'notes': notes, 'designSystems': []}
json.dump(canvas, open('out/project/canvas.json', 'w'), indent=2)
print(len(boards), 'boards')
for n in order: print(n, len(BOARDS[n][3]))
