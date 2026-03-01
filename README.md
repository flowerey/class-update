# class-update

A fork of class-update that is faster.

## Performance

Benchmark conducted against `Materialistic.css` using the official `Changes.txt` dataset.

| Version | Execution Time |
| :--- | :--- |
| Fork | 413.6 ms |
| Non-forked | 3330.3 ms |

This version processed the theme in **413.6ms** compared to **3330.3ms** for the original, making it approximately **8x faster**.

## Migrating

Change the step to:

```yml
- uses: flowerey/class-update@main
```
