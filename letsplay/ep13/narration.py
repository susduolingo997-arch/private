import sys, os, json
sys.path.insert(0, '..')
LINES = [
 (0.6,1.15,"Shardwild, episode thirteen! Welcome to... THE GRAND RACE! Around the whole island!"),
 (6.2,1.05,"Judge Flopsy is announcing. He's back! Bow tie and everything."),
 (10.6,1.1,"The racers: Prestin on his golden hover-sled. The goose, riding Bonk-bot. He fixed the robot!"),
 (17.0,1.1,"And Bloop is building a kart. Right now. On the starting line. Classic Bloop."),
 (22.8,1.1,"And us! Leggy, the fastest six legs in Shardwild! And me, her jockey! Very professional."),
 (29.0,1.1,"Puff is our turbo. Muffin is our mascot. He's sitting on Leggy's head. He insisted."),
 (34.8,1.1,"Bloop's kart is done! Four wheels, one seat, zero safety features. Beautiful."),
 (40.2,1.05,"Prestin's doing stretches. On a hover-sled. He doesn't even need legs for this."),
 (45.6,1.1,"The goose just honked at me. That's trash talk. I know trash talk when I hear it."),
 (51.0,1.05,"Chat, place your bets. My money's on Leggy. Not that I have any money."),
 (56.2,1.2,"Racers, to your marks! Here we go!"),
 (59.6,1.25,"Three! Two! One! GOOOO!"),
 (63.6,1.25,"AND THEY'RE OFF! Prestin takes the lead! Leggy's right behind! Bloop's still starting the engine."),
 (70.4,1.2,"Down the beach! Past the crowd! The seals are going wild!"),
 (74.6,1.25,"Into the canyon! Hold on, Muffin!"),
 (80.2,1.15,"The Ash Canyon! Hot, dusty, and full of rocks! Prestin's still leading!"),
 (85.2,1.2,"Bonk-bot is bumping Leggy! Hey! That's a foul! Judge? JUDGE?!"),
 (90.4,1.1,"Wait, where's Bloop? Bloop's front wheel just rolled past us. Without Bloop."),
 (96.2,1.0,"Bloop's fixing it. Mid-race. With his mallet. Respect."),
 (100.0,1.3,"Time for the turbo! Puff, BOOST!"),
 (102.2,1.3,"WHOA! We're FLYING! We passed Prestin! We passed everyone! We're passing... the road!"),
 (107.8,1.05,"...We're in a sand dune. Leggy's upside down. Muffin is fine. Muffin is always fine."),
 (113.6,1.2,"Back on the road! We're in third now! Come on, Leggy!"),
 (117.6,1.15,"Wait, what's blocking the road? Are those rocks? Rolling rocks? With faces?!"),
 (122.8,1.15,"Pebblebacks! A whole herd of them! They're crossing the canyon! Everybody's stuck!"),
 (128.2,1.1,"Prestin's trying to push through. The rocks roll into him. And he's... bounced. Hard."),
 (134.2,1.1,"Bonk-bot tried too. Bonk-bot is now spinning in circles. Rocks one, robots zero."),
 (139.6,0.95,"But Leggy's just waiting. Patiently. Letting them cross."),
 (143.6,1.1,"Aww, a baby one is stuck in a crack! Leggy's helping it out! Leggy, you sweetheart!"),
 (149.4,1.2,"And the herd is turning around? They're rolling under us! They're CARRYING us!"),
 (154.8,1.2,"We're on a rock conveyor belt! The pebblebacks are paying Leggy back! Kindness POWER!"),
 (161.2,1.25,"We're zooming past everyone! First place! FIRST PLACE!"),
 (165.0,1.2,"Thank you, pebblebacks! Out of the canyon! Final stretch!"),
 (169.0,1.05,"Meanwhile, behind us, Prestin's sled is smoking, and Bonk-bot is still dizzy."),
 (174.4,1.15,"And Bloop just strapped the Drillbert to his kart. Oh no. He's FAST."),
 (180.2,1.2,"Chat, it's a real race now! Everybody's catching up!"),
 (184.0,1.25,"Leggy, give it everything! Six legs! Sixty steps per second!"),
 (190.2,1.25,"BACK AT THE BEACH! The final straight! All four of us! Neck and neck!"),
 (195.2,1.2,"Bloop's rocket kart is gaining! Prestin's boosting! Bonk-bot is going backwards?"),
 (200.8,1.3,"The finish line! Here it comes! LEGGY, GO, GO, GOOOO!"),
 (205.2,1.3,"IT'S CLOSE! IT'S SO CLOSE! IT'S..."),
 (208.0,1.05,"...everybody crashed into the finish line. At the same time. The arch is falling."),
 (213.2,1.2,"PHOTO FINISH! Judge Flopsy is checking the photo! Who won?!"),
 (217.0,1.1,"Is it Leggy's nose? Prestin's sled? Bloop's wheel?"),
 (220.6,1.0,"...It's Muffin. The cherry on Muffin's head crossed first. Muffin won the Grand Race."),
 (226.6,1.2,"The cupcake won. The CUPCAKE won."),
 (229.2,1.05,"Muffin is on the podium. Leggy's second. Bloop's third. Prestin's... somewhere."),
 (234.6,1.1,"Bonk-bot came last. The goose is furious. The goose is honking at the robot."),
 (240.0,1.0,"But look at Leggy. She doesn't even care. She's happy for Muffin."),
 (244.2,1.15,"And look who came to watch! The pebblebacks! They rolled all the way here!"),
 (249.0,1.05,"Leggy, you didn't win, but you won something better. A rock herd that loves you."),
 (254.6,1.05,"Muffin's doing a victory lap. On Leggy. Of course."),
 (258.0,1.1,"Prestin wants a rematch. Bloop gave Muffin an invoice for the kart. Muffin ate it."),
 (264.8,1.1,"Chat, comment who you were rooting for. If you said the cupcake, you're a genius."),
 (270.2,1.05,"Best race ever. Nobody won. Except a cupcake."),
 (273.8,1.05,"Shardwild Grand Race: first place, Muffin. Last place, our dignity."),
 (278.4,1.0,"See you next time. If I can find my dignity."),
 (286.6,0.95,"...Second place. Again."),
 (288.4,1.15,"Next time on Shardwild... the haunted mine! It's not haunted. Probably. Subscribe!"),
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
