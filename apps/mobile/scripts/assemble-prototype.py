"""Assemble the Expo web export into one self-contained prototype page."""
import base64, glob, os, sys
dist, fonts_root, out = sys.argv[1], sys.argv[2], sys.argv[3]
js_path = glob.glob(os.path.join(dist, '_expo/static/js/web/entry-*.js'))
assert len(js_path) == 1, js_path
js = open(js_path[0], encoding='utf-8').read()
assert js.count('O=/<!--/') == 1 and '</script' not in js.lower()
js = js.replace('O=/<!--/', 'O=/<\\!--/')

FACES = [
    ('Baloo2_800ExtraBold', 'baloo-2/800ExtraBold/Baloo2_800ExtraBold.ttf'),
    ('Baloo2_700Bold', 'baloo-2/700Bold/Baloo2_700Bold.ttf'),
    ('Mukta_400Regular', 'mukta/400Regular/Mukta_400Regular.ttf'),
    ('Mukta_500Medium', 'mukta/500Medium/Mukta_500Medium.ttf'),
    ('Mukta_600SemiBold', 'mukta/600SemiBold/Mukta_600SemiBold.ttf'),
]
faces = []
for family, rel in FACES:
    data = base64.b64encode(open(os.path.join(fonts_root, rel), 'rb').read()).decode()
    faces.append(f"@font-face{{font-family:'{family}';src:url(data:font/ttf;base64,{data}) format('truetype');font-display:block}}")

page = f"""<title>Pawsure Prototype</title>
<style>
/* Single light look on purpose: the app's moodboard palette is light-only. */
:root {{ --canvas: #F4EED8; --ink: #20201D; color-scheme: light }}
html, body {{ height: 100% }}
body {{ overflow: hidden; background: var(--canvas); color: var(--ink); font-family: 'Mukta_400Regular', system-ui, sans-serif }}
#root {{ display: flex; height: 100%; flex: 1 }}
{''.join(faces)}
</style>
<noscript>Pawsure needs JavaScript to run.</noscript>
<div id="root"></div>
<script>{js}</script>
"""
open(out, 'w', encoding='utf-8').write(page)
print(f'wrote {out}: {len(page.encode()) / 1e6:.2f} MB (js {len(js) / 1e6:.2f} MB)')
