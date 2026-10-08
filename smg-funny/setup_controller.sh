#!/usr/bin/env bash
# Map a normal gamepad (Xbox/PlayStation/Switch Pro...) to Wii Remote + Nunchuk
# in Dolphin, laid out for Super Mario Galaxy. Backs up your old mapping.
set -euo pipefail

if pgrep -x steam >/dev/null; then
    echo "!! Steam is running - close it first (Steam Input hides the controller)"; exit 1
fi

# Ask SDL (what Dolphin uses) for the controller's name
NAME="$(python3 - <<'PY'
import ctypes, ctypes.util, sys
lib = None
for n in ("libSDL2-2.0.so.0", ctypes.util.find_library("SDL2")):
    try:
        lib = ctypes.CDLL(n); break
    except (OSError, TypeError):
        pass
if not lib:
    sys.exit("no SDL2 library")
lib.SDL_Init(0x2000 | 0x200)  # GAMECONTROLLER | JOYSTICK
lib.SDL_GameControllerNameForIndex.restype = ctypes.c_char_p
lib.SDL_JoystickNameForIndex.restype = ctypes.c_char_p
for i in range(lib.SDL_NumJoysticks()):
    n = lib.SDL_GameControllerNameForIndex(i) or lib.SDL_JoystickNameForIndex(i)
    if n:
        print(n.decode()); break
PY
)" || true
if [[ -z "$NAME" ]]; then
    echo "!! no controller found - plug it in (and close Steam), then run again"; exit 1
fi
echo ">> found controller: $NAME"

if [[ -d "$HOME/.dolphin-emu" ]]; then CFG="$HOME/.dolphin-emu/Config"
else CFG="${XDG_CONFIG_HOME:-$HOME/.config}/dolphin-emu"; fi
mkdir -p "$CFG"
INI="$CFG/WiimoteNew.ini"
[[ -f "$INI" && ! -f "$INI.bak" ]] && cp "$INI" "$INI.bak"

cat > "$INI" <<EOF
[Wiimote1]
Device = SDL/0/$NAME
Source = 1
Buttons/A = \`Button S\`
Buttons/B = \`Trigger R\`
Buttons/1 = \`Button N\`
Buttons/2 = \`Button E\`
Buttons/- = \`Back\`
Buttons/+ = \`Start\`
Buttons/Home = \`Guide\`
D-Pad/Up = \`Pad N\`
D-Pad/Down = \`Pad S\`
D-Pad/Left = \`Pad W\`
D-Pad/Right = \`Pad E\`
IR/Up = \`Right Y-\`
IR/Down = \`Right Y+\`
IR/Left = \`Right X-\`
IR/Right = \`Right X+\`
Shake/X = \`Button W\`
Shake/Y = \`Button W\`
Shake/Z = \`Button W\`
Extension = Nunchuk
Nunchuk/Buttons/C = \`Shoulder L\`
Nunchuk/Buttons/Z = \`Trigger L\`
Nunchuk/Stick/Up = \`Left Y-\`
Nunchuk/Stick/Down = \`Left Y+\`
Nunchuk/Stick/Left = \`Left X-\`
Nunchuk/Stick/Right = \`Left X+\`
Nunchuk/Shake/X = \`Shoulder R\`
Nunchuk/Shake/Y = \`Shoulder R\`
Nunchuk/Shake/Z = \`Shoulder R\`
[Wiimote2]
Source = 0
[Wiimote3]
Source = 0
[Wiimote4]
Source = 0
[BalanceBoard]
Source = 0
EOF

cat <<'EOF'
>> controller set up:
   left stick  = move              A / Cross       = jump
   X / Square  = spin              right trigger   = shoot Space Crumbs (B)
   left trigger= crouch (Z)        left bumper     = camera reset (C)
   right stick = aim pointer       right bumper    = spin (alt)
   d-pad       = camera            Start = pause   Guide = Home
EOF
