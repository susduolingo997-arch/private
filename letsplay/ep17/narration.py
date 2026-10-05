import sys, os, json
sys.path.insert(0, '..')
LINES = [
 (0.6,1.15,"Shardwild, episode seventeen! THE TIME MACHINE!"),
 (6.0,1.1,"Bloop built a time machine. Out of a phone booth, a toaster, and a crystal he found in a pond."),
 (12.0,1.1,"And here's my plan. We go back to episode one. And we stop my first house from falling over."),
 (17.6,1.1,"One small fix. History saved. My dignity restored. What could possibly go wrong?"),
 (22.4,1.1,"Leggy packed snacks for the trip. Six legs, six snack bags. Very organized."),
 (28.2,1.1,"Setting the dial. Year: twenty twenty-six. Minus... a little bit. Careful. Careful."),
 (34.0,1.05,"Chat, don't touch anything. Seriously. Time travel is very delicate."),
 (40.2,1.2,"MUFFIN! Muffin bumped the dial! It's spinning! It's going backwards! WAY backwards!"),
 (46.2,1.25,"Bloop says don't pull the lever. I already pulled the lever. WHY DID I PULL THE LEVER?"),
 (53.2,1.1,"Okay. We're... somewhere. It's hot. Everything is huge. Is that a volcano?"),
 (58.6,1.1,"The dial says one million BC. One. Million. We overshot by nine hundred ninety-nine thousand years."),
 (62.4,1.1,"But look at this place! Giant ferns! Giant mushrooms! Hi, prehistory! Hello!"),
 (70.2,1.1,"... did you feel that? The ground is shaking. Thoom. Thoom. THOOM."),
 (76.2,1.25,"DINOSAUR! A GIANT PURPLE DINOSAUR! Everybody stay still! It can't see us if we don't move!"),
 (81.4,1.1,"It can see us. It's looking right at me. It's opening its mouth—"),
 (84.4,1.15,"It licked me. It licked my whole body. I'm covered in dinosaur slime. I've named it Chompodon."),
 (90.2,1.15,"Wait, it's wagging its tail! It's friendly! It's a big puppy! Wanna play fetch? Go get it!"),
 (96.4,1.1,"It ate the stick. That's okay. It's a good boy. It's a good, giant boy."),
 (100.4,1.1,"Now it wants something else to fetch. It's sniffing the time booth. No. Not that. Not the—"),
 (106.0,1.2,"It took the crystal! The flux crystal! The thing that makes the time machine go!"),
 (110.2,1.15,"... and it swallowed it. Gulp. The crystal is inside the dinosaur."),
 (113.6,1.25,"We're stuck! We're stuck in one million BC! FOREVER! I don't even like ferns!"),
 (118.2,1.1,"Bloop is furious. He's trying to fix the booth with a rock. And a fern. It's not working."),
 (126.2,1.1,"Meanwhile Leggy found a nest. With an egg. A big purple-spotted egg. She's guarding it."),
 (132.4,1.0,"Leggy, that's not your egg. ... She's sitting on it. Okay. She's sitting on it."),
 (136.2,1.2,"It's hatching! It's hatching! It's... a tiny Chompodon! Aww!"),
 (141.0,1.1,"And it thinks Leggy is its mom. It's following her everywhere. Chat, I'm not crying. It's the volcano smoke."),
 (150.2,1.1,"New plan: tickle the dinosaur. It laughs, it coughs, the crystal comes out. Science."),
 (156.0,1.05,"Tickle tickle tickle. It's laughing! It's working! It's... rolling on me. Help."),
 (159.8,1.1,"It licked me again. That's two licks. I'm basically a lollipop now."),
 (166.4,1.1,"Wait, look! Leggy's bringing the baby over. Mama Chompodon is sniffing them..."),
 (171.0,1.0,"Her nose is twitching. Leggy's crystals are tickling her nose. Oh, she's gonna—"),
 (174.2,1.3,"AH-CHOOMP! THE CRYSTAL! IT FLEW OUT! IT'S COMING RIGHT AT—"),
 (177.2,1.0,"... it landed on my head. Bonk. I got it though. Teamwork."),
 (182.2,1.1,"Bloop puts the crystal back. The booth lights up! We can go home!"),
 (188.2,0.95,"Time to say goodbye. Leggy has to leave the baby with its real mom. Look at her."),
 (192.8,0.95,"Bye, little guy. Be good. Don't eat any more time machine parts."),
 (196.2,1.2,"Everybody in! Pull the lever! Next stop: twenty twenty-six!"),
 (202.0,1.1,"We're home! It's sunset! The house is still there! Bonk-bot is still there!"),
 (210.2,1.1,"And nothing changed. The past is safe. Bloop, great work. Truly. History says thank you."),
 (218.2,1.1,"... why is the booth still rumbling? We're done. Booth, we're done. Stop rumbling."),
 (224.2,1.2,"WAIT. THE BABY! The baby Chompodon came with us! He hid in the booth! Stowaway!"),
 (229.4,1.1,"Okay, he's so cute. Leggy is so happy. Fine. He can stay. He's tiny. How much can he eat?"),
 (234.2,1.15,"He ate the apple tree. The whole tree. He's... bigger now. Is he bigger?"),
 (244.2,1.15,"He ate the hay. All the hay. He's definitely bigger now. Stop feeding him!"),
 (252.2,1.2,"Nobody is feeding him! He's feeding himself! He's growing every second! Bonk-bot, alarm!"),
 (260.2,1.15,"Okay. He's huge. He's the size of mom. In fifteen minutes. That's dinosaur math."),
 (266.2,1.0,"He's yawning. He's tired. That's fine. Just lie down. Anywhere. Not on the—"),
 (270.4,1.3,"NOT ON THE TIME MACHINE! He sat on it! CRUNCH!"),
 (275.2,1.05,"And here comes Bloop. With an invoice. Time machine, one. Pancaked."),
 (280.2,1.1,"And he licked me. Again. Three licks. I'm going to go shower for a week."),
 (286.0,0.9,"Yep. It followed us home."),
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
