# Example of application basis for graph search

Currently, graphic and text search applications cover a wide range of areas. In e-commerce, users can search for goods by uploading images or text descriptions; in social media platforms, content can be found quickly through images or text to enhance the user's experience; and in copyright detection, image copyright can be identified and protected. In addition, text search is widely used in search engines to help users find specific images through keywords, while graphic search is used in machine learning and artificial intelligence for image recognition and classification tasks.

The following is a flow chart of a graphic search:

<div align="center">
<img src=https://github.com/matrixorigin/artwork/blob/main/docs/tutorial/Vector/search-image.png?raw=true width=80% heigth=80%/>
</div>

As you can see, vectorized storage and retrieval of images is involved in building graph-to-text search applications, while MatrixOne's vector capabilities and multiple retrieval methods provide critical technical support for building graph-to-text search applications.

In this chapter, we'll build a simple graphical (textual) search application based on MatrixOne's vector capabilities.

## Prepare before you start

### Relevant knowledge

**Transformers**: Transformers is an open source natural language processing library that provides a wide range of pre-trained models through which researchers and developers can easily use and integrate CLIP models into their projects.

**CLIP**: The CLIP model is a deep learning model published by OpenAI. At its core is the unified processing of text and images through contrastive learning, enabling tasks such as image classification to be accomplished through text-image similarity without the need for direct optimization tasks. It can be combined with a vector database to build tools to search graphs. High-dimensional vector representations of images are extracted through CLIP models to capture their semantic and perceptual features, and then encoded into an embedded space. At query time, the sample image gets its embedding through the same CLIP encoder, performing a vector similarity search to effectively find the first k closest database image vectors.

### Software Installation

Before you begin, confirm that you have downloaded and installed the following software:

- Verify that you have completed the [standalone deployment of](../Get-Started/install-standalone-matrixone.md) MatrixOne.

