import sys, os, json
sys.path.insert(0, '..')
VOICE = "am_puck"
LINES = [
 (0.6,1.15,"Shardwild, episode twenty-four! We're at the seaside, chat! Sunset! Sand! A job interview!",'H'),
 (6.4,1.1,"This is Barnaby. He's a pelican. He's the lighthouse keeper. And he's going on vacation.",'H'),
 (11.0,1.1,"So tonight, we keep the lighthouse. Just one night. How hard can it be?",'H'),
 (13.6,1.05,"He gave me the keys. And a list of rules. Rule one: keep the light on. Easy.",'H'),
 (17.8,1.05,"Rule two: feed Lumen. Rule three: do NOT let Lumen get excited. ...Who is Lumen?",'H'),
 (22.4,1.2,"And he's gone! Flying away! With a suitcase in his beak! Badly! Bye, Barnaby!",'H'),
 (27.4,1.15,"Bloop builds us a motorboat. Wood. Paint. A little yellow motor. Beautiful.",'H'),
 (34.2,1.1,"Bloop steps on the boat... and he's already seasick. We haven't even left the dock.",'H'),
 (38.6,1.1,"And we're off! Across the bay. Chat, the sun is going down. The lighthouse is getting closer.",'H'),
 (45.0,1.0,"Bloop is leaning over the side. Bloop is having a very bad time. Stay strong, Bloop.",'H'),
 (52.4,1.1,"Land! The island! Up the stairs! A lot of stairs! Two hundred stairs!",'H'),
 (58.4,1.0,"The lamp room. It's dark. There's a big glass tank. And something... glowing. Inside.",'H'),
 (63.4,1.25,"It's a FISH! A big, toothy, glowing fish! The light is a FISH!",'H'),
 (67.6,1.05,"That's Lumen. Lumen IS the lighthouse. That little glowing ball on its head is the light.",'H'),
 (70.6,1.0,"But it's... dimming. Lumen looks sad. Light power: dropping. Chat, that's bad.",'H'),
 (78.4,1.3,"KRAKOOM! A storm! Out of nowhere! Rain! Lightning! Waves!",'H'),
 (84.4,1.25,"And out on the bay... a yacht! Heading straight for the rocks! Is that... DUKE FLUFFINGTON?",'H'),
 (90.4,1.15,"We need the light! Okay, Lumen. Cheer up. Why did the fish blush? Because it saw the... ocean's bottom.",'H'),
 (95.6,1.0,"...Nothing. Lumen is unimpressed. Tough crowd.",'H'),
 (98.4,1.15,"Bloop has an idea! Between throwing up, he's building... a disco ball?",'H'),
 (103.2,1.1,"Disco! Lights! Music! ...Lumen is hiding behind the little castle. Too much disco.",'H'),
 (108.4,1.1,"Leggy tries dancing. Six legs. Tippy tap tippy tap. ...Lumen peeks out! A little brighter!",'H'),
 (116.4,1.15,"Wait. Rule two. Feed Lumen. When did it last EAT? There's no fish food! Okay. I'm going in.",'H'),
 (122.2,1.35,"SPLOOSH! The water is FREEZING! It's dark! Something touched my foot!",'H'),
 (126.4,1.05,"First catch: a boot. Not food. Second catch: also a boot. Same boot.",'H'),
 (130.8,1.2,"THIRD CATCH! SHRIMP! A whole bucket of shrimp! I'm a fisherman!",'H'),
 (134.6,1.1,"Back up the stairs. Soaking wet. Two hundred stairs. Here, Lumen. Dinner.",'H'),
 (138.6,1.2,"CHOMP! It loves them! The light's getting brighter! Seventy percent!",'H'),
 (142.4,1.15,"But the yacht's still too far! Seventy isn't enough! We need more!",'H'),
 (146.4,1.05,"And Leggy... Leggy, who hates water... climbs into the tank. And gives Lumen a hug.",'H'),
 (151.0,1.25,"ONE HUNDRED PERCENT! Lumen is glowing like the sun!",'H'),
 (154.4,1.25,"And Bloop turns the disco ball into a reflector! The beam is TEN TIMES BIGGER!",'H'),
 (160.4,1.2,"The yacht sees the rocks! It's turning! It's TURNING! The Duke is waving! Everyone's safe!",'H'),
 (167.0,1.05,"Chat. We did it. The light stayed on. Nobody sank. That's a first.",'H'),
 (170.6,0.95,"And the storm... just stops. Quiet. Stars. Lumen's purring. Do fish purr?",'H'),
 (177.0,0.95,"Bloop isn't seasick anymore. Leggy's drying off. I'm still wet. But it's nice.",'H'),
 (184.4,0.95,"You know what, chat? I think I like lighthouses. They're cozy. In a stormy way.",'H'),
 (190.0,0.95,"...We fell asleep. All of us. On the lamp room floor.",'H'),
 (196.4,1.1,"Morning! The sun's up! And look who's flying back. Badly. It's Barnaby!",'H'),
 (203.4,1.05,"He landed. On the railing. Mostly. He's checking the light.",'H'),
 (208.4,1.05,"Barnaby says: good job, kids. Light's on. Lumen's fed. Nobody got excited.",'H'),
 (213.6,1.05,"He's very proud. Lumen is looking at him. Lumen is REALLY looking at him.",'H'),
 (218.4,1.1,"Oh no. Rule three. Lumen missed Barnaby. Lumen is getting... excited.",'H'),
 (222.6,1.3,"THE LIGHT! IT'S TOO BRIGHT! TWO HUNDRED PERCENT! THREE HUNDRED! I CAN'T SEE!",'H'),
 (228.4,1.25,"The tank is boiling! Bubbles everywhere! Barnaby is flapping! Bloop is yelling!",'H'),
 (236.4,1.3,"LUMEN JUMPED OUT OF THE TANK! It's flopping around the room! Bouncing off the walls!",'H'),
 (242.4,1.25,"It knocked the disco ball down! It's heading for the roof! I'm grabbing the lure!",'H'),
 (246.6,1.3,"I'M HOLDING ON! WHY AM I HOLDING ON?!",'H'),
 (250.4,1.4,"THROUGH THE DOME! WE'RE OUTSIDE! WE'RE FLYING OVER THE BAY!",'H'),
 (257.0,1.25,"And down... and down... and... SPLASH!",'H'),
 (262.6,1.25,"We're in the water! I'm riding a fish! I'm SURFING a fish!",'H'),
 (267.6,1.15,"Chat, this is actually amazing. Lumen's so happy. Barnaby's cheering from the top. Bloop's... facepalming.",'H'),
 (273.4,1.1,"The lighthouse is dark now, though. Because the light is out here. With me.",'H'),
 (278.2,1.3,"Oh no. It's going for a jump. A BIG jump! HOLD ON!",'H'),
 (282.0,1.2,"WHEEEEEEEE!",'H'),
 (286.0,0.9,"Yep. It's a fish.",'H'),
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
