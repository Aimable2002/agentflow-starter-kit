# Directional EA releases

Each version lives in its own folder (`v1.2/`, `v1.3/`, ...). To publish a new version:
1. Add the folder with the `.ex5` file.
2. Add an entry to `releases.json` (version, file_path, file_name, size, sha256, status, notes, date).
Only entries with `"status": "published"` are shown to signed-in customers. Use `draft` or `withdrawn` to hide one.
