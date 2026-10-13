"""Visibility before revision selection, invalidation and future-only controls."""

import pandas as pd

from common import frame, tables

DDL = [
    (
        "doc_pit_events",
        "rid INT PRIMARY KEY,event_id INT,event_day INT,received_day INT,revision INT,valid INT,v DOUBLE",
    ),
    ("doc_pit_labels", "entity_id INT,label_day INT,ready_day INT,y DOUBLE"),
]
rows = [
    (1, 1, 1, 2, 1, 1, 10.0),
    (2, 1, 1, 5, 2, 1, 99.0),
    (3, 2, 2, 3, 1, 1, 20.0),
    (4, 2, 2, 4, 2, 0, None),
]
with tables(DDL) as conn:
    with conn.cursor() as cur:
        cur.executemany("INSERT INTO doc_pit_events VALUES(%s,%s,%s,%s,%s,%s,%s)", rows)
        cur.execute("INSERT INTO doc_pit_labels VALUES(1,4,6,1)")

    def query(cutoff):
        return frame(
            conn,
            """WITH visible AS (
            SELECT *,ROW_NUMBER() OVER(PARTITION BY event_id
                ORDER BY revision DESC,rid DESC) choice
            FROM doc_pit_events WHERE event_day<%s AND received_day<=%s
        )
        SELECT event_id,v FROM visible WHERE choice=1 AND valid=1 ORDER BY event_id""",
            (cutoff, cutoff),
        )

    expected = pd.DataFrame([(1, 10.0), (2, 20.0)], columns=["event_id", "v"])
    pd.testing.assert_frame_equal(query(3), expected, check_dtype=False)
    # Future-only changes must leave the cutoff-3 feature rows unchanged.
    with conn.cursor() as cur:
        cur.execute("UPDATE doc_pit_events SET v=9999 WHERE received_day>3 AND valid=1")
        cur.execute("UPDATE doc_pit_labels SET y=9999 WHERE ready_day>3")
    pd.testing.assert_frame_equal(query(3), expected, check_dtype=False)
    at_four = query(4)
    assert at_four.to_records(index=False).tolist() == [(1, 10.0)]
    labels = frame(
        conn, "SELECT y FROM doc_pit_labels WHERE label_day=4 AND ready_day<=3"
    )
    assert labels.empty
    print(
        "cutoff 3: [(1,10),(2,20)]; cutoff 4: [(1,10)]; future-only invariance verified"
    )
