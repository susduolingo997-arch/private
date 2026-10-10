import sys, os, json
sys.path.insert(0, '..')
VOICE = "am_puck"
LINES = [
 (0.6,1.15,"Shardwild, episode thirty! Chat, today we are going UNDER the sea. In a submarine. Built by Bloop. What could go wrong?",'H'),
 (10.0,1.2,"Bloop yanks the tarp and... TA-DAA! The Deep Dipper! It's yellow! It's chunky! It's beautiful!",'H'),
 (15.0,1.1,"Wait, Leggy found something in the water. A bottle? With a note inside?",'H'),
 (19.4,1.1,"It's a treasure map! The Glow Pearl. At the very bottom of the Gloom Trench. Finders keepers!",'H'),
 (24.0,1.15,"Okay, quick tour. Propeller: spins. Claw arm: grabby. Very grabby.",'H'),
 (28.2,1.1,"It even has a cupholder. On the outside. Underwater. Great.",'H'),
 (31.8,1.1,"Hold on. Let me walk around it. Bloop. Bloop, where are the windows?",'H'),
 (35.4,1.15,"He says windows are extra. EXTRA. Chat, he forgot the windows.",'H'),
 (39.2,1.15,"Fine! It's fine! Who needs windows. Everybody in! Leggy, squeeze!",'H'),
 (43.4,1.1,"And we're diving! Goodbye, sun! Goodbye, light!",'H'),
 (46.8,1.1,"So this is the inside. It's dark. It's red. It smells like fresh paint.",'H'),
 (50.4,1.15,"Periscope! Let's see where we're going... it's water. It's just water.",'H'),
 (54.6,1.1,"Bloop flips a switch and the sonar comes on. Ping. Ping. Okay, that's actually cool.",'H'),
 (59.2,1.05,"Leggy keeps staring at the wall. Buddy, there's no window there. I'm sorry.",'H'),
 (63.2,1.15,"From out here it's gorgeous. Kelp, light beams, and a school of fish trying to look inside. They can't. No windows.",'H'),
 (72.3,1.25,"CLONK! What was that?! The sonar says rock. The sonar said rock AFTER we hit it.",'H'),
 (77.0,1.25,"CLONK! Again! Okay. That's it.",'H'),
 (80.4,1.15,"I'm making a window. One tiny hole.",'H'),
 (83.6,1.3,"BLBLBLBL! Water! In my FACE!",'H'),
 (86.5,1.25,"And now the pipes are bursting! Leak! Another leak! Leggy, DO SOMETHING!",'H'),
 (90.6,1.15,"She plugged all six. With six legs. Chat, she's a genius.",'H'),
 (95.6,1.35,"THERE'S AN EYE! A GIANT EYE! IT LOOKED AT ME!",'H'),
 (98.8,1.0,"We made it to the Gloom Trench. Deep, dark, and... wait. Something is glowing down there.",'H'),
 (106.4,1.15,"Claw time. Steady... steady... and I grabbed sand. Classic.",'H'),
 (110.8,1.15,"Second try. Got it! Pull! It's stuck! PULL!",'H'),
 (114.0,1.25,"Plink! The Glow Pearl is OURS! Chat, we did it!",'H'),
 (116.8,0.9,"...why did all the lights go out?",'H'),
 (119.6,1.2,"The rock has eyes. The big rock. Has. EYES.",'H'),
 (122.8,1.35,"IT'S AN ANGLERFISH! That stick was her LURE! We stole her LIGHT BULB!",'H'),
 (126.8,1.3,"Go go go! Full speed! She's right behind us! I can't SEE anything! NO WINDOWS!",'H'),
 (134.6,1.3,"She just bulldozed those rocks like they were cardboard!",'H'),
 (139.4,1.0,"Dead end. We're cornered. Chat, it was an honor.",'H'),
 (143.2,1.05,"Wait. The hatch is opening. Leggy?! Leggy, what are you doing?",'H'),
 (146.8,1.05,"She's swimming out there with the pearl. Glowing. Tiny. Brave.",'H'),
 (150.4,1.15,"She put it back! The lure lights up and... is the fish... blushing?",'H'),
 (155.4,1.1,"Her name is Mo, apparently. And she and Leggy are best friends now. Just like that.",'H'),
 (161.4,1.15,"Now she's picking us up. In her mouth. Gently. I think? Going up!",'H'),
 (170.6,1.35,"WHOOOAAA! She threw us! We're FLYING! A submarine is FLYING!",'H'),
 (178.4,1.05,"We're home. I'm dizzy. And we came back with... no pearl. Zero treasure.",'H'),
 (184.4,1.1,"Oh! Mo spits out a tiny pearl. For Leggy! A friendship pearl! I'm not crying, you're crying.",'H'),
 (192.4,1.1,"And Bloop says: fine. WINDOWS. Window, window, window. He's so fast. Leggy fell asleep.",'H'),
 (208.4,1.1,"Annnd there's the invoice. Windows, times forty. Chat, the windows were EXTRA.",'H'),
 (214.6,1.05,"But look at it. Forty windows in the sunset. That is a good-looking submarine.",'H'),
 (219.8,1.15,"Test dive! Everyone in! This time we're actually going to SEE something!",'H'),
 (230.4,1.1,"Oh wow. Coral, fish, sunlight. THIS is what the ocean looks like!",'H'),
 (236.8,1.1,"And there's Mo! Swimming right next to us. She's waving! Wave back, Leggy!",'H'),
 (243.6,1.1,"A little fish is tapping on the glass. Hi, little fish. Tap tap.",'H'),
 (247.6,1.0,"...is that a crack? Little fish, please stop tapping.",'H'),
 (251.4,1.2,"Mo wants to say hi too. Mo, gently. GENTLY! Mo, NO!",'H'),
 (255.4,1.35,"ALL FORTY WINDOWS! AT ONCE! Leggy only has SIX LEGS!",'H'),
 (260.6,1.3,"And Mo... eats us. She ate the whole submarine. To save us. I think.",'H'),
 (265.6,1.3,"She's spitting us out! Onto the dock! Incoming!",'H'),
 (271.4,1.05,"Bloop has another invoice. Windows, times forty. Again.",'H'),
 (276.4,1.05,"Okay, the sub is wobbling. On the edge. Leggy, don't touch it. Leggy.",'H'),
 (280.6,1.35,"NO NO NO! It's sliding! It's sinking! The periscope is waving goodbye!",'H'),
 (296.0,1.1,"Next time on Shardwild... the mountain. We forgot the way down.",'H'),
]

if __name__ == "__main__":
    import soundfile as sf
    from kokoro_onnx import Kokoro
    V = sys.argv[1]; k = Kokoro(V + "/kokoro.onnx", V + "/voices.bin")
    os.makedirs("build/vo", exist_ok=True); cues = []
    for i, (t, sp, txt, who) in enumerate(LINES):
        s, sr = k.create(txt, voice=VOICE, speed=sp, lang="en-us")
        f = f"build/vo/{i:03d}.wav"; sf.write(f, s, sr); cues.append(dict(start=t, end=t + len(s) / sr, text=txt, file=f, voice='me'))
    for a, b in zip(cues, cues[1:]):
        if a["end"] > b["start"] - 0.1: print("OVERLAP %.1f by %.2f" % (a["start"], a["end"] - b["start"]))
    json.dump(cues, open("build/cues.json", "w"), indent=1)
