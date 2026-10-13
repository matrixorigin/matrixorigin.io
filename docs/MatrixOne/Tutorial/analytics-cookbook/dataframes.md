# pandas and NumPy data handling

The goal is to calculate a weighted mean without silently changing precise source values or counting the weight of a missing observation.

## Source and numerical contract

The complete [dataframes.py example](examples/dataframes.py), together with [common.py](examples/common.py), creates these rows:

| id | v: DECIMAL(18,8) | w: DOUBLE |
|---|---:|---:|
| 1 | 0.125 | 1 |
| 2 | 0.5 | 3 |
| 3 | NULL | 2 |

SQLAlchemy connects through mysql+pymysql. The example builds the URL with URL.create, so special characters in the password are handled by the URL library. pandas.read_sql uses coerce_float=False to preserve DECIMAL objects while auditing source values.

It checks the raw Decimal and NULL values before explicitly constructing float64 numerical inputs. Use pd.isna/notna for mixed None/NaN inputs; np.isnan(None) is not a general missing-value check. Keep identifiers and timestamps out of lossy floating conversions when exact identity matters.

## Pairwise-valid weights

Use the same valid (v,w) pairs for both numerator and denominator:

```sql
-- Expected-Value: 0.40625
SELECT SUM(v*w) / NULLIF(
    SUM(CASE WHEN v IS NOT NULL AND w IS NOT NULL THEN w END),0
) weighted_mean
FROM (
    SELECT CAST(0.125 AS DOUBLE) v,CAST(1 AS DOUBLE) w
    UNION ALL SELECT CAST(0.5 AS DOUBLE),CAST(3 AS DOUBLE)
    UNION ALL SELECT CAST(NULL AS DOUBLE),CAST(2 AS DOUBLE)
) observations;
```

The expected mean is (0.125 + 0.5*3) / 4 = 0.40625. Including the third row's weight in the denominator would incorrectly produce 1.625 / 6.

The Python script independently calculates np.dot(x,w)/w.sum(), checks finite/nonnegative weights and compares the SQL result. A zero total weight returns NULL/None. Define the application's policy for negative or nonfinite weights.

## Precision choices

Choose the type according to the task. Monetary accounting may require DECIMAL arithmetic throughout; scientific calculations may require an explicit DOUBLE input and a stated numerical tolerance.

In the source validation, AVG(integer) on the tested MO build returned a scale-four DECIMAL while floating reference engines returned floating averages. If a feature requires floating calculation, cast the input, for example AVG(CAST(v AS DOUBLE)). Casting an already rounded average cannot recover its lost precision. Do not merely widen a comparison tolerance to hide this difference.

## Transactional result publication

Run the complete example after the [connection setup](index.md#run-the-complete-examples):

```bash
python dataframes.py
```

Expected output:

```text
weighted_mean=0.40625; DECIMAL/NULL and commit/rollback readback verified
```

The script writes a deterministic result key, commits, then reads the full result through a separate connection. It also changes the result inside a transaction, rolls back and verifies the original value through that second connection.

A failed write with an unknown commit outcome needs a result key and a reconciliation strategy. Blindly retrying append-style publication can duplicate results; a successful transaction does not by itself define application-level replay semantics.
