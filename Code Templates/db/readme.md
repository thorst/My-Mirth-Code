# db_exec

This is meant to be a fully featured db script that can connect to any db engine that jodbc can connect to.

## Configuration Map conneciton strings
To get started you will need to create a connection string in your configuration map. Whatever the key name is, is what you would use while calling db_Exec

* Key: db_server
* Value: {"address":"jdbc:jtds:sqlserver://db_server:1433/db_name","username":"username","password":"password","driver":"net.sourceforge.jtds.jdbc.Driver"}

## Features
I was able to accomplish a lot in this version, and it should be pretty extensible in the future if more features are needed. Here are the features and their associated version number

    • V1 (db_execute) - 11/11/2020
        ○ Persistent connection at server or channel level
        ○ Selects/Updates
        ○ Tries 2 times to make query
        ○ Shuts channel down if unable to connect
    • V2 (db_exec, db_connect, db_perform, db_close) - 01/19/2024
        ○ Query Timeout
        ○ Sleep between queries
        ○ Optionally shut down
        ○ Loop until successful
        ○ JS query parameters (instead of java)
        ○ Parameterized queries
        ○ Multiple query parameter sets
        ○ Auto-detects if data is returned (removed function parameter)
        ○ Object for settings instead of multiple function parameters
        ○ Created documentation and examples

## Notes:
    1. As mirth reprocesses transactions, if you are doing an insert, there is a potential to have duplicate data inserted into your db, so you will need to account for that. Here are some potential solutions.
        a. Move the code to the source connector, where its less likely to be replayed
        b. Wrap in some code like
```javascript
        if (typeof $c('inserted_in_db')!= null) {
            //db code
            $c('inserted_in_db',true);
        }
```
        c. Insert ignore – not all db engines have this syntax, for all cases you would put a unique key on the column in question
            i. Sqlite - "INSERT OR IGNORE INTO my_table (name) VALUES ('a');"
            ii. Postgres - "INSERT INTO my_table (name) VALUES ('a') ON CONFLICT (name) DO NOTHING;"
            iii. Ms sql server – Insert and let it throw an error, or do a select first
    
## Examples

### #1: Typical select
There is only one data set returned so we don’t need to wrap the while loop in a foreach. You can access columns by their name or index (1-based)
```javascript
var sql = "SELECT * FROM [my_db].[my_table];";
var result = db_exec("db_server", sql);
while (result && result.next()) {

    // Get columns by index
    echo([result.getString(1), result.getString(2), result.getString(3), result.getString(4)]);

    // Or get them by name
    echo(result.getString('Name'));
}
```

### #2: Typical insert
This is a harmless update because its settings Name=Name. You can run it to test if you need to. You can also see how I created a query that spans multiple lines by escaping the newline.

```javascript
var sql = "UPDATE [my_db].[my_table] \
            SET Name=Name \
            WHERE ID = " + configurationMap.get("serverID");
var result = db_exec("db_server", sql);
echo("Effected Rows:", result);
if (result.size()==1) {
        // one row was effected
}
```

### #3: Multiple Queries - Multiple Data Sets
Generally if you have a lot of queries you would think it would be faster to use parameterized queries (example below) but honestly, if you have to make 200 calls, it's much more performant to build a long string and send that in "as one query". This traverses the network one time, executes all the queries, and then comes back one time. In either scenario we use one connection, but in this case we are saving a lot of network time and statement handle creation.

I've also included some echos in this one, just to give you some understanding of what's happening. 

The first two echo's return the same thing. `[null,null]` You can see the outer JavaScript array, but the inner objects say null. These are the java data sets.
The echo inside the forEach will output `com.mirth.connect.server.userutil.MirthCachedRowSet`, so they are indeed valued, and not null. Just an interesting observation.
```javascript
var sql = "SELECT 1;SELECT 2;";
var results = db_exec("db_server", sql);
echo(JSON.stringify(results));
echo("results",results);
results.forEach(function(result, i) {
    echo(varType(result));
    while (result && result.next()) {

        // Get columns by index
        echo(result.getString(1));
    }
});
```

