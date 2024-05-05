# Mermaid Worker

This is a simple worker that renders Mermaid diagrams from a URL.

```bash
curl "https://mermaid-renderer.maximum.vc/?code={encoded code}"
```

`image/svg+xml` is returned.
If the code is invalid, `500 Internal Server Error` will be returned.
