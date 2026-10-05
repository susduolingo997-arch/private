import sys, os, json
sys.path.insert(0, '..')
LINES = [
 (0.6,1.1,"Shardwild, episode twelve! And today is a very special day. Today... Leggy turns ONE!"),
 (6.6,1.05,"One year since I found her lurking in that cave. She tried to eat me. Now she's family."),
 (12.6,1.1,"So we're throwing her a SURPRISE party. Here's the plan."),
 (16.2,1.1,"Cake. Banner. Balloons. And most importantly... keep Leggy away from camp."),
 (21.6,1.1,"Prestin volunteered. He's taking her on a nature walk. Go, Prestin, go!"),
 (26.8,1.1,"Leggy looks suspicious. Leggy, it's just a walk! A normal walk! Nothing is happening!"),
 (32.6,1.2,"...She's gone. Okay. TEAM. We have until sunset. GO GO GO!"),
 (37.2,1.1,"Bloop is designing the cake. Six tiers. Because Leggy has six legs. Makes sense."),
 (42.6,1.0,"Meanwhile, in the forest... Prestin and Leggy. Nature walk. Very natural."),
 (47.8,1.05,"Prestin is pointing at a butterfly. Leggy is looking back at camp. She knows something."),
 (53.6,1.05,"Wait, what's Leggy picking up? Flowers? Shiny shards? What is she collecting?"),
 (58.8,1.15,"Prestin, keep her busy! Do a dance! Do the hair flip! You don't have hair, but do it!"),
 (64.8,1.15,"Back at camp! Puff is the oven! Bloop is stacking cake layers! I'm licking the spoon."),
 (70.8,1.2,"Layer one! Vanilla! Layer two! Strawberry! This cake is going to be HUGE!"),
 (75.8,1.0,"Puff, keep it warm. Not too warm. Just... cozy warm."),
 (79.8,1.2,"And the banner! HAPPY BIRTHDAY LEGGY! Balloons! Lots of balloons!"),
 (84.4,1.05,"Chat, this is the nicest thing I've ever built. And it's not even a house."),
 (89.8,1.0,"It's not falling. It's not sinking. It's not on fire. Yet."),
 (93.8,0.9,"...why did I say yet."),
 (100.2,1.1,"Forest update: Leggy is trying to sneak back. Prestin is blocking the path with his body."),
 (106.4,1.1,"She went around him. He blocks again. She goes around again. This is a dance now."),
 (112.2,1.05,"And she's still collecting stuff. A feather. A pebble. A tiny pink flower. What's she up to?"),
 (118.6,1.1,"Prestin's texting me: she's onto us, hurry. Prestin, you can't text, it's a voxel game."),
 (124.8,1.25,"Back at camp, layer three is smoking. Puff! Too warm! PUFF, TOO WARM!"),
 (130.0,1.0,"It's burnt. Layer three is charcoal. The cake has a charcoal layer now."),
 (134.6,1.0,"No frosting, no time, and a crispy cake. This is a disaster."),
 (138.8,1.15,"Wait. Who's that? Is that a cupcake? A walking cupcake?!"),
 (143.0,1.15,"It's a little cupcake guy! He followed the cake smell out of the forest!"),
 (147.6,1.1,"He says his name is Muffin. And he's a frosting expert. Muffin, you're HIRED."),
 (153.2,1.2,"Look at him go! Pink frosting! Sprinkles! He's sneezing sprinkles! The cake looks amazing!"),
 (159.6,1.05,"Okay. Cake: done. Banner: done. Balloons: done. Now we just need..."),
 (164.0,1.3,"LEGGY?! She's back early! Everyone hide! HIDE!"),
 (167.2,1.0,"...Wait. She's carrying something. She's not surprised. She brought... gifts?"),
 (172.8,1.05,"A flower crown for me. A shard necklace for Bloop. A feather for Prestin's... head."),
 (179.2,1.0,"A warm pebble for Puff. And a card. Thank you for my first year."),
 (184.2,0.95,"She was throwing US a surprise party. On her own birthday. Leggy..."),
 (189.0,1.1,"I'm not crying. You're crying. Chat's crying. EVERYONE IS CRYING."),
 (193.6,1.3,"PARTY TIME! Happy birthday, Leggy!"),
 (196.4,1.1,"Prestin brought sparkler candles from his sponsor. Puff, light them up!"),
 (201.0,1.1,"Ooh, sparkly! Very sparkly. Extremely sparkly. Why is it hissing?"),
 (205.8,1.3,"THE CAKE IS LAUNCHING! THE CANDLES WERE FIREWORKS! THE CAKE IS A ROCKET!"),
 (210.6,1.1,"It's going up... up... and it's coming down..."),
 (214.6,1.3,"KA-SPLAT!"),
 (216.0,1.0,"...Frosting. Everywhere. On everyone. I have cake in my ears."),
 (220.4,1.1,"Bloop is pink. Prestin is pink. The goose wasn't invited, but he's here, and he's pink."),
 (226.4,1.1,"And Leggy is eating the cake. Off of everyone. She's thrilled."),
 (231.2,1.05,"Best birthday disaster ever."),
 (233.6,1.1,"Okay, a toast! To Leggy! The scariest cave monster who became the best friend ever!"),
 (239.6,1.05,"To Bloop, who builds everything, and invoices everything."),
 (243.6,1.05,"To Puff, our tiny sun. To Prestin, who has no hair but a huge heart."),
 (248.6,1.0,"And to Muffin, our newest friend. Welcome to the family, little cupcake."),
 (253.2,1.2,"Group photo! Prestin, stream it! Everybody squeeze in! Say CAKE!"),
 (257.6,0.95,"Chat, a year ago I was alone in a cave with zero friends. Look at us now."),
 (263.0,1.0,"Thanks for watching all twelve episodes. Seriously. You're part of the family too."),
 (268.6,1.05,"And Bloop just handed me an invoice for the cake. Happy birthday to me, I guess."),
 (274.4,1.05,"Leggy ate the invoice. Leggy is the best."),
 (277.2,1.0,"Happy birthday, Leggy. Here's to year two."),
 (280.6,1.0,"Year two of disasters. I can feel it."),
 (286.6,0.95,"...I still have cake in my ears."),
 (288.4,1.15,"Next time on Shardwild... the grand race! Six legs versus wheels! Subscribe!"),
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
