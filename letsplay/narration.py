# Narration script: (start_seconds, speed, text). Generates per-line TTS + timeline JSON.
import json, sys, os
import soundfile as sf
LINES = [
 # 0:00-0:40 Starting the world
 (0.6,1.10,"WHAT IS UP, everybody! Welcome back to the channel!"),
 (4.0,1.10,"Today, we are playing a brand new game called... Shardwild!"),
 (8.2,1.12,"And this is going to be a completely, totally, one hundred percent normal survival playthrough."),
 (14.0,1.10,"Look at this forest! Pink trees! Teal grass! It's gorgeous!"),
 (18.0,1.12,"Okay. Step one of survival. Everybody knows this. You punch a tree."),
 (22.4,1.20,"Hyah! Hyah! Come on, tree! Give me your wood!"),
 (26.2,1.12,"Yes! Wood! ...Wait. Why is the rest of the tree still floating? ...That's fine. That's a feature."),
 (32.6,1.12,"Now we open the Tinker Grid, put the wood in here... and boom! A Twig Mallet!"),
 (37.0,1.15,"Don't worry, guys. I'm basically an expert. I've watched, like, two videos."),
 # 0:40-1:30 Exploring
 (40.8,1.12,"Alright, let's go explore! Adventure time!"),
 (44.6,1.10,"Look at those hills! Look at that... wait. Is that a village?"),
 (49.6,1.12,"Oh my gosh, there are little guys! They have one eye, and mushroom hats! I love them!"),
 (55.4,1.10,"Hello, little friend! I would like to trade, please. Very politely."),
 (60.0,1.12,"Three wood, for... a Fizzberry Bomb? Sure! What could possibly go wrong?"),
 (64.8,1.15,"Okay, how do I use this? Is it this button? Or maybe..."),
 (67.6,1.30,"Whoa whoa whoa! NO NO NO NO NO!"),
 (71.0,1.00,"...Okay. Okay. So. That was... intentional."),
 (75.0,1.15,"I was renovating! Open-concept living! Very trendy right now!"),
 (79.8,1.15,"Why is he looking at me like that? Don't look at me like that!"),
 (84.4,1.15,"I'm just gonna... go. Bye! Love the village! Five stars!"),
 # 1:30-2:20 The cave
 (90.6,1.10,"Okay, new plan. We need resources. And look at this... a GIANT cave."),
 (95.8,1.12,"I have a stick hammer, zero armor, and half a sandwich. Let's go in!"),
 (101.2,1.08,"It's so dark in here... oh! Oh! Look at these crystals! They're glowing!"),
 (107.2,1.12,"These have got to be worth something. Shard-wild! Shards! I get it now!"),
 (112.6,1.08,"Aww, look at the little glowing bugs! Hi, buddies!"),
 (117.0,1.05,"This is so peaceful. Honestly? Caves are super safe. I don't know why people are scared of..."),
 (123.0,0.95,"...why are the bugs leaving?"),
 (125.6,1.25,"AAAAAAHHHHH! WHAT IS THAT?! WHAT IS THAT?!"),
 (129.4,1.25,"RUN! Run run run! It has so many legs! WHY DOES IT HAVE SO MANY LEGS?!"),
 (134.2,1.25,"Light! I see light! GO GO GO!"),
 (137.4,1.05,"...I'm out. I'm alive. I am never going in a cave again."),
 # 2:20-3:10 Building a house
 (141.0,1.10,"Okay. New plan. We build a house. A safe, normal, reasonable house."),
 (146.4,1.10,"Four walls, a floor... look at that! Beautiful! Very sensible."),
 (151.2,1.12,"Now a roof. Nice! You know what this needs? A tower."),
 (156.0,1.12,"And... another tower. Towers are important. For defense. And for vibes."),
 (161.4,1.15,"Windows! Lots of windows! You can never have too many windows!"),
 (166.2,1.12,"I ran out of nice blocks, so now we're using... whatever this is. Mismatched is a style!"),
 (172.4,1.10,"And finally... THE DOOR. Okay. It's a little big."),
 (176.6,1.12,"It's a little bit bigger than the house. That's fine. It's a statement door."),
 (181.6,1.10,"Ladies and gentlemen... the greatest house ever built. Architects hate me."),
 # 3:10-4:10 Nighttime chaos
 (190.6,1.10,"Uh oh. The sun is going down. That's... fine! We have a house!"),
 (195.4,1.10,"Oh wow, two moons! That's pretty! ...That's pretty ominous, actually."),
 (200.4,1.12,"Something is coming out of the ground. Several somethings."),
 (204.4,1.18,"What ARE those?! Is that a jelly cube with teeth? And a guy on stilts?!"),
 (209.4,1.18,"Okay, I'll just bonk them through the window. Hyah! ...Missed. Hyah! Missed again!"),
 (215.6,1.20,"Fine! Fizzberry Bomb! Take THIS! ...Wait, why is it bouncing back? NO!"),
 (220.6,1.15,"Okay, okay, it's fine, the walls are strong, these walls are..."),
 (223.6,1.30,"THE WALL! THE WALL IS GONE!"),
 (226.4,1.30,"Blocks! Place blocks! Block! Block! Block block block block!"),
 (231.0,1.25,"Get away from me! Go away! Not the door! The giant door is useless!"),
 (236.8,1.25,"Up! I need to go up! Pillar! Pillar! Pillar!"),
 (241.6,1.20,"Is it following me?! Can jelly cubes climb?! Please tell me jelly cubes can't climb!"),
 # 4:10-5:00 Ending
 (250.6,1.00,"Phew. Okay. I'm on the roof. And the sun is coming up."),
 (255.4,1.05,"The monsters are leaving... Look at this view. Look at my beautiful kingdom."),
 (261.4,1.08,"Honestly, guys? Everything went perfectly according to plan. Survival expert."),
 (267.8,1.10,"I'm just gonna fix this one ugly block real quick. This one, right here..."),
 (273.0,0.95,"...what was that noise?"),
 (275.4,1.30,"No. No no no no. WHY? Why is it falling?!"),
 (280.0,1.25,"THAT was the support block?! HOW was THAT the support block?!"),
 (285.4,1.00,"...So. Anyway. That's the video."),
 (288.6,1.15,"If you enjoyed watching me destroy everything, hit subscribe! See you next time, in Shardwild!"),
]
if __name__=="__main__":
    from kokoro_onnx import Kokoro
    V=sys.argv[1]
    k=Kokoro(V+"/kokoro.onnx",V+"/voices.bin")
    os.makedirs("build/vo",exist_ok=True)
    cues=[]
    for i,(t,sp,txt) in enumerate(LINES):
        s,sr=k.create(txt,voice="am_puck",speed=sp,lang="en-us")
        f=f"build/vo/{i:03d}.wav"; sf.write(f,s,sr)
        d=len(s)/sr; cues.append(dict(start=t,end=t+d,text=txt,file=f))
    for a,b in zip(cues,cues[1:]):
        if a["end"]>b["start"]-0.1: print("OVERLAP %.1f by %.2f: %s"%(a["start"],a["end"]-b["start"],a["text"][:40]))
    json.dump(cues,open("build/cues.json","w"),indent=1)
