# Django Foundation Example

This document will guide you through how to build a simple application using **Django** and implement CRUD (Create, Read, Update, Delete) functionality.

**Django** is an open source web application framework written in Python.

## Prepare before you start

A simple introduction to related software:

* Django is an advanced Python web framework for rapid development of maintainable and scalable web applications. With Django, with very little code, Python's program developers can easily do most of what a full-fledged website needs and further develop full-featured web services.

### Software Installation

Before you begin, confirm that you have downloaded and installed the following software:

- Verify that you have completed the [standalone deployment of](../Get-Started/install-standalone-matrixone.md) MatrixOne.

- Verify that you have finished installing [Python 3.8 (or plus)](https://www.python.org/downloads/). Verify that the installation was successful by checking the Python version with the following code:

    ```
    python3 -V 
    ```

- Verify that you have completed installing the MySQL client.

- Verify that you have finished installing [Django](https://www.djangoproject.com/download/). Verify that the installation was successful by checking the Django version with the following code:

    ```
    python3 -m django --version 
    ```

- Download and install the `pymysql` tool. Download and install the `pymysql` tool using the following code:

    ```
    pip3 install pymysql

    #If you are in China mainland and have a low downloading speed, you can speed up the download by following commands.
    pip3 install pymysql -i https://pypi.tuna.tsinghua.edu.cn/simple
    ```

### Environment Configuration

1. Connect to MatrixOne through a MySQL client. Create a new database named *test*.

    ```
    mysql> create database test; 
    ```

2. Create the project `django_crud_matrixone`.

    ```
    django-admin startproject django_crud_matrixone 
    ```

    Once created we can look at the directory structure of the following project:

    ```bash
    cd django_crud_matrixone/

    django_crud_matrixone/
    ├── __init__.py
    └── asgi.py
    └── settings.py
    └── urls.py
    └── wsgi.py
    manage
    ```

3. Next we start the server by entering the following command into the django\_crud\_matrixone directory:

    ```
    python3 manage.py runserver 0.0.0.0:8000 
    ```

    0.0.0.0 Let other computers connect to the development server, 8000 is the port number. If not, then the port number defaults to 8000.

    Enter the ip of your server in your browser (here we enter the native IP address: 127.0.0.1:8000) and the port number. If it starts normally, the output is as follows:

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/tutorial/django/django-1.png?raw=true)

4. We found the DATABASES configuration item in the project's settings.py file and modified its information to:

    ```python
     DATABASES = { 
        'default': { 'ENGINE': 'django.db.backends.mysql', # database engine 
        'NAME': 'test', # database name 
        'HOST': '127.0.0.1', # database address, native ip address 127.0.0.1 
        'PORT': 6001, # Port 
        'USER': 'root', # database username 
        'PASSWORD': '111', #database password 
        } 
    } 
    ```

5. Next, tell Django to connect to the mysql database using the pymysql module, introduce the module and configure it in __init__.py in the same directory as settings.py:

    ```python
    import pymysql
    pymysql.install_as_MySQLdb()
    ```

6. To create an app, Django dictates that you must create one if you want to use the model. We create an app for TestModel using the following command:

    ```
    django-admin startapp TestModel
    ```

    The directory structure is as follows:

    ```bash
    django_crud_matrixone/
    ├── __init__.py
    └── asgi.py
    ...
    TestModel
    └── migrations
    └── __init__.py
    └── admin.py
    └── apps.py
    └── models.py
    └── tests.py
    └── views.py
    ```

7. Next find the INSTALLED\_APPS entry in settings.py as follows:

    ```python
    INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "TestModel",                 #add this  
    ]
    ```

## New Table

- Modify the TestModel/models.py file to define the information code for a *book table* as follows:

```python
from django.db import models 
class Book(models.Model): 
    id = models.AutoField(primary_key=True) # id is created automatically and can be written manually 
    title = models.CharField(max_length=32) # book name 
    price = models.DecimalField(max_digits=5, decimal_places=2) # book price 
    publish = models.CharField(max_length=32) # publisher name 
    pub_date = models.DateField() # publication time 
```

The Django model uses its own ORM. The above class name represents the database table name (*testmodel_book*) and inherits models.Model. Fields inside the class represent fields in the data table. Data types: AutoField (equivalent to int), CharField (equivalent to varchar), DecimalField (equivalent to decimal), DateField (equivalent to date), max_length parameter limits length.

ORM correspondence table:

<div align="center">
<img src=https://github.com/matrixorigin/artwork/blob/main/docs/tutorial/django/django-7.png?raw=true width=70% heigth=70%/>
</div>

Refer to: <https://docs.djangoproject.com/en/5.0/ref/models/fields/> for more model field types.

- Run from the command line

```bash
python3 manage.py makemigrations TestModel # Generate the configuration file and put it in the migrations directory under the app 
python3 manage.py migrate TestModel # Automatically generate the appropriate SQL statements based on the configuration file 
```

Go into the *test* database and see that the *testmodel\_book table* has been generated. where a record of the operations performed is generated in the *django\_migrations table*.

```sql
mysql> show tables;
+-------------------+
| Tables_in_test    |
+-------------------+
| django_migrations |
| testmodel_book    |
+-------------------+
2 rows in set (0.01 sec)
```

## Insert Data

- Adding data requires the creation of objects first, and then through the ORM-supplied objects-supplied method create . Create a new views.py file in the django\_crud\_matrixone directory under the previously created django_crud_matrixone directory and enter the code:
  
```
from django.shortcuts import render,HttpResponse
from TestModel import models 
def add_book(request):
    books = models.Book.objects.create(title="白夜行",price=39.50,publish="南海出版公司",pub_date="2010-10-10") 
    return HttpResponse("<p>数据添加成功！</p>")
```

- Next, bind the URL to the view function. Open the urls.py file, delete the original code, and copy and paste the following code into the urls.py file:

```
from django.contrib import admin
from django.urls import path
from . import views
 
urlpatterns = [
    path('', views.add_book),
    ]
```

- Next we start the server by entering the following command into the django\_crud\_matrixone directory:

```
python3 manage.py runserver 0.0.0.0:8000 
```

Enter the ip of your server in your browser (here we enter the native IP address: 127.0.0.1:8000) and the port number. If it starts normally, the output is as follows:

<div align="center">
<img src=https://github.com/matrixorigin/artwork/blob/main/docs/tutorial/django/django-2.png?raw=true width=50% heigth=50%/>
</div>

- Connecting to the database to query the data, you can see that the data was successfully inserted:

```sql
mysql> select * from testmodel_book;
+------+-----------+-------+--------------------+------------+
| id   | title     | price | publish            | pub_date   |
+------+-----------+-------+--------------------+------------+
|    1 | 白夜行     | 39.50 | 南海出版公司         | 2010-10-10 |
+------+-----------+-------+--------------------+------------+
1 row in set (0.00 sec)
```

## query data

- Modify the views.py file in the django\_crud\_matrixone directory and add the code:

```python
def src_book(request):
    books = models.Book.objects.all()#Use the all() method to query everything 
    for i in books:
       print(i.id,i.title,i.price,i.publish,i.pub_date)
    return HttpResponse("<p>查找成功！</p>")  
```

For more query related methods, refer to:<https://docs.djangoproject.com/en/5.0/ref/models/querysets/>

- Modify the urls.py file:

    ```
    urlpatterns = [
    path('', views.src_book),
    ]
    ```

- Next we start the server by entering the following command into the django\_crud\_matrixone directory:

```
python3 manage.py runserver 0.0.0.0:8000
```

Enter the ip of your server in your browser (here we enter the native IP address: 127.0.0.1:8000) and the port number. If it starts normally, the output is as follows:

<div align="center">
<img src=https://github.com/matrixorigin/artwork/blob/main/docs/tutorial/django/django-3.png?raw=true width=50% heigth=50%/>
</div>

The command line results are:

<div align="center">
<img src=https://github.com/matrixorigin/artwork/blob/main/docs/tutorial/django/django-4.png?raw=true width=50% heigth=50%/>
</div>

## Update Data

- The update data uses QuerySet type data `.update()`. The following example updates the price value of a record with an id value of 1 to 50. Modify the views.py file in the django\_crud\_matrixone directory and add the code:

```python
def upd_book(request):
    books = models.Book.objects.filter(pk=1).update(price=50)
    return HttpResponse("<p>更新成功！</p>")
```

pk=1 means primary key=1, which is equivalent to id=1.

- Modify the urls.py file:

```
urlpatterns = [
path('', views.upd_book),
]
```

- Next we start the server by entering the following command into the django\_crud\_matrixone directory:

```
python3 manage.py runserver 0.0.0.0:8000
```

Enter the ip of your server in your browser (here we enter the native IP address: 127.0.0.1:8000) and the port number. If it starts normally, the output is as follows:

<div align="center">
<img src=https://github.com/matrixorigin/artwork/blob/main/docs/tutorial/django/django-5.png?raw=true width=40% heigth=40%/>
</div>

- Looking at the *testmodel\_book table*, you can see that the data was updated successfully:

```sql
mysql> select * from testmodel_book;
+------+-----------+-------+--------------------+------------+
| id   | title     | price | publish            | pub_date   |
+------+-----------+-------+--------------------+------------+
|    1 | 白夜行     | 50.00 | 南海出版公司         | 2010-10-10 |
+------+-----------+-------+--------------------+------------+
1 row in set (0.00 sec)
```

## Delete Data

- Deleting data uses the number of QuerySet types `.delete()`. The following example deletes a record with price 50. Modify the views.py file in the django\_crud\_matrixone directory and add the code:

```python
def del_book(request):
    books=models.Book.objects.filter(price=50).delete()
    return HttpResponse("<p>删除成功！</p>")
```

- Modify the urls.py file:

```
urlpatterns = [
path('', views.del_book),
]
```

- Next we start the server by entering the following command into the django\_crud\_matrixone directory:

```
python3 manage.py runserver 0.0.0.0:8000
```

Enter the ip of your server in your browser (here we enter the native IP address: 127.0.0.1:8000) and the port number. If it starts normally, the output is as follows:

<div align="center">
<img src=https://github.com/matrixorigin/artwork/blob/main/docs/tutorial/django/django-6.png?raw=true width=50% heigth=50%/>
</div>

- Looking at the *testmodel\_book table*, you can see that the data was successfully deleted.

```sql
mysql> select * from testmodel_book;
Empty set (0.00 sec)
```
