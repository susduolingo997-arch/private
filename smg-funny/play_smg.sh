#!/usr/bin/env bash
# Funny Super Mario Galaxy: installs Dolphin, rewrites the game's text,
# and sets it up as a Riivolution patch (your disc image is never changed).
#
# usage: ./play_smg.sh /path/to/SuperMarioGalaxy.iso   (.iso/.rvz/.wbfs all fine)
set -euo pipefail

ISO="${1:-}"
[[ -f "$ISO" ]] || { echo "usage: $0 /path/to/your/SuperMarioGalaxy.iso"; exit 1; }
ISO="$(realpath "$ISO")"
HERE="$(cd "$(dirname "$0")" && pwd)"
WORK="$HOME/smg-funny"
mkdir -p "$WORK"

# 1. Dolphin
if ! command -v dolphin-emu >/dev/null; then
    sudo pacman -Syy --needed --noconfirm dolphin-emu
fi
command -v dolphin-tool >/dev/null || { echo "dolphin-tool missing (should come with dolphin-emu)"; exit 1; }

# Dolphin user dir (new XDG location, or the old ~/.dolphin-emu)
if [[ -d "$HOME/.dolphin-emu" ]]; then DUSER="$HOME/.dolphin-emu"
else DUSER="${XDG_DATA_HOME:-$HOME/.local/share}/dolphin-emu"; fi

# 2. Find and pull out the message archive
echo ">> looking for the text file in your disc image..."
MSG_PATH="$(dolphin-tool extract -i "$ISO" -p DATA -l 2>/dev/null \
            | grep -io '[^ ]*MessageData/Message\.arc' | head -1 || true)"
rm -rf "$WORK/extract"
if [[ -n "$MSG_PATH" ]]; then
    MSG_PATH="/${MSG_PATH#/}"
    MSG_PATH="${MSG_PATH#/files}"
    dolphin-tool extract -i "$ISO" -p DATA -s "$MSG_PATH" -o "$WORK/extract" -q
else
    echo ">> listing didn't work, extracting whole game (few GB, takes a minute)..."
    dolphin-tool extract -i "$ISO" -p DATA -o "$WORK/extract" -q
fi
FOUND="$(find "$WORK/extract" -ipath '*MessageData/Message.arc' | head -1)"
[[ -n "$FOUND" ]] || { echo "couldn't find MessageData/Message.arc in the disc image"; exit 1; }
DISC_PATH="/${FOUND#*/files/}"
[[ "$DISC_PATH" == "/$FOUND" ]] && DISC_PATH="/${FOUND#"$WORK/extract/"}"
echo ">> found $DISC_PATH"

# 3. Make it funny
python3 "$HERE/smg_funny.py" "$FOUND" "$WORK/Message.arc"

# 4. Install as a Riivolution patch
RIIV="$DUSER/Load/Riivolution"
mkdir -p "$RIIV/riivolution" "$RIIV/smgfunny"
cp "$WORK/Message.arc" "$RIIV/smgfunny/Message.arc"
cat > "$RIIV/riivolution/smgfunny.xml" <<EOF
<wiidisc version="1">
  <id game="RMG"/>
  <options>
    <section name="Funny Galaxy">
      <option name="Funny text">
        <choice name="Enabled"><patch id="funnytext"/></choice>
      </option>
    </section>
  </options>
  <patch id="funnytext" root="/smgfunny">
    <file disc="$DISC_PATH" external="Message.arc"/>
  </patch>
</wiidisc>
EOF
rm -rf "$WORK/extract"

# 5. Cheats (incl. Luigi if the code database has it)
GAME_ID="$(dolphin-tool header -i "$ISO" 2>/dev/null | grep -oE 'RMG[A-Z]01' | head -1 || true)"
for off in 0 512; do  # raw .iso / .wbfs
    [[ -n "$GAME_ID" ]] && break
    GAME_ID="$(dd if="$ISO" bs=1 skip=$off count=6 2>/dev/null | grep -aoE 'RMG[A-Z]01' || true)"
done
if [[ -d "$HOME/.dolphin-emu" ]]; then DINI="$DUSER/Config/Dolphin.ini"
else DINI="${XDG_CONFIG_HOME:-$HOME/.config}/dolphin-emu/Dolphin.ini"; fi
for id in ${GAME_ID:-RMGE01 RMGP01}; do
    python3 "$HERE/smg_cheats.py" "$id" "$DUSER/GameSettings" "$DINI" \
        || echo "   (cheat download failed for $id - use Download Codes in Dolphin)"
done

cat <<'EOF'

>> Done! To play:
   1. Dolphin opens now. Add your game folder if the list is empty.
   2. Right-click Super Mario Galaxy -> "Start with Riivolution Patches..."
   3. Set "Funny text" to Enabled -> Start.
   Cheats are already on (list above). Toggle more in:
   right-click the game -> Properties -> Gecko Codes.
EOF
dolphin-emu >/dev/null 2>&1 &
