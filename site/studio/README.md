# Gottesman Studio Local Live Routes

The public GitHub Pages build keeps `/studio/lidmas` in mock mode.
Authenticated backend testing uses a local-only route:

`/studio/lidmas-live`

Run the three local services in separate terminals:

```bash
cd /Users/denniswayo/lidmas_cpp/lidmas+
./target/debug/lidmas_backend
```

```bash
cd /Users/denniswayo/Gottesman-Software.github.io/site/studio/lidmas
VITE_BASE_PATH=/ VITE_DATA_MODE=api VITE_PUBLIC_DEMO=0 VITE_API_BASE_URL=http://127.0.0.1:8080/api/v1 npm run dev:standalone
```

```bash
cd /Users/denniswayo/Gottesman-Software.github.io/site
npm run dev:lidmas-live
```

Then open:

`http://127.0.0.1:5174/studio/lidmas-live`

If Vite moves the site server to another port, use the printed local URL with
`/studio/lidmas-live`.

Do not enable `VITE_ENABLE_LIDMAS_LIVE_ROUTE` in the public GitHub Pages build.
