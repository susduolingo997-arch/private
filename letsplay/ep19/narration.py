import sys, os, json
sys.path.insert(0, '..')
LINES = [
 (0.6,1.15,"Shardwild, episode nineteen! THE TREASURE MAP!"),
 (5.0,1.1,"Beach day! Sun, sand, and Muffin found... a bottle? There's something inside!"),
 (12.2,1.2,"A MAP! A real treasure map! With a dotted line! And a big red X! Chat, we're rich!"),
 (17.4,1.05,"The X is on that little island. We walk there at low tide. Twenty paces from the big rock."),
 (20.4,1.1,"Leggy wants to do the digging. Six legs, six shovels. Sorry Leggy, the captain digs. I have the hat."),
 (28.2,1.1,"Bloop says digging by hand is for amateurs. He's building something. It's yellow. It's loud."),
 (34.4,1.0,"Chat, if you've ever dug a hole on the beach, you know. It's harder than it looks."),
 (40.2,1.2,"The Dig-o-Matic! A drill on wheels! Test hole: success! Look at that hole. Beautiful hole."),
 (44.4,1.1,"Okay. Twenty paces from the big rock. One. Two. Three. These are big captain paces."),
 (50.2,1.05,"Nine. Ten. Eleven... Leggy's taking tiny paces. Leggy, you're throwing off the count."),
 (55.4,1.1,"Twenty-ish! And now we cross to the island! The tide is out! Go go go!"),
 (64.4,1.1,"The island! Palm trees! Crabs! And there it is! A big red X in the sand!"),
 (70.4,1.0,"Real pirates would dig with a shovel. We have a robot drill. We're better pirates."),
 (74.2,1.2,"Dig-o-Matic, DIG! Brrrrrrr! Deeper! Deeper! We hit something! We hit something!"),
 (80.4,1.1,"It's a... box? A small box. That's fine. Small boxes hold the best treasure. Open it!"),
 (86.2,1.15,"It's another map. The treasure is another map. Who does that? Who buries a MAP?"),
 (91.6,1.0,"This map says the real X is somewhere else on the island. Okay. Okay. We can do this."),
 (96.2,1.1,"Wait. Look at the sand. There's another X. And another one. There are X's everywhere!"),
 (99.6,1.15,"The crabs! The crabs are drawing them! With their claws! Scritch scritch! Stop that!"),
 (102.4,1.25,"Dig them all! Every single X! Dig-o-Matic, maximum drill! BRRRRR! Nope! BRRRRR! Nope!"),
 (108.4,1.2,"Nope! Nope! Nope! That's eight holes! Nine! The island looks like Swiss cheese!"),
 (114.4,1.1,"Eleven holes. Zero treasure. And one very tired robot drill."),
 (118.4,1.05,"But Leggy... Leggy is sniffing something. She's heading for the rocks. Follow Leggy!"),
 (126.4,1.05,"A sea cave! Leggy found a secret cave! It's glowing! Good girl, Leggy!"),
 (132.2,1.0,"Shh. Whisper voice. Crystals everywhere. This is so pirate. This is SO pirate."),
 (140.2,1.15,"And in the middle... a giant X. A REAL X. Painted on the floor. With a chest on it!"),
 (148.2,1.25,"It's open! It's gold! It's full of gold! We did it, chat! TREASURE!"),
 (152.2,1.05,"... why did the chest stand up? Chests don't have legs. That chest has legs."),
 (154.6,1.2,"It's a crab! A giant hermit crab! The treasure chest is her SHELL! She's wearing a pirate hat!"),
 (158.2,1.25,"She's chasing me! Captain Clawdette is chasing me! I'm sorry! I didn't know it was your house!"),
 (164.4,1.2,"Snip snip! Around the cave! Around again! Bloop, help! Bloop is just watching!"),
 (170.4,1.15,"I'm down. I'm down. Captain, please. I'm also a captain. We're colleagues."),
 (176.4,1.05,"Leggy is offering her a snack. Leggy always has a snack. ... She's eating it. She's calming down."),
 (182.4,1.1,"And Bloop has an idea. He's taking the dome off the Dig-o-Matic. It's shiny. It's roomy."),
 (187.6,1.1,"A new shell! She loves it! She's trying it on! It even has a window!"),
 (192.4,1.15,"And she's trading us the gold! A fair trade! Dome for doubloons! Thank you, Captain!"),
 (202.4,1.1,"Back at the beach. Sunset. Sixty-four gold coins. We are officially rich."),
 (210.2,1.1,"And first things first. Bloop. Here. Your invoice. Paid. In gold. With interest."),
 (218.4,1.1,"He's speechless. He's hopping. He's... framing a gold coin. Bloop, you can spend it."),
 (226.4,1.0,"Okay. Calm sunset. Treasure on the blanket. Puff is keeping us warm. Very warm."),
 (232.4,1.05,"Why is the gold... dripping? Gold doesn't drip. Is it hot? Puff, are you too hot?"),
 (240.2,1.3,"It's CHOCOLATE! The gold coins are CHOCOLATE COINS! The treasure is CANDY!"),
 (245.6,1.1,"And Leggy is eating them. Of course she is. Leggy, that was our fortune. That was Bloop's invoice!"),
 (252.4,1.25,"I'm going back to that cave! Clawdette owes us real gold! Out of my way, I'm stomping—"),
 (256.2,1.2,"FWUMP. ... I fell in the test hole. The first hole. The one we dug this morning."),
 (260.4,1.0,"I'm stuck. Up to my neck. X marks the spot. The spot is me."),
 (268.4,1.1,"And the tide is coming in. Of course it is. The tide is coming in. Help? Anyone?"),
 (276.4,1.1,"A crab is coming. With a bucket. Please don't. Please don't do the bucket—"),
 (280.4,1.0,"... it did the bucket. I'm a sandcastle now."),
 (286.0,0.9,"Yep. It was chocolate."),
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
