# YEAR Type

The YEAR type is a 1-byte data type used to represent year values. It can be declared as YEAR with an implicit display width of 4 characters or equivalently as `YEAR(4)` with an explicit display width of 4.

MatrixOne displays YEAR values in the format YYYY, ranging from the year 0001 to 9999.

YEAR accepts input values in various formats:

- As 4-digit strings in the range '0001' to '9999'.
- As 4-digit numbers in the range 0001 to 9999.
- As 1- or 2-digit strings in the range '0' to '99'. For values in the range '0' to '00' and '00' to '99', MatrixOne automatically adds '00' as the prefix, resulting in values from '0000' to '0099'.
- The result of functions that return a value acceptable in the context of YEAR, such as the `NOW()` function.

## Two-Digit Years in Dates

Due to the lack of century information, two-digit years in dates need to be sufficiently clear. To ensure internal storage consistency, MatrixOne must interpret these date values as four-digit numbers.

For DATETIME, DATE, and TIMESTAMP types, MatrixOne follows these rules to interpret dates with ambiguous year values:

- Year values within the range 00-99 are converted to 0000-0099.

Below are examples of dates involving two-digit years:

1. Interpreting dates in DATETIME type:

Let's assume we have a column named `event_date` with DATETIME type, containing the following date values:

| event_date         |
|--------------------|
| 2023-07-12 08:30   |
| 99-01-15 13:45     |
| 23-05-06 09:00     |

According to the rules, the two-digit year values in these dates are interpreted as:

- 99-01-15 is interpreted as January 15th, 0099.
- 23-05-06 is interpreted as May 6th, 0023.

2. Interpreting dates in DATE type:

Let's assume we have a column named `birth_date` with DATE type containing the following date values:

| birth_date         |
|--------------------|
| 95-08-21           |
| 04-11-30           |
| 88-03-17           |

According to the rules, the two-digit year values in these dates are interpreted as:

- 95-08-21 is interpreted as August 21st, 0095.
- 04-11-30 is interpreted as November 30th, 0004.
- 88-03-17 is interpreted as March 17th, 0088.

3. Interpreting dates in YEAR type:

Let's assume we have a column named `graduation_year` with YEAR type containing the following year values:

| graduation_year    |
|--------------------|
| 65                 |
| 78                 |
| 03                 |

According to the rules, the two-digit year values in these dates are interpreted as:

- 65 is interpreted as the year 0065.
- 78 is interpreted as the year 0078.
- 03 is interpreted as the year 0003.
