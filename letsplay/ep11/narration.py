import sys, os, json
sys.path.insert(0, '..')
LINES = [
 (0.6,1.05,"Shardwild, episode eleven. Look at my head. What's missing? My CROWN. It's been gone since episode eight."),
 (7.4,1.05,"The goose still has it. In his shop. Behind a lock. And tonight... we're getting it back."),
 (13.2,1.1,"Welcome to the heist plan. Step one: Prestin is the distraction. He's very distracting."),
 (19.2,1.1,"Step two: Leggy climbs. Step three: Bloop drills. Step four: Puff is our flashlight."),
 (24.8,1.05,"And step five: I grab the crown. Simple. Elegant. Nothing can go wrong."),
 (29.8,1.1,"Chat, I know. I said nothing can go wrong. I take it back. Something will go wrong."),
 (36.0,1.05,"Team, synchronize your... we don't have watches. Okay. Synchronize your vibes."),
 (41.2,0.95,"Let's go. Quietly. Heist mode. Whisper voice from now on."),
 (48.4,0.95,"...The market at night. Very quiet. Very spooky. Very... is that a robot?"),
 (53.8,1.0,"That's a security robot. With a flashlight. The goose hired security. Of course he did."),
 (60.2,1.2,"Hide! Behind the fountain! Don't breathe! Puff, stop glowing so much!"),
 (64.6,1.0,"Okay, it's gone. Prestin, you're on. Go be distracting."),
 (68.4,1.1,"And he's starting a dance party. In the middle of the night. With seals. And a DJ."),
 (74.4,1.2,"The robot is watching. The goose came out to watch! The goose is DANCING!"),
 (79.6,1.25,"Go go go! Leggy, up the wall!"),
 (82.2,1.1,"She's climbing with me on her back. Six legs, zero fear. Leggy, you're amazing."),
 (87.8,0.95,"Roof. Skylight. Rope. Puff, you come with me. Leggy, lower me down. Slowly..."),
 (93.6,0.9,"...slowly... slowly... okay, this is the coolest thing I've ever done."),
 (98.4,1.0,"I'm a spy. A spy dangling from a rope in a goose's shop. Life is good."),
 (104.0,1.15,"Uh oh. Lasers. Red lasers. Everywhere. Why does a pawn shop have LASERS?!"),
 (109.4,1.05,"Okay. Under this one. Over that one. Limbo! How low can you go?"),
 (114.2,1.0,"Lower... lower... my back makes a noise like a twig. Ow."),
 (118.8,1.2,"Made it! Bloop, your turn. Bloop? Bloop, why are you jumping?!"),
 (124.6,1.1,"He jumped through the skylight. He landed on a pile of pots. Very loud pots."),
 (130.0,0.95,"...Nobody heard that. Nobody heard that, right? Okay. Moving on."),
 (134.2,1.1,"The vault! Bloop, Drillbert time! Drill quietly. Quietly!"),
 (138.2,1.15,"It's open! It's... wait. There's not one crown in here. There are... TWENTY."),
 (144.6,1.2,"Twenty crowns! The goose has been making copies! He's a forger! A goose forger!"),
 (150.2,1.15,"Which one is mine? They all look the same! Chat, which one?!"),
 (154.2,1.05,"Wait. My crown has a real shard in it. And shards glow near warm things. Puff!"),
 (159.8,0.95,"Puff, float over them. Slowly. Find the glow..."),
 (162.8,1.25,"That one! It's glowing! That's my crown! THAT'S MY CROWN!"),
 (166.8,1.0,"It's back. It's on my head. I feel whole again. I feel like a king."),
 (171.4,0.95,"And now we leave very, very carefully and don't touch any..."),
 (175.2,0.9,"...I touched a laser."),
 (176.8,1.3,"ALARM! EVERYBODY OUT! LEGGY, PULL THE ROPE!"),
 (180.8,1.25,"We're flying up! Bloop's holding my leg! Puff's holding Bloop! It's a heist chain!"),
 (186.2,1.3,"The robot's on the roof! It can climb?! WHY CAN IT CLIMB?!"),
 (190.2,1.3,"Jump! JUMP! Down to the plaza! Run around the fountain!"),
 (194.4,1.3,"It's catching up! Bloop, do something! Anything!"),
 (198.0,1.15,"Bloop dropped his bag of marbles. Classic. Wait... it's working!"),
 (202.6,1.25,"The robot's slipping! It's spinning! It's going into the fountain!"),
 (206.8,1.15,"SPLASH! And it's sparking. And it's launching... fake crowns? Into the sky?"),
 (212.6,1.1,"It's raining fake crowns! This is the weirdest thing that's ever happened. Including space."),
 (218.6,1.0,"Uh oh. The goose. The goose is here. And he's holding... a piece of paper?"),
 (223.6,1.05,"A receipt. For my crown. Paid in full. This morning. By... Prestin?!"),
 (229.0,1.05,"Prestin bought it back for me this morning. It was a surprise. For the stream."),
 (234.2,0.95,"So we broke into a shop... to steal a crown... that was already mine."),
 (239.0,1.0,"Chat. CHAT. Don't say anything."),
 (241.2,1.05,"The goose will forgive us. If we pay for the skylight. And the pots. And the robot."),
 (247.2,1.1,"And Bloop is giving the goose an invoice. For the drilling. Bloop, read the room!"),
 (253.0,1.0,"...The goose paid it. Instantly. Bloop is in love with this goose."),
 (257.6,1.05,"Leggy and the goose are dancing again. Prestin's still live. Everyone's happy."),
 (262.6,1.0,"And I have my crown back. Legally. Turns out I always did."),
 (266.8,1.1,"Best heist ever. Zero things stolen. One robot damaged. Twenty fake crowns everywhere."),
 (272.6,1.05,"Like and subscribe if you've ever stolen something you already owned."),
 (277.0,1.05,"Prestin, buddy. Thank you. Really. ...You still have better hair though."),
 (281.8,1.0,"Wait, you don't have hair."),
 (286.6,0.95,"...Crown's back, baby."),
 (288.4,1.15,"Next time on Shardwild... it's Leggy's birthday! She turns one! Subscribe!"),
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
