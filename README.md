# class-update

A fork of class-update that is faster.

## Performance

Benchmark conducted against `Materialistic.css` using the official `Changes.txt` dataset.

| Version | Execution Time |
| :--- | :--- |
| Fork | 414.1 ms |
| Non-forked | 3346.6 ms |

This version processed the theme in **414.1ms** compared to **3346.6ms** for the original, making it approximately **8x faster**.

## Migrating

Change the step to:

```yml
- uses: flowerey/class-update@main
```
