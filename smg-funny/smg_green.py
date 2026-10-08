#!/usr/bin/env python3
"""Make Mario green: recolor red in the textures/materials of an SMG model arc.

usage: smg_green.py IN.arc OUT.arc
       smg_green.py --selftest
"""
import colorsys
import struct
import sys

from smg_funny import rarc_files, rarc_rebuild, yaz0_decompress, yaz0_store

TARGET_HUE = 0.33  # Luigi green


def green(r, g, b):
    h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
    if s < 0.35 or not (h < 0.07 or h > 0.93):
        return r, g, b
    r, g, b = colorsys.hsv_to_rgb(TARGET_HUE, s, v * 0.8)
    return round(r * 255), round(g * 255), round(b * 255)


# ---- 16-bit pixel formats
def rgb565(v):
    r, g, b = (v >> 11) & 31, (v >> 5) & 63, v & 31
    r, g, b = green(r * 255 // 31, g * 255 // 63, b * 255 // 31)
    return (r * 31 // 255) << 11 | (g * 63 // 255) << 5 | b * 31 // 255


def rgb5a3(v):
    if v & 0x8000:
        r, g, b = (v >> 10) & 31, (v >> 5) & 31, v & 31
        r, g, b = green(r * 255 // 31, g * 255 // 31, b * 255 // 31)
        return 0x8000 | (r * 31 // 255) << 10 | (g * 31 // 255) << 5 | b * 31 // 255
    a, r, g, b = v & 0x7000, (v >> 8) & 15, (v >> 4) & 15, v & 15
    r, g, b = green(r * 17, g * 17, b * 17)
    return a | (r // 17) << 8 | (g // 17) << 4 | b // 17


def map16(buf, start, nbytes, fn):
    for p in range(start, start + nbytes - 1, 2):
        struct.pack_into(">H", buf, p, fn(struct.unpack_from(">H", buf, p)[0]))


def rgba8(buf, start, nbytes):
    for blk in range(start, start + nbytes - 63, 64):
        for i in range(16):
            r = buf[blk + 2 * i + 1]
            g, b = buf[blk + 32 + 2 * i], buf[blk + 33 + 2 * i]
            buf[blk + 2 * i + 1], buf[blk + 32 + 2 * i], buf[blk + 33 + 2 * i] = green(r, g, b)


def cmpr(buf, start, nbytes):
    for p in range(start, start + nbytes - 7, 8):
        c0, c1, idx = struct.unpack_from(">HHI", buf, p)
        four = c0 > c1
        n0, n1 = rgb565(c0), rgb565(c1)
        if four and n0 <= n1:              # keep 4-colour mode: swap + remap
            n0, n1 = n1, n0
            idx ^= 0x55555555              # 0<->1, 2<->3
            if n0 == n1:
                n1 = max(0, n1 - 1)
        elif not four and n0 > n1:         # keep 3-colour+alpha mode
            n0, n1 = n1, n0
            new = 0
            for k in range(16):
                i = (idx >> (2 * k)) & 3
                new |= ({0: 1, 1: 0}.get(i, i)) << (2 * k)
            idx = new
        struct.pack_into(">HHI", buf, p, n0, n1, idx)


# format: (block w, block h, bits per pixel)
FORMATS = {0: (8, 8, 4), 1: (8, 4, 8), 2: (8, 4, 8), 3: (4, 4, 16), 4: (4, 4, 16),
           5: (4, 4, 16), 6: (4, 4, 32), 8: (8, 8, 4), 9: (8, 4, 8), 10: (4, 4, 16),
           14: (8, 8, 4)}


def tex_size(fmt, w, h, mips):
    bw, bh, bpp = FORMATS[fmt]
    total = 0
    for _ in range(max(1, mips)):
        total += -(-w // bw) * bw * -(-h // bh) * bh * bpp // 8
        w, h = max(1, w // 2), max(1, h // 2)
    return total


def do_tex1(buf, sec):
    count = struct.unpack_from(">H", buf, sec + 8)[0]
    hdrs = sec + struct.unpack_from(">I", buf, sec + 12)[0]
    done = set()
    for i in range(count):
        h = hdrs + i * 0x20
        fmt, _a, w, ht = struct.unpack_from(">BBHH", buf, h)
        pal_fmt, pal_n, pal_off = struct.unpack_from(">BHI", buf, h + 9)
        mips = buf[h + 0x18]
        data = h + struct.unpack_from(">I", buf, h + 0x1C)[0]
        if fmt not in FORMATS:
            continue
        if fmt in (8, 9, 10) and pal_n and (h + pal_off) not in done:
            done.add(h + pal_off)
            fn = {1: rgb565, 2: rgb5a3}.get(pal_fmt)
            if fn:
                map16(buf, h + pal_off, pal_n * 2, fn)
        if data in done:                   # shared image data
            continue
        done.add(data)
        size = tex_size(fmt, w, ht, mips)
        if fmt == 4:
            map16(buf, data, size, rgb565)
        elif fmt == 5:
            map16(buf, data, size, rgb5a3)
        elif fmt == 6:
            rgba8(buf, data, size)
        elif fmt == 14:
            cmpr(buf, data, size)


def do_mat3(buf, sec, size):
    offs = [struct.unpack_from(">I", buf, sec + 0x0C + 4 * k)[0] for k in range(30)]
    ends = sorted(set(o for o in offs if o) | {size})
    for k in (5, 8):                       # material colour, ambient colour
        o = offs[k]
        if not o:
            continue
        end = next(e for e in ends if e > o)
        for p in range(sec + o, sec + end - 3, 4):
            buf[p:p + 3] = bytes(green(*buf[p:p + 3]))


def recolor_j3d(data):
    buf = bytearray(data)
    nsec = struct.unpack_from(">I", buf, 0x0C)[0]
    pos = 0x20
    for _ in range(nsec):
        magic = bytes(buf[pos:pos + 4])
        size = struct.unpack_from(">I", buf, pos + 4)[0]
        if magic == b"TEX1":
            do_tex1(buf, pos)
        elif magic == b"MAT3":
            do_mat3(buf, pos, size)
        pos += size
    return bytes(buf)


def process(arc_bytes):
    compressed = arc_bytes[:4] == b"Yaz0"
    arc = yaz0_decompress(arc_bytes)
    files, ds = rarc_files(arc)
    new = {}
    for e, name, off, size in files:
        content = arc[ds + off:ds + off + size]
        inner_z = content[:4] == b"Yaz0"
        raw = yaz0_decompress(content)
        if raw[:4] in (b"J3D2", b"J3D1") and raw[4:8] in (b"bmd3", b"bdl4", b"bmd2", b"bdl3"):
            out = recolor_j3d(raw)
            if out != raw:
                print(f"  {name}: recolored")
                new[e] = yaz0_store(out) if inner_z else out
    if not new:
        print("  (no red found in this archive)")
    arc = rarc_rebuild(arc, new)
    return yaz0_store(arc) if compressed else arc


def selftest():
    red565 = 0xF800
    # TEX1 with one 4x4 RGB565 texture (32 bytes) and one 8x8 CMPR (32 bytes)
    tex = bytearray(b"TEX1" + bytes(4) + struct.pack(">HHII", 2, 0, 0x20, 0) + bytes(12))
    hdr0 = struct.pack(">BBHHBBBBHI", 4, 0, 4, 4, 0, 0, 0, 0, 0, 0) + bytes(8) + struct.pack(">BBHI", 1, 0, 0, 0x40)
    hdr1 = struct.pack(">BBHHBBBBHI", 14, 0, 8, 8, 0, 0, 0, 0, 0, 0) + bytes(8) + struct.pack(">BBHI", 1, 0, 0, 0x40)
    tex += hdr0 + hdr1
    tex += struct.pack(">H", red565) * 16
    tex += struct.pack(">HHI", red565, 0x001F, 0x1B1B1B1B) * 4
    struct.pack_into(">I", tex, 4, len(tex))
    j3d = bytearray(b"J3D2bmd3" + struct.pack(">II", 0, 1) + bytes(16) + tex)
    out = recolor_j3d(j3d)
    p = 0x20 + 0x60
    px = struct.unpack_from(">H", out, p)[0]
    assert (px >> 5) & 63 > 30 and px >> 11 < 4, hex(px)
    c0, c1, idx = struct.unpack_from(">HHI", out, p + 32)
    assert c0 > c1, "CMPR mode changed"
    print(f"red 565 -> {px:#06x}, cmpr {c0:#06x}/{c1:#06x}/{idx:#010x}")
    print("selftest OK")


if __name__ == "__main__":
    if sys.argv[1:] == ["--selftest"]:
        selftest()
    elif len(sys.argv) == 3:
        with open(sys.argv[1], "rb") as f:
            result = process(f.read())
        with open(sys.argv[2], "wb") as f:
            f.write(result)
    else:
        sys.exit(__doc__)
