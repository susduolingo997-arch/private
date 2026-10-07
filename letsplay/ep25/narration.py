import sys, os, json
sys.path.insert(0, '..')
VOICE = "am_puck"
LINES = [
 (0.6,1.15,"Shardwild, episode twenty-five! Chat, I got mail! A package! With a bow!",'H'),
 (6.4,1.1,"It's from Duke Fluffington. Thanks for saving his yacht. And it's... a snow globe!",'H'),
 (11.0,1.0,"Look at it. Tiny houses. Tiny trees. Tiny snow. It's adorable.",'H'),
 (14.4,1.15,"Shake shake shake! Look at the snow go! Okay, let me get a closer look...",'H'),
 (19.6,1.0,"Closer... closer... there's a tiny bell on a tiny hill. And tiny... are those people?",'H'),
 (24.0,1.1,"Wait. Why is it pulling me? Why is my face getting... squishy? Chat? CHAT?",'H'),
 (28.4,1.4,"SHWOOOOOOP!",'H'),
 (30.0,1.05,"From out here: Bloop is staring at an empty spot. Where I used to be. Leggy is staring at the globe.",'H'),
 (36.2,1.1,"Leggy picked it up. Leggy is looking inside. Leggy... gives it a little shake.",'H'),
 (40.4,1.3,"AAAAH! FLUMP! I'm in a snowdrift! I'm in the snow globe! I'm TINY!",'H'),
 (46.4,1.1,"And there are little guys! Snowballs! With scarves! And mittens! Hi! Hi, little guys!",'H'),
 (52.4,1.05,"This is the mayor. Mayor Flurrington. He has a top hat. He says... nobody leaves Flurrytown.",'H'),
 (57.6,1.05,"The only way out: ring the Great Bell on Snowtop. When the snow settles. Okay. Easy.",'H'),
 (62.4,1.4,"RUMBLE! The whole world is shaking! It's Leggy! LEGGY IS SHAKING THE GLOBE!",'H'),
 (66.6,1.2,"I can see her EYE through the glass! It's HUGE! Stop shaking! Please!",'H'),
 (70.6,1.05,"Okay. It stopped. To Snowtop! The Flurries are coming with me. They're very excited.",'H'),
 (76.4,1.0,"Up the hill. Up, up, up. There's a sled up here. Of course there's a sled.",'H'),
 (80.4,1.35,"SLED RIDE! WHEEEE! Wait, we're going DOWN. We need to go UP. WHEEEE anyway!",'H'),
 (86.0,1.0,"Okay. That was a mistake. A fun mistake. Back up the hill.",'H'),
 (92.4,1.1,"Meanwhile, outside. Bloop is building a tiny drill. To drill me out. Bloop, that's glass.",'H'),
 (97.6,1.1,"And Leggy... is shaking it again. While Bloop is drilling. This is not teamwork.",'H'),
 (104.4,1.4,"MEGA SHAKE! I'm sliding! I'm rolling! I'm a SNOWBALL! I'm a BIG SNOWBALL!",'H'),
 (109.6,1.3,"I'm heading for a house! Sorry, little house! KRUNCH!",'H'),
 (116.4,1.0,"...I'm okay. The Flurries are okay. But the mayor wants to tell me something.",'H'),
 (120.6,1.05,"The shakes? They LOVE the shakes. It's the only weather they've ever had. And they've never seen outside.",'H'),
 (126.4,1.15,"Mayor Flurrington says: take us with you! We want to see the big world! ...Okay! Everybody up the hill!",'H'),
 (132.6,1.0,"A Flurry parade. Up to Snowtop. This is the cutest thing I've ever seen, chat.",'H'),
 (140.4,1.25,"The bell! I'm swinging my mallet! DONNNG! DONNNNNG!",'H'),
 (145.2,1.15,"Everything is sparkling. We're floating. We're floating UP. Hold on, everybody!",'H'),
 (150.6,1.25,"Up through the snow! Up to the glass! And...",'H'),
 (156.4,1.3,"POP! I'm out! I'm big again! I'm on the lawn! Hi, Bloop! Hi, Leggy!",'H'),
 (160.6,1.05,"And the Flurries came with me. Six tiny snowballs on the table. Seeing the world. Look at them!",'H'),
 (166.4,1.2,"Oh no. Oh no no no. It's warm out here. They're MELTING! The Flurries are melting!",'H'),
 (172.4,1.2,"Bloop's on it! He's building! Pipes! A crank! A funnel! It's a... snow machine!",'H'),
 (180.0,1.0,"Hurry, Bloop! Mayor Flurrington's hat is sliding off his head!",'H'),
 (188.4,1.25,"FWOOOSH! SNOW! It's snowing in the yard! The Flurries are back! They're cheering!",'H'),
 (195.0,1.0,"The whole yard is turning white. In autumn. Bloop just invented winter.",'H'),
 (200.6,1.0,"Leggy is making snow angels. Six-legged snow angels. They look like snow spiders.",'H'),
 (206.4,1.2,"SNOWBALL FIGHT! Me versus six Flurries! They're tiny but they have great aim! POMF!",'H'),
 (214.0,1.05,"I surrender. I surrender! They win. They're natural snowball throwers. It's in their blood. Their snow.",'H'),
 (220.4,0.95,"Okay. This is nice. Snow on the porch. Flurries on my shoulders. Sunset. Perfect.",'H'),
 (227.6,0.95,"Chat, this might be the best gift I've ever gotten. Thanks, Duke.",'H'),
 (236.4,1.1,"Clunk. ...What was that? The snow machine made a clunk. Machines shouldn't clunk.",'H'),
 (241.6,1.3,"The lever's stuck! It's going faster! OVERDRIVE! Bloop, turn it OFF!",'H'),
 (247.4,1.3,"There's no off switch! Why is there NEVER an off switch?!",'H'),
 (252.4,1.25,"It's up to my knees! It's up to my waist! The house is getting buried!",'H'),
 (259.0,1.2,"Bloop is riding the machine like a bucking horse! Leggy is surfing on the snow!",'H'),
 (265.0,1.15,"The Flurries are LOVING it. This is their dream. This is their paradise.",'H'),
 (269.2,1.2,"I can't move my legs. Chat. I'm stuck. I'm... part of the yard now.",'H'),
 (272.6,1.2,"And Leggy... climbs onto the snow machine. And starts... shaking it. LEGGY, NO!",'H'),
 (278.0,1.35,"FWOOOOOOOMP!",'H'),
 (281.4,1.0,"...It's very quiet in here.",'H'),
 (286.0,0.9,"Yep. It snowed.",'H'),
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