- Verify that you have finished installing [Python 3.8 (or plus)](https://www.python.org/downloads/). Verify that the installation was successful by checking the Python version with the following code:

```
python3 -V 
```

- Verify that you have completed installing the MySQL client.

- Download and install the `pymysql` tool. Download and install the `pymysql` tool using the following code:

```
pip install pymysql 
```

- Download and install the `transformers` library. Download and install the `transformers` library using the following code:

```
pip install transformers 
```

- Download and install the `Pillow` library. Download and install the `Pillow` library using the following code:

```
pip install pillow 
```

## Build your app

### Building table

Connect to MatrixOne and create a table called `pic_tab` to store picture path information and corresponding vector information.

```sql
create table pic_tab(pic_path varchar(200), embedding vecf64(512)); 
```

### Load Model

```python
from transformers import CLIPProcessor, CLIPModel

# Load model from HuggingFace
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
```

### Traversing the Picture Path

The definition method `find_img_files` traverses the local images folder, where I pre-stored images of fruit in five categories, apple, banana, blueberry, cherry, and apricot, several in each category, in `.jpg` format.

```python
def find_img_files(directory):
    img_files = []  # Used to store found .jpg file paths 
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.lower().endswith('.jpg'):
                full_path = os.path.join(root, file)
                img_files.append(full_path) # Build the full file path
    return img_files
```

- Image vectorized and stored in MatrixOne

Define the method `storage_img` to map the picture into a vector, normalize it (not required) and store it in MatrixOne. MatrixOne supports L2 normalization of vectors using the `NORMALIZE_L2()` function. In some cases, features of the data may be distributed at different scales, which may cause some features to have a disproportionate effect on distance calculations. By normalizing, this effect can be reduced and the contribution of different characteristics to the end result more balanced. And when using the L2 distance measure, L2 normalization avoids vectors of different lengths affecting distance calculations.

```python
import pymysql
from PIL import Image

conn = pymysql.connect(
        host = '127.0.0.1',
        port = 6001,
        user = 'root',
        password = "111",
        db = 'db1',
        autocommit = True
        )

cursor = conn.cursor()

# Map the image into vectors and store them in MatrixOne
def storage_img():
 for file_path in jpg_files:
     image = Image.open(file_path)
     if image.mode != 'RGBA':
         image = image.convert('RGBA')
     inputs = processor(images=image, return_tensors="pt", padding=True)
     img_features = model.get_image_features(inputs["pixel_values"]) # Using models to acquire image features
     img_features = img_features .detach().tolist() # Separate tensor, convert to list
     embeddings = img_features [0]
     insert_sql = "insert into pic_tab(pic_path,embedding) values (%s, normalize_l2(%s))"
     data_to_insert = (file_path, str(embeddings))
     cursor.execute(insert_sql, data_to_insert)
     image.close()
```

### View quantity in `pic_tab` table

```sql
mysql> select count(*) from pic_tab;
+----------+
| count(*) |
+----------+
|     4801 |
+----------+
1 row in set (0.00 sec)
```

As you can see, the data was successfully stored into the database.

### Build Vector Index

MatrixOne supports vector indexing in IVF-FLAT, where each search requires recalculating the similarity between the query image and each image in the database without an index. The index, on the other hand, reduces the amount of computation necessary by performing similarity calculations only on images marked as "relevant" in the index.

```python
def create_idx(n):
    cursor.execute('SET GLOBAL experimental_ivf_index = 1')
    create_sql = 'create index idx_pic using ivfflat on pic_tab(embedding) lists=%s op_type "vector_l2_ops"'
    cursor.execute(create_sql, n)
```

### Search in graphic (text)

Next, we define the methods `img_search_img` and `text_search_img` to implement graph and text search. MatrixOne has vector retrieval capabilities and supports multiple similarity searches, where we use `l2_distance` to retrieve.

```python
# search for maps
def img_search_img(img_path, k):
    image = Image.open(img_path)
    inputs = processor(images=image, return_tensors="pt")
    img_features = model.get_image_features(**inputs)
    img_features = img_features.detach().tolist()
    img_features = img_features[0]
    query_sql = "select pic_path from pic_tab order by l2_distance(embedding,normalize_l2(%s)) asc limit %s"
    data_to_query = (str(img_features), k)
    cursor.execute(query_sql, data_to_query)
    global data
    data = cursor.fetchall()

# search for pictures by writing
def text_search_img(text,k):
    inputs = processor(text=text, return_tensors="pt", padding=True)
    text_features = model.get_text_features(inputs["input_ids"], inputs["attention_mask"])
    embeddings = text_features.detach().tolist()
    embeddings = embeddings[0]
    query_sql = "select pic_path from pic_tab order by l2_distance(embedding,normalize_l2(%s)) asc limit %s"
    data_to_query = (str(embeddings),k)
    cursor.execute(query_sql, data_to_query)
    global data
    data = cursor.fetchall()
```

### Search Results Showcase

When retrieving a relevant image from an image or text, we need to print the results, where we use Matplotlib to present the search results.

```python
import matplotlib.pyplot as plt
import matplotlib.image as mpimg

def show_img(img_path,rows,cols):
    if img_path:
        result_path = [img_path] + [path for path_tuple in data for path in path_tuple]
    else:
        result_path = [path for path_tuple in data for path in path_tuple]
    # Create a new graph and axes
    fig, axes = plt.subplots(nrows=rows, ncols=cols, figsize=(10, 10))
    # Loop over image paths and axes
    for i, (result_path, ax) in enumerate(zip(result_path, axes.ravel())):
        image = mpimg.imread(result_path) # Read image
        ax.imshow(image) # Show picture
        ax.axis('off') # Remove Axis
        ax.set_title(f'image{i + 1}') # Setting the Submap Title
    plt.tight_layout() # Adjusting subgraph spacing
    plt.show() # Display the entire graph
```

### View Results

Run the program by entering the following code in the main program:

```python
if __name__ == "__main__":
    directory_path = '/Users/admin/Downloads/fruit01' # Replace with the actual directory path
    jpg_files = find_img_files(directory_path)
    storage_img()
    create_idx(4)
    img_path = '/Users/admin/Downloads/fruit01/blueberry/f_01_04_0450.jpg'
    img_search_img(img_path, 3) # search for maps
    show_img(img_path,1,4)
    text = ["Banana"]
    text_search_img(text,3) # search for pictures by writing
    show_img(None,1,3)
```

Using the results of the chart search, the first chart on the left is a comparison chart. As you can see, the searched picture is very similar to the comparison chart:

<div align="center">
<img src=https://github.com/matrixorigin/artwork/blob/main/docs/tutorial/Vector/img_search.png?raw=true width=80% heigth=80%/>
</div>

As you can see from the text search results, the searched image matches the input text:

<div align="center">
<img src=https://github.com/matrixorigin/artwork/blob/main/docs/tutorial/Vector/text_search_pic.png?raw=true width=50% heigth=50%/>
</div>

## Reference Documents

- [Vector Type](../Develop/Vector/vector_type.md)
- [Vector retrieval](../Develop/Vector/vector_search.md)
- [CREATE INDEX...USING IVFFLAT](../Reference/SQL-Reference/Data-Definition-Language/create-index-ivfflat.md)
- [L2_DISTANCE()](../Reference/Functions-and-Operators/Vector/l2_distance.md)
- [NORMALIZE_L2()](../Reference/Functions-and-Operators/Vector/normalize_l2.md)