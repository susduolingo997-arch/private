import sys, os, json
sys.path.insert(0, '..')
LINES = [
 (0.5,0.9,"Previously... on Shardwild."),
 (3.0,1.05,"I built the greatest house in history. Then I removed one block... and it all fell down."),
 (9.0,1.12,"WHAT IS UP, everybody! Welcome back! Episode two! And yes. I am still sitting in the rubble."),
 (15.2,1.1,"But today, we rebuild! Bigger! Better! And this time... structurally sound!"),
 (20.6,1.12,"I made a plan. Look at this. A real, professional plan."),
 (24.6,1.1,"Step one: get stone. Step two: get help. Step three: do NOT touch the support block."),
 (31.0,1.12,"Step four is just question marks. We'll figure it out."),
 (36.4,1.12,"Alright! Stone time! Stone doesn't fall down. Stone is reliable. Stone is my friend."),
 (42.6,1.2,"Mine! Mine! Mine! Look at me go! I'm a machine!"),
 (47.6,1.1,"Twelve slatestone! Now we need wood. And this time, I'm chopping the whole tree."),
 (53.4,1.15,"Timber! Yes! It's falling! It's actually falling! It's falling... towards me..."),
 (57.6,1.3,"NO NO NO NO NO!"),
 (59.8,0.95,"...I'm okay. I'm under a tree. But I'm okay."),
 (63.6,1.18,"Montage! Sand for windows! A jelly cube! Bonk! Get out of here!"),
 (69.6,1.12,"And now we carry all of it home. Totally normal amount of blocks. Totally safe."),
 (75.8,1.1,"Step one... complete!"),
 (80.6,1.1,"Step two. Get help. And I know exactly who to ask."),
 (84.8,1.1,"The Burbles! My old friends! ...whose village I exploded."),
 (90.0,1.15,"Okay, they remember me. They definitely remember me. They have little angry faces!"),
 (95.6,1.05,"I come in peace! Look! I brought a flower! An apology flower!"),
 (100.6,1.12,"They're... accepting it? We're friends again? Let's hire a builder!"),
 (105.6,1.12,"Five logs and one apology flower, for... Bloop the Builder! Look at his little hard hat!"),
 (112.2,1.1,"Bloop, buddy, you and me are going to build something incredible."),
 (117.0,1.08,"He's not saying anything. He's just staring. I think that means yes."),
 (122.8,1.1,"Step two... complete! Let's go home!"),
 (130.4,1.12,"Okay Bloop, first, we clean up the old house. ...Wow, he's fast."),
 (135.6,1.1,"And now he's building. Stone walls! Thick! Square! Actually sensible!"),
 (141.6,1.1,"Look at those corners. Look at that roof. Bloop is a genius."),
 (146.6,1.12,"Okay, but it needs a personal touch. My personal touch. Bloop, take five."),
 (152.4,1.15,"First: a moat! Every fortress needs a moat!"),
 (156.4,1.12,"Then, a drawbridge! And then... a trampoline!"),
 (160.8,1.12,"Why a trampoline? Because it's fun. Watch this!"),
 (165.2,1.3,"Wheeeee! WHEEEEE! Oh no, I'm going too high!"),
 (169.8,1.15,"...I'm in the moat. Bloop is... is he facepalming? Can Burbles facepalm?"),
 (175.6,1.1,"Final touch. A statue. Of me. On the roof. It's tasteful."),
 (181.4,1.1,"Ladies and gentlemen... the Fortress of Not Collapsing!"),
 (185.6,1.1,"Built by Bloop. Improved by me."),
 (190.6,1.1,"The sun's going down... and honestly? I feel safe. For the first time ever."),
 (196.2,1.2,"Wait. Did the ground just shake? Why did the ground shake?"),
 (200.4,1.3,"NO. NO NO NO. It's the cave thing! The leg monster! It followed me!"),
 (205.6,1.25,"Bloop! Protect me! ...Bloop is hiding behind ME! That's not how this works!"),
 (210.8,1.25,"Fine! Fizzberry bomb! Take THIS!"),
 (213.0,1.25,"It hit the trampoline! It's bouncing! It's... NOT MY STATUE!"),
 (217.8,1.0,"...My beautiful head."),
 (221.0,1.1,"Wait. It stopped. It's just... looking at me. At my backpack."),
 (226.0,1.1,"Is it... the crystal? From the cave? Is this YOUR crystal?"),
 (231.2,1.12,"Here, buddy! Catch! ...It caught it! It's so happy! It's wiggling!"),
 (236.8,1.05,"Oh my gosh. It's rolling over. Does it want belly rubs? It wants belly rubs!"),
 (242.0,1.05,"Okay. You're adorable. You're staying. Your name is Leggy."),
 (246.4,1.0,"Me, Bloop, and Leggy. One big, happy family."),
 (250.6,1.05,"Okay, bedtime! Leggy, where are you going to sleep?"),
 (254.6,1.12,"Up the wall... onto the roof. Okay. Sure. Climb the fortress."),
 (259.6,1.05,"Aww, she's curling up. On the roof. Right next to my headless statue."),
 (264.2,0.95,"...Please tell me that wasn't a creak."),
 (266.8,1.15,"No. Nope. Absolutely not. Bloop built this! It's stone! It's fine!"),
 (271.0,1.3,"IT'S SINKING! THE WHOLE FORTRESS IS SINKING! WHY IS IT SINKING?!"),
 (276.0,1.25,"NOT AGAIN! IT WAS MADE OF STONE! HOW?!"),
 (280.2,1.0,"...Bloop is handing me something. Is that... an invoice?"),
 (284.0,1.0,"Emotional damage... nine hundred logs."),
 (287.4,1.0,"...So. Anyway."),
 (289.0,1.15,"Next time on Shardwild, we live in a boat! Subscribe! Bye!"),
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
