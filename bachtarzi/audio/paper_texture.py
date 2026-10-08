"""Seamless paper-grain tile (public/paper.png): periodic noise built in the
frequency domain, written as an RGBA PNG with the standard library only."""
import struct
import sys
import zlib

import numpy as np

N = 512
rng = np.random.default_rng(7)


def periodic_noise(beta):
    """1/f^beta noise that tiles seamlessly (built in Fourier space)."""
    f = np.fft.fftfreq(N)
    fx, fy = np.meshgrid(f, f)
    r = np.sqrt(fx ** 2 + fy ** 2)
    r[0, 0] = 1
    spec = (rng.normal(size=(N, N)) + 1j * rng.normal(size=(N, N))) / r ** beta
    spec[0, 0] = 0
    out = np.real(np.fft.ifft2(spec))
    return (out - out.mean()) / out.std()


grain = rng.normal(size=(N, N))
cloud = periodic_noise(1.6)
fibres = periodic_noise(0.9)
a = 0.10 * np.clip(grain, -3, 3) / 3 + 0.12 * cloud / 3 + 0.05 * fibres / 3
alpha = np.clip(0.10 + a, 0, 1)
img = np.zeros((N, N, 4), np.uint8)
img[..., 0], img[..., 1], img[..., 2] = 92, 64, 34
img[..., 3] = (alpha * 255).astype(np.uint8)


def png(path, rgba):
    h, w, _ = rgba.shape
    raw = b''.join(b'\x00' + rgba[y].tobytes() for y in range(h))

    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xFFFFFFFF)

    with open(path, 'wb') as f:
        f.write(b'\x89PNG\r\n\x1a\n')
        f.write(chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0)))
        f.write(chunk(b'IDAT', zlib.compress(raw, 9)))
        f.write(chunk(b'IEND', b''))


png(sys.argv[1] if len(sys.argv) > 1 else 'public/paper.png', img)
