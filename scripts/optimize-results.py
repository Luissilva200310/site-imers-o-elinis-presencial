from pathlib import Path

from PIL import Image, ImageOps


SOURCE_DIR = Path(r"C:\Users\luiss\Downloads")
OUTPUT_DIR = Path(__file__).resolve().parents[1] / "assets"
SOURCE_FILES = [
    "IMG_5627.PNG",
    "IMG_5644.PNG",
    "IMG_5629.PNG",
    "IMG_5631.PNG",
    "IMG_5635.PNG",
    "IMG_5633.PNG",
    "IMG_5638.PNG",
    "IMG_5643.PNG",
    "IMG_5641.PNG",
]


def main() -> None:
    for index, filename in enumerate(SOURCE_FILES, start=1):
        source = SOURCE_DIR / filename
        destination = OUTPUT_DIR / f"resultado-{index:02d}.webp"

        with Image.open(source) as original:
            image = ImageOps.exif_transpose(original).convert("RGB")
            image.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
            image.save(destination, "WEBP", quality=88, method=6)

        print(destination)


if __name__ == "__main__":
    main()
