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
# dolphin-tool (Arch's package doesn't ship it -> use the Flathub build's copy)
FLATPAK_DOLPHIN=org.DolphinEmu.dolphin-emu
if command -v dolphin-tool >/dev/null; then
    dolphin-tool() { command dolphin-tool "$@"; }
else
    if ! flatpak info "$FLATPAK_DOLPHIN" >/dev/null 2>&1; then
        echo ">> installing Flathub Dolphin (only for its dolphin-tool helper)..."
        command -v flatpak >/dev/null || sudo pacman -S --needed --noconfirm flatpak
        flatpak remote-add --user --if-not-exists flathub \
            https://dl.flathub.org/repo/flathub.flatpakrepo
        flatpak install -y --user flathub "$FLATPAK_DOLPHIN"
    fi
    dolphin-tool() {
        flatpak run --filesystem=home --filesystem=/tmp --command=dolphin-tool "$FLATPAK_DOLPHIN" "$@"
    }
fi

# Dolphin user dir (new XDG location, or the old ~/.dolphin-emu)
if [[ -d "$HOME/.dolphin-emu" ]]; then DUSER="$HOME/.dolphin-emu"
else DUSER="${XDG_DATA_HOME:-$HOME/.local/share}/dolphin-emu"; fi

# 2. Pull the text file + Mario's model files out of the disc image
echo ">> looking for files in your disc image..."
LIST="$(dolphin-tool extract -i "$ISO" -p DATA -l 2>/dev/null || true)"
WANT="$(grep -ioE '[^ ]*(MessageData/Message|ObjectData/[^/ ]*Mario[^/ ]*)\.arc' <<<"$LIST" \
        | grep -viE 'anim|sound' | sort -u || true)"
rm -rf "$WORK/extract"
if grep -qi 'Message\.arc' <<<"$WANT"; then
    while read -r f; do
        f="/${f#/}"; f="${f#/files}"
        dolphin-tool extract -i "$ISO" -p DATA -s "$f" -o "$WORK/extract" -q
    done <<<"$WANT"
else
    echo ">> listing didn't work, extracting whole game (few GB, takes a minute)..."
    dolphin-tool extract -i "$ISO" -p DATA -o "$WORK/extract" -q
fi
disc_path() { local d="/${1#*/files/}"; [[ "$d" == "/$1" ]] && d="/${1#"$WORK/extract/"}"; echo "$d"; }

FOUND="$(find "$WORK/extract" -ipath '*MessageData/Message.arc' | head -1)"
[[ -n "$FOUND" ]] || { echo "couldn't find MessageData/Message.arc in the disc image"; exit 1; }

RIIV="$DUSER/Load/Riivolution"
rm -rf "$RIIV/smgfunny"
mkdir -p "$RIIV/riivolution" "$RIIV/smgfunny/green"

# 3. Make the text funny
python3 "$HERE/smg_funny.py" "$FOUND" "$RIIV/smgfunny/Message.arc"
TEXT_XML="<file disc=\"$(disc_path "$FOUND")\" external=\"Message.arc\"/>"

# 4. Make Mario green
GREEN_XML=""
while read -r m; do
    [[ -z "$m" ]] && continue
    case "${m,,}" in *anim*|*sound*) continue;; esac
    name="$(basename "$m")"
    echo ">> greening $name"
    python3 "$HERE/smg_green.py" "$m" "$RIIV/smgfunny/green/$name"
    GREEN_XML+="<file disc=\"$(disc_path "$m")\" external=\"green/$name\"/>"
done < <(find "$WORK/extract" -ipath '*ObjectData/*Mario*.arc')
[[ -n "$GREEN_XML" ]] || echo "   (no Mario model files found - green Mario skipped)"

cat > "$RIIV/riivolution/smgfunny.xml" <<EOF
<wiidisc version="1">
  <id game="RMG"/>
  <options>
    <section name="Funny Galaxy">
      <option name="Funny text">
        <choice name="Enabled"><patch id="funnytext"/></choice>
      </option>
      <option name="Green Mario">
        <choice name="Enabled"><patch id="greenmario"/></choice>
      </option>
    </section>
  </options>
  <patch id="funnytext" root="/smgfunny">$TEXT_XML</patch>
  <patch id="greenmario" root="/smgfunny">$GREEN_XML</patch>
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
   3. Set "Funny text" and "Green Mario" to Enabled -> Start.
   Cheats are already on (list above). Toggle more in:
   right-click the game -> Properties -> Gecko Codes.
EOF
dolphin-emu >/dev/null 2>&1 &
