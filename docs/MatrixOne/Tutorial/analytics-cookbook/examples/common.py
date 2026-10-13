"""Connection and cleanup helpers for the executable cookbook examples."""

import os
from contextlib import contextmanager

import pymysql


def connection():
    options = dict(
        host=os.getenv("MO_HOST", "127.0.0.1"),
        port=int(os.getenv("MO_PORT", "6001")),
        user=os.environ["MO_USER"],
        password=os.environ["MO_PASSWORD"],
        database=os.environ["MO_DATABASE"],
        autocommit=True,
        connect_timeout=10,
        read_timeout=60,
        write_timeout=60,
    )
    if os.getenv("MO_SSL_CA"):
        options["ssl"] = {"ca": os.environ["MO_SSL_CA"], "check_hostname": True}
    return pymysql.connect(**options)


@contextmanager
def tables(definitions):
    """Create only new tutorial tables and remove only successfully created ones."""
    conn = connection()
    created = []
    try:
        with conn.cursor() as cur:
            for name, columns in definitions:
                cur.execute(f"CREATE TABLE {name}({columns})")
                created.append(name)
        yield conn
    finally:
        conn.rollback()
        with conn.cursor() as cur:
            for name in reversed(created):
                cur.execute(f"DROP TABLE {name}")
        conn.close()


def frame(conn, sql, params=None):
    import pandas as pd

    with conn.cursor() as cur:
        cur.execute(sql, params)
        return pd.DataFrame(
            cur.fetchall(), columns=[item[0] for item in cur.description]
        )
