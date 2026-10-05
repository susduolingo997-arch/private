import sys, os, json
sys.path.insert(0, '..')
LINES = [
 (0.6,1.1,"Shardwild, episode eight! Last time, Bloop handed me a stack of invoices. Today he's back. With more paper."),
 (7.6,1.2,"Whoa! WHOA! That's not a stack. That's a mountain. That's an invoice MOUNTAIN!"),
 (13.0,1.15,"Every invoice from every episode. The house. The fortress. The boat. The volcano. Two thousand and forty-eight logs."),
 (20.6,1.05,"And he just took off his hard hat. Bloop... are you quitting?!"),
 (25.8,1.05,"He's serious. Pay up by sunset, or Bloop the Builder is done. Forever."),
 (30.8,1.15,"Wait, a bird? A letter for Bloop? It says... MegaBuild Company. A job offer?!"),
 (36.2,1.15,"And he's leaving. He's actually leaving. Bloop! Bloop, come back!"),
 (40.8,1.1,"Okay chat. Don't panic. I have zero logs. I need two thousand. How hard can it be?"),
 (46.6,1.1,"Here's the plan. Step one: sell snacks. Step two: sell stuff. Step three: get rich."),
 (52.0,1.05,"Leggy wants to help. She's offering me her pebble collection. That's sweet, Leggy. They're pebbles."),
 (58.4,1.1,"Puff, you're coming too. You're our oven."),
 (61.4,1.2,"To the market! We've got until sunset!"),
 (67.0,1.15,"Look at this place! Shops, customers, money everywhere. Let's make some logs!"),
 (74.4,1.2,"Business one: Puff-mallows! Marshmallows roasted by a real, live, tiny fire guy!"),
 (79.8,1.2,"Customers! Seals love marshmallows! One log each! Step right up!"),
 (84.2,1.25,"That's ten sold! Twenty! Chat, we're entrepreneurs!"),
 (88.0,1.2,"Forty logs! Forty! Only two thousand and eight to go!"),
 (92.0,1.05,"Puff, why are there no more marshmallows? Puff. Did you eat the inventory?"),
 (97.2,1.0,"He ate the inventory. The whole business is inside Puff now."),
 (101.4,1.1,"Business two: the Honk and Pawn. Run by a goose. With a monocle. Very fancy."),
 (106.8,1.1,"What can I sell? My mallet? Junk, he says. My hat? Junk. My... crown?"),
 (112.8,1.15,"Three hundred logs for the crown?! ...Okay. Deal. Don't look at me, chat."),
 (118.4,1.0,"I feel naked. My head is cold. I miss my crown already."),
 (122.4,1.15,"Wait, what's Leggy doing? Is that a sign? TAXI?"),
 (125.8,1.2,"She's giving rides! Six legs, zero traffic! The seals are lining up!"),
 (130.4,1.15,"Fast, friendly, five-star service. Leggy is a business genius!"),
 (136.0,1.2,"Leggy just made... nine hundred logs?! Leggy, you're my favorite. Don't tell Bloop."),
 (141.8,1.05,"Okay. My turn. One last business. The ancient art of... mime."),
 (146.2,1.0,"I'm in a box. An invisible box. I can't get out. ...Anyone?"),
 (150.8,1.0,"One seal gave me one log. Out of pity. I'll take it."),
 (154.6,1.1,"Total: twelve hundred and forty-one logs. Still not enough. Let's go find Bloop."),
 (160.6,1.0,"MegaBuild Company. Everything is grey. Everything is a box. Everything is... sad."),
 (166.4,1.0,"There he is. Stacking grey cubes. No hard hat. No music. No joy."),
 (171.6,1.05,"And that's his new boss, Gravelbeard. A golem. With a very scary clipboard."),
 (177.4,0.95,"Psst. Bloop. Hey buddy. Are you... okay?"),
 (180.4,1.0,"He says they pay on time. Every time. But nobody says thank you. Nobody notices his hats."),
 (186.8,0.95,"Oh. It was never about the logs, was it? The invoices were him saying... notice me."),
 (193.2,1.0,"Bloop, I'm sorry. You're the best builder in Shardwild. And you have the best hats."),
 (199.0,1.1,"Uh... why is that tower wobbling? Is it supposed to wobble?"),
 (203.2,1.2,"Bloop is warning the boss! Gravelbeard isn't listening! He says it's fine! It is NOT fine!"),
 (209.2,1.25,"It's leaning! Everybody, help! Leggy, hold it up!"),
 (213.6,1.25,"Support blocks! I need support blocks! Puff, keep the mortar warm!"),
 (218.0,1.25,"And Bloop... Bloop's putting his hat back on. BLOOP IS BACK!"),
 (222.4,1.25,"He's directing! Left! More left! It's straightening! We're doing it!"),
 (227.2,1.3,"Gravelbeard, don't lean on it. DON'T LEAN ON IT!"),
 (230.4,1.3,"TIMBEEEER!"),
 (232.2,1.05,"...Well. Gravelbeard just fired Bloop. And Bloop is... laughing!"),
 (237.4,1.15,"Bloop quits! Again! But this time, he quits the right job!"),
 (242.4,1.0,"Back at camp. Sunset. Time to pay what I've got."),
 (246.0,1.05,"Twelve hundred and forty-one logs, one crown's worth of regret, and an IOU for the rest."),
 (251.8,0.95,"Bloop's looking at the logs. Looking at the invoices. And he's..."),
 (255.8,1.3,"HE'S TEARING THEM UP! ALL OF THEM! THE MOUNTAIN IS CONFETTI!"),
 (260.0,1.0,"Bloop says the logs are enough. Actually, he says I'm enough. That's... wow."),
 (265.6,1.15,"Group hug! Leggy, careful, you have a lot of legs!"),
 (270.4,1.0,"Bloop's staying. The family is back together. Nothing can ruin this moment."),
 (275.2,1.1,"...Bloop, what's that? Invoice two thousand and forty-nine? Friendship fee: one log?!"),
 (281.6,1.05,"Worth it. Totally worth it. Chat, I'm broke."),
 (286.6,0.95,"...Wait, I still don't have my crown."),
 (288.4,1.15,"Next time on Shardwild... a rival moves in next door. And he's better at this. Subscribe!"),
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
