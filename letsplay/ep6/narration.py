import sys, os, json
sys.path.insert(0, '..')
LINES = [
 (0.6,1.12,"HEY HEY HEY, welcome back to Shardwild! Episode six! That's our old bunker. It's a fountain now."),
 (7.6,1.1,"And Leggy is still soaking wet. She's been shivering for two days. Look at her. Little drippy noodle."),
 (14.6,1.1,"So today we fix everything. We need a house that is warm, dry, and impossible to flood."),
 (20.4,1.1,"Bloop brought fire bricks. One hundred percent fireproof. It says so on the sticker."),
 (26.0,1.0,"And where do you put a fireproof house? ...Inside. A. Volcano."),
 (30.6,1.15,"Road trip! Okay, more of a road walk. A road stroll."),
 (34.6,1.1,"Ooh, it's getting warmer already. Leggy stopped shivering. Look at her strut!"),
 (40.2,1.1,"Hmm. My shoes are making toast noises. Is that normal? Chat, is that normal?"),
 (45.6,1.1,"Chat says my shoes are on fire. Chat is being dramatic."),
 (50.4,1.05,"There it is. The volcano. Our new home. Look how majestic it is."),
 (55.4,1.12,"Volcanoes don't flood. Volcanoes don't fall. They're basically big, warm mountains. Science!"),
 (62.4,1.2,"WHOA. Look at that view! It's a hot tub the size of a city!"),
 (66.8,1.15,"Okay, building time! Bloop, hit me with those fire bricks!"),
 (70.8,1.1,"Bloop's doing the walls. I'm, uh, supervising. With my mallet. Very hard work."),
 (76.4,1.1,"A door that faces the lava. Because every great house needs a lava view."),
 (81.0,1.1,"And a chimney! On a volcano. Is that redundant? Don't answer that."),
 (86.4,1.1,"Behold... the LAVA LODGE. Free heating. Forever."),
 (91.0,1.05,"Bloop set up a heat-o-meter. Let's check the temperature. It says..."),
 (95.6,1.05,"...it says FINE. He put a sticky note on it. Thank you, Bloop. Very scientific."),
 (100.6,1.2,"Wait, something just jumped out of the lava! What is that?!"),
 (104.6,1.15,"It's a little rock guy! He's on fire! He's adorable! Hello, little guy!"),
 (109.4,1.05,"I'm calling him Puff. Puff, can I pet you? I'm gonna pet you."),
 (113.2,1.3,"OW! OW! HOT! MY HAND! MY HAND IS A TORCH!"),
 (117.0,1.05,"Okay. Lesson learned. Puff is not for petting."),
 (121.2,1.2,"Bloop, your blueprints! He's eating the blueprints! He's eating the whole plan!"),
 (126.4,1.1,"And now he's riding on Leggy's head. They're best friends now. I've been replaced."),
 (132.4,1.1,"Is it just me, or is it getting really, REALLY hot in here?"),
 (136.6,1.25,"The heat-o-meter EXPLODED! Bloop, your hat is melting! It's a beret now!"),
 (141.2,1.15,"I have an idea. Frost blocks. A giant fan. Air conditioning for the whole volcano!"),
 (146.6,1.15,"Introducing... the Chill-o-Matic three thousand! Switch it on!"),
 (151.0,1.2,"Look at that! The lava is freezing over! I turned off a volcano! I'm a genius!"),
 (156.2,1.05,"Nice and cool. Nice and comfy. Chat, I would like an apology."),
 (160.6,1.0,"Hm? Puff? Puff, why are you turning blue?"),
 (164.4,1.05,"Uh oh. He's shivering. Leggy's shivering again too. And she's giving me a look."),
 (169.6,1.05,"That's a mean look, Leggy. That is a very mean look."),
 (173.6,0.95,"...Did the floor just growl?"),
 (176.4,1.1,"Wait. When Puff is warm, the volcano is calm. When Puff is cold..."),
 (181.4,1.2,"Puff doesn't live IN the volcano. Puff is the volcano's PILOT LIGHT! And I switched him off!"),
 (188.0,1.15,"And the crust is trapping all the heat underneath. Like a lid on a pot!"),
 (192.6,1.3,"Turn it off! Unplug the fan! UNPLUG IT!"),
 (196.0,1.0,"Okay. Fan's off. Nothing's happening. We're good. We're so good."),
 (200.4,0.95,"...that's a crack. That's a big crack. That's a lot of cracks."),
 (204.6,0.95,"...It's fine. Everything is fine. Leggy, pick me up. Pick me up right now."),
 (209.4,1.25,"Climb, Leggy! Climb! Bloop, get out of the house! Why are you hiding in the house?!"),
 (214.4,1.3,"KABOOOOM! THE HOUSE! THE HOUSE IS GOING TO SPACE!"),
 (218.6,1.3,"And Bloop is surfing! On a fire brick! On the lava! BLOOP, YOU LEGEND!"),
 (223.6,1.2,"They really were fireproof! Just not house-proof!"),
 (227.6,1.3,"Jump, Leggy! JUMP!"),
 (229.6,1.2,"Where's the house?! Does anyone see the house?!"),
 (233.6,1.05,"Oh, there it is. It's coming back down. Right toward... the fountain..."),
 (238.2,1.1,"SPLOOSH. Direct hit."),
 (240.2,1.25,"Here comes Leggy at full speed! Brake, Leggy! BRAKE!"),
 (244.6,1.0,"...Ow. Face first. Classic."),
 (247.2,1.1,"And Bloop surfs in on a lava trail. Of course he does. Show-off."),
 (251.6,1.05,"Wait. A fireproof house... in a pool of water... with a little fire guy heating it..."),
 (257.0,1.3,"WE HAVE A HOT TUB! WE FINALLY HAVE A HOT TUB!"),
 (260.8,1.05,"Leggy is finally warm. Puff is finally warm. Everyone is happy."),
 (265.4,1.1,"Scoreboard time. Houses that survived: zero. Disasters: six. New friends: one, tiny and spicy."),
 (271.6,1.05,"Behind us, the volcano is still erupting. That's... probably fine."),
 (276.6,1.05,"Bloop, what's that? A warranty card? He stamped it. Warranty... void."),
 (281.4,1.1,"Smash that like button if you've ever made a volcano sad."),
 (286.6,1.0,"...So. Yeah."),
 (288.4,1.15,"Next time on Shardwild... we live on an iceberg. Nothing can go wrong. Subscribe!"),
]
if __name__ == "__main__":
    import soundfile as sf
    from kokoro_onnx import Kokoro
    V = sys.argv[1]; k = Kokoro(V + "/kokoro.onnx", V + "/voices.bin")
    os.makedirs("build/vo", exist_ok=True); cues = []
    for i, (t, sp, txt) in enumerate(LINES):
        s, sr = k.create(txt, voice="am_puck", speed=sp, lang="en-us")
        f = f"build/vo/{i:03d}.wav"; sf.write(f, s, sr); cues.append(dict(start=t, end=t + len(s) / sr, text=txt, file=f))
    for a, b in zip(cues, cues[1:]):
        if a["end"] > b["start"] - 0.1: print("OVERLAP %.1f by %.2f" % (a["start"], a["end"] - b["start"]))
    json.dump(cues, open("build/cues.json", "w"), indent=1)
