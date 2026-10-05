import sys, os, json
sys.path.insert(0, '..')
LINES = [
 (0.6,1.15,"Shardwild, episode eighteen! THE SHRINK RAY!"),
 (6.0,1.1,"So. Remember the baby dinosaur from last time? Chompy? He's not a baby anymore. Look at him."),
 (11.0,1.1,"He ate the garden. He ate the mailbox. He ate one of my boots. While I was wearing it."),
 (14.4,1.1,"But Bloop has a solution! The Shrink Ray! Point, click, small dinosaur. Easy."),
 (19.6,1.0,"Bloop says it's 'mostly tested'. I'm choosing not to ask what mostly means."),
 (22.4,1.1,"Okay Chompy, hold still. Smile for the ray. This won't hurt. Probably."),
 (26.6,1.1,"Three... two... one..."),
 (30.2,1.25,"FIRE! It hit Bonk-bot! It bounced off his shiny visor! It's coming right back at—"),
 (33.6,1.2,"Oh no. Oh no no no. Everything's getting bigger. No. WE'RE getting smaller!"),
 (38.4,1.0,"Chompy is sniffing around. He can't find us. We're... somewhere around his toe."),
 (44.4,1.1,"Okay. Status report. We are tiny. Like, really tiny. One percent tiny."),
 (49.6,1.1,"This grass is like a jungle. Every blade is a skyscraper. Chat, this is actually kind of cool."),
 (55.4,1.05,"That clover is a palm tree. That pebble is a mountain. That ant is... let's not talk about that ant."),
 (60.4,1.1,"Plan: walk back to the shrink ray. It's on the table. Four meters away. Which is four hundred tiny meters."),
 (66.2,1.25,"What's that noise? Skitter skitter. Something big is coming. Something with a LOT of legs."),
 (71.0,1.2,"A BEETLE! A GIANT BEETLE! Leggy, protect us! Leggy? ... Leggy is hiding behind ME."),
 (76.4,1.1,"She's scared! Leggy is scared of a bug! Leggy, you ARE a bug! You're a six-legged bug!"),
 (84.2,1.1,"Okay, Leggy is offering it a crumb. Slowly. Slowly. It's sniffing the crumb..."),
 (89.4,1.1,"It ate the crumb! It's chirping! It likes us! I'm calling it Dotbeetle. Look at those dots!"),
 (96.2,1.2,"And now we're riding it! Giddy-up, Dotbeetle! Leggy is running alongside! She's so fast!"),
 (102.4,1.1,"Chat, I've ridden a boat, a rocket, a cart and a bridge. This is the best one. Don't tell Bonk-bot."),
 (108.4,1.15,"Grass jungle, full speed! Dodge the pebble! Dodge the other pebble! Dodge the worm! Sorry, worm!"),
 (114.6,1.0,"Two hundred tiny meters to go. We're making great time. Tiny time."),
 (120.4,1.1,"Uh oh. A puddle. To us, that's an ocean. Bloop says he can build a boat."),
 (125.4,1.05,"He's using a leaf. And a twig. And a piece of my hoodie. Bloop, that's my hoodie."),
 (132.2,1.1,"Setting sail! The S.S. Leaf! Captain on deck! That's me. I have the hat."),
 (138.0,1.0,"Smooth sailing. Calm waters. And what's that on the other side? Is that... a cupcake mountain?"),
 (142.6,1.15,"That's Muffin. That's giant Muffin. Well, normal Muffin. We're the small ones. And she's hopping—"),
 (146.2,1.3,"WAVE! MUFFIN TSUNAMI! HOLD ON TO THE LEAF!"),
 (150.4,1.1,"We made it to shore. I swallowed some puddle. It tasted like dirt. And cupcake."),
 (156.2,1.15,"Wait. Why is it getting dark? Is that... a cloud? That's not a cloud. That's an EYE."),
 (161.0,1.2,"Chompy found us! He's sniffing! Chompy, it's us! We're your friends! Don't—"),
 (166.2,1.25,"THE TONGUE! THE TONGUE IS COMING! Dotbeetle, do something!"),
 (170.2,1.25,"DOTBEETLE HAS WINGS?! We're flying! WE'RE FLYING! Straight up to the table!"),
 (178.4,1.1,"We landed on the table. And there it is. The shrink ray. It's the size of a building."),
 (184.0,1.05,"Bloop has to climb up and set the dial to grow. Leggy has to pull the lever. Teamwork."),
 (190.2,1.1,"Bloop is climbing the tripod. One tiny step at a time. Go Bloop! You can do it!"),
 (196.2,1.05,"He made it! He's turning the dial! Shrink... medium... GROW. Perfect."),
 (204.2,1.15,"Leggy, pull! All six legs! Pull! PULL! The lever's moving—"),
 (210.2,1.25,"ZAP! Grow beam! It's working! Everything's getting smaller! I mean, WE'RE getting bigger!"),
 (214.4,1.1,"We're back! Normal size! Look at my hands! Normal hands! I've never been so happy to see my hands!"),
 (220.2,1.1,"Everyone's okay. Bloop, Leggy, me. And Dotbeetle came too! She's so small and cute and—"),
 (226.4,1.2,"... she's getting bigger. Did the grow beam hit her too? She's getting bigger! STILL bigger!"),
 (234.2,1.1,"Okay, she's enormous now. And she loves me. She's hugging me. I can't breathe, but she loves me."),
 (244.2,1.05,"But hey, we still have the ray. And we still have a giant dinosaur problem. Round two."),
 (252.2,1.1,"I'm aiming carefully this time. Bonk-bot is inside. No shiny visors. Chompy, hold still."),
 (256.2,1.25,"FIRE! It bounced off Dotbeetle's shiny shell! Of course it did! Where's it going? Where's it—"),
 (260.4,1.15,"... Muffin. It hit Muffin. Muffin is growing. Muffin is very, very big now."),
 (264.4,1.3,"And she's hopping! BOOM! The ray! She stomped the ray! It's gone! Chompy is hiding! CHOMPY IS SCARED!"),
 (270.4,1.1,"So. Chompy is scared of Muffin now. So the problem is solved? Is it? I don't know anymore."),
 (276.2,1.05,"Dotbeetle is hugging me again. Comment if you want a giant beetle. I'll mail you one."),
 (286.0,0.9,"Yep. It hit the wrong guy."),
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
