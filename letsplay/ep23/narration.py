import sys, os, json
sys.path.insert(0, '..')
VOICE = "am_puck"
LINES = [
 (0.6,1.15,"Shardwild, episode twenty-three! Good morning, chat! Today we're doing something calm. Something wholesome. Baking.",'H'),
 (5.4,1.15,"Bloop built an oven. The Turbo-Oven. It bakes a cake in ten seconds. What could possibly go wrong?",'H'),
 (11.4,1.1,"Test cake. Flour, eggs, sugar. Stir, stir, stir. I'm basically a chef.",'H'),
 (16.4,1.15,"Into the oven. Ten seconds. It's rumbling. Is it supposed to rumble?",'H'),
 (20.4,1.4,"POOF! FLOUR! EVERYWHERE! I can't see! I'm a ghost now! A baking ghost!",'H'),
 (26.4,1.1,"Leggy's here with mail. On her head. Okay, let's read it.",'H'),
 (29.6,1.1,"The Grand Crumbleton Bake-Off! Prize: the Golden Whisk! Judge: Brioche. Very strict.",'H'),
 (34.4,1.1,"No magic ingredients, it says. Hmm. Does shard sugar count? ...It's basically sugar.",'H'),
 (38.6,1.15,"We're going! Chat, wish me luck. I'm still covered in flour. That's my look now.",'H'),
 (42.6,1.1,"The bake-off tent! Stripes! Ovens! Four stations! And... the judge.",'H'),
 (47.4,1.0,"Judge Brioche. He's a loaf of bread. With a monocle. He has never smiled.",'H'),
 (53.4,1.1,"Four contestants. Me. Duke Fluffington. Team Lumpy. And... Bloop entered too! Bloop's baking!",'H'),
 (58.4,1.25,"DING! Bake! Go go go! Eggs! Crack! ...Where did the egg go?",'H'),
 (62.8,1.1,"It landed on Leggy. Leggy is wearing an egg. Leggy is fine with this.",'H'),
 (66.6,1.1,"Bloop is using a trowel. Bloop is building a cake. Layer by layer. Like a wall.",'H'),
 (70.6,1.05,"Duke's making a pillow cake. Of course he is. It has tassels.",'H'),
 (76.4,1.0,"And now... my secret ingredient. Just a pinch of shard sugar. Just a tiny pinch.",'H'),
 (80.6,1.1,"Into the oven! Timer's running. Okay. Okay. We wait.",'H'),
 (86.4,1.1,"Chat, why is my oven purple. Why is it humming. Why is it glowing.",'H'),
 (92.4,1.2,"DING! Time's up! Judging begins!",'H'),
 (94.6,1.05,"Duke's pillow cake. Brioche takes a bite. Eight out of ten! A strong start.",'H'),
 (100.4,1.05,"Team Lumpy's cake. Team Lumpy fell asleep. Four out of ten.",'H'),
 (104.4,1.1,"Bloop's cake. Brioche bites... CRACK. Ow. It's a brick. It's literally a brick with frosting.",'H'),
 (109.4,1.0,"Two out of ten. Bloop is devastated. He worked so hard on that brick.",'H'),
 (112.4,1.15,"My turn. I open the oven... it's big. It's very big. It's very... pink.",'H'),
 (116.4,1.1,"...Did my cake just blink?",'H'),
 (118.4,1.3,"IT HAS EYES! IT HAS LEGS! MY CAKE IS ALIVE!",'H'),
 (121.4,1.3,"It ATE Duke's cake! It's getting BIGGER! It ate Team Lumpy's cake! EVEN BIGGER!",'H'),
 (128.4,1.3,"Judge Brioche has fainted! Everyone run! It's going for the ROOF!",'H'),
 (133.4,1.4,"KABOOM! Through the roof!",'H'),
 (138.6,1.2,"It landed in the town square. Crumbleton is under attack. By my cake.",'H'),
 (142.6,1.3,"Chat, I named it Crumbs. Crumbs is ROARING. Crumbs is very angry. Or very hungry.",'H'),
 (147.6,1.35,"It's throwing frosting! At ME! SPLAT! ...It's strawberry. It's actually really good.",'H'),
 (153.4,1.2,"I have a whisk. It has teeth. This is a fair fight. EN GARDE!",'H'),
 (158.4,1.0,"...I am losing to a cake.",'H'),
 (161.4,1.2,"Wait! Leggy just took a bite! And Crumbs got SMALLER! That's it! We EAT it!",'H'),
 (167.4,1.2,"Everybody! Grab a fork! The whole town is eating my cake! Nom nom nom!",'H'),
 (175.4,1.35,"FROSTING CANNON! Crumbs is fighting back! It's raining frosting! Retreat! RETREAT!",'H'),
 (181.0,1.1,"We can't win. The cake is too strong. The cake is too delicious.",'H'),
 (184.4,1.1,"But here comes Bloop. Carrying... his brick cake. He sets it down. Right in front of Crumbs.",'H'),
 (189.4,1.3,"Crumbs bites the brick! CRUNCH! Its teeth! Its gumdrop teeth!",'H'),
 (193.4,1.0,"Crumbs is crying. Crumbs is shrinking. Oh no. It's just a little baby cake.",'H'),
 (199.0,0.95,"It wasn't evil, chat. It was just hungry. And made of sugar. And a little bit of shard.",'H'),
 (205.0,1.0,"Okay, I take back everything I said about magic ingredients.",'H'),
 (208.4,1.1,"Judge Brioche wakes up. Adjusts his monocle. Looks at the brick cake.",'H'),
 (213.0,1.2,"The only cake that survived... the winner of the Golden Whisk is... BLOOP!",'H'),
 (218.4,1.25,"BLOOP WINS! Bloop has never won anything! Look at him! He's crying! He's holding it up!",'H'),
 (226.4,1.0,"Sunset in Crumbleton. Everyone's sticky. Nobody's mad. Well, maybe the bakery.",'H'),
 (234.4,0.95,"And Crumbs... is sitting on the fountain. Tiny. Toothless. Kind of cute, honestly.",'H'),
 (240.0,0.95,"Hey little guy. No hard feelings, right? You're a good cake.",'H'),
 (244.4,1.1,"Group photo! Brioche is holding the camera. Everybody squeeze in! Say CAKE!",'H'),
 (250.6,1.1,"Click! Perfect. Chat, that one's going on the fridge.",'H'),
 (256.4,1.0,"Now, I've been baking all day and I haven't had a single bite. Just one little forkful...",'H'),
 (260.4,1.15,"Crumbs is looking at the fork. Crumbs is looking at ME. ...Crumbs is going to the pie table.",'H'),
 (264.6,1.2,"It picked up a pie. It's bigger than Crumbs. It's holding it over its head.",'H'),
 (268.6,1.35,"IT'S CHASING ME! Around the fountain! Sorry! I'm sorry! I put the fork down!",'H'),
 (274.4,1.3,"Bloop is facepalming! Brioche is taking notes! Leggy is cheering for the cake!",'H'),
 (280.4,1.2,"It stopped. It's winding up. Chat. Chat, it's going to—",'H'),
 (283.4,0.8,"slooow... motion...",'H'),
 (286.0,0.9,"Yep. It fights back.",'H'),
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
