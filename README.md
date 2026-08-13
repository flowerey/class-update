# class-update

A fork of class-update that is faster.

## Performance

Benchmark conducted against `Materialistic.css` using the official `Changes.txt` dataset.

| Version | Execution Time |
| :--- | :--- |
| Fork | 90.2 ms |
| Non-forked | 702.4 ms |

This version processed the theme in **90.2ms** compared to **702.4ms** for the original, making it approximately **8x faster**.

## Migrating

Change the step to:

```yml
- uses: flowerey/class-update@main
```
