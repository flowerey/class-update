# class-update

A fork of class-update that is faster.

## Performance

Benchmark conducted against `Materialistic.css` using the official `Changes.txt` dataset.

| Version | Execution Time |
| :--- | :--- |
| Fork | 332.4 ms |
| Non-forked | 2899.6 ms |

This version processed the theme in **332.4ms** compared to **2899.6ms** for the original, making it approximately **9x faster**.

## Migrating

Change the step to:

```yml
- uses: flowerey/class-update@main
```
