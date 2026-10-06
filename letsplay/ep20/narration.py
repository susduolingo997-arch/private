import sys, os, json
sys.path.insert(0, '..')
# two narrators: H = me (am_puck), T = past me from Day 1 (am_michael)
VOICES = {'H': 'am_puck', 'T': 'am_michael'}
LINES = [
 (0.6,1.15,"Shardwild, episode twenty! THE TIME MACHINE! And this time... it works. Allegedly.",'H'),
 (5.0,1.1,"Chat, welcome to my house. Or what's left of it. Tilted. Soggy. Slightly on fire, once.",'H'),
 (12.2,1.15,"Nineteen days of disasters. This house has fallen, sunk, flooded and floated. It's tired. I'm tired.",'H'),
 (19.6,1.1,"But Bloop has a surprise. Under a tarp. Bloop, is that... the pancake?",'H'),
 (23.4,1.2,"TIME MACHINE TWO POINT OH! Rebuilt from the pancake! Shiny! Blue! Not flat!",'H'),
 (28.4,1.1,"And... an invoice. Three pages. Page three is just the word 'please'.",'H'),
 (33.4,1.15,"Okay. Test run. One rubber duck. Ten seconds into the past. Hand on the lever...",'H'),
 (36.8,1.25,"Wait. Why is there already a duck? A duck just came OUT. Before I sent it!",'H'),
 (40.4,1.15,"I pull the lever... ZWOOP! My duck is gone. And the early duck is still here. Chat. CHAT.",'H'),
 (44.8,1.15,"It works. It actually works! And Leggy has adopted the duck. The duck is hers now.",'H'),
 (48.8,1.15,"New plan. We go back to DAY ONE. Before the house. And we build it RIGHT this time.",'H'),
 (54.4,1.15,"Everybody in! Bloop, Leggy, duck. Dial: day one. Hold on to something...",'H'),
 (58.8,1.25,"THREE! TWO! ONE! GOOOOO!",'H'),
 (64.0,1.1,"Whoa. Day one. Look at that grass. No holes. No craters. Fresh.",'H'),
 (68.6,1.15,"And there's a guy. Green hoodie. Silly hat. Placing his first block. Oh no. That's me.",'H'),
 (74.2,1.1,"Uh, hi? Who are you? Why do you have my face? And why does it look so... tired?",'T'),
 (79.4,1.2,"I'm you! From the future! Day twenty! Hi, me!",'H'),
 (82.6,1.15,"Day twenty? Cool. So I'm famous? I have a big house? Tell me I have a big house.",'T'),
 (87.4,1.1,"Define 'house'. ... Wait. What is THAT?",'H'),
 (90.6,1.15,"A clockwork owl just hopped out of the time machine. It's ticking. It's staring at us.",'H'),
 (94.4,1.1,"It's got a meter. Paradox meter? That's not a good meter to have.",'T'),
 (97.6,1.15,"Okay, past me. Listen. Do NOT build here. This is where everything goes wrong.",'H'),
 (101.6,1.15,"But it's the perfect spot! Flat! Sunny! I'm building. Watch this. One hut, coming up!",'T'),
 (107.8,1.1,"He's not listening. Was I always this stubborn? ... Don't answer that, chat.",'H'),
 (112.8,1.15,"Done! Look at her! My first house ever! Isn't she beautiful?",'T'),
 (117.4,1.15,"It's... cute. I'll just lean on the time machine and wait for the disaster. Any minute now...",'H'),
 (121.8,1.3,"CREAK. Oh no. Oh no no no. The machine's tipping. TIMBERRRR!",'H'),
 (125.6,1.25,"MY HOUSE! You squashed my house! On day ONE!",'T'),
 (129.4,1.1,"Wait. The first collapse. The very first disaster. That was... ME? It was always me?!",'H'),
 (134.2,1.15,"Hey, hard-hat guy. You're a builder? What do I owe you? I'll pay right now. Here. A fish.",'T'),
 (139.6,1.15,"Bloop just got paid. On time. Nineteen days early. He's crying. It's a big fish.",'H'),
 (143.4,1.1,"Okay. Future me. If you know what goes wrong...",'T'),
 (146.2,1.15,"...then we fix it together. Proper foundation. Stone base. Real windows.",'H'),
 (150.0,1.2,"Two of us, four hands...",'T'),
 (151.8,1.2,"...double speed! You do the walls...",'H'),
 (153.6,1.2,"...you do the roof! This is SO efficient!",'T'),
 (156.2,1.1,"We finish each other's...",'H'),
 (157.6,1.1,"...sandwiches? No. Sentences. Definitely sentences.",'T'),
 (160.4,1.2,"Meanwhile, the owl just stole Leggy's duck. Bad idea, owl. Bad idea. Leggy, get him!",'H'),
 (165.6,1.2,"Six legs versus two wings! Around the house! Leggy wins! The duck is safe!",'H'),
 (170.6,1.2,"Last block. The chimney. And... DONE! It's gorgeous! High five, future me!",'T'),
 (174.4,1.3,"No wait, don't touch me, the meter...",'H'),
 (176.2,1.3,"TIME IS GLITCHING! The blocks are going backwards! The sun is blinking!",'H'),
 (180.0,1.25,"Why is my voice doing that?! Why is everything doing that?!",'T'),
 (183.4,1.1,"Leggy... gives the owl the duck. As a gift. ... The owl is purring. Time is fixed.",'H'),
 (188.6,1.15,"Okay! Back to the future! Past me, take care of this house. No funny business.",'H'),
 (192.4,1.2,"Bye, future me! Bye, owl! Bye, sad builder with the fish!",'T'),
 (197.2,1.15,"Back in day twenty! Did it work? Is the house still... chat. CHAT. LOOK.",'H'),
 (201.4,1.25,"IT STANDS! Stone base! Two floors! Real windows! A chimney! It's not tilted! At all!",'H'),
 (207.2,1.1,"Nineteen days of disasters. Gone. This is the house that should have been.",'H'),
 (212.6,1.15,"And Bloop checked his records. Invoice: paid. Nineteen days ago. In fish. The fish is... ripe.",'H'),
 (218.8,1.1,"Okay. Calm. Peace. Nothing else is coming out of that machine. Right?",'H'),
 (222.6,1.25,"SURPRISE! Did you miss me?",'T'),
 (224.8,1.25,"YOU CAN'T BE HERE! You're the past! Go back to the past!",'H'),
 (228.6,1.1,"I just wanted to see how the house turns out. ... Wow. I'm good. We're good.",'T'),
 (233.6,1.05,"Fine. One sunset. On the porch. Me, me, Bloop, Leggy, and an owl.",'H'),
 (239.2,1.0,"This is honestly the best...",'T'),
 (241.4,1.0,"...house we have ever built. Yeah. It really is.",'H'),
 (246.6,1.1,"Chat, I said it in the title, and it's true. It works. Everything works. Just this once.",'H'),
 (252.8,1.15,"Hey. Why does Leggy have three ducks now? We only sent one.",'T'),
 (256.8,1.15,"Uh oh. The machine is humming. Nobody touched it. Why is it humming?",'H'),
 (261.6,1.2,"Something's coming out. A top hat. A red hoodie. Oh no.",'H'),
 (265.6,1.25,"That's us! That's US again! From even further in the future!",'T'),
 (269.8,1.25,"He's waving his arms! He's shouting something! Don't let Leggy squeeze the...",'H'),
 (274.6,0.9,"squeak.",'H'),
 (276.4,1.25,"DUCKS! It's raining ducks! From the sky! Hundreds of ducks!",'T'),
 (280.6,1.0,"Three of me. One house. A thousand ducks.",'H'),
 (286.0,0.9,"Yep. It works. Too well.",'H'),
]
if __name__ == "__main__":
    import soundfile as sf
    from kokoro_onnx import Kokoro
    V = sys.argv[1]; k = Kokoro(V + "/kokoro.onnx", V + "/voices.bin")
    os.makedirs("build/vo", exist_ok=True); cues = []
    for i, (t, sp, txt, who) in enumerate(LINES):
        s, sr = k.create(txt, voice=VOICES[who], speed=sp, lang="en-us")
        f = f"build/vo/{i:03d}.wav"; sf.write(f, s, sr); cues.append(dict(start=t, end=t + len(s) / sr, text=txt, file=f, voice='twin' if who == 'T' else 'me'))
    for a, b in zip(cues, cues[1:]):
        if a["end"] > b["start"] - 0.1: print("OVERLAP %.1f by %.2f" % (a["start"], a["end"] - b["start"]))
    json.dump(cues, open("build/cues.json", "w"), indent=1)
