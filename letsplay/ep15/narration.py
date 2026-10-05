import sys, os, json
sys.path.insert(0, '..')
LINES = [
 (0.6,1.15,"Shardwild, episode fifteen! Tonight... THE TALENT SHOW!"),
 (6.0,1.1,"Look at this poster. Talent show, tonight. First prize: a golden mallet. I need that mallet."),
 (12.0,1.1,"And my act? Introducing... Bonk-bot! Bonk-bot is going to DANCE."),
 (18.0,1.1,"Okay Bonk-bot, show them the routine. Five, six, seven, eight—"),
 (22.4,1.15,"No. No no no. That's not dancing. That's falling. With style. But falling."),
 (26.0,1.1,"Meanwhile, Leggy is doing... tap? Is that tap dancing? Leggy, buddy, not now. We're rehearsing."),
 (32.0,1.1,"Bloop says he can fix it. He's building a Groove Chip. A computer chip. Full of grooves."),
 (37.4,1.1,"Chat, what is a groove? Scientifically? Nobody knows. Bloop knows."),
 (42.2,1.1,"And here's the invoice. Of course there's an invoice. Groove installation: forty coins."),
 (44.6,1.15,"Chip in! And... TA-DA! It danced! For one whole second! We're going to win!"),
 (50.4,1.1,"To the village square! Showtime, baby!"),
 (56.4,1.1,"Wow. Look at this. A real stage. Real curtains. Real Grumbles in the audience."),
 (62.0,1.05,"Oh, and the judge. Madame Clapperclam. She's a clam. She claps. That's the whole job."),
 (70.4,1.1,"First act: Prestin. Of course it's Prestin. He's doing... magic?"),
 (75.6,1.1,"He's bald now, by the way. Since episode nine. He doesn't want to talk about it."),
 (80.4,1.1,"He reaches into the hat... he's pulling out... no. NO WAY."),
 (86.2,1.2,"HIS HAIR! He pulled his hair out of a hat! And put it back on his head! The crowd LOVES it!"),
 (90.6,1.1,"Clapperclam says... seven. Ha! Seven! Only seven, Prestin!"),
 (96.2,1.1,"Second act. A Grumble. Sitting. Just... sitting there."),
 (99.6,0.95,"... he's still sitting."),
 (101.4,1.2,"TEN?! A TEN! The crowd is going wild! FOR SITTING! What is happening at this show!"),
 (106.4,1.1,"Okay, backstage. Leggy wants to go on stage. Look at her. Tap tap tap."),
 (110.6,1.1,"Sorry Leggy, you're crew. Crew holds the cables. Stars dance. We talked about this."),
 (114.4,1.15,"And now... the act you've all been waiting for... BONK-BOT!"),
 (120.2,1.1,"Music! And he's... he's doing it. He's actually doing it! Look at those arms!"),
 (126.0,1.1,"Left. Right. Spin. Pose! Chat, are you seeing this? Bloop, you genius!"),
 (132.0,1.15,"The applause meter is going UP! Standing ovation! I'm a manager! I'm a talent manager!"),
 (138.2,1.1,"Bloop is crying. Happy tears. Bloop has never been paid in applause before."),
 (142.2,1.1,"Wait. Why is he smoking? Robots shouldn't smoke. Is that part of the routine?"),
 (147.6,1.25,"TURBO MODE?! Who installed turbo mode?! Bloop! BLOOP!"),
 (152.0,1.2,"He's spinning! He's spinning SO fast! Somebody stop him!"),
 (156.2,1.25,"AND HE'S IN THE CROWD! Bonk-bot is in the CROWD! EVERYBODY RUN!"),
 (161.6,1.2,"The Grumbles are fleeing! The clam is hiding in her shell! This is a mosh pit!"),
 (167.4,1.2,"Bonk-bot, STOP! Stay! Sit! Like the Grumble! The Grumble got a TEN!"),
 (172.4,1.2,"No no, not the lamp post! Not the—"),
 (177.0,0.95,"... and the lights are out. Great. Wonderful. Talent show over."),
 (182.0,1.0,"Wait. A spotlight. Puff is up on the beam. Puff, what are you doing?"),
 (186.2,1.1,"It's Leggy. Leggy's on stage. In the spotlight. And she's... tap dancing."),
 (191.0,1.1,"Six legs. Six tap shoes. Chat... chat, she's REALLY good."),
 (196.4,1.15,"The Grumbles are coming back! They're clapping! They're clapping in rhythm!"),
 (202.0,1.15,"Tappity tappity tap. That's a triple shuffle. With all six legs. Nobody can do that!"),
 (208.2,1.2,"Clapperclam says... TEN! TEN AND TEN! LEGGY! LEGGY WINS!"),
 (214.4,1.1,"Meanwhile Bonk-bot finally ran out of battery. Bloop is pulling the chip."),
 (219.0,1.0,"Warranty: void. Yeah. I bet."),
 (222.4,1.1,"And the golden mallet goes to... Leggy! Look at her! She's so happy!"),
 (228.0,1.15,"Excuse me! Excuse me! I'm her manager! Ten percent of that mallet is mine!"),
 (234.2,1.1,"Prestin wants to say congratulations. That's nice. That's actually nice, Prestin—"),
 (238.4,1.1,"And his hair fell off. Again. Right in front of everyone. Again."),
 (244.2,0.95,"Hey Leggy. I'm sorry. You're not crew. You were never crew. You're the star."),
 (249.4,0.95,"Okay I'm not crying. You're crying."),
 (252.4,1.15,"ENCORE! Everybody dance! Grumbles, Bloop, everybody!"),
 (258.0,1.1,"Write in the comments what your talent is. Mine is managing. Clearly."),
 (262.2,1.15,"Wait. Why is Bonk-bot beeping? He was out of battery. He was OUT of battery!"),
 (266.6,1.2,"Encore mode?! Robots don't have an encore mode! Bloop! WHY?"),
 (270.4,1.25,"He's back on stage! He's spinning! Not the post! NOT THE POST!"),
 (276.2,1.25,"The stage is cracking! Everybody off! OFF! OFF!"),
 (281.6,1.15,"...it fell. All around me. I'm fine. I'm totally fine. And then the mallet—"),
 (286.0,0.95,"Yep. It brought the house down."),
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
