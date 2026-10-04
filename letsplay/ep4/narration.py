import sys, os, json
sys.path.insert(0, '..')
LINES = [
 (0.6,1.12,"WHAT IS UP, everybody! Shardwild! Episode four! We... washed up on a beach."),
 (6.0,1.1,"Let's review. The house fell down. The fortress sank. The boat sank. The island was a fish."),
 (12.8,1.1,"So the ground is bad, and the water is bad. You know what's left?"),
 (17.4,1.2,"THE SKY! We're going to live in the sky!"),
 (21.6,1.1,"Bloop is shaking his head. Leggy is excited. Leggy gets it."),
 (27.0,1.1,"Now, how do you build in the sky? You need something that floats."),
 (32.0,1.12,"And look at these! Glowing blue blocks in the cliff! Let's mine one!"),
 (37.0,1.2,"Mine! Mine! Mine!"),
 (40.4,1.15,"Whoa! It's floating! It's FLOATING! Floatstone! I'm calling it floatstone!"),
 (46.6,1.1,"If one floats, then a whole bunch can hold up a whole house. That's science."),
 (53.0,1.1,"Is it science? Bloop, is that science? He's writing something down. Probably an invoice."),
 (61.0,1.2,"Okay! First, a pillar to get up there! Jump, place! Jump, place!"),
 (66.6,1.2,"Higher! Higher! Don't look down! I looked down!"),
 (71.4,1.1,"Bloop, I'm sending you planks! Let's build a sky house!"),
 (76.8,1.1,"Floatstone on the bottom. Planks on top. A little house. A little garden."),
 (83.6,1.12,"A railing! Safety first! I've learned from my mistakes!"),
 (89.0,1.1,"A tiny windmill, because it looks cool. And a hammock, because I deserve it."),
 (95.0,1.1,"And... done!"),
 (99.6,1.12,"Ladies and gentlemen... the SKY HOUSE! It can't fall down! It's already UP!"),
 (107.4,1.05,"Look at this view. We're above the clouds. Literally."),
 (113.0,1.05,"No monsters up here. No fish pretending to be islands. Just peace."),
 (119.0,1.05,"Time for a well-earned sandwich. A brand new sandwich."),
 (124.6,1.15,"Oh no. Pink. Pink in the sky. It's the Squawklings!"),
 (128.6,1.3,"NOT AGAIN! HOW DID YOU EVEN FIND ME?! I'M IN THE SKY!"),
 (134.6,1.1,"...They live in the sky. I moved into their neighborhood. That's on me."),
 (141.4,1.05,"Okay, hammock time. Bloop, wake me up if anything happens."),
 (149.8,1.05,"Hey, where's Leggy? ...Oh no. Leggy's still on the ground."),
 (155.6,1.05,"She looks so sad. Look at her little legs. All six of them. Waving."),
 (162.0,1.1,"Sorry, Leggy. You're a bit too heavy for the sky."),
 (168.6,1.1,"She'll be fine down there. She has... grass. Grass is nice."),
 (175.0,1.05,"Okay, napping. Absolutely nothing can go wrong now."),
 (185.6,1.2,"Wait. What's that sound? Is Leggy... climbing the pillar?!"),
 (191.6,1.25,"Leggy, no! Leggy, you're too heavy! Leggy, stop being adorable and listen!"),
 (198.6,1.3,"SHE'S ON! WE'RE TILTING! THE HOUSE IS TILTING!"),
 (204.0,1.3,"Everybody to the other side! Balance! BALANCE!"),
 (210.4,1.2,"It's working! A little more! Bloop, give me something heavy!"),
 (216.4,1.2,"The checkered block! Yes! The heaviest, ugliest block in the game!"),
 (221.0,1.1,"...We're level. We're LEVEL! Physics! I did physics!"),
 (227.6,1.05,"And now Leggy lives in the sky too. One big, floating family."),
 (233.8,1.05,"Look at that sunset. Golden. Beautiful. The floatstone is glowing less... it's so pretty."),
 (241.6,1.05,"Wait. Why is it glowing less?"),
 (245.0,1.1,"Bloop. Bloop, what are you pointing at. What does the sign say."),
 (250.4,1.2,"FLOATSTONE: FLOATS IN SUNLIGHT ONLY?! WHO WRITES THAT IN TINY LETTERS?!"),
 (257.6,1.2,"The sun is setting! The sun is setting RIGHT NOW!"),
 (262.2,1.25,"We're sinking! We're sinking in the SKY! That's not even a thing!"),
 (268.0,1.3,"WE'RE FALLING! WE'RE FALLIIIIING!"),
 (273.4,1.0,"...Leggy caught me. Leggy caught me. Good girl."),
 (278.0,1.0,"The sky house is now a ground house. A very flat ground house."),
 (282.2,1.0,"And Bloop has... a bigger invoice."),
 (286.6,1.0,"...So. Anyway."),
 (288.4,1.15,"Next time on Shardwild: we live underground! Subscribe! Bye!"),
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
