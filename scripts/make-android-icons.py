#!/usr/bin/env python3
"""Rasterize the 纸历 mark into Android launcher densities."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

CREAM = (243, 236, 224, 255)
VERMILION = (196, 69, 43, 255)


def rounded_rect(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], radius: int, fill: tuple[int, int, int, int]) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=fill)


def paint_mark(size: int, *, pad: float = 0.12, background: tuple[int, int, int, int] | None = CREAM) -> Image.Image:
    img = Image.new("RGBA", (size, size), background or (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    inset = int(size * pad)
    inner = size - inset * 2
    x0, y0 = inset, inset
    unit = inner / 32

    def s(value: float) -> int:
        return int(round(x0 + value * unit))

    def t(value: float) -> int:
        return int(round(y0 + value * unit))

    if background is None:
        rounded_rect(draw, (s(0), t(0), s(32), t(32)), int(8 * unit), CREAM)

    draw.ellipse((s(11 - 3.2), t(7 - 3.2), s(11 + 3.2), t(7 + 3.2)), fill=VERMILION)
    draw.ellipse((s(21 - 3.2), t(7 - 3.2), s(21 + 3.2), t(7 + 3.2)), fill=VERMILION)
    rounded_rect(draw, (s(5), t(8), s(27), t(28)), int(3 * unit), VERMILION)
    rounded_rect(draw, (s(8), t(14), s(24), t(25)), int(1.5 * unit), CREAM)
    rounded_rect(draw, (s(10), t(16), s(15.5), t(23)), int(1 * unit), VERMILION)
    return img


def save(img: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "PNG")


def main() -> None:
    root = Path("/workspace")
    resources = root / "resources"
    save(paint_mark(1024), resources / "icon.png")
    save(paint_mark(512, background=None, pad=0.18), resources / "icon-foreground.png")
    save(Image.new("RGBA", (512, 512), CREAM), resources / "icon-background.png")

    densities = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192,
    }
    android_res = root / "android" / "app" / "src" / "main" / "res"
    if android_res.exists():
        for folder, size in densities.items():
            icon = paint_mark(size)
            save(icon, android_res / folder / "ic_launcher.png")
            save(icon, android_res / folder / "ic_launcher_round.png")
            save(paint_mark(size * 2, background=None, pad=0.22), android_res / folder / "ic_launcher_foreground.png")
            save(Image.new("RGBA", (size, size), CREAM), android_res / folder / "ic_launcher_background.png")


if __name__ == "__main__":
    main()
