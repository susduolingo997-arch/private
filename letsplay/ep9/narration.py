import sys, os, json
sys.path.insert(0, '..')
LINES = [
 (0.6,1.1,"Shardwild, episode nine! Bloop is back, Leggy is happy, Puff is warm, and I am... still broke. Life is good!"),
 (7.8,1.15,"Wait. What's that sound? Is that a golden hover-sled? Who parks a hover-sled on a beach?"),
 (13.8,1.05,"Oh no. Perfect hair. Perfect suit. Sunglasses. That's Prestin Glow."),
 (20.2,1.1,"He's a YouTuber. Two point four million viewers. And he just said... flawless. Obviously."),
 (26.2,1.2,"He's building next door. Live. Look at that speed. Who needs that many columns?!"),
 (32.8,1.1,"Done. In six seconds. A mansion. Chat, he built a mansion while I was talking."),
 (38.4,1.15,"Okay. You know what? Build-off. Right now. Me versus the hair."),
 (42.8,1.2,"Watch and learn, Prestin! A tower! Taller! TALLER! Look at this beauty!"),
 (47.8,1.05,"It's swaying a bit. That's character. That's artistic sway."),
 (52.6,1.1,"Chat says it's leaning. Chat, it's not leaning, it's... okay, it's leaning."),
 (57.6,1.3,"NOOO! MY TOWER!"),
 (60.0,1.15,"Fine. Building is overrated. Streaming is about personality. Watch this sick backflip!"),
 (66.2,1.3,"Three, two, one... AAAAAH!"),
 (68.8,1.0,"...I'm in the ocean. My viewers went from thirty-seven to twelve."),
 (73.2,1.1,"Okay, plan C: be cool. Sunglasses. Leggy, how do I look?"),
 (78.0,1.25,"Leggy is laughing. Puff, what are you... PUFF, MY SUNGLASSES ARE ON FIRE!"),
 (83.6,1.0,"I am not cool. I am smoking. Literally."),
 (88.4,1.05,"Wait, Prestin's talking to Bloop. What's he holding? Is that... gold?"),
 (93.0,1.15,"I pay on time. Every time. Bloop is listening! Bloop, don't listen!"),
 (98.8,1.1,"And he's walking over there. With his hard hat. Bloop, you JUST came back!"),
 (104.0,1.2,"Leggy? Not you too! He has a spa?! With a hot pool? And a bow?!"),
 (109.4,1.0,"She looks fabulous. I hate that she looks fabulous."),
 (113.0,0.95,"Everyone left. It's just me and Puff. Puff, you'll never leave me, right? ...Right?"),
 (119.2,0.95,"Puff is asleep. Great."),
 (122.0,1.0,"And now it's dark, and next door there's a housewarming party. I wasn't invited."),
 (129.4,1.1,"Neon lights. A DJ seal. Even the goose is there. The GOOSE, chat."),
 (134.4,0.95,"You know what? I'm sneaking in. Just to look. Spy mode. Whisper voice."),
 (139.4,0.9,"...Around the side. Quiet, Puff. Glow less."),
 (143.0,0.95,"Let's just peek behind the mansion and see how he built it so fast..."),
 (147.6,1.0,"Wait. Wait wait wait."),
 (149.6,1.3,"IT'S FAKE! IT'S ONE WALL! THE WHOLE MANSION IS ONE WALL WITH STICKS!"),
 (154.4,1.15,"Prestin! You can't build at all?! You just edit the videos?!"),
 (158.6,0.95,"He's... crying. Real tears. Through the sunglasses."),
 (162.2,1.05,"He has a live house tour in five minutes. Two million people. And no house."),
 (167.2,1.2,"...Fine. FINE. Bloop! Leggy! We're building a real house. Behind the fake one. GO!"),
 (172.8,1.15,"Bloop's running the site! Leggy carries four blocks at once! Prestin is holding one block. Very carefully."),
 (180.4,1.15,"This is chaos. Beautiful chaos. Chat, we're actually doing it!"),
 (185.2,1.25,"Roof! Door! Done! A real house! Built by real idiots!"),
 (190.0,1.2,"And we're live! The house tour! Prestin and me, side by side!"),
 (194.2,1.05,"He's doing his catchphrase. Flawless. Obviously. It's actually kind of flawless."),
 (200.2,1.15,"And now, he says, the grand finale. Fireworks!"),
 (203.8,1.15,"Ooh! Pretty! Pink one! Blue one! ...Sideways one?"),
 (208.2,1.3,"THE SIDEWAYS ONE HIT THE FAKE WALL! IT'S FALLING! RUN!"),
 (212.8,1.2,"No, don't move! DON'T MOVE! Stand right... here."),
 (216.2,1.05,"...The door hole. We were standing exactly in the door hole. We're alive!"),
 (220.8,1.15,"And Prestin's hair just blew off. His hair was a wig. On live stream."),
 (226.2,1.2,"Two million people saw that. His chat is exploding! They... love it?!"),
 (231.2,1.15,"Real is better than perfect! It's trending! And my viewers just hit two million too!"),
 (237.2,1.0,"And behind the rubble, our real house is still standing. Built by friends."),
 (242.6,1.0,"Next morning. Prestin came over. Hat in his hands. Well, wig in his hands."),
 (247.6,1.1,"He wants to collab. The Glow and the Go. Okay, the name needs work."),
 (253.2,1.2,"Shake on it! Partners! Rivals! Friends! Rival-friends!"),
 (257.0,1.1,"And Bloop has two invoices. One for each of us. Prestin paid instantly. Show-off."),
 (262.6,1.0,"Leggy kept the bow. Puff kept warm. Everyone's happy."),
 (266.8,1.05,"Is he... doing the hair flip? With no hair? It's somehow still smooth."),
 (272.0,1.0,"Flawless. Obviously. Okay, I'll admit it. He's good."),
 (276.0,1.1,"Chat, comment who's cooler. Actually, don't. I know the answer. I don't like the answer."),
 (282.0,1.05,"Anyway, he's still better at hair."),
 (286.6,0.95,"...Fake wall. Real friends."),
 (288.4,1.15,"Next time on Shardwild... we're going to space?! We need a rocket. Subscribe!"),
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
