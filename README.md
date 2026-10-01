# class-update

A fork of class-update that is faster.

## Performance

Benchmark conducted against `Materialistic.css` using the official `Changes.txt` dataset.

| Version | Execution Time |
| :--- | :--- |
| Fork | 161.3 ms |
| Non-forked | 3348.6 ms |

This version processed the theme in **161.3ms** compared to **3348.6ms** for the original, making it approximately **21x faster**.

## Migrating

Change the step to:

```yml
- uses: flowerey/class-update@main
```
