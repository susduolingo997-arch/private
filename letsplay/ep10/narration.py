import sys, os, json
sys.path.insert(0, '..')
LINES = [
 (0.6,1.15,"Shardwild, episode ten! Double digits! And today we are NOT staying on the ground. We're going to SPACE!"),
 (7.2,1.1,"Prestin got a sponsor. First YouTubers on the Shard Moon. That pink thing in the sky. Up there."),
 (13.8,1.0,"One tiny problem. We don't have a rocket."),
 (16.8,1.1,"Bloop already has a blueprint? The Bloop-One! Of course he does."),
 (21.8,1.1,"Body: blocks. Fins: blocks. Engine: Puff. Wait, Puff is the engine?!"),
 (26.4,1.1,"Building time! Bloop's in charge. Prestin is filming. I'm holding the ladder. Very important job."),
 (33.2,1.15,"Look at it go! Nose cone! Fins! A window so we can wave at the moon!"),
 (38.0,1.1,"Chat, this is the first thing Bloop built that's SUPPOSED to fly. Everything else just ended up flying."),
 (44.6,1.1,"Puff, in you go! You're our engine. Stay warm. Stay toasty."),
 (48.4,1.05,"Wait, where's Leggy? Leggy? Is she hiding behind the tent?"),
 (52.6,1.05,"She's scared of heights. Leggy, it's okay. Space is just very, very, very high up."),
 (58.6,1.2,"Countdown! Three... two... one... LIFTOFF!"),
 (63.8,1.0,"...Nothing. Puff, did you just sneeze? The engine sneezed."),
 (67.6,1.25,"Okay, again! Puff, think warm thoughts! THREE, TWO, ONE!"),
 (71.4,1.3,"WE'RE FLYING! WE'RE ACTUALLY FLYING! BLOOP, IT WORKS!"),
 (75.2,1.2,"Higher! Higher! The sky is getting dark! The beach is tiny!"),
 (80.2,1.0,"Chat... we're in space. That's Shardwild down there. It's round. I didn't know it was round."),
 (86.6,1.2,"Zero gravity! Bloop's invoices are floating everywhere! It's a paper blizzard!"),
 (91.6,1.1,"And Leggy's floating upside down. She's... actually kind of enjoying it?"),
 (96.2,1.1,"Prestin took off his helmet for a selfie. Prestin, you're bald. In space. Bald in space."),
 (102.2,1.05,"Puff Power is at sixty percent. Is that enough to get home? ...We'll think about that later."),
 (110.2,1.2,"Touchdown! Bump, bump, BOUNCE! We landed on the Shard Moon!"),
 (114.2,1.1,"One small step for a guy in an orange hoodie! One giant... wait, I'm floating."),
 (119.6,1.15,"Flag time! SHARDWILD! And Prestin's flag says GLOWUP. Oh, it's a flag war now."),
 (125.6,1.2,"Leggy discovered low gravity. She's jumping twenty blocks high! Look at her go!"),
 (130.8,1.05,"The scared spider is now a space kangaroo."),
 (134.0,1.0,"Wait. Something's moving. Something's peeking out of the craters!"),
 (138.2,1.15,"Little cube guys! With one eye! And an antenna! Hello, little guys!"),
 (142.6,1.0,"They're shivering. It's freezing here. There's no sun on this side of the moon."),
 (147.8,1.15,"But look! They see Puff! They're crowding around him! They're warming up!"),
 (152.6,1.05,"They're bowing. They're bowing to Puff. Puff is their god now."),
 (156.8,1.0,"They call themselves the Moonsquish. And they've never seen a sun before."),
 (161.4,1.0,"Uh oh. Puff hopped up on that rock. He's glowing like a little sun. He... wants to stay."),
 (167.6,1.15,"Puff, buddy, we need you! You're our engine! No Puff, no rocket home!"),
 (172.2,1.15,"Wait, what's he doing? He's splitting? He made a baby Puff! A Puffling!"),
 (177.2,1.1,"The Puffling stays as the moon's sun. And Puff comes home with us. Everybody wins!"),
 (182.6,1.05,"But Puff Power is low. Bloop has an idea. The Moonsquish are bouncy. Really bouncy."),
 (188.2,1.2,"They're stacking under the rocket! A Moonsquish trampoline! Everybody bounce!"),
 (192.8,1.25,"And Leggy jumps the highest! Six legs of pure push! GO, LEGGY!"),
 (197.6,1.25,"LAUNCH! Bye, Moonsquish! Bye, Puffling! Stay warm!"),
 (202.2,1.1,"Heading home. Re-entry in three... two... it's getting hot. It's getting really hot."),
 (208.0,1.3,"We're a fireball! A giant fireball! Bloop, is this normal?! BLOOP?!"),
 (215.2,1.15,"There's the beach! There's camp! There's Prestin's house. Why are we pointed at Prestin's house?"),
 (221.6,1.3,"KABOOM!"),
 (223.0,1.0,"...We landed. Technically. Inside Prestin's living room."),
 (226.8,1.0,"Prestin's real house. The one we built. It's a crater now."),
 (231.2,1.15,"Prestin's laughing! The stream got ten million viewers! The moon landing went viral!"),
 (237.6,1.05,"Bloop is so proud. His rocket flew. And landed. Kind of. That's a first."),
 (242.6,1.05,"Leggy wants to go back. Leggy, the space kangaroo. Who knew?"),
 (246.8,1.0,"And Puff is home, warm and happy. Look up there, chat. See that little pink twinkle?"),
 (252.6,0.95,"That's the Puffling. The moon's very own tiny sun."),
 (255.8,0.95,"That's actually beautiful. I'm not crying. Space dust in my eye."),
 (260.0,1.1,"Best episode ever. We went to space, made friends, and nobody had to build a house."),
 (265.6,1.05,"Except Prestin. Prestin has to build a new house now. Sorry, Prestin."),
 (270.0,1.1,"...Bloop? An invoice? One rocket, slightly used. Re-entry fees. Moon parking?!"),
 (275.8,1.05,"Fine. Chat, I'm still broke. And I still don't have my crown."),
 (280.8,1.0,"...Wait. My crown. The goose still has my crown."),
 (286.6,0.95,"...I have a plan."),
 (288.4,1.15,"Next time on Shardwild... the heist. We're stealing my crown back. Subscribe!"),
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
