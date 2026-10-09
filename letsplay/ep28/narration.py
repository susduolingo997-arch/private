import sys, os, json
sys.path.insert(0, '..')
VOICE = "am_puck"
LINES = [
 (0.6,1.15,"Shardwild, episode twenty-eight! Chat, it's a peaceful morning walk. Nothing can go wrong on a walk.",'H'),
 (5.6,1.1,"Leggy's sniffing something in that bush. Leggy, what is it? A rock? A snack?",'H'),
 (10.8,1.1,"Wait. She's pushing something out. Something big. Something... round.",'H'),
 (14.4,1.3,"AN EGG! A giant glowing egg! And it's warm! Why is it warm?",'H'),
 (20.2,1.1,"Oh, there's a sign. Lost: one egg. Return to Ember Peak. Reward! Signed, Mama.",'H'),
 (25.4,1.15,"Reward? Chat, did you hear that? A reward! Where's Ember Peak?",'H'),
 (31.6,1.15,'Bloop! Bloop rolls in with... a wheelbarrow with a lamp on it. The Egg-Cart!','H'),
 (36.2,1.1,'Padded tray, heat lamp, cup holder. And of course, an invoice. Thanks, Bloop.','H'),
 (40.4,1.15,'Okay team, quest accepted! We deliver the egg, we get the reward. Easy money.','H'),
 (46.2,1.1,"Ooh, cloud. It's getting cold. The egg meter says too cold! Too cold!",'H'),
 (50.4,1.0,'And Leggy just... hugs the cart. With all six legs. Egg warmth: just right. Aww.','H'),
 (56.6,1.3,"BONK! A rock! The egg! The egg is out! It's rolling down the hill!",'H'),
 (64.2,1.2,"Leggy caught it! Egg-cellent catch! She's carrying it on her back like a little backpack.",'H'),
 (70.4,1.1,'Bloop wants to make up for the cold. So he turns the heat lamp all the way up. Maximum.','H'),
 (75.2,1.0,'Is that smoke? Bloop, is the Egg-Cart supposed to smell toasty?','H'),
 (79.0,1.4,"FIRE! The cart's on fire! The egg's in the air! It's coming right at me!",'H'),
 (82.4,1.0,'...it landed in my hat. And the meter says: perfect temperature.','H'),
 (86.8,1.1,'Chat, my hat is officially an incubator now. Onward to the volcano.','H'),
 (92.4,1.1,'Welcome to the Cinder Trail. Lava rivers, black rocks, and a very spicy sunset.','H'),
 (96.6,1.25,'Hop on the stones! Bloop, hot hot hot! Leggy just walks through the lava. Show off.','H'),
 (102.4,0.9,'Okay. Nobody move. The egg moved. On my head. I felt it.','H'),
 (106.4,1.0,"Do you hear that? Tik. Tik tik. Chat, I think it's... hatching.",'H'),
 (110.2,1.35,"IT HATCHED! IT HATCHED IN MY HAT! There's a baby dragon on my head!",'H'),
 (115.4,1.0,"He's looking at me. He said mama. Little guy, I'm not your mom. I'm a guy in a hat.",'H'),
 (122.4,1.3,"Hic! He hiccuped FIRE! Right into Bloop's face! Bloop is now extra crispy.",'H'),
 (128.2,1.2,'Bloop holds up the invoice to complain, and... hic. The invoice is gone. Rest in peace.','H'),
 (134.2,1.1,'Chat, he needs a name. Drop your suggestions. ...Pip. His name is Pip. Final answer.','H'),
 (140.4,1.1,"Leggy's bringing him a snack. A fireberry. Pip, say thank you, and... hic. Well done.",'H'),
 (145.6,1.1,"Second berry. He eats it! And now he's hopping onto Leggy's head. Best friends!",'H'),
 (150.0,1.15,"Flying lesson! Step one: climb a rock. Step two: flap your legs.",'H'),
 (153.8,1.25,'She jumped! Plop. But Pip flutters! He flies! A little! Back into my hat.','H'),
 (157.4,1.1,'Night falls, and we climb. And climb. Timelapse, because chat, this volcano is tall.','H'),
 (163.4,0.95,"The top of Ember Peak. A giant nest. And it's empty. Hello? Mama?",'H'),
 (169.2,0.85,'Did something just fly over us? Something... really big?','H'),
 (175.6,1.4,"THOOM! That's Mama! Mama is a GIANT DRAGON! And she is NOT happy!",'H'),
 (182.2,0.9,"She's sniffing me. She sees the shell bits. She thinks I stole her egg.",'H'),
 (187.2,1.4,'RUN! Fire! FIRE! Around the nest! Bloop is hiding under his hard hat! Good plan!','H'),
 (198.4,1.0,"And now I'm at the edge of a cliff. Chat, this is fine. This is totally fine.",'H'),
 (202.6,1.3,"Leggy jumps in front of me! Leggy, no!",'H'),
 (206.4,1.15,"But wait. Pip is climbing out of my hat. Flap. Flap flap. He's flying to her!",'H'),
 (212.4,1.1,"MAMA! They found each other! She's nuzzling him! Okay, I'm not crying, you're crying.",'H'),
 (218.4,1.05,'And Bloop comes out of hiding with a brand new invoice. One egg delivery.','H'),
 (222.6,1.2,'She flicks him a gold block! Bloop got PAID! In gold! ...and he fainted.','H'),
 (226.6,0.95,'The sun comes up over Ember Peak. Quest complete. Pip is home. Chat, that was beautiful.','H'),
 (232.4,1.1,"Bye Pip! Be good! Don't hiccup on anybody! ...Wait, Mama wants something.",'H'),
 (238.4,1.2,"She's pushing a boulder. Behind it are... more eggs. Five more eggs. Oh no.",'H'),
 (243.2,1.25,"Clonk! On my hat. Clonk! Clonk! She's stacking them on my head! Mama, NO!",'H'),
 (251.4,1.15,"And she's flying off with Pip! Back by lunch, apparently! I'm the babysitter now!",'H'),
 (256.4,1.05,'Bloop already has a new invoice. Babysitting, per hour. Of course he does.','H'),
 (262.4,1.0,"Chat, they're wobbling. All of them. At the same time. Please don't.",'H'),
 (270.4,1.35,'POP POP POP POP POP! Five baby dragons! On my head!','H'),
 (274.4,1.0,"And they're all looking down at me. Mama? Mama? Mama? I'm a guy in a HAT!",'H'),
 (278.4,1.4,'Hic! Hic hic hic HIC! MY HAT IS ON FIRE! Get them off! Get them off!','H'),
 (282.2,1.3,'Bloop is handing me an invoice! For my own hat! Run in circles! RUN IN CIRCLES!','H'),
 (286.0,0.9,'Yep. They hatched.','H'),
 (296.0,1.0,'Next time: the carnival! And the ferris wheel escapes?! Bye!','H'),
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
