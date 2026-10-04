import sys, os, json
sys.path.insert(0, '..')
LINES = [
 (0.6,1.12,"WHAT IS UP, everybody! Shardwild, episode five! We are sitting next to a sky house... that is now a ground house."),
 (7.6,1.1,"The house fell. The fortress sank. The boat sank. The island swam away. The sky house fell."),
 (14.2,1.1,"So what's the one place that can't fall, can't sink, and can't swim away?"),
 (19.4,1.2,"UNDERGROUND! We're going underground!"),
 (23.4,1.1,"Nothing falls down when you're already at the bottom. Checkmate, physics."),
 (30.4,1.15,"Dig! Dig! Dig! Straight down! Never dig straight down? Says who?"),
 (36.4,1.1,"A living room! A workshop for Bloop! And a big room for Leggy!"),
 (42.6,1.1,"Look at this. It's like an ant farm. A very cozy ant farm."),
 (48.6,1.1,"Now let's make it nice. Torches! Lots of torches."),
 (53.6,1.1,"A bed. A table. A bookshelf. Books I will never read."),
 (59.6,1.1,"A couch for Leggy. Leggy, that is a couch. Not a snack."),
 (65.6,1.1,"And a painting of the sky house. In memoriam."),
 (72.6,1.1,"Ladies and gentlemen... the BUNKER. The safest house ever built."),
 (80.4,1.05,"Ahh. Listen to that. Silence. No birds. No storms. No fish."),
 (86.6,1.05,"Leggy's asleep. Bloop is reading. I'm... vibing. Underground vibing."),
 (93.4,1.05,"Honestly? Best episode ever. Nothing is going to happen. Nothing."),
 (100.4,1.05,"I could just stay here forever. Like a happy little mole."),
 (106.4,1.1,"Bloop's doing something. Bloop, what are you doing?"),
 (110.6,1.1,"Pipes! He's installing pipes! We're getting plumbing!"),
 (116.4,1.1,"A sink! A real sink! Bloop, you are a genius! But where does the water come from?"),
 (124.6,1.05,"He's pointing down. Okay. So we need water. From... below."),
 (130.4,1.1,"You know what we really need? A hot tub. An underground hot tub."),
 (136.4,1.12,"I'll just dig down a little bit, find some water... how hard can it be?"),
 (141.6,1.15,"Dig, dig, dig. Deeper. Deeper. Is that... is the stone wet?"),
 (147.4,1.2,"I think I hear water! I found it! Hot tub time!"),
 (150.6,1.3,"WHOA! TOO MUCH WATER! WAY TOO MUCH WATER!"),
 (155.2,1.3,"It's coming up! It's filling the hole! Leggy's room is flooding!"),
 (160.4,1.3,"Block it! I need blocks! Plug the hole! PLUG THE HOLE!"),
 (166.4,1.2,"...It stopped. It's plugged. We plugged it. Okay. Okay."),
 (171.6,1.05,"Leggy is swimming in her room. She's fine with it. She's always fine with it."),
 (177.6,1.05,"New rule: no one touches the plug. No one breathes near the plug."),
 (183.6,1.1,"Leggy... why is your nose twitching? Leggy, don't sneeze. Don't sneeze!"),
 (189.0,1.3,"SHE SNEEZED! THE PLUG! THE PLUG IS GONE!"),
 (194.0,1.3,"EVERYBODY UP! The living room is flooding! The couch is floating!"),
 (200.6,1.25,"The bookshelf! My unread books! Nooo!"),
 (206.4,1.25,"Bloop is still holding the sink. Bloop, let go of the sink!"),
 (212.6,1.25,"Up the shaft! Swim up! Swim up!"),
 (218.6,1.25,"It's rising too fast! It's like... like a giant straw!"),
 (225.0,1.2,"Leggy, push! We're almost at the top!"),
 (231.4,1.25,"Wait, why is it speeding up?! Why is the water bubbling?!"),
 (237.6,1.3,"GEYSER! WE ARE THE GEYSER! WHEEEEEE!"),
 (245.2,1.1,"...Ow. Landed in the sky house. Again."),
 (250.6,1.05,"Our bunker is now a fountain. A very big, very pretty fountain."),
 (257.0,1.05,"Leggy loves it. She's sitting in it. Of course she is."),
 (263.0,1.1,"Let's review. House: fell. Fortress: sank. Boat: sank. Island: swam."),
 (270.4,1.1,"Sky house: fell. Bunker: flooded. I'm running out of directions."),
 (277.0,1.0,"And Bloop has... the biggest invoice yet. It has two pages."),
 (286.6,1.0,"...So. Anyway."),
 (288.4,1.15,"Next time on Shardwild... we live in a volcano. It's fine. Subscribe!"),
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
