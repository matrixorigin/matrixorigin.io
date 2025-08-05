# Overview

Apache Flink is a powerful framework and distributed processing engine focused on performing stateful computations for handling borderless and bounded data streams. Flink operates efficiently in a variety of common cluster environments and performs computations at memory speeds, supporting the processing of data of any size.

## Application scenarios

* Event Driven Applications

    Event-driven applications typically have state, and they extract data from one or more event streams to trigger calculations, state updates, or other external actions based on arriving events. Typical event-driven applications include anti-fraud systems, anomaly detection, rule-based alarm systems, and business process monitoring.

* Data analysis applications

    The main objective of the data analysis task is to extract valuable information and indicators from raw data. Flink supports streaming and batch analysis applications for scenarios such as telecom network quality monitoring, product updates and experimental evaluation analysis in mobile applications, real-time data impromptu analysis in consumer technology, and large-scale graph analysis.

* Data Pipeline Applications

    Extract-Transform-Load (ETL) is a common method of data conversion and migration between different storage systems. There are similarities between data pipelines and ETL jobs, both of which can transform and enrich data and then move it from one storage system to another. The difference is that the data pipeline operates in a continuous stream mode rather than a periodic trigger. Typical data pipeline applications include real-time query index building and continuous ETL in e-commerce.
