import sys, os, json
sys.path.insert(0, '..')
LINES = [
 (0.6,1.15,"Shardwild, episode fourteen! Tonight... THE HAUNTED MINE. Ooooh."),
 (6.0,1.1,"This is the old mine on the hill. The sign says: keep out, haunted. Very spooky font."),
 (11.4,1.1,"And it's moaning. Listen. Ooooooo. That's not me. I want to be clear. That's the mine."),
 (16.0,1.1,"Prestin is here too. He's doing a live ghost hunt. With a flashlight. On his forehead."),
 (22.0,1.1,"He says if there's a ghost, he'll catch it, and get ten million views. Sure, buddy."),
 (28.0,1.1,"Bloop is building a ghost detector. Out of a lamp, a spring, and a spoon."),
 (33.6,1.1,"Done! The Ghost-o-meter! It's pointing at... green. Green means no ghost. Probably."),
 (40.0,1.1,"Leggy is not coming. Leggy is hiding behind a tree. A very small tree. I can see all six legs."),
 (46.4,1.1,"That's okay, Leggy. Guard the entrance. Muffin is coming instead. Muffin fears nothing."),
 (52.0,1.1,"And we're in. It's dark. It's cold. It smells like... old rocks. Because it's a mine."),
 (57.4,1.1,"Puff is our lantern. Puff, glow brighter! There you go. Good Puff."),
 (62.0,1.1,"The old lanterns are still lit. Who lit these? Mines don't light themselves. Right?"),
 (67.4,1.1,"Ghost-o-meter is twitching a little. Bloop says that's normal. Bloop is sweating."),
 (72.0,1.1,"Wait. Did that cart just move? That cart just moved. BY ITSELF. Into the dark."),
 (78.0,1.1,"Nobody pushed it! I was looking! I was looking the whole time!"),
 (82.6,1.1,"Okay. Okay. Deep breaths. Mine carts roll. Gravity. Science. Keep walking."),
 (86.0,1.1,"Lights. Floating lights. Coming toward us. Lots of them. This is it. This is the ghost."),
 (92.0,1.1,"The meter's in the red! Bloop! Bloop, why is it in the red!"),
 (98.0,1.1,"Oh. Wait. They're moths. Glowing moths! Lantern moths! They're kind of cute, actually."),
 (103.4,1.1,"Muffin caught one. Muffin, let it go. ... Thank you, Muffin."),
 (110.0,1.15,"BOOOOO! THAT'S A GHOST! THAT IS A REAL, ACTUAL, BEDSHEET GHOST!"),
 (114.0,1.15,"RUN! Everybody run! Bloop, run! Don't stop for the spoon!"),
 (119.0,1.1,"Wait. Where's Muffin? Muffin didn't run. Muffin is walking TOWARD the ghost."),
 (124.0,1.1,"Muffin bit the sheet. Muffin is pulling the sheet. Muffin, you absolute legend."),
 (128.4,1.15,"IT'S THE GOOSE! The ghost is the goose! Riding Bonk-bot! In a bedsheet!"),
 (133.8,1.1,"And who do we know who wants ten million views on a ghost hunt..."),
 (137.4,1.1,"Prestin says it was a test. A test of what, Prestin? My heart? It failed. I failed."),
 (143.0,1.1,"Mystery solved. Let's go home. ... Wait."),
 (146.2,1.1,"Ooooooo. ... The moaning. It's still happening. And the goose is right here."),
 (151.4,1.1,"The goose is very offended. That's not his moan. So who is moaning?"),
 (156.4,1.1,"Deeper. The sound comes from deeper. The meter is pointing that way. Of course it is."),
 (162.0,1.1,"Everybody stay close. Puff, maximum glow. Goose, no more pranks."),
 (166.0,1.1,"Whoa. Look at this cave. It's huge. And the crystals! They glow on their own!"),
 (171.4,1.1,"Free crystals. This is the best mine ever. If it wasn't haunted. Which it might be."),
 (176.0,1.1,"Okay, there's a giant rock in the middle. A very, very big... rock."),
 (181.0,1.1,"It's breathing. The rock is breathing. And moaning. Wait, that's not moaning."),
 (186.0,1.1,"That's SNORING! The ghost is snoring! It's a giant pebbleback! Sleeping!"),
 (192.0,1.1,"Oh no. She's awake. She's looking at us. She's... so big. Hi. Hello. We're friends."),
 (197.2,1.1,"Ghost-o-meter says: grandma. Bloop's machine just said grandma. It knows."),
 (200.0,1.1,"WAIT! It's the baby pebbleback! From the race! This is the baby's grandma!"),
 (205.6,1.1,"They're snuggling. I'm not crying. The mine is dusty. That's all it is."),
 (210.0,1.1,"Oh no. Prestin's back. He snuck in. He wants a real ghost for his stream."),
 (215.0,1.1,"He's shining the light right in her face. Prestin. Prestin, no. Don't wake up grandma."),
 (218.0,1.15,"She YAWNED! And Prestin SCREAMED! That's the loudest scream in Shardwild history!"),
 (222.4,1.15,"He jumped in the mine cart! The cart is rolling! He's going down the tracks!"),
 (227.0,1.15,"Bye, Prestin! Mind the turns! There are a lot of turns!"),
 (232.0,1.1,"Outside, Leggy is still guarding the entrance. Very brave. Behind a tree."),
 (236.0,1.15,"And here comes the cart! And there goes Prestin! Into a bush! Ten out of ten landing."),
 (242.0,1.1,"Leggy sniffed him. Leggy approves. Prestin does not approve. Prestin is in a bush."),
 (248.0,1.1,"Okay, new sign. Let me just... fix this. There. NOT haunted. Grandma lives here."),
 (254.4,1.1,"Bloop's adding a doorbell. A doorbell. For a mine. Okay, that's actually nice."),
 (262.0,1.1,"And grandma came out to say hi! With the baby! And all the lantern moths!"),
 (267.4,1.1,"Leggy, this is Grandma Pebble. Grandma Pebble, Leggy. Be nice. ... They're nose to nose."),
 (273.4,1.1,"So the mine is not haunted. It's just a grandma, a baby, a lot of moths, and one goose."),
 (279.0,1.1,"Next time: the Shardwild talent show. Bonk-bot is practicing. It is not going well."),
 (296.0,1.1,"Subscribe! And bring a lantern. And a cupcake."),
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
