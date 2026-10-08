#!/usr/bin/env python3
"""Make Super Mario Galaxy's text funny.

Reads a Message.arc (Yaz0-compressed RARC containing .bmg message files),
rewrites the text with joke substitutions, and writes a new Message.arc.

usage: smg_funny.py IN_Message.arc OUT_Message.arc
       smg_funny.py --selftest
"""
import re
import struct
import sys

# ---------------------------------------------------------------- jokes
# (pattern, replacement). Applied in order, only to plain text (never to
# control codes), so button icons / colors / player names keep working.
REPLACEMENTS = [
    (r"Power Stars", "Power Farts"),
    (r"Power Star", "Power Fart"),
    (r"Grand Stars", "Grand Toots"),
    (r"Grand Star", "Grand Toot"),
    (r"Star Bits", "Space Crumbs"),
    (r"Star Bit", "Space Crumb"),
    (r"Comet Observatory", "Comet Outhouse"),
    (r"Princess Peach", "Princess Snackrat"),
    (r"Rosalina", "Space Mom"),
    (r"Lumas", "Star Gremlins"),
    (r"Luma", "Star Gremlin"),
    (r"Bowser Jr\.", "Bowser Jr. (smelly)"),
    (r"Bowser", "Big Stinky Turtle"),
    (r"Toad Brigade", "Toad Bros. Moving Co."),
    (r"Captain Toad", "Captain Toot"),
    (r"Lubba", "Chubba"),
    (r"Goombas", "Mushroom Guys"),
    (r"Goomba", "Mushroom Guy"),
    (r"Koopa", "Shell Dude"),
    (r"\bgalaxy\b", "galaxy (it smells)"),
    (r"\bcoins\b", "nuggets"),
    (r"\bcoin\b", "nugget"),
    (r"\bspin\b", "wiggle"),
    (r"\bSpin\b", "Wiggle"),
    (r"\bthank you\b", "thank you, I guess"),
    (r"\bThank you\b", "Thank you, I guess"),
    (r"\bhelp\b", "help (pls)"),
    (r"\bHelp\b", "Help (pls)"),
    (r"\buniverse\b", "big dark room"),
    (r"\bdestroy\b", "make a mess of"),
    (r"\bevil\b", "extremely rude"),
]
TOOT_EVERY = 5  # every Nth exclamation-ending message gets a *toot*


def funnify(text, counter):
    for pat, rep in REPLACEMENTS:
        text = re.sub(pat, rep, text)
    if text.rstrip().endswith("!"):
        counter[0] += 1
        if counter[0] % TOOT_EVERY == 0:
            text = text.rstrip() + " *toot*"
    return text


# ---------------------------------------------------------------- Yaz0
def yaz0_decompress(data):
    if data[:4] != b"Yaz0":
        return data
    size = struct.unpack(">I", data[4:8])[0]
    out = bytearray()
    src = 16
    while len(out) < size:
        flags = data[src]
        src += 1
        for bit in range(7, -1, -1):
            if len(out) >= size:
                break
            if flags & (1 << bit):
                out.append(data[src])
                src += 1
            else:
                b1, b2 = data[src], data[src + 1]
                src += 2
                dist = ((b1 & 0x0F) << 8 | b2) + 1
                n = b1 >> 4
                if n == 0:
                    n = data[src] + 0x12
                    src += 1
                else:
                    n += 2
                for _ in range(n):
                    out.append(out[-dist])
    return bytes(out)


def yaz0_store(data):
    """Valid Yaz0 stream using literals only (bigger, but always correct)."""
    out = bytearray(b"Yaz0" + struct.pack(">I", len(data)) + bytes(8))
    for i in range(0, len(data), 8):
        chunk = data[i:i + 8]
        out.append(0xFF)
        out += chunk
    return bytes(out)


