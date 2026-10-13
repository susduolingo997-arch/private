import sys, os, json
sys.path.insert(0, '..')
VOICE = "am_puck"
LINES = [
 (0.6,1.15,'Shardwild, episode thirty-two! Chat, I got a JOB. A real one. Pizza delivery!','H'),
 (8.6,1.15,"This is Chef Crustino. He's a tomato who makes pizza. Don't think about it.",'H'),
 (16.4,1.2,"Ooh, he's tossing the dough! Spin, spin... and it's on my head. Dough hat.",'H'),
 (24.8,1.15,'The order! Mega pizza, extra extra spicy, end of the Long Road.','H'),
 (29.6,1.2,"Thirty minutes or it's free. Ordered by... a sauce stain.",'H'),
 (33.4,1.15,'The MEGA PIZZA! Eight slices! And Leggy is... staring.','H'),
 (40.4,1.25,'Bloop built a delivery box! The Hot-Box nine thousand!','H'),
 (44.4,1.15,'Big red TURBO button. Bloop says: do not press.','H'),
 (48.4,1.3,"Timer's running! Everybody on Leggy! GO!",'H'),
 (53.0,1.15,'The Long Road! Easiest job in Shardwild, chat!','H'),
 (61.0,1.1,'Leggy. Your head is turning. Toward the box. Leggy. NO.','H'),
 (68.6,1.3,'Slice check... SEVEN?! There were EIGHT!','H'),
 (76.6,1.25,'Bridge out?! Bloop is building a ramp. Hero.','H'),
 (84.6,1.3,'Ramp go! Leggy, JUMP! ...slow motion...','H'),
 (89.4,1.3,'We stick the landing! Air mail!','H'),
 (93.0,1.35,'SIX?! Two slices GONE!','H'),
 (96.8,1.2,'Order in the court! The people versus Leggy!','H'),
 (100.8,1.25,'Objection! Bloop is defending her!','H'),
 (104.8,1.05,'New plan. Stakeout. Box on the road, we hide.','H'),
 (109.2,0.9,'Shh. Whisper mode. Leggy, your crystals are showing.','H'),
 (113.4,1.1,"The lid... it's opening. From INSIDE.",'H'),
 (116.0,1.3,"A BANDIT! HE WAS IN THE BOX! Leggy, I'm SO sorry!",'H'),
 (120.8,1.3,"GET HIM! He's got slice number five!",'H'),
 (124.6,1.2,'Ow. Tree. Found it with my face.','H'),
 (130.8,1.0,'Into the log... oh. He has babies. Three tiny babies.','H'),
 (135.8,1.0,"He was feeding his kids. I can't be mad at that.",'H'),
 (140.6,1.05,'The little one is offering Leggy a slice. She LOVES pizza...','H'),
 (145.8,1.25,"She said NO! Leggy, I'm so proud of you!",'H'),
 (150.4,1.35,'Wait. TWO MINUTES LEFT?! The road is SO long!','H'),
 (155.2,1.2,"The TURBO button. I'm pressing it.",'H'),
 (159.2,1.3,"IT BLOWS PIZZA SMELL AT HER NOSE! SHE'S CHASING IT!",'H'),
 (164.0,1.3,'We are going SO fast! Bloop is a flag now!','H'),
 (168.4,1.25,'Speed limit six legs?! We HAVE six legs!','H'),
 (172.4,1.3,'End of the Long Road! Hold on!','H'),
 (176.8,1.25,'WE MADE IT! With seconds to spare!','H'),
 (182.4,1.15,'Knock knock! Pizza delivery! Hellooo?','H'),
 (186.4,1.1,"Nobody's home. And the clock hits zero. LATE.",'H'),
 (190.8,1.05,'The mailbox has a name on it. It says... LEGGY?!','H'),
 (196.0,1.25,"Leggy, did YOU order this?! She's nodding!",'H'),
 (200.2,1.15,'She LIVES here! She set a table! With a candle!','H'),
 (204.4,1.0,'She rode with her own pizza on her back. Chat.','H'),
 (208.4,1.2,'Bloop hands her his invoice, and...','H'),
 (212.0,1.25,'SHE PAID HIM! Bloop got PAID! First time ever!','H'),
 (218.6,1.3,'Chef Crustino?! He ran all the way here?!','H'),
 (222.8,1.2,'We were late. By ONE second.','H'),
 (226.8,1.3,"So it's FREE?! For HER?! And I pay?!",'H'),
 (236.6,0.95,"Now she eats. With a napkin. So polite. It's beautiful.",'H'),
 (244.6,1.3,'GULP. The whole pizza. And... the BOX?!','H'),
 (252.0,1.0,'Hang on. The order said extra... extra...','H'),
 (256.4,1.35,"SPICY! She's turning RED! She's STEAMING!",'H'),
 (262.4,1.35,"She's a kettle! Everybody RUN!",'H'),
 (267.0,1.3,'Chat, if this is the end, like and subscribe!','H'),
 (271.0,1.35,"She's breathing in... NO NO NO!",'H'),
 (275.0,1.35,"FIRE SNEEZE! WE'RE FLYYYING!",'H'),
 (286.6,1.0,'...yep. She ate it. And the box. Extra extra spicy.','H'),
 (296.6,1.2,"Next time: the robot. It wants Bloop's job. See you there!",'H'),
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
