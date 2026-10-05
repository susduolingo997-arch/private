"""Episode 8 soundtrack (generic): reuses the synth library and narration mixer from ../audio.py."""
src = open('../audio.py').read()
exec(src[:src.index("C, G_, F_, Am, Em, Dm = ")])
MIX = src[src.index("# ---------------------------------------------------------------- narration with overlap shifting"):]
C, G_, F_, Am = (0, 'M'), (7, 'M'), (5, 'M'), (9, 'm')
F0, LG = E['freeze'], E['logo']
mput(s_fanfare(), E['titleIn'], 0.7)
track(4.6, 70, 112, 62, [C, G_, Am, F_], seed=101, gain=0.36, drums=1, wave='tri')
track(70, 140, 132, 65, [C, F_, G_, C], seed=102, gain=0.38, drums=2)
pad(140, 175, [57, 60, 64], 0.28, 900); bells(141, 174, 57, 'min', 1.4, seed=103, gain=0.18)
track(175, 235, 150, 52, [(0, 'm'), (3, 'M'), (5, 'm'), (6, 'M')], mode='min', seed=104, gain=0.42, drums=2, lead=2, wave='saw')
track(235, F0 - 0.2, 100, 60, [C, Am, F_, G_], seed=105, gain=0.32, drums=1, wave='tri')
put(s_scratch(), F0 - 0.1, 1.0)
track(F0 + 1.2, LG, 110, 64, [(0, 'M'), (5, 'M'), (7, 'M'), (0, 'M')], seed=106, gain=0.3, drums=1, wave='tri', swing=0.25)
put(s_whoosh(0.8, 300, 6000), LG - 0.3, 0.8); mput(s_fanfare(), LG + 0.2, 0.7)
track(LG + 2.3, 299.6, 120, 60, [C, Am, F_, G_], seed=107, gain=0.4, drums=2)
for i in range(9): put(s_thock(), LG + 0.5 + i * 0.12, 0.5)
put(s_click(), 296.2, 1.0); put(s_ding(), 296.3, 0.6)
exec(MIX)