# ---------------------------------------------------------------- RARC
def rarc_files(arc):
    """Return (list of (entry_offset, name, data_off, size)), data_start."""
    assert arc[:4] == b"RARC", "not a RARC archive"
    data_start = struct.unpack(">I", arc[0x0C:0x10])[0] + 0x20
    info = 0x20
    num_entries, entry_off = struct.unpack(">II", arc[info + 8:info + 16])
    str_off = struct.unpack(">I", arc[info + 20:info + 24])[0]
    entry_off += 0x20
    str_off += 0x20
    files = []
    for i in range(num_entries):
        e = entry_off + i * 0x14
        _id, _hash, typ, name_off, d_off, d_size = struct.unpack(
            ">HHHHII", arc[e:e + 16])
        if (typ >> 8) & 0x02:  # directory
            continue
        end = arc.index(b"\0", str_off + name_off)
        name = arc[str_off + name_off:end].decode("ascii", "replace")
        files.append((e, name, d_off, d_size))
    return files, data_start


def rarc_rebuild(arc, new_data):
    """new_data: {entry_offset: bytes}. Returns rebuilt archive."""
    files, data_start = rarc_files(arc)
    head = bytearray(arc[:data_start])
    blob = bytearray()
    for e, _name, d_off, d_size in sorted(files, key=lambda f: f[2]):
        content = new_data.get(e, arc[data_start + d_off:data_start + d_off + d_size])
        struct.pack_into(">II", head, e + 8, len(blob), len(content))
        blob += content
        blob += bytes((-len(blob)) % 32)
    out = head + blob
    struct.pack_into(">I", out, 0x04, len(out))
    struct.pack_into(">I", out, 0x10, len(blob))  # data length
    struct.pack_into(">I", out, 0x14, len(blob))  # MRAM size
    struct.pack_into(">I", out, 0x18, 0)          # ARAM size
    return bytes(out)


# ---------------------------------------------------------------- BMG
def bmg_sections(bmg):
    assert bmg[:8] == b"MESGbmg1", "not a BMG file"
    count = struct.unpack(">I", bmg[0x0C:0x10])[0]
    pos, secs = 0x20, []
    for _ in range(count):
        magic = bmg[pos:pos + 4]
        size = struct.unpack(">I", bmg[pos + 4:pos + 8])[0]
        secs.append([magic, bytearray(bmg[pos:pos + size])])
        pos += size
    return secs


def split_utf16(raw):
    """Yield ('text', str) / ('code', bytes) parts of a UTF-16BE message."""
    i, buf = 0, bytearray()
    while i + 1 < len(raw):
        ch = struct.unpack(">H", raw[i:i + 2])[0]
        if ch == 0x1A:
            if buf:
                yield "text", buf.decode("utf-16-be", "replace")
                buf = bytearray()
            n = raw[i + 2]
            yield "code", bytes(raw[i:i + n])
            i += n
        else:
            buf += raw[i:i + 2]
            i += 2
    if buf:
        yield "text", buf.decode("utf-16-be", "replace")


def bmg_funnify(bmg, counter):
    enc = bmg[0x10]
    if enc != 2:
        print(f"  skipping BMG with encoding {enc} (only UTF-16 handled)")
        return bmg, 0
    secs = bmg_sections(bmg)
    inf = next(s for s in secs if s[0] == b"INF1")[1]
    dat_i = next(i for i, s in enumerate(secs) if s[0] == b"DAT1")
    dat = secs[dat_i][1]
    n, esize = struct.unpack(">HH", inf[8:12])

    def read_msg(off):
        p = 8 + off
        while struct.unpack(">H", dat[p:p + 2])[0] != 0:
            if struct.unpack(">H", dat[p:p + 2])[0] == 0x1A:
                p += dat[p + 2]
            else:
                p += 2
        return bytes(dat[8 + off:p])

    new_dat = bytearray(b"\0\0")  # offset 0 = empty string, like the original
    moved, changed = {0: 0}, 0
    for k in range(n):
        e = 0x10 + k * esize
        off = struct.unpack(">I", inf[e:e + 4])[0]
        if off not in moved:
            raw = read_msg(off)
            parts = []
            for kind, val in split_utf16(raw):
                if kind == "text":
                    new = funnify(val, counter)
                    changed += new != val
                    parts.append(new.encode("utf-16-be"))
                else:
                    parts.append(val)
            moved[off] = len(new_dat)
            new_dat += b"".join(parts) + b"\0\0"
        struct.pack_into(">I", inf, e, moved[off])

    body = new_dat + bytes((-(len(new_dat) + 8)) % 32)
    secs[dat_i][1] = bytearray(b"DAT1" + struct.pack(">I", len(body) + 8) + body)
    out = bytearray(bmg[:0x20]) + b"".join(s[1] for s in secs)
    struct.pack_into(">I", out, 0x08, len(out))
    return bytes(out), changed


