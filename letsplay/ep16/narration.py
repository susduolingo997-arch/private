import sys, os, json
sys.path.insert(0, '..')
LINES = [
 (0.6,1.1,"Shardwild, episode sixteen. Today... nothing goes wrong. I'm told."),
 (6.0,1.0,"Okay. Hi. I'm calm. I'm very calm. Last episode a stage fell on me. So. Calm."),
 (11.4,1.05,"Today's project: a bridge. Over the gorge. A normal bridge. For walking. Normally."),
 (14.4,1.1,"Bloop has the plans. And... the invoice. Two pages. Of course."),
 (18.2,1.1,"And today... I'm paying it. All of it. Here you go, Bloop. Forty coins. On time."),
 (22.6,1.1,"Bloop fainted. Bloop has never been paid on time. Somebody fan him."),
 (26.4,1.1,"Leggy wants to be first across the bridge. She's already carrying planks. Good girl."),
 (32.4,1.05,"And here's the gorge. It's deep. There's a river down there. I'm not looking at it."),
 (36.4,1.1,"Construction begins! Bloop places a plank. Nothing happens. Suspicious."),
 (40.6,1.0,"Remember the house that fell over? I remember. I remember every night."),
 (47.4,1.0,"Remember the fortress that sank? It sank, chat. It just... sank."),
 (54.2,1.0,"Remember the island that was a fish? I do. I do remember."),
 (61.2,1.0,"Remember the house that floated away? Why do my houses keep leaving?"),
 (68.2,0.9,"I'm checking the support block. Under the bridge. Knock knock. ... Solid. Too solid."),
 (78.2,1.15,"Bloop says it's done. The bridge is done. Nobody celebrate. NOBODY celebrate."),
 (84.2,1.1,"Test one: I throw a rock on it. Boing. It bounced. The bridge is fine. Hmm."),
 (90.2,1.1,"Test two: Bonk-bot drives across. All the way. And... he's fine. Why is he fine?"),
 (96.4,1.0,"Chat, I don't trust this. Type one in the chat if you don't trust this either."),
 (100.4,1.0,"Oh no. Who is that? Is that... a snail? With a clipboard?"),
 (105.4,1.05,"That's Inspector Snailsworth. Official bridge inspector. He's been walking here since Tuesday."),
 (112.4,1.0,"He's inspecting. He taps every plank. With a tiny hammer. Tap. Tap. I can't breathe."),
 (120.6,0.95,"Tap. ... Tap. ... He's writing something. He's writing something down."),
 (128.4,1.0,"He's at the middle. This is where it breaks. This is where it always breaks."),
 (136.2,1.15,"APPROVED?! A gold star? The bridge passed? First try?"),
 (142.2,1.25,"THUNDER! There it is! I KNEW it! The storm is here! Everybody hold on!"),
 (148.4,1.0,"It's... it's just drizzle. It's watering the flowers. That's... nice."),
 (156.4,1.0,"And now there's a rainbow. Over the bridge. Okay this is getting creepy."),
 (161.4,0.95,"Nobody says anything. Something is coming. I can feel it."),
 (166.2,1.25,"FISH! GIANT FISH! It's the island fish! It's back for revenge!"),
 (170.6,1.1,"It jumped over the bridge. And left. It said blub. That was it. Just blub."),
 (176.2,1.15,"Wind! Hold on to something! I'm lying flat! I'm one with the bridge!"),
 (181.6,1.0,"The bridge swayed one centimeter. One. I'm still lying down."),
 (186.2,1.1,"And here goes Leggy. First across! Tap tap tap! She made it! She actually made it!"),
 (192.4,1.05,"Okay. My turn. Very slowly. Step. Step. Step. Don't look down. I looked down."),
 (200.4,1.05,"Picnic time on the other side. Everyone's happy. I'm going to sit on the bridge. And wait."),
 (205.6,1.0,"Bloop framed the receipt. He's hanging it on an easel. He's so proud."),
 (209.4,0.95,"I'm watching the planks. Something will happen. Any second now."),
 (219.0,0.95,"... still standing. Okay. Okay. Maybe... maybe I can sit with everyone."),
 (226.6,1.0,"It's a nice picnic. Leggy is sharing her snacks. Puff is roasting a marshmallow."),
 (233.4,0.95,"Chat. I think... I think it worked. I think it actually worked."),
 (240.2,1.0,"Group hug. Come here. You too, Bloop. Even you, Snailsworth. Slowly."),
 (248.2,0.9,"Look at that sunset. The bridge is standing. Nobody fell. Nothing sank. Nothing floated."),
 (256.4,0.95,"The sign says days without disaster: one. One whole day. A personal record."),
 (262.4,0.95,"We did it. Best episode ever. I'm so proud of this team. I'm just... so..."),
 (268.4,0.9,"... wait. Did you hear that? Something's moving. On the bridge."),
 (271.3,1.3,"AAAAAAAAH! IT'S FALLING! IT'S ALL FALLING!"),
 (276.0,1.05,"... it was a pebble. One pebble. Everyone is staring at me."),
 (280.6,1.0,"I'm fine. Totally fine. Subscribe. Bring a helmet."),
 (286.0,0.9,"Yep. It... worked?"),
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
