# Transaction ascenarios in MatrixOne

In a financial system, transfers between different users are prevalent scenarios. The actual operation of transfers in the database is usually two steps; first, after deducting the book value of one user and then to another, The user's account amount is increased. Only by using the atomicity of the transaction can we ensure that the total book funds have not changed. At the same time, the accounts between the two users have completed their deductions and increases. For example, user A transfers 50 to user B at this time:

```
start transaction;
update accounts set balance=balance-50 where name='A';
update accounts set balance=balance+50 where name='B';
commit;
```

When the two `update` are successful and finally submitted, the entire transfer is truly completed. The entire transaction must be rolled back if any step fails to ensure atomicity.

In addition, during the transfer process of the two accounts, before committing, whether it is A or B, you see the book balance that has not been transferred, which is the transaction's isolation.

During the transfer process, the database will check whether A's book funds are greater than 50 and whether A and B are indeed in the system. Only when these constraints are satisfied can the consistency of the transaction be guaranteed.

After the transfer is completed, whether the system is restarted or not, the data has persisted, reflecting the persistence of the transaction.
