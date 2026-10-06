import sys, os, json
sys.path.insert(0, '..')
# three narrators: H = me (am_puck), T = past me from Day 1 (am_michael), R = future me from Day 99 (am_adam)
VOICES = {'H': 'am_puck', 'T': 'am_michael', 'R': 'am_adam'}
CUEV = {'H': 'me', 'T': 'twin', 'R': 'top'}
LINES = [
 (0.6,1.15,"Shardwild, episode twenty-one! Welcome back, chat. Quick headcount... there are three of me.",'H'),
 (5.2,1.15,"Hi chat! I'm me from day one! The handsome one!",'T'),
 (8.2,1.1,"And I'm me from day ninety-nine. The wise one. The one with the hat.",'R'),
 (11.6,1.2,"Problem. One couch. Three seats. And now Bloop wants to sit. And Leggy. And the owl.",'H'),
 (16.0,1.2,"Nobody move. Nobody breathe. The couch is making a noise...",'H'),
 (18.8,1.3,"CRACK! IT SNAPPED! The couch is in seven pieces!",'T'),
 (21.6,1.1,"Okay. Confession. This is why I came back. In the future... we never get a bigger couch.",'R'),
 (26.6,1.1,"Eighty days of standing. My knees are ancient. You have to fix this.",'R'),
 (30.2,1.15,"Wait, the owl brought a flyer. Comfy Fair! Grand relay, teams of three! Prize: the Mega Sofa. Seats twelve!",'H'),
 (36.4,1.2,"Teams of three! We ARE three! We're the most three anyone has ever been!",'T'),
 (40.0,1.15,"And Bloop has... an invoice. For the old couch. One couch. Deceased.",'H'),
 (44.2,1.15,"Then Bloop builds a wagon. In six seconds. Wheels and everything. Who IS this guy?",'H'),
 (50.6,1.15,"Everyone on the wagon! Leggy is pulling. Leggy has six legs. Leggy is a horse now.",'R'),
 (55.0,1.2,"Chat, we're on the road. Leggy's going SO fast. Leggy, the brakes! Do we have brakes?!",'H'),
 (59.4,1.25,"We don't have brakes!",'T'),
 (62.4,1.15,"Welcome... to the Comfy Fair! Tents! Bunting! Everything is soft! I want to live here.",'H'),
 (67.8,1.1,"And here's the host. A giant cushion. With a crown. And a megaphone.",'H'),
 (71.8,1.1,"Duke Fluffington, ladies and gentlemen. He's squishy and he's in charge.",'H'),
 (76.0,1.15,"Rules: three legs. Pillow fight, mattress sprint, couch carry. Our rivals: Team Lumpy. Three cushions. Very confident.",'H'),
 (82.4,1.1,"Hold on. The Duke is squinting at us. He thinks we're the same guy.",'R'),
 (85.8,1.2,"We're triplets! Very different triplets! I'm the young one!",'T'),
 (88.8,1.0,"I'm the old one.",'R'),
 (90.4,1.1,"And I'm... the tired one. He lets us in!",'H'),
 (93.4,1.2,"Leg one! Pillow fight on the log! I have never lost a pillow fight!",'T'),
 (97.8,1.0,"He's losing the pillow fight.",'H'),
 (99.8,1.3,"Wait, my hat! The propeller! I'm flying! I'M FLYING!",'T'),
 (103.4,1.25,"Pillow from above! FWUMP! Lumpy is down! Tag, old me!",'T'),
 (106.6,1.05,"Mattress sprint. Watch and learn, kids. Elegance. Experience. Bounce...",'R'),
 (111.2,1.3,"Bounce... BOUNCE... too much bounce! TOO MUCH BOUNCE!",'R'),
 (114.9,1.2,"He's on the tent. He's ON the tent. He's sliding down it like a slide. Honestly? Fast!",'H'),
 (119.6,1.2,"Tag! Your turn, me! Don't drop it!",'R'),
 (121.0,1.15,"Leg three. Carry the couch. Alone. Chat, this couch weighs as much as a house.",'H'),
 (125.8,1.2,"Team Lumpy is winning! They're halfway!",'T'),
 (128.0,1.2,"We're coming! The rule says team of three. Nothing says one at a time!",'R'),
 (131.8,1.2,"Three of me! One couch! RUN! ...Team Lumpy fell asleep on their couch. They're cushions.",'H'),
 (137.6,1.3,"WE WIN! WE WIN! Team Me, Me, and Me!",'H'),
 (140.6,1.15,"Meanwhile, Leggy entered the pet show. Category: fluffiest. Leggy is not fluffy.",'H'),
 (145.6,1.15,"But Leggy brought every duck from the duck rain. On her back. ...First place! FLUFFIEST!",'H'),
 (150.8,1.15,"Prize time! The Duke pulls off the sheet... the MEGA SOFA! It's beautiful! Twelve seats!",'H'),
 (156.0,1.1,"Did the sofa just... blink?",'T'),
 (157.8,1.1,"Sofas don't blink. I'm from the future. I'd know.",'R'),
 (160.6,1.3,"It's standing up. It has LEGS! THE SOFA IS ALIVE! AND IT'S RUNNING!",'H'),
 (164.8,1.25,"After it! It's heading for the mattresses!",'T'),
 (168.6,1.2,"It's bouncing! It's a better bouncer than me! That's humiliating!",'R'),
 (172.6,1.25,"Bloop's in the wagon! Leggy's pulling! Go Bloop! Chase that couch!",'H'),
 (176.8,1.1,"It's cornered. By the fence. Careful... it's scared.",'T'),
 (180.8,1.0,"Leggy walks up. Slowly. Gives it a duck... and climbs on.",'H'),
 (185.6,0.95,"Listen. Chat. Listen... The sofa is purring.",'H'),
 (189.8,1.05,"It just wanted a friend. Same, sofa. Same.",'R'),
 (192.8,1.1,"The Duke says a living sofa chooses its owner. And it chose... Leggy. Fair enough.",'H'),
 (197.8,1.05,"And then Bloop sat down. Bloop. Has never. Sat down. Not once in twenty episodes.",'H'),
 (203.0,1.2,"Look at his face! He's so happy! He's ripping up the couch invoice!",'T'),
 (207.0,1.2,"Everybody on! Sofa, take us home!",'H'),
 (212.4,1.1,"Home. Sunset. And the sofa trots up to the house... turns around... and plops down.",'H'),
 (218.4,1.2,"Seats! Seats for everyone! There's even a seat for the ducks!",'T'),
 (222.2,1.1,"Me, me, me, Bloop, Leggy, the owl, eight ducks. And... it fits.",'R'),
 (226.8,1.0,"Chat. It fits. Something in this series... fits.",'H'),
 (231.2,1.05,"Mission accomplished. In the future, my knees thank you.",'R'),
 (235.2,1.1,"This is the best couch I've ever sat on. And I've only sat on one.",'T'),
 (239.8,1.0,"It's quiet. The sun's going down. Nobody's on fire... I could get used to this.",'H'),
 (245.8,1.05,"Well. Time to go home. Day ninety-nine awaits.",'R'),
 (249.2,1.15,"And back to day one for me. Bye, me! Bye, other me!",'T'),
 (253.6,1.05,"They're walking to the time machine. It's humming. This is actually a little emotional.",'H'),
 (259.0,1.2,"And Leggy... Leggy, no. Don't squeeze the duck. We learned this. DON'T—",'H'),
 (264.2,1.2,"The sofa perked up. It's excited. It's VERY excited.",'H'),
 (268.6,1.25,"It's running laps! With everyone on it! Hold on!",'T'),
 (272.4,1.3,"AAAH! Around the yard! Around the tree! Bloop is screaming! Bloop never screams!",'H'),
 (277.4,1.2,"It's heading for the time machine! It's a twelve-seat sofa! It won't fit!",'R'),
 (281.8,1.3,"IT'S JUMPING! IT'S NOT GONNA FIT—",'H'),
 (286.0,0.9,"Yep. It fits.",'H'),
]
if __name__ == "__main__":
    import soundfile as sf
    from kokoro_onnx import Kokoro
    V = sys.argv[1]; k = Kokoro(V + "/kokoro.onnx", V + "/voices.bin")
    os.makedirs("build/vo", exist_ok=True); cues = []
    for i, (t, sp, txt, who) in enumerate(LINES):
        s, sr = k.create(txt, voice=VOICES[who], speed=sp, lang="en-us")
        f = f"build/vo/{i:03d}.wav"; sf.write(f, s, sr); cues.append(dict(start=t, end=t + len(s) / sr, text=txt, file=f, voice=CUEV[who]))
    for a, b in zip(cues, cues[1:]):
        if a["end"] > b["start"] - 0.1: print("OVERLAP %.1f by %.2f" % (a["start"], a["end"] - b["start"]))
    json.dump(cues, open("build/cues.json", "w"), indent=1)
