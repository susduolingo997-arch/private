import sys, os, json
sys.path.insert(0, '..')
VOICE = "am_puck"
LINES = [
 (0.6,1.15,"Shardwild, episode twenty-six! Chat, we got tickets! The grand opening of the Shardwild Museum!",'H'),
 (6.4,1.1,"Columns. A banner. A sign that says do not touch the museum. Fancy.",'H'),
 (11.2,1.05,"Bloop brought a statue. Of himself.",'H'),
 (14.6,1.25,"The doors are opening! It's an owl! A very serious owl! With a monocle!",'H'),
 (18.6,1.0,"Professor Hootsworth. One rule. Do not touch anything.",'H'),
 (22.4,1.1,"Nice to meet you! Let me shake your... NO HANDSHAKES. Noted.",'H'),
 (26.6,1.1,"Bloop presents his statue. Ta-daa! The professor inspects it...",'H'),
 (31.0,1.3,"REJECTED! Oof. Bloop, buddy. Leggy gives him a pat.",'H'),
 (35.0,1.0,"Okay, chat. Inside. Hands in pockets. We touch nothing.",'H'),
 (39.0,1.05,"Whoa. The Great Hall. And in the middle... a dinosaur skeleton.",'H'),
 (44.4,1.1,"Rexbone. Six legs. Leggy is staring at it. Six legs. Like her.",'H'),
 (50.2,1.0,"Ooh, an ancient vase. Just looking. Ah... ah...",'H'),
 (54.0,1.3,"AH-CHOO! It's wobbling! IT'S WOBBLING! Leggy caught it! LEGGY CAUGHT IT!",'H'),
 (58.4,0.95,"That counts as a touch. Put it on Leggy's tab.",'H'),
 (62.4,1.05,"This painting is crooked. One little nudge...",'H'),
 (65.0,1.2,"It's upside down. And his head just turned all the way around!",'H'),
 (70.2,1.0,"He's off to his office for tea. Don't touch anything. Got it.",'H'),
 (74.4,0.9,"The Button. Do not press. I want to so bad.",'H'),
 (78.6,1.1,"Bloop, your cart is rolling!",'H'),
 (81.0,1.35,"The statue pressed it! CLOSING TIME! The doors! NO NO NO!",'H'),
 (85.6,1.0,"...We're locked in. At night. Don't panic. We wait for morning.",'H'),
 (90.4,1.35,"AAAH! Oh. It's Leggy. Leggy, your eyes glow. In the dark. Please don't do that.",'H'),
 (96.4,0.95,"Psst. Bloop is sneaking his statue onto the empty pedestal. Bloop. No.",'H'),
 (102.4,0.9,"And Leggy is tiptoeing toward the dinosaur. Leggy. Don't.",'H'),
 (107.4,0.9,"Boop.",'H'),
 (110.2,1.15,"Wait. Its eyes are glowing. Why are its eyes glowing? Why is it RATTLING?",'H'),
 (116.0,1.5,"SKREEEEONK!",'H'),
 (118.4,1.35,"IT'S ALIVE! THE DINOSAUR IS ALIVE! RUN! EVERYBODY RUN!",'H'),
 (124.0,1.3,"It's right behind me! Left! Right! Not the vase! NOT THE VASE!",'H'),
 (128.6,1.2,"KSSSH. The vase is gone. Ten thousand years. Gone. Keep running!",'H'),
 (133.0,1.2,"I'm cornered. This is it, chat. Tell Bloop I'll pay him back. Maybe.",'H'),
 (138.0,1.0,"It's lowering its head. Its tail is... wagging?",'H'),
 (142.0,1.05,"Its eyes went green. Chat. Is the dinosaur... a puppy?",'H'),
 (146.4,1.25,"Leggy has a bone! Fetch! He's going! He got it! GOOD BOY!",'H'),
 (152.4,1.3,"And now he has the zoomies. In the museum. There goes the painting. There go the ropes.",'H'),
 (158.4,1.0,"Chat. The professor comes back at sunrise. We have to fix EVERYTHING before then.",'H'),
 (164.6,1.25,"Fix-it montage! Bloop's got glue! I've got the painting! Leggy's on puppy duty!",'H'),
 (171.0,1.0,"Bloop glued the vase back. It looks like Bloop. That's art.",'H'),
 (176.0,1.0,"Last problem. The very awake dinosaur.",'H'),
 (180.4,0.85,"And Leggy is singing him a lullaby. He's climbing back up.",'H'),
 (186.6,0.9,"He curls up. Like a cat. Close enough.",'H'),
 (192.4,0.8,"Tiptoe. Tiptoe. Every snore, his bones rattle. Shh.",'H'),
 (199.2,0.8,"Nobody breathe. Nobody touch anything.",'H'),
 (204.4,1.05,"Sunrise! The shutters are opening! And here comes the professor. Act natural.",'H'),
 (210.6,1.0,"He's looking at the vase. The Bloop vase. ...A bold restoration! He likes it?",'H'),
 (217.6,1.0,"The painting. It's upside down. He turns his head upside down. MAGNIFICENT. Okay!",'H'),
 (223.6,1.0,"The dinosaur. Curled up. Snoring. He says... how modern. We're getting away with this!",'H'),
 (230.6,1.0,"And then he sees Bloop's statue. On the pedestal. Who made this?",'H'),
 (236.0,1.3,"ACCEPTED! Bloop is in a museum! Look at him! He threw his hat! BLOOP, YOU DID IT!",'H'),
 (242.4,0.95,"We did it, chat. I'm just gonna lean here for a second.",'H'),
 (248.2,0.95,"...On the do not touch sign. It's falling. Into the posts.",'H'),
 (253.2,1.3,"Clack. Clack. It's a domino! NO!",'H'),
 (257.0,1.1,"He's awake. He's sniffing. Ah... ah...",'H'),
 (260.2,1.5,"AH-CHOOOO! BONES! BONES EVERYWHERE!",'H'),
 (263.6,1.05,"The skull landed on the professor. He's wearing it.",'H'),
 (268.2,1.1,"The bones fly back together! But the skull is busy. So... the Bloop vase. As a head.",'H'),
 (274.0,1.3,"And Leggy jumps on. And they're RUNNING! Out the door! COME BACK!",'H'),
 (279.6,1.25,"Walkies! The dinosaur is going walkies! With a vase on his head! Chat, CLIP THIS!",'H'),
 (286.0,0.9,"Yep. He touched it.",'H'),
 (296.0,1.0,"Next time: road trip! And Leggy's driving. Bye!",'H'),
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
