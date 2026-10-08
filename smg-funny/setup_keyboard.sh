#!/usr/bin/env bash
# Keyboard + mouse mapping for Super Mario Galaxy in Dolphin (Wii Remote + Nunchuk).
set -euo pipefail
if [[ -d "$HOME/.dolphin-emu" ]]; then CFG="$HOME/.dolphin-emu/Config"
else CFG="${XDG_CONFIG_HOME:-$HOME/.config}/dolphin-emu"; fi
mkdir -p "$CFG"
INI="$CFG/WiimoteNew.ini"
[[ -f "$INI" && ! -f "$INI.bak" ]] && cp "$INI" "$INI.bak"
cat > "$INI" <<'EOF'
[Wiimote1]
Device = XInput2/0/Virtual core pointer
Source = 1
Buttons/A = Space
Buttons/B = `Click 3`
Buttons/1 = `1`
Buttons/2 = `2`
Buttons/- = Q
Buttons/+ = Return
Buttons/Home = Escape
D-Pad/Up = Up
D-Pad/Down = Down
D-Pad/Left = Left
D-Pad/Right = Right
IR/Up = `Cursor Y-`
IR/Down = `Cursor Y+`
IR/Left = `Cursor X-`
IR/Right = `Cursor X+`
Shake/X = `Click 1`
Shake/Y = `Click 1`
Shake/Z = `Click 1`
Extension = Nunchuk
Nunchuk/Buttons/C = E
Nunchuk/Buttons/Z = Shift_L
Nunchuk/Stick/Up = W
Nunchuk/Stick/Down = S
Nunchuk/Stick/Left = A
Nunchuk/Stick/Right = D
[Wiimote2]
Source = 0
[Wiimote3]
Source = 0
[Wiimote4]
Source = 0
[BalanceBoard]
Source = 0
EOF
echo ">> keyboard controls set up"
