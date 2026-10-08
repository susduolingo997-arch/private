#!/usr/bin/env python3
"""Download Dolphin's Gecko code list for a game and enable the fun ones.

usage: smg_cheats.py GAME_ID GAMESETTINGS_DIR DOLPHIN_INI
"""
import os
import re
import shutil
import subprocess
import sys
import urllib.request

# Codes whose name matches one of these get switched on automatically.
WANTED = re.compile(r"luigi|moon ?jump|infinite|inf\.? |max (lives|health|star)|"
                    r"all stars|always|never die|invincib", re.I)
HEX = re.compile(r"^[0-9A-Fa-f]{8} [0-9A-Fa-f]{8}$")


def parse(txt):
    blocks = re.split(r"\n\s*\n", txt.replace("\r", "").strip())
    codes = []
    for b in blocks[1:]:  # first block is "ID\nTitle"
        lines = [l.strip() for l in b.split("\n") if l.strip()]
        if not lines or HEX.match(lines[0]):
            continue
        name, hexes, notes = lines[0], [], []
        for l in lines[1:]:
            (hexes if HEX.match(l) else notes).append(l)
        if hexes:
            codes.append((name, hexes, notes))
    return codes


def enable_cheats(ini_path):
    os.makedirs(os.path.dirname(ini_path), exist_ok=True)
    text = open(ini_path).read() if os.path.exists(ini_path) else ""
    if re.search(r"^EnableCheats\s*=", text, re.M):
        text = re.sub(r"^EnableCheats\s*=.*$", "EnableCheats = True", text, flags=re.M)
    elif re.search(r"^\[Core\]", text, re.M):
        text = re.sub(r"^\[Core\]\s*$", "[Core]\nEnableCheats = True", text, count=1, flags=re.M)
    else:
        text += "\n[Core]\nEnableCheats = True\n"
    open(ini_path, "w").write(text)


def main(game_id, gs_dir, dolphin_ini):
    url = f"https://codes.rc24.xyz/txt.php?txt={game_id}"
    print(f">> downloading cheat codes for {game_id}")
    try:
        with urllib.request.urlopen(url, timeout=30) as r:
            raw = r.read()
    except Exception:  # e.g. python can't verify the site's certificate chain
        try:
            raw = subprocess.run(["curl", "-fsSL", "--max-time", "30", url],
                                 check=True, capture_output=True).stdout
        except subprocess.CalledProcessError:
            sys.exit("   couldn't reach the cheat code website (its certificate is broken)")
    codes = parse(raw.decode("utf-8", "replace"))
    if not codes:
        sys.exit(f"no codes found for {game_id}")

    out = ["[Gecko]"]
    for name, hexes, notes in codes:
        out.append(f"${name}")
        out += hexes + [f"*{n}" for n in notes]
    out += ["", "[Gecko_Enabled]"]
    on = [n for n, _, _ in codes if WANTED.search(n)]
    out += [f"${n}" for n in on]

    os.makedirs(gs_dir, exist_ok=True)
    path = os.path.join(gs_dir, f"{game_id}.ini")
    if os.path.exists(path) and not os.path.exists(path + ".bak"):
        shutil.copy(path, path + ".bak")
    open(path, "w").write("\n".join(out) + "\n")
    enable_cheats(dolphin_ini)

    print(f">> {len(codes)} codes available, switched on:")
    for n in on:
        print(f"     + {n}")
    if not any(re.search("luigi", n, re.I) for n in on):
        print("   (no Luigi code in the list for this version - see README)")
    print("   more: right-click game -> Properties -> Gecko Codes")


if __name__ == "__main__":
    if len(sys.argv) != 4:
        sys.exit(__doc__)
    main(*sys.argv[1:])
