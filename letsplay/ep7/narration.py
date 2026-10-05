import sys, os, json
sys.path.insert(0, '..')
LINES = [
 (0.6,1.12,"Welcome back to Shardwild, episode seven! New rule today: we are NOT building a house. No houses. Zero houses."),
 (8.0,1.05,"Puff, buddy, you stay here and keep the hot tub warm. Good boy. Stay."),
 (12.8,1.1,"Wait, who's that sliding up the beach? Is that... a seal in a bow tie?"),
 (17.2,1.15,"It's Judge Flopsy! He's announcing the Frostbite Cup! An ice fishing contest on the big iceberg!"),
 (23.6,1.15,"Biggest fish wins a solid gold fish. Solid gold! Bloop, that pays ALL your invoices!"),
 (29.2,1.1,"Bloop is building us a raft. Not a house. A raft. Totally different. Chat, it's different."),
 (35.4,1.2,"And off we go! Leggy is our engine. Paddle, Leggy, paddle!"),
 (39.4,1.0,"Ooh, it's foggy out here. And cold. Very cold. My nose is an ice cube."),
 (44.2,1.15,"Wait for it... wait for it... THERE! The iceberg! Look at the size of that thing!"),
 (50.2,1.1,"Contestants everywhere! Seals, seals, and... more seals. They look professional."),
 (55.4,1.2,"Leggy, careful, it's slippery! Oh no. Her legs! She's doing the splits! All six of them!"),
 (61.8,1.05,"She's okay! She's okay. She's just, uh, very flat right now."),
 (65.0,1.1,"Bloop is drilling the fishing holes with his new gadget, the Drillbert. Look at him go."),
 (70.6,1.15,"One hole. Two holes. Bloop, we only need one hole each. Bloop? Bloop!"),
 (75.2,1.05,"He's making them perfectly round. All in a perfect line. He's an artist."),
 (80.2,1.2,"The judge is ready! Three... two... one... FISH!"),
 (84.4,1.05,"Okay chat, watch and learn. Cast... and wait. Fishing is all about patience."),
 (89.8,1.2,"A BITE! Reel it in! It's... a boot. A size nine boot."),
 (93.8,1.05,"That seal just caught a fish the size of my arm. Show-off."),
 (97.8,1.15,"Bite! Bite! It's... an ice cube. I caught a piece of the iceberg. Great."),
 (102.8,1.1,"The seals are crushing it. That one has six fish. SIX."),
 (106.4,1.2,"Ooh! A real fish! It's tiny, but it's... hey! HEY! That seal stole my fish!"),
 (111.8,1.0,"He just ate it. He looked me in the eye and ate it."),
 (115.0,1.1,"Meanwhile Leggy is learning to ice skate. She's getting better! Kind of! Ooh, that one hurt."),
 (121.0,1.1,"And Bloop has an invoice for the holes. Nine holes. A perfectly round surcharge?!"),
 (126.4,1.0,"Hey... why is the ice wet? Why are my shoes splashing?"),
 (130.2,1.05,"And why is my bait bucket glowing? Buckets shouldn't glow. Chat, do buckets glow?"),
 (135.6,0.95,"It's steaming. It's... humming? Okay. I'm opening it."),
 (140.0,1.3,"PUFF?! What are you doing in the bait bucket?!"),
 (143.4,1.2,"He stowed away! He's been melting the iceberg this whole time! From the inside!"),
 (149.0,1.1,"And the melting is following Bloop's perfect line of holes. Like a dotted line. Like a... tear here line..."),
 (155.8,1.3,"IT SNAPPED! We're floating away! Bloop! BLOOOP!"),
 (159.8,1.0,"Bloop is horrified. Bloop knows exactly what he did."),
 (163.6,1.15,"Wait, he's running to the raft. He's strapping the Drillbert to the back. Is that a motor?!"),
 (169.6,1.3,"BLOOP HAS A SPEEDBOAT! GO BLOOP!"),
 (172.4,1.0,"Our ice is melting fast. Okay. One last cast. For the gold."),
 (176.4,1.3,"WHOA! WHAT IS THAT?! IT'S HUGE! IT'S A FISH WITH A CROWN!"),
 (181.2,1.25,"It's towing the iceberg! We're water skiing on an iceberg!"),
 (185.2,1.25,"And look at Leggy! She's skating! She's actually skating! Triple axel! LEGGY!"),
 (190.2,1.3,"The ice is almost gone! Bloop's right beside us! Everybody JUMP!"),
 (194.8,1.25,"We're on the raft! And the fish is still pulling! Straight at the big iceberg!"),
 (199.6,1.3,"BRACE FOR IMPACT!"),
 (201.6,1.05,"...and the fish landed on the iceberg. Right at the judge's feet. Did we... did we win?"),
 (207.6,1.3,"WE WON! THE FROSTBITE CUP! THE GOLDEN FISH IS OURS!"),
 (211.2,1.2,"Bloop, look! Your invoices are getting paid! This is solid gold! Probably!"),
 (215.8,1.15,"Puff, no, don't hug it! Don't hug the... it's dripping. Why is it dripping?"),
 (220.8,1.2,"It's ice. The golden fish was ICE, painted gold. It's melting!"),
 (224.8,1.25,"And the iceberg is melting too! Everybody's going in! Seals included!"),
 (229.4,1.2,"SPLASH."),
 (232.6,1.0,"...and we're back on the beach. Soaking wet. Again."),
 (236.4,1.1,"Final score: one boot, one ice cube, one gold puddle, and a giant fish who now lives here, apparently."),
 (243.2,1.05,"Leggy is drying off like a dog. Six legs of shaking."),
 (246.8,1.1,"Look! Glubzilla is waving goodbye! He's a good fish. A good, terrifying fish."),
 (251.8,1.05,"Puff is steaming himself dry. Puff, you are grounded. Grounded on the ground."),
 (257.0,1.15,"Honestly? Best episode ever. No house fell. No house sank. Because there was no house!"),
 (263.2,0.95,"...Bloop? What's that? That's... a lot of paper."),
 (266.8,1.05,"It's every invoice. From every episode. Pay up... or he quits?!"),
 (271.2,1.15,"Bloop, buddy, come on. I had a golden fish! It melted! That counts for something, right?"),
 (276.8,1.0,"He's not laughing. Chat, he's not laughing. Bloop always laughs."),
 (280.8,1.2,"Comment how I'm gonna pay two thousand logs. Seriously. I need ideas."),
 (286.6,0.95,"...Uh oh."),
 (288.4,1.15,"Next time on Shardwild... Bloop quits?! Don't miss it. Subscribe!"),
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