### #4: Calling a stored procedure with no parameters
```javascript
var sql = "EXEC [dbo].[usp_TestNoParam];";
var result = db_exec("db_server", sql);
while (result && result.next()) {

    // Get columns by index
    echo(result.getString(1));
}
```

### #5: Calling a stored procedure with parameters
```javascript
var sql = "EXEC [dbo].[usp_TestWithParam] @retInt = 5;";
var result = db_exec("db_server", sql);
while (result && result.next()) {

    // Get columns by index
    echo(result.getString(1));
}
```

### #6: Parameterized Query
You can see there is a ? In the query that will get replaced with the parameter. In this case we send in an array with a single value. I will have a multiple value example below, but order matters here. This would be the same code for a select or an update, but if you had an update you wouldn’t need the results part.
```javascript
var result = db_exec("db_server", 'SELECT * FROM [my_db].[my_table] WHERE ID = ?', {
    query_parameters: [configurationMap.get("serverID")]
});
while (result && result.next()) {

    // Get columns by index
    echo([result.getString(1), result.getString(2), result.getString(3), result.getString(4)]);

    // Or get them by name
    echo(result.getString('Name'));
}
```

### #7: Multiple Parameter Set
Here you can see we still only have one "?" but in our query_parameters we have an array of arrays. We need these two layers because the top layer can be thought of as the number of times the query will execute, and the inner layer is what values get substituted where. The inner array could have multiple values that it will be substituting. Critically, note here that because we are essentailly executing two queries, that you will get two data sets returned to you. If there is only one data set you can just use the "while" to loop over the contents of a data set, but now we need an outer "forEach" to loop over each data set. The outer object is a javascript array, the inner object is a java MirthCachedRowSet.
```javascript
var results = db_exec("db_server", 'SELECT * FROM [my_db].[my_table] WHERE ID = ?', {
    query_parameters: [
        [configurationMap.get("serverID")],
        [1]
    ]
});
results.forEach(function(result) {
    while (result && result.next()) {

        // Get columns by index
        echo([result.getString(1), result.getString(2), result.getString(3), result.getString(4)]);

        // Or get them by name
        echo(result.getString('Name'));
    }
});
```

### #8: Multiple Parameter Sets with Multiple Parameters
If you run the below code you will get the following output:

    Set 0 updated 0 record(s)

    Set 1 updated 1 record(s)

Not much is changed here, I'm just showing how you can have multiple parameters, and ORDER MATTERS. This is also using an update instead of a select as we were above. Since an update only returns an integer for the number of rows updaed and not a data set you can just use the JavaScript forEach.
```javascript
var sql = "UPDATE [my_db].[my_table] \
            SET Name=Name \
            WHERE ID = ? AND Name=?;";
var results = db_exec("db_server", sql, {
    query_parameters: [
        [2, "TST01"],  // This will not update anything since 1 is maintest, 2 is mainprd
        [1, "TST01"]  // This will update the record, and set the name to itself
    ]
});
results.forEach(function(result, i) {
    echo("Set " + i + " updated " + result + " record(s)");
});
```

### #9: Query in a Query
If your hitting one server then I would suggest creating one big query that returns everything, or maybe a stored procedure, or you can send in multiple queries. But what if you want to hit multiple db servers or some other use case I'm not thinking about at the moment. You can execute a 2nd sub query in a loop of the 1st queries results.


### #10: Timeouts
I would not recommend you have a timeout. This is typically set by the server and we don’t touch it. Here you can set it. I suppose we would use this to set it HIGHER if we have a long executing query. But pro tip, don’t do that. Optimize the query or table in order to have a performant query. Still, I've thrown this in just-in-case. If it times out in prod and loop was set to true (it is by default) if would continue trying this slow query. Ideally, you identify a slow query prior to moving to prod. Side note, if you want to learn how to do a sleep you can check out the store procedure referenced here. This is also an example of a stored procedure with parameters.
```javascript
var sql = "EXEC [dbo].[usp_TestTimeout] @waitSeconds = 5";
var result = db_exec("db_server", sql, {timeout:3});
while (result && result.next()) {

    // Get columns by index
    echo(result.getString(1));
}
```

