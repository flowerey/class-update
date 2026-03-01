# class-update

A fork of class-update that is faster.

## Performance

Benchmark conducted against `Materialistic.css` using the official `Changes.txt` dataset.

| Version | Execution Time (Mean) |
| :--- | :--- |
| Optimized (Fork) | 407.8 ms |
| Original (Legacy) | 1199.0 ms |

This version processed the theme in **407.8ms** compared to **1199.0ms** for the original, making it approximately **2.94x faster**.

## Migrating

Change the step to:

```yml
- uses: flowerey/class-update@main
```
