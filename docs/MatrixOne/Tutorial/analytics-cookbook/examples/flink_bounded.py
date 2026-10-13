"""A bounded Flink JDBC source/dimension join/aggregate/sink job."""

import os
from pathlib import Path

from pyflink.table import EnvironmentSettings, TableEnvironment

from common import frame, tables

required = [
    "flink-connector-jdbc-core-4.1.0-2.1.jar",
    "flink-connector-jdbc-mysql-4.1.0-2.1.jar",
    "mysql-connector-j-8.0.33.jar",
    "openlineage-java-1.32.0.jar",
    "openlineage-sql-java-1.32.0.jar",
]
jar_dir = Path(os.environ["MO_JAR_DIR"])
jars = [jar_dir / name for name in required]
assert all(p.is_file() for p in jars), "Provide the five documented JDBC/runtime JARs"
url = os.environ["MO_JDBC_URL"]


def esc(value):
    return str(value).replace("'", "''")


def options(table):
    return (
        f"'connector'='jdbc','url'='{esc(url)}','table-name'='{table}',"
        f"'driver'='com.mysql.cj.jdbc.Driver','username'='{esc(os.environ['MO_USER'])}',"
        f"'password'='{esc(os.environ['MO_PASSWORD'])}'"
    )


with tables(
    [
        ("doc_flink_events", "id INT PRIMARY KEY,uid INT,v DOUBLE"),
        ("doc_flink_units", "uid INT PRIMARY KEY,region INT"),
        ("doc_flink_results", "region INT,n BIGINT,total DOUBLE"),
    ]
) as conn:
    with conn.cursor() as cur:
        cur.execute("INSERT INTO doc_flink_events VALUES(1,1,10),(2,1,20),(3,2,7)")
        cur.execute("INSERT INTO doc_flink_units VALUES(1,10),(2,20)")
    assert frame(conn, "SELECT * FROM doc_flink_events ORDER BY id").to_records(
        index=False
    ).tolist() == [(1, 1, 10.0), (2, 1, 20.0), (3, 2, 7.0)]
    assert frame(conn, "SELECT * FROM doc_flink_units ORDER BY uid").to_records(
        index=False
    ).tolist() == [(1, 10), (2, 20)]
    environment = TableEnvironment.create(EnvironmentSettings.in_batch_mode())
    configuration = environment.get_config().get_configuration()
    configuration.set_string(
        "pipeline.jars", ";".join(p.resolve().as_uri() for p in jars)
    )
    configuration.set_string("parallelism.default", "1")
    environment.execute_sql(
        "CREATE TABLE events(id INT,uid INT,v DOUBLE) WITH ("
        + options("doc_flink_events")
        + ")"
    )
    environment.execute_sql(
        "CREATE TABLE units(uid INT,region INT) WITH ("
        + options("doc_flink_units")
        + ")"
    )
    environment.execute_sql(
        "CREATE TABLE sink(region INT,n BIGINT,total DOUBLE) WITH ("
        + options("doc_flink_results")
        + ")"
    )
    environment.execute_sql("""INSERT INTO sink
        SELECT u.region,COUNT(*),SUM(e.v)
        FROM events e JOIN units u ON e.uid=u.uid
        GROUP BY u.region""").wait(120000)
    actual = frame(conn, "SELECT region,n,total FROM doc_flink_results ORDER BY region")
    assert actual.to_records(index=False).tolist() == [(10, 2, 30.0), (20, 1, 7.0)]
    print("bounded Flink JDBC results: [(10,2,30),(20,1,7)]")