### #11: Result set length
You should do a count(*) if your JUST interested in the count. However if you need both the count and the data you can use this: https://stackoverflow.com/questions/192078/how-do-i-get-the-size-of-a-java-sql-resultset
```javascript
ResultSets=ps.executeQuery();
introwcount=0;
if(rs.last()) {
  rowcount = rs.getRow();
  rs.beforeFirst(); // not rs.first() because the rs.next() below will move on, missing the first element
}
while(rs.next()) {
  // do your standard per row stuff
}
```

## Data Types
In JDBC, there are several methods you can use to retrieve data from a ResultSet object. Here are some commonly used methods:
1. getInt(int columnIndex) / getInt(String columnLabel): Retrieves the value of the designated column as an int.
2. getDouble(int columnIndex) / getDouble(String columnLabel): Retrieves the value of the designated column as a double.
3. getBoolean(int columnIndex) / getBoolean(String columnLabel): Retrieves the value of the designated column as a boolean.
4. getDate(int columnIndex) / getDate(String columnLabel): Retrieves the value of the designated column as a java.sql.Date.
5. getTimestamp(int columnIndex) / getTimestamp(String columnLabel): Retrieves the value of the designated column as a java.sql.Timestamp.
6. getFloat(int columnIndex) / getFloat(String columnLabel): Retrieves the value of the designated column as a float.
7. getLong(int columnIndex) / getLong(String columnLabel): Retrieves the value of the designated column as a long.
8. getObject(int columnIndex) / getObject(String columnLabel): Retrieves the value of the designated column as an Object.





## Not Exampled
1. global_connection - Boolean - this defaults to true, if you set it to false it will store the connection in the globalChannelMap instead of the globalMap
2. sleep - Integer - defaults to null, if valued as an integer, the function will sleep between executions if its looping. Consult the sleep code template to understand its ramifications.
3. shut_down - Boolean - defaults to false, if true and its unable to make a connection it'll shut the channel down. Not recommended.
4. loop - Boolean - defaults to true IN PROD - will loop until it successfully makes the query in prod, in test it will not loop (so you can develop without creating infinite loops).
5. isProd - Boolean - defaults based on serverIsProd() code template - if you wanted to test how it would react in prod with looking in test, you can override this to true.

## Failures
While I would consider this version pretty fully featured and well-developed, I was not able to accomplish two goals.
1. Real Time Data - If you use mirth's built in db methods, they will cache results. This means you can loop over them as many times as you want without it re-querying the data. This is good. But it also stores all the data in memory. For any result set that is large, either due to large number of columns or large column size, or a large set of rows, you could negatively impact mirth. JDBC, which is what underlines these built in methods, is capable of returning a data set for you to loop over and then clean up when you done. I was unable to make this work. When sending it back to JavaScript it would close the result set and statement handles. I titled this as "real time data" because if you loop over the data a second time, it will re-query the database and get fresh results. This can be investigated more in the future if needed. I would start with a scratch implementation and do everything by hand, and then see if I can return the result set to the caller. CAN I STORE THE STATEMENT HANDLE IN CHANNELMAP? Currently if I loop over the result set at the time of execution it works, but this is how the cache works, I need to pass the handle back to the caller. If it's not possible directly in js, can we somehow call java to return it? Or when it comes over to js does it just close no matter how/where its instantiated. If you get it to work, make sure you include closing the handles in the example so we don’t have things hanging out there. In the meantime, if you have large datasets, the solution is to not. Either limit the number of rows and/or only return the columns you need.
2. Named Parameterized Query - In other languages it's possible to have a query like "SELECT * FROM [my_db].[my_table] WHERE ID = :serverID" and then you would pass in {serverID: 1}. Just like retrieving columns by their name, this is easier if the table/query changes structure, you don’t have to worry about updating your parameter set. This is possible in java but it requires Spring Framework, Java Object Oriented Querying, or QueryDSL. To my knowledge these do not come with Mirth and so I don’t want to manage another package, keeping it updated and installed everywhere. If jdbc were to begin to allow this, or if these other frameworks were to be included with mirth I would extend the product to include this functionality.
    
