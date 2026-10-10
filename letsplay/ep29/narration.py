import sys, os, json
sys.path.insert(0, '..')
VOICE = "am_puck"
LINES = [
 (0.6,1.15,"Shardwild, episode twenty-nine! Chat, we're at the carnival. Rides, games, snacks. Zero building. Zero disasters.",'H'),
 (6.0,1.1,'Look at this place! Lights, stripes, a giant Ferris wheel. Leggy is already staring at the cotton candy.','H'),
 (9.6,1.25,'WHOA! Where did he come from? A guy just sprang out of the ground with a megaphone!','H'),
 (14.2,1.1,"That's Barker Bix. Top hat, megaphone, and a mustache that moves on its own.",'H'),
 (17.0,1.15,'And THAT is the grand prize. A giant plush crown. Chat, I need it. I need it so bad.','H'),
 (21.4,1.1,'One thousand tickets?! Okay. Okay. How hard can carnival games be?','H'),
 (25.6,1.1,'Meanwhile Bix is pulling Bloop aside. Something about the wheel being a bit loose. A job offer!','H'),
 (29.2,1.15,'Ring toss. Easy. First throw... counter. Second throw... the roof.','H'),
 (33.0,1.1,'Third throw bounces off a peg and lands... on Leggy.','H'),
 (36.6,1.15,'Now Leggy tries. Ring. Ring. Ring. Ring. RING! Five for five! With her LEGS!','H'),
 (44.4,1.1,'Strength tester. Watch this, chat. Full power. Hiyaaa!','H'),
 (48.0,1.2,"It says weak. It says WEAK. The puck barely left the ground. That's five tickets.",'H'),
 (52.6,1.15,"Leggy taps it with one leg. Tap. And the bell just... leaves. It's in orbit now. Three hundred tickets!",'H'),
 (61.0,1.15,'She spent three hundred tickets on cotton candy. And then she went INTO the cotton candy. She is the candy now.','H'),
 (66.2,1.1,'Over at the wheel, Bloop is installing something called the Turbo-Spin three thousand. That sounds safe.','H'),
 (70.4,1.15,'Bloop hands Bix an invoice, and Bix pays him. On time! In tickets.','H'),
 (75.2,1.25,'First rider on the turbo wheel wins five hundred tickets? ME! ME ME ME! Pick me!','H'),
 (79.8,1.1,"Okay. We're in. Nice and slow. Look at that view, chat. Very relaxing.",'H'),
 (83.6,1.1,"...Bix? Why are you pulling the lever?",'H'),
 (86.0,1.3,'TOO FAST! TOO FAST! Turbo is way too much turbo! My face is going sideways!','H'),
 (90.4,1.25,'Was that a pop?! The wheel popped off!','H'),
 (93.8,1.25,"It's rolling! Through the big top! Out of the carnival! The Ferris wheel is escaping!",'H'),
 (98.6,1.15,"Chat, I'm inside a runaway Ferris wheel, rolling down a hill at sunset. This is fine.",'H'),
 (103.6,1.3,"AAAAAAAAA! Every second I'm upside down! Leggy is just eating her cotton candy. Calmly!",'H'),
 (109.4,1.2,'Bloop and Bix are chasing us in a bumper car! Bix is yelling stop that wheel. Into the megaphone. Very helpful.','H'),
 (115.6,1.2,"Hay bales! Hay bales ahead! And... we went straight through the hay. There's hay in my hood.",'H'),
 (120.6,1.25,"There's a ramp. Why is there a ramp. Please don't hit the... WE'RE FLYING!",'H'),
 (124.8,1.2,"Leggy throws her cotton candy! It's an airbag! A fluffy pink airbag! We bounced!",'H'),
 (130.2,1.1,"Think. If I run on top the other way... I'm the brake!",'H'),
 (134.8,1.15,"I'm climbing out. Don't look down, chat. Okay I looked down.",'H'),
 (138.4,1.2,"Run run run run! It's working! It's slowing down! Leg day, chat. This is leg day.",'H'),
 (143.4,1.3,"A pond! A POND! Wobble... wobble... don't tip, don't tip, don't tip...",'H'),
 (147.6,1.1,'...phew. It stopped. Right on the edge. My legs are noodles.','H'),
 (151.6,1.15,'Bloop drives around and pushes from the front. Teamwork! Back up the hill we go.','H'),
 (160.6,1.15,"We're back! At night! Rolling the wheel back into the carnival like a giant hamster.",'H'),
 (164.6,1.2,'And CLUNK, right back on its stand. And I get launched. Of course I get launched.','H'),
 (168.6,1.1,'Oh wow. The lights are on. Chat, look at this place now.','H'),
 (172.6,1.1,'Bix gives me the five hundred tickets for the longest ride in carnival history!','H'),
 (176.4,1.0,'...seven hundred and five. Not a thousand. So close, chat. So close.','H'),
 (180.6,1.1,"Wait. Bloop is walking over. He's holding out his tickets. His pay. For me?",'H'),
 (184.6,1.1,"Bloop, that's so nice. One thousand two hundred and five!",'H'),
 (188.0,1.2,"...and he's handing me an invoice. For five hundred tickets. It's a LOAN?! Of course it's a loan.",'H'),
 (193.0,1.25,"But I got it! The giant plush crown! It's so soft! Chat, I'm a king!",'H'),
 (200.6,1.1,'Victory lap on the wheel. Fireworks. Leggy. Nice and slow this time. No turbo.','H'),
 (207.6,1.0,'...this is actually perfect. Top of the wheel, crown on my head. Remember this moment, chat.','H'),
 (222.6,0.95,'...did you hear that? A creak. Why is it creaking.','H'),
 (226.6,1.15,"Oh. It's Leggy. She's chewing on the railing. Leggy, that is not cotton candy!",'H'),
 (232.6,1.15,"Bix is celebrating. He's dancing. He's leaning... on the lever. Bix, NO, the LEVER!",'H'),
 (236.4,1.3,'NO NO NO! Turbo again! Why does it even have a turbo?!','H'),
 (241.6,1.3,"POP. It popped. AGAIN. We're rolling AGAIN!",'H'),
 (248.4,1.2,"And now the carousel popped off too! It's following us! The whole carnival is leaving!",'H'),
 (255.6,1.15,'Bix is on the bumper car yelling step right back! Nobody is stepping right back!','H'),
 (268.6,1.1,"Bloop stopped chasing. He's writing something. Wheel retrieval, times two. Of course.",'H'),
 (274.6,1.0,"...it's just rolling, chat. Into the night. With me in it. Wearing my prize.",'H'),
 (279.6,1.25,'Somebody stop the wheel! I won! I WON! Why am I still screaming!','H'),
 (296.0,1.1,'Next time on Shardwild... the submarine. Bloop forgot the windows.','H'),
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
