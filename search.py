import os
search_terms = ['هدية', 'خصم', 'BELAMI5']
for root, dirs, files in os.walk('.'):
    for file in files:
        if file.endswith(('.html', '.js')):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    for i, line in enumerate(f):
                        for term in search_terms:
                            if term in line:
                                print(f'{path}:{i+1} -> {line.strip()}')
            except Exception:
                pass