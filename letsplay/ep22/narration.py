import sys, os, json
sys.path.insert(0, '..')
VOICE = "am_puck"
LINES = [
 (0.6,1.15,"Shardwild, episode twenty-two! Chat, it's a calm evening. Sofie's asleep. The house is standing. Suspicious.",'H'),
 (6.4,1.15,"Wait. Did you hear that? A whistle. A train whistle. We don't HAVE trains.",'H'),
 (11.4,1.1,"Something's floating down. Glowing. Spinning. It's a... ticket?",'H'),
 (14.6,1.1,"Ghost Train. Admit three. Departs midnight. Next stop: AAAAH. No refunds. No exits.",'H'),
 (19.4,1.15,"Bloop has hidden behind me. Bloop doesn't do ghosts. Bloop has made that very clear.",'H'),
 (24.4,1.15,"So Bloop is building a ghost detector. To prove ghosts aren't real. Scientifically.",'H'),
 (30.6,1.1,"The Spook-o-Meter! Testing on Leggy... forty percent spooky. Rude, but fair.",'H'),
 (34.6,1.1,"Testing on me... three percent. I'm the least spooky thing here. Great.",'H'),
 (37.6,1.1,"Okay. Lantern. Ticket. Courage. Let's go find a ghost train.",'H'),
 (46.6,1.05,"Hollow Hill Station. Abandoned for years. Fog. Rails. A clock that doesn't work.",'H'),
 (52.2,0.95,"Chat, I'm whispering now. Because... vibes. Step. Step. Creak.",'H'),
 (56.4,1.3,"AAH! BATS! Paper bats? Flappy... paper... things! Okay. Okay. I'm fine.",'H'),
 (60.4,1.2,"The clock. It's striking twelve. The clock that doesn't work is WORKING.",'H'),
 (64.4,1.1,"And out of the fog... a train. A see-through, glowing, ghost... train.",'H'),
 (72.4,1.05,"A ghost conductor. A sheet with a hat. And a lantern. He wants our tickets.",'H'),
 (75.8,1.1,"Bloop fainted. Bloop is on the floor. Spook-o-Meter: ninety-seven percent.",'H'),
 (79.4,1.1,"Here's our ticket, Mister Ghost, sir. Click. Punched. We're... going.",'H'),
 (84.4,1.15,"Leggy's carrying Bloop aboard like a sack of potatoes. A sack of very small, very green potatoes.",'H'),
 (90.4,1.25,"And we're moving! Into the hill! Into the dark! Chat, hold my hand. Metaphorically.",'H'),
 (96.6,1.1,"Inside the tunnel. Glowing mushrooms. Floating lanterns. This is actually kind of pretty.",'H'),
 (102.0,1.1,"The conductor keeps looking back at us. Proud. Like a dad at a school play.",'H'),
 (104.6,1.35,"WHAT IS THAT? A FACE! A ROCK FACE! IT'S OPENING ITS MOUTH! AAAH!",'H'),
 (109.4,1.1,"...It closed again. The conductor is clapping. That was the show. Okay. Good show.",'H'),
 (113.4,1.3,"FLAPPERS! A whole swarm! Leggy is trying to catch them! Leggy, they're not snacks!",'H'),
 (118.6,1.1,"Wait. Why is the track going... down? Why is it going DOWN?",'H'),
 (122.4,1.4,"WHEEEEEEE! OKAY THIS IS FUN! THIS IS ACTUALLY REALLY FUN!",'H'),
 (127.0,1.1,"And... we're slowing down. A big cave. End of the line.",'H'),
 (130.8,1.0,"There's a little platform. One chair. A lot of empty benches. And a poster.",'H'),
 (134.6,0.95,"Opening day... with a question mark. Chat. Nobody came.",'H'),
 (138.6,0.95,"He's sitting alone. He's not scary. He's lonely. Spook-o-Meter says... lonely.",'H'),
 (144.6,1.0,"And Leggy... just walks up. And hugs him. Right through him, kind of.",'H'),
 (148.4,1.05,"He's glowing pink! He's happy! Ghosts glow pink when they're happy! Who knew!",'H'),
 (151.0,1.15,"Mister Ghost! We're going to throw you a REAL opening! We'll fill every seat!",'H'),
 (154.6,1.1,"Bloop woke up. Saw the ghost. Fainted again. Classic Bloop.",'H'),
 (158.4,1.05,"...Okay, he's up. He says he's fine. He says his name is Wisp, by the way. The ghost. Not Bloop.",'H'),
 (164.2,1.1,"Back through the tunnel. Chat, we have a grand opening to plan.",'H'),
 (170.4,1.15,"Timelapse! Lanterns! Bunting! A big sign! Bloop is building faster than I've ever seen.",'H'),
 (177.0,1.1,"I don't think Bloop is scared anymore. I think Bloop is... plotting something.",'H'),
 (184.4,1.15,"And here comes the crowd! Duke Fluffington! Team Lumpy! Every cushion in the valley!",'H'),
 (190.0,1.0,"Wisp is so happy. He's doing a little float-dance.",'H'),
 (192.6,1.2,"The Duke cuts the ribbon! Ghost Train: officially open!",'H'),
 (198.4,1.15,"Everyone aboard! Team Lumpy in front! Me and Leggy in the back!",'H'),
 (203.0,1.0,"Wait. Where's Bloop? ...Why is there a bedsheet on the station roof?",'H'),
 (207.8,1.05,"Oh no. Bloop has a plan. Bloop wants to be the ghost. Bloop has character development.",'H'),
 (212.4,1.1,"The train starts. Slow. Spooky. Elegant. Everybody's loving it.",'H'),
 (216.2,1.4,"BLOOP JUMPS! BOO! He scared WISP! He scared the GHOST!",'H'),
 (219.6,1.35,"Wisp grabbed the lever! FULL SPEED! WE'RE GOING FULL SPEED!",'H'),
 (224.4,1.3,"Through the hill! Out the hill! Around the station! Again! AGAIN!",'H'),
 (232.4,1.25,"And the crowd is going WILD! They love it! Best ride ever! Five stars!",'H'),
 (237.2,1.2,"Okay, can we slow down now? Wisp? The lever? ...Wisp is holding the lever. Just the lever.",'H'),
 (243.0,1.2,"IT SNAPPED OFF! THERE ARE NO BRAKES! WHY ARE THERE NEVER BRAKES?!",'H'),
 (246.6,1.25,"Leggy's dragging all six legs! Sparks! SPARKS! It's not working!",'H'),
 (252.4,1.2,"Fine! I'm climbing to the front! Car by car! Don't look down! Don't look at Bloop!",'H'),
 (258.8,1.2,"I'm in the cab! There's one button! It's red! I'm pressing it!",'H'),
 (262.6,1.1,"...It's the horn. Toot toot. Thanks, train.",'H'),
 (266.4,1.3,"Here comes the curve by the lake! We are NOT gonna make the curve!",'H'),
 (271.6,1.3,"Duke's waving! Team Lumpy's screaming! Wisp is spinning! Bloop is still yelling BOO!",'H'),
 (277.0,1.3,"Chat, if this is the end, it was an honor. A spooky, spooky honor.",'H'),
 (281.6,1.35,"WE'RE OFF THE RAILS! WE'RE FLYIIIIING!",'H'),
 (286.0,0.9,"Yep. It's haunted.",'H'),
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
