"""DECIMAL preservation, pairwise NULL handling and transactional readback."""

import os
from decimal import Decimal

import numpy as np
import pandas as pd
from sqlalchemy import URL, create_engine, text

from common import connection, tables

with tables(
    [
        ("doc_analytics_values", "id BIGINT PRIMARY KEY,v DECIMAL(18,8),w DOUBLE"),
        ("doc_analytics_results", "id BIGINT PRIMARY KEY,weighted_mean DOUBLE"),
    ]
) as conn:
    with conn.cursor() as cur:
        cur.executemany(
            "INSERT INTO doc_analytics_values VALUES(%s,%s,%s)",
            [(1, Decimal("0.125"), 1.0), (2, Decimal("0.5"), 3.0), (3, None, 2.0)],
        )
    url = URL.create(
        "mysql+pymysql",
        username=os.environ["MO_USER"],
        password=os.environ["MO_PASSWORD"],
        host=os.getenv("MO_HOST", "127.0.0.1"),
        port=int(os.getenv("MO_PORT", "6001")),
        database=os.environ["MO_DATABASE"],
    )
    ssl = (
        {"ssl": {"ca": os.environ["MO_SSL_CA"], "check_hostname": True}}
        if os.getenv("MO_SSL_CA")
        else {}
    )
    engine = create_engine(url, connect_args=ssl)
    try:
        with engine.connect() as reader:
            raw = pd.read_sql(
                text("SELECT id,v,w FROM doc_analytics_values ORDER BY id"),
                reader,
                coerce_float=False,
            )
        assert isinstance(raw.loc[0, "v"], Decimal)
        assert pd.isna(raw.loc[2, "v"])
        numeric = raw.copy()
        numeric["v"] = pd.to_numeric(numeric["v"], errors="raise").astype("float64")
        valid = numeric["v"].notna() & numeric["w"].notna()
        x = numeric.loc[valid, "v"].to_numpy()
        w = numeric.loc[valid, "w"].to_numpy()
        assert np.isfinite(x).all() and np.isfinite(w).all() and (w >= 0).all()
        weighted_mean = float(np.dot(x, w) / w.sum()) if w.sum() else None
        assert weighted_mean == 0.40625
        with conn.cursor() as cur:
            cur.execute("""SELECT SUM(CAST(v AS DOUBLE)*w) /
                NULLIF(SUM(CASE WHEN v IS NOT NULL AND w IS NOT NULL THEN w END),0)
                FROM doc_analytics_values""")
            assert cur.fetchone()[0] == weighted_mean

        # DDL was completed before the transaction. Publish a deterministic result key.
        conn.begin()
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO doc_analytics_results VALUES(%s,%s)", (1, weighted_mean)
            )
        conn.commit()
        observer = connection()
        try:
            with observer.cursor() as cur:
                cur.execute(
                    "SELECT id,weighted_mean FROM doc_analytics_results ORDER BY id"
                )
                assert cur.fetchall() == ((1, 0.40625),)
            conn.begin()
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE doc_analytics_results SET weighted_mean=99 WHERE id=1"
                )
            conn.rollback()
            with observer.cursor() as cur:
                cur.execute(
                    "SELECT weighted_mean FROM doc_analytics_results WHERE id=1"
                )
                assert cur.fetchone()[0] == weighted_mean
        finally:
            observer.close()
        print(
            "weighted_mean=0.40625; DECIMAL/NULL and commit/rollback readback verified"
        )
    finally:
        engine.dispose()
