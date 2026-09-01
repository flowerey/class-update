# class-update

A fork of class-update that is faster.

## Performance

Benchmark conducted against `Materialistic.css` using the official `Changes.txt` dataset.

| Version | Execution Time |
| :--- | :--- |
| Fork | 188.9 ms |
| Non-forked | 3815.4 ms |

This version processed the theme in **188.9ms** compared to **3815.4ms** for the original, making it approximately **20x faster**.

## Migrating

Change the step to:

```yml
- uses: flowerey/class-update@main
```
