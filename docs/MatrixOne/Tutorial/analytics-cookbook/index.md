# Analytics and machine-learning cookbook

Use MatrixOne to select and aggregate facts, then use Python or an external compute engine for the analytical steps that belong there. These tutorials show complete inputs, expected results and readback checks.

## Choose a tutorial

| User requirement | Tutorial |
|---|---|
| Preserve DECIMAL and NULL values while building a DataFrame | [pandas and NumPy data handling](dataframes.md) |
| Reconstruct features using only information known at a cutoff | [Point-in-time features and revisions](point-in-time.md) |
| Join facts without multiplying revenue or refunds | [Multi-table analysis](joins.md) |
| Distinguish missing days, missing values and zero activity | [Calendar and rolling features](time-series.md) |
| Configure JDBC pipelines and understand their delivery scope | [Spark and Flink integration](connectors.md) |
| Save preprocessing, model weights and predictions together | [Model lifecycle](model-lifecycle.md) |
| Translate dedicated statistical APIs into a defined SQL profile | [Window statistics migration](migration.md) |
| Explore ten business-analysis requirements | [Business analysis seeds](business-analysis.md) |
| Measure fetching separately from scientific computation | [Measurement and troubleshooting](measurement.md) |

## Tested environment

The runnable examples were checked on MatrixOne binary commit `23d8f61252f3017dff218b530817a240206fd762`. This is the executed binary revision, not the source checkout revision and not a claim about every release. Record your server and dependencies before reproducing a result.

| Component | Verified version |
|---|---|
| Python | 3.12 |
| NumPy / pandas | 2.1.3 / 2.2.3 |
| PyMySQL / SQLAlchemy | 1.2.0 / 2.0.43 |
| SciPy / scikit-learn | 1.17.0 / 1.8.0 |
| NetworkX / Shapely | 3.6.1 / 2.1.2 |
| CPU PyTorch | 2.5.1 |
| PySpark / PyFlink | 3.5.3 / 2.1.1 |
| Java / MySQL Connector-J | Java 17 / 8.0.33 |

Small synthetic examples establish the stated input/output contract. They do not establish production capacity, distributed fault tolerance, predictive quality or long-term availability.

## Run the complete examples

Create a dedicated test database and use an account allowed to create and remove tables in that database:

```sql
CREATE DATABASE doc_analytics;
```

Install the relevant dependencies in a Python virtual environment. The basic DataFrame and point-in-time examples need:

```bash
python -m pip install numpy==2.1.3 pandas==2.2.3 PyMySQL==1.2.0 SQLAlchemy==2.0.43
```

Set MO_HOST, MO_PORT, MO_USER, MO_PASSWORD and MO_DATABASE in your environment. For these examples MO_DATABASE is doc_analytics; keep the password out of source files. Set MO_SSL_CA when your connection requires TLS certificate verification.

Download the linked scripts together with [common.py](examples/common.py), or clone the public documentation repository and run them from its examples directory:

```bash
git clone https://github.com/matrixorigin/matrixorigin.io.git
cd matrixorigin.io/docs/MatrixOne/Tutorial/analytics-cookbook/examples
python -m pip install -r requirements.txt
python dataframes.py
python point_in_time.py
```

Each script refuses to overwrite an existing tutorial table and removes only tables it created. Tables are shared by name while a script runs; use separate test databases for simultaneous runs. DDL setup occurs before data transactions.

The [basic requirements](examples/requirements.txt) and [scientific requirements](examples/requirements-scientific.txt) record the versions used by the corresponding scripts. Spark/Flink and CPU PyTorch are optional separate installations described in their tutorials.

## Where calculations execute

| Layer | Responsibilities in these examples |
|---|---|
| MatrixOne SQL | Filtering, joins, revision selection, windows and aggregates; storing facts, model bytes and predictions. |
| Composed MatrixOne SQL | Formulas built from existing SQL primitives, with explicitly defined NULL/weight/frame policies. |
| Python libraries | Scientific statistics, graph/geometry calculations and PyTorch training/inference after fetching facts. |
| Spark/Flink | Their own computation operators plus JDBC reading/writing; delivery and recovery semantics depend on the configured pipeline. |

The larger source campaign contains 360,000 unique logical data-science cases, including historical failures. Those cases are parameterized assertions or workflows, not that many distinct algorithms. This cookbook selects small independently checkable examples; its success statements concern these examples only.

After finishing all tutorials, remove doc_analytics if it contains only your tutorial data. Use the [transaction guide](../../Develop/Transactions/matrixone-transaction-overview/overview.md) for general transaction behavior.