# ---------------------------------------------------------------- main
def process(arc_bytes):
    compressed = arc_bytes[:4] == b"Yaz0"
    arc = yaz0_decompress(arc_bytes)
    files, data_start = rarc_files(arc)
    counter, new = [0], {}
    for e, name, d_off, d_size in files:
        content = arc[data_start + d_off:data_start + d_off + d_size]
        if content[:8] == b"MESGbmg1":
            out, changed = bmg_funnify(content, counter)
            print(f"  {name}: {changed} text pieces made funny")
            new[e] = out
    if not new:
        sys.exit("no .bmg message files found in archive")
    arc = rarc_rebuild(arc, new)
    return yaz0_store(arc) if compressed else arc


def selftest():
    def msg(s):
        return s.encode("utf-16-be")
    msgs = [msg("Collect the Power Star!") + b"\0\x1a\x06\x01\x00\x00" + msg(" Bowser is evil!"),
            msg("Rosalina says thank you.")]
    dat = bytearray(b"\0\0")
    offs = []
    for m in msgs:
        offs.append(len(dat))
        dat += m + b"\0\0"
    dat += bytes((-(len(dat) + 8)) % 32)
    inf = b"INF1" + struct.pack(">IHHI", 0, 2, 8, 0)
    inf += b"".join(struct.pack(">II", o, 0) for o in offs)
    inf += bytes((-len(inf)) % 32)
    inf = inf[:4] + struct.pack(">I", len(inf)) + inf[8:]
    dat1 = b"DAT1" + struct.pack(">I", len(dat) + 8) + dat
    bmg = bytearray(b"MESGbmg1" + struct.pack(">II", 0, 2) + b"\x02" + bytes(15) + inf + dat1)
    struct.pack_into(">I", bmg, 8, len(bmg))
    # minimal RARC: 1 dir node, entries: file + "." + ".."
    names = b".\0..\0message.bmg\0"
    names += bytes((-len(names)) % 32)
    entries = struct.pack(">HHHHIII", 0, 0, 0x1100, 5, 0, len(bmg), 0)
    entries += struct.pack(">HHHHIII", 0xFFFF, 0, 0x0200, 0, 0, 0x10, 0)
    entries += struct.pack(">HHHHIII", 0xFFFF, 0, 0x0200, 2, 0xFFFFFFFF, 0x10, 0)
    entries += bytes((-len(entries)) % 32)
    node = b"ROOT" + struct.pack(">IHHI", 0, 0, 3, 0) + bytes(16)
    info_len = 0x20
    node_off = info_len
    entry_off = node_off + len(node)
    str_off = entry_off + len(entries)
    info = struct.pack(">IIIIIIHBB", 1, node_off, 3, entry_off, len(names), str_off, 3, 1, 0)
    info += bytes(info_len - len(info))
    meta = info + node + entries + names
    data = bytes(bmg) + bytes((-len(bmg)) % 32)
    hdr = b"RARC" + struct.pack(">IIIIII", 0, 0x20, len(meta), len(data), len(data), 0) + bytes(4)
    arc = bytearray(hdr + meta + data)
    struct.pack_into(">I", arc, 4, len(arc))
    out = yaz0_decompress(process(yaz0_store(bytes(arc))))
    files, ds = rarc_files(out)
    (e, name, off, size), = files
    secs = bmg_sections(out[ds + off:ds + off + size])
    text = secs[1][1].decode("utf-16-be", "replace")
    print(repr(text))
    assert "Power Fart" in text and "Big Stinky Turtle" in text and "Space Mom" in text
    assert b"\x00\x1a\x06\x01\x00\x00" in secs[1][1], "control code damaged"
    print("selftest OK")


if __name__ == "__main__":
    if sys.argv[1:] == ["--selftest"]:
        selftest()
    elif len(sys.argv) == 3:
        with open(sys.argv[1], "rb") as f:
            result = process(f.read())
        with open(sys.argv[2], "wb") as f:
            f.write(result)
        print(f"wrote {sys.argv[2]}")
    else:
        sys.exit(__doc__)
