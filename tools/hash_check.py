import zlib

def fnv1a(data: bytes) -> int:
    h = 0x811c9dc5
    for b in data:
        h = (h ^ b) * 0x01000193
        h &= 0xffffffff
    return h

def djb2(data: bytes) -> int:
    h = 5381
    for b in data:
        h = ((h << 5) + h) + b
        h &= 0xffffffff
    return h

candidates = [b'Recipe', b'2Recipe', b'Recipe-BG-Convert-Poly-03', b'Recipe-BG']
target = 0xC5668ED4

print(f"Target Hash: {target:08X}")

for s in candidates:
    print(f"\n--- Testing '{s.decode()}' ---")
    print(f"CRC32: {zlib.crc32(s):08X}")
    print(f"FNV1a: {fnv1a(s):08X}")
    print(f"DJB2:  {djb2(s):08X}")
    
    if zlib.crc32(s) == target or fnv1a(s) == target or djb2(s) == target:
        print("!!! MATCH FOUND !!!")
