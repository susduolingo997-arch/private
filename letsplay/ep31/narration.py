import sys, os, json
sys.path.insert(0, '..')
VOICE = "am_puck"
LINES = [
 (0.6,1.15,'Shardwild, episode thirty-one! Chat, today we climb a MOUNTAIN. All the way to the top!','H'),
 (9.6,1.2,'Bloop has a gadget. TA-DAA! The Stair-O-Matic three thousand!','H'),
 (15.4,1.05,'The legend says: ring the Summit Bell at the top, and your name echoes across Shardwild. Forever.','H'),
 (23.6,1.05,"Leggy, you okay? She climbed one block. One. And she's shaking.",'H'),
 (29.6,1.15,'Test fire! Pew, pew, pew! Stairs! IT WORKS!','H'),
 (34.0,1.05,"Bloop is explaining eco mode. Yeah, yeah. Cool. Let's go.",'H'),
 (38.6,1.2,'Adventure time! To the summit!','H'),
 (43.0,1.1,'The stairs pop out in front of me. I am a staircase god.','H'),
 (48.6,1.35,"WIND! Bloop's hard hat is flying! ...and it came back.",'H'),
 (54.6,1.0,'Wait. Is that a goat? On the WALL?','H'),
 (59.0,1.1,'Selfie time! Bloop wants one for his portfolio.','H'),
 (63.8,1.1,"And the goat photobombed it. That's a goat photo now.",'H'),
 (68.2,0.95,"Don't look down. Don't look down.",'H'),
 (71.4,1.05,"Chat says: where are the stairs? We're ON the stairs, chat.",'H'),
 (75.8,1.0,"We're inside a cloud. Something just said baa.",'H'),
 (81.6,1.2,"We're ABOVE the clouds! Chat, look at this!",'H'),
 (90.0,1.2,'THE SUMMIT! Four hundred meters! Legend status: incoming!','H'),
 (96.4,1.0,"Okay, the bell frame. There's the hook. Where's the bell?",'H'),
 (102.2,1.1,'Ding? Oh no. The bell is on the goat!','H'),
 (107.6,1.3,"Give it! Goat! Give me the bell! He's so fast!",'H'),
 (112.2,1.15,'Chat, I am chasing a goat around a mountain. This is my career now.','H'),
 (116.6,1.4,'He stopped. Why is he looking at me like th— BONK!','H'),
 (121.2,1.05,'Head first in the snow. Leggy pulls me out. Thank you, Leggy.','H'),
 (126.2,1.15,"Meanwhile the goat ATE Bloop's tripod. He just ate it.",'H'),
 (130.6,1.05,'But Bloop has an idea. The goat loves bonking. Bloop has... a hard hat.','H'),
 (135.4,1.2,'CLONK! No headache! He loves it! And he drops the bell!','H'),
 (140.6,1.0,'Bell on the hook. Okay chat. This is the moment.','H'),
 (145.4,1.3,"DIIIIING! That's my name, echoing across Shardwild!",'H'),
 (149.6,1.1,'Selfie number three. Squeeze in. Yes, the goat is Dingus now.','H'),
 (154.2,1.1,"Perfect! Okay, legend achieved. Let's head down the stairs.",'H'),
 (159.0,1.3,'The stairs. Where are the stairs? THERE ARE NO STAIRS!','H'),
 (163.2,1.05,'Eco mode. It recycled every stair. Down mode: sold separately?!','H'),
 (167.4,0.95,'Wait. Is that what Bloop was saying? When I said yeah, yeah, cool?','H'),
 (172.6,0.85,"Chat. It's night. It's so cold. We forgot the way down.",'H'),
 (178.4,1.2,"Plan A! The clouds look soft. Like a pillow. I'm going in!",'H'),
 (183.0,1.0,"Bloop grabbed me. He's throwing a snowball first.",'H'),
 (187.2,0.8,'...plip.','H'),
 (188.8,1.2,"Plan B! Twelve stairs left. I'll make my own way down!",'H'),
 (193.4,1.15,"And eco mode ate the stairs behind me. I'm on one stair. Over nothing.",'H'),
 (197.8,1.15,"Leggy? You're scared of heights! She's going over the edge!",'H'),
 (201.6,1.3,"She's CLIMBING! Six legs! Leggy, you're a natural!",'H'),
 (205.6,1.15,"Sunrise. Everybody on Leggy. She's taking us all the way down!",'H'),
 (212.4,1.15,'The scared one is carrying everybody. Look at her go!','H'),
 (219.8,1.4,'She slipped! Hold on! ...She caught it. My heart.','H'),
 (225.6,1.0,'Back through the clouds. And yes, I took the bell. Souvenir.','H'),
 (234.6,1.2,"BASE CAMP! We're alive! Leggy, you are a hero!",'H'),
 (241.6,1.05,'Bloop has an invoice. One hard hat. Honestly? Fair.','H'),
 (248.2,1.2,'One more, for the fans. Victory ding! DING!','H'),
 (252.8,0.9,'...why is the mountain rumbling?','H'),
 (257.4,1.4,'AVALANCHE! The ding did it! RUN!','H'),
 (262.8,1.35,'RUN RUN RUN! Is Dingus SURFING it?!','H'),
 (268.0,1.3,"It's right behind us! It's right behind us!",'H'),
 (277.8,1.05,"Pop. Bloop's okay. Leggy's upside down. And Dingus got his bell back.",'H'),
 (296.0,1.1,'Next time on Shardwild... the pizza run. Leggy ate the pizza.','H'),
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
