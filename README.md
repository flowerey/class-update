# class-update

A fork of class-update that is faster.

## Performance

Benchmark conducted against `Materialistic.css` using the official `Changes.txt` dataset.

| Version | Execution Time |
| :--- | :--- |
| Fork | 419.7 ms |
| Non-forked | 3374.0 ms |

This version processed the theme in **419.7ms** compared to **3374.0ms** for the original, making it approximately **8x faster**.

## Migrating

Change the step to:

```yml
- uses: flowerey/class-update@main
```
