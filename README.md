# class-update

A fork of class-update that is faster.

## Performance

Benchmark conducted against `Materialistic.css` using the official `Changes.txt` dataset.

| Version | Execution Time |
| :--- | :--- |
| Fork | 401.5 ms |
| Non-forked | 1184.7 ms |

This version processed the theme in **401.5ms** compared to **1184.7ms** for the original, making it approximately **2.95x faster**.

## Migrating

Change the step to:

```yml
- uses: flowerey/class-update@main
```
