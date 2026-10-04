import sys, os, json
sys.path.insert(0, '..')
LINES = [
 (0.6,1.12,"WHAT IS UP, everybody! Welcome back to Shardwild! Episode three!"),
 (5.4,1.1,"So. Quick update. My fortress is now a lake."),
 (9.6,1.1,"Leggy loves it. Look at her swimming. She has no regrets."),
 (14.6,1.12,"And Bloop is... still holding the invoice. I see you, Bloop."),
 (19.8,1.12,"But here's the thing. You can't knock down a house on the water. So... we live on a BOAT!"),
 (26.6,1.12,"Bloop! Planks! Lots of planks! Let's build a ship!"),
 (31.0,1.1,"Okay, the hull. It's boat-shaped. That's the most important part."),
 (36.4,1.1,"A deck! A little cabin! A mast! A sail with stripes!"),
 (41.8,1.12,"Now my touches. A cannon! It's decorative. And a giant anchor!"),
 (47.4,1.1,"And of course... a captain's hat. Captain Me. Reporting for duty."),
 (53.0,1.15,"Okay. Moment of truth. Push it into the water!"),
 (57.2,1.3,"Push! Push! PUSH!"),
 (60.2,1.25,"It floats! IT FLOATS! Bloop, it floats!"),
 (64.6,1.1,"Everybody aboard! Leggy, you can... swim alongside. You're a bit heavy."),
 (70.4,1.12,"Anchors aweigh! To the sea! Whatever that means!"),
 (75.6,1.1,"Goodbye, lake! Goodbye, land! Hello, adventure!"),
 (80.6,1.08,"Look at this! Open sea! Nothing but water in every direction!"),
 (86.0,1.1,"This is the life. No floors to fall through. No walls to explode."),
 (91.6,1.12,"Time to fish! Captain's dinner! Cast the line..."),
 (96.4,1.2,"Bite! I've got a bite! It's a big one! It's..."),
 (99.8,1.2,"A JELLY CUBE?! Why is there a jelly cube in the ocean?!"),
 (104.4,1.2,"Get it off! It's slimy! Bloop, help!"),
 (108.6,1.12,"Okay. Okay. Lunch break. I'll just eat my sandwich in peace..."),
 (113.4,1.25,"HEY! That bird took my sandwich! Those are Squawklings! Pink sky thieves!"),
 (119.2,1.2,"Give it back! That was half a sandwich! It was the last half!"),
 (124.4,1.05,"...It's fine. I wasn't hungry. Captain's log: lost one sandwich."),
 (130.4,1.1,"Uh, Bloop? Why is the sky getting dark?"),
 (134.8,1.15,"That's a storm. That's a big storm. Is the boat storm-proof? Bloop?"),
 (140.4,1.25,"WHOA! Big wave! Hold on to something! Leggy, hold on!"),
 (146.0,1.25,"Captain's log! Everything is fine! Nothing is fine!"),
 (151.6,1.3,"LIGHTNING! It hit the mast! My beautiful stripy sail!"),
 (157.0,1.15,"Okay, okay, we just ride it out. We just ride it out..."),
 (160.6,1.3,"WHAT IS THAT?! Something is coming up! Something HUGE!"),
 (165.4,1.3,"It's a giant fish with a lantern on its head! Battle stations! Fire the cannon!"),
 (171.4,1.1,"...The cannon is decorative. I said that. I said it was decorative."),
 (176.6,1.2,"It's looking at us... it's... it's just swimming away? Okay! Bye, big guy!"),
 (182.4,1.15,"The waves... we're drifting... I can't see anything!"),
 (190.6,1.05,"...Is everyone alive? Bloop? Leggy? Sandwich? No. The sandwich is gone."),
 (196.4,1.12,"Wait. LAND! An island! A beautiful little island!"),
 (202.0,1.1,"Sand! A tree! It's perfect! We're shipwrecked, but in a cute way!"),
 (208.0,1.1,"The boat looks... rough. Half a mast. No sail. One decorative cannon."),
 (214.0,1.12,"Oh! Leggy found something! A chest! A treasure chest!"),
 (219.4,1.15,"What's inside? Is it gold? Is it shards? It's... a crown!"),
 (224.6,1.1,"A crystal crown! I'm a captain AND a king now! King Captain Me!"),
 (230.4,1.05,"You know what? Forget the boat. We live on the island now."),
 (235.6,1.1,"Islands can't sink. Islands are just... land. In the water. Totally stable."),
 (241.6,1.1,"I'll just drop the anchor, so the boat doesn't drift away. Heave!"),
 (250.6,1.1,"Wait. Why is the ground warm? Why is the ground... breathing?"),
 (255.4,1.15,"Bloop, is that... an eye? Why does the island have an eye?!"),
 (260.2,1.3,"IT'S THE FISH! THE ISLAND IS THE FISH! WE'RE ON THE FISH!"),
 (265.4,1.3,"It's diving! The island is sinking! EVERYBODY OFF THE FISH!"),
 (271.6,1.25,"The boat! Where's the boat?! The anchor! The anchor is pulling it down!"),
 (277.0,1.0,"...Okay. So. We're floating. On Leggy. In the middle of the ocean."),
 (282.6,1.0,"Bloop is writing another invoice. Of course he is."),
 (286.6,1.0,"...So. Anyway."),
 (288.4,1.15,"Next time on Shardwild: we live in the sky! What could go wrong? Subscribe!"),
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
