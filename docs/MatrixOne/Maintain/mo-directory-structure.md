# MatrixOne Directory Structure

After MatrixOne has been installed and connected, the MatrixOne automatically generates the following directories for storing data files or metadata information.

Enter into the *matrixone* directory and execute `ls` to view the directory structure. The related directory structure and uses are as follows:

matrixone    //MatrixOne main directory<br>
├── etc   //configuration file directory<br>
│   └── quickstart //configration file directory<br>
├── mo-data  //data file directory<br>
│   ├── local   //local fileservice directory<br>
│   │   ├── xf<br>
│   │   └── dnservice   //dn node information directory<br>
│   ├── etl  //external table directory<br>
│   │        └── sys //Which account does the external table information belong to<br>
│   │            ├──  logs //type of statistics<br>
│   │               └── 2022 // the year of statistics<br>
│   │                   └── 10  //month of statistics<br>
│   │                       └── 27 // the number of days of statistics<br>
│   │                           ├── metric //system indicators storage directory<br>
│   │                           ├── rawlog //log storage directory<br>
│   │                           └── statement_info //information storage directory<br>
│   │  	        └── merged //Merge records of past external table information<br>
│   │                  └──  2022 // the year of statistics<br>
│   │                      └──  10  //month of statistics<br>
│   │                         └──  27 // the number of days of statistics<br>
│   │                           ├── metric //system indicators storage directory<br>
│   │                           ├── rawlog //log storage directory<br>
│   │                           └── statement_info //information storage directory<br>
│   └── logservice  //logservice directory<br>
 |      └── 7c4dccb4-4d3c-41f8-b482-5251dc7a41bf //logservice node directory (randomly generated uuid)<br>
│       ├──hostname //MatrixOne server domain name<br>
│       │   └── 00000000000000000001 //snapshot directory<br>
│        |	   ├── exported-snapshot //exporting snapshot Directory<br>
 |         │     └── snapshot-part-n //snapshot partial directory<br>
│       │       └── tandb //bootstrap directory<br>
└── s3  //data storage directory<br>
