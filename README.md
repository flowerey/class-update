# class-update

A fork of class-update that is faster.

## Performance

Benchmark conducted against `Materialistic.css` using the official `Changes.txt` dataset.

| Version | Execution Time |
| :--- | :--- |
| Fork | 412.0 ms |
| Non-forked | 1200.9 ms |

This version processed the theme in **412.0ms** compared to **1200.9ms** for the original, making it approximately **3x faster**.

## Migrating

Change the step to:

```yml
- uses: flowerey/class-update@main
```
