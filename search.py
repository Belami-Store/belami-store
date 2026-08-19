import os

with open('style.css', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if 'modal' in line or 'close' in line:
        print(f"{idx + 1}: {line.strip()}")
