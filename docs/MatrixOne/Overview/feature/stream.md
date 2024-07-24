# Stream

## Features of streaming data

With the rise of real-time data analytics, streaming data is becoming increasingly important in several areas. These data sources include, but are not limited to, real-time social media developments, online retail transactions, real-time market analysis, network security monitoring, instant messaging records, and real-time data on smart city infrastructure. Streaming data has a wide range of applications, such as:

- Real-time monitoring system: network traffic monitoring, user online behavior analysis, IoT device status monitoring;
- E-commerce platform: real-time user shopping behavior tracking, inventory dynamic adjustment, real-time price updates;
- Real-time interactive applications: social media dynamic real-time streaming, online gamer interaction data;
- Real-time risk management: financial transaction anomaly monitoring, network security threat detection;
- Smart city management: real-time traffic flow monitoring, public safety monitoring, environmental quality monitoring.
  
The distinguishing features of streaming data are real-time and continuity. This means that data is constantly generated and transmitted instantly, reflecting the latest situation at every turn. In addition, due to the large and rapidly changing volume of data streams, traditional data processing methods are often difficult to cope with and require more efficient processing and analysis techniques. Therefore, streaming data processing typically requires:

- Real-time data aggregation: real-time aggregation and analysis of continuously flowing data;
- Dynamic Data Window: Analyzes data streams within a set time period for trend analysis and pattern recognition;
- High throughput and low latency: processing large amounts of data while ensuring the immediacy and accuracy of data processing.
  
These characteristics make streaming data play an increasingly important role in modern data-driven decision-making processes, especially in scenarios that require rapid response and real-time insights.

## MatrixOne's ability to stream

### Source

MatrixOne synchronizes data between external data streams and MatrixOne database tables through Source. By enabling a precise connection and data mapping mechanism, Source not only ensures seamless docking of data streams, but also guarantees data integrity and accuracy.

### Dynamic Table Dynamic Table

Dynamic Table is the core embodiment of MatrixOne's capabilities on the stream. Dynamic tables capture, process, and transform data flowing into both Source and plain data tables in real time, guaranteeing instant updates and accurate representation of information flows throughout the system. This design not only improves the flexibility and efficiency of data processing, but also optimizes the responsiveness and processing performance of the entire system for complex data scenarios.
