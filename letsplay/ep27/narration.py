import sys, os, json
sys.path.insert(0, '..')
VOICE = "am_puck"
LINES = [
 (0.6,1.15,"Shardwild, episode twenty-seven! Chat, it's ROAD TRIP DAY! Destination: the World's Biggest Shard!",'H'),
 (5.6,1.1,"And Bloop built us a ride. Behold. The Bloopmobile! It has wheels! It has a stripe!",'H'),
 (11.2,1.1,"Okay, I call driver. Obviously. I'm walking to the... Leggy's in the driver's seat. HEY.",'H'),
 (17.0,1.1,"She says six legs means she can press all the pedals at once. That is not how pedals work.",'H'),
 (22.4,1.1,"Fine. I'll navigate. Bloop hands me a warranty card. Good for three hundred miles.",'H'),
 (27.4,1.2,"Seatbelts! ...We don't have seatbelts. Leggy, hit it!",'H'),
 (31.2,1.25,"HONK! She found the horn. She is going to use the horn a lot.",'H'),
 (38.4,1.15,"Are we there yet? Are we there yet? Okay, I'll stop. Are we there yet?",'H'),
 (46.2,1.3,"BUMP! The hubcap! It's flying! Bloop caught it!",'H'),
 (49.6,1.15,"And now Bloop is running next to the car. At highway speed. To put it back on. He did it!",'H'),
 (55.6,1.0,"Okay. Navigator time. The map. Hmm. Which way is up? This way. Definitely this way.",'H'),
 (60.2,1.3,"Shortcut! Turn left! Your left! Leggy, you have six lefts!",'H'),
 (64.4,1.2,"Uh oh. Sirens. Is that... a traffic cone? On a scooter?",'H'),
 (68.6,0.95,"Officer Coney. Highway patrol. He's walking up to the window. Be cool. Be cool.",'H'),
 (76.6,1.3,"She doesn't have a license. Chat. SHE DOESN'T HAVE A LICENSE!",'H'),
 (80.4,1.1,"He says: then it's a test. Right now. Slalom through the cones.",'H'),
 (84.6,1.25,"Wait. These cones have faces. They're his COUSINS! Leggy, do NOT hit the family!",'H'),
 (89.8,1.35,"Left! Right! Left! I can't look! I'm looking! She's nailing it!",'H'),
 (94.4,1.05,"Not a single cousin touched. Officer Coney is taking notes. Furiously.",'H'),
 (101.6,1.3,"SHE PASSED! Leggy has a license! She's holding it in her mouth! So proud!",'H'),
 (110.4,1.1,"Desert time, chat! Look at that sunset! Cactuses! Mesas! Big rocks shaped like bigger rocks.",'H'),
 (115.6,1.1,"Are we there yet? Bloop says: ask me one more time.",'H'),
 (118.6,1.1,"Wait, what was that? The door just fell off. Bloop is waving goodbye to it.",'H'),
 (123.0,1.25,"A sign! World's biggest shard, next exit! We made it!",'H'),
 (126.8,1.0,"And it's... a little shack. With a pedestal. And a magnifying glass.",'H'),
 (130.6,1.0,"World's... smallest shard. It's tiny. Where is it? Oh. There it is.",'H'),
 (136.2,0.9,"Hold on. Let me check the map. Oh. Oh no. I had it upside down.",'H'),
 (143.4,1.1,"Sputter. Cough. Pfffft. We're out of gas. In the desert. Next to the world's smallest shard. Chat, this is fine.",'H'),
 (151.0,0.85,"Night in the desert. It's quiet. Too quiet. And cold. Bloop, fire please.",'H'),
 (155.2,1.1,"Bloop built a campfire in half a second. And an invoice. For the campfire. Of course.",'H'),
 (160.4,1.1,"Leggy is showing everyone her license again. Yes, Leggy. We know. We're so proud.",'H'),
 (164.6,1.3,"Marshmallow time. Golden brown... FIRE! It's on fire! Blow it out!",'H'),
 (168.6,0.85,"Whoa. A shooting star. Make a wish, chat. I wish for gas.",'H'),
 (172.4,1.0,"Is that Officer Coney? Patrolling the desert. At night. He waves. We wave.",'H'),
 (176.6,1.0,"Leggy is staring at the car. She has that look. The I-have-an-idea look.",'H'),
 (184.4,1.3,"Morning! And Leggy is... lifting the car. LEGGY IS LIFTING THE CAR!",'H'),
 (192.6,1.35,"SHE'S RUNNING! Six legs! Full speed! THIS is what Leggy is driving means!",'H'),
 (197.6,1.15,"Fuel gauge says: legs. Are we there yet? ARE WE THERE YET?",'H'),
 (203.4,1.3,"Sirens again! Officer Coney! She's getting a speeding ticket! On FOOT!",'H'),
 (209.8,1.35,"One hundred and twelve miles per hour! He can't keep up! Sorry, officer!",'H'),
 (215.0,1.2,"Bloop's holding his hard hat. I'm holding Bloop. Nobody is holding me!",'H'),
 (226.6,1.1,"She's slowing down. Gently. Gently. And... parked.",'H'),
 (232.4,1.05,"She puts the car down like a mama cat. Everybody out.",'H'),
 (236.6,0.85,"Chat. Look up. The world's biggest shard. It's enormous. It's beautiful.",'H'),
 (241.4,1.25,"Group photo! Everybody squish in! Say shard! SHARD!",'H'),
 (248.4,1.05,"Officer Coney is here. Of course he is. He says: park it properly.",'H'),
 (252.4,1.0,"Okay Leggy, I'll guide you in. Keep going. Keep going. Lots of room.",'H'),
 (260.2,1.15,"Bonk. Stop. STOP. That's the hill. The hill with the shard on it.",'H'),
 (264.0,1.4,"It's wobbling. Everybody out! OUT OUT OUT!",'H'),
 (267.2,1.4,"IT'S FALLING! The biggest shard is ROLLING! TOWARDS THE CAR!",'H'),
 (271.4,1.0,"Crunch. The Bloopmobile is now a pancake.",'H'),
 (274.4,1.1,"Bloop hands me an invoice. One van. Flat. Fair.",'H'),
 (277.4,1.35,"And it's still rolling! The gift shop! NOT THE GIFT SHOP!",'H'),
 (280.6,1.0,"Officer Coney is writing a parking ticket. Chat... she parked it. Technically.",'H'),
 (286.0,0.9,"Yep. She parked it.",'H'),
 (296.0,1.0,"Next time: a dragon egg! And it hatched in my hat?! Bye!",'H'),
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
