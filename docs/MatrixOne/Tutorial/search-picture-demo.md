# Basic example of image search application using images (text)

At present, related applications of image search and text search cover a wide range of fields. In e-commerce, users can search for products by uploading images or text descriptions; on social media platforms, users can quickly find relevant content through images or text. , enhance the user experience; in terms of copyright detection, it can help identify and protect image copyrights; in addition, text-based image search is also widely used in search engines to help users find specific images through keywords, while image-based image search is used in Used for image recognition and classification tasks in the field of machine learning and artificial intelligence.

The following is a flow chart for searching pictures using pictures (text):

<div align="center">
<img src=https://github.com/matrixorigin/artwork/blob/main/docs/tutorial/Vector/search-image.png?raw=true width=70% heigth=70%/>
</div>

It can be seen that building an image (text) search application involves vectorized storage and retrieval of images, and MatrixOne has vector capabilities and provides a variety of retrieval methods, which provides a good foundation for building an image (text) image search application. The application provides critical technical support.
In this chapter, we will combine the vector capabilities of MatrixOne with Streamlit to build a simple web application for image (text) search.

## Preparation before starting

### Related knowledge

**Transformers**: Transformers is an open source natural language processing library that provides a wide range of pre-trained models. Through the Transformers library, researchers and developers can easily use and integrate CLIP models into their projects.

**CLIP**: The CLIP model is a deep learning model released by OpenAI. The core is to unify text and images through contrastive learning methods, so that tasks such as image classification can be completed through text-image similarity without the need for Optimize tasks directly. It can be combined with a vector database to build a tool for image (text) search. High-dimensional vector representations of images are extracted through the CLIP model to capture their semantic and perceptual features, and then these images are encoded into an embedding space. At query time, a sample image is passed through the same CLIP encoder to obtain its embedding, performing a vector similarity search to efficiently find the top k closest database image vectors.

**Streamlit**: is an open source Python library designed to quickly build interactive and data-driven web applications. Its design goal is to be simple and easy to use. Developers can create interactive dashboards and interfaces with very little code, especially suitable for displaying machine learning models and data visualization.

### Software installation

Before you begin, make sure you have downloaded and installed the following software:

- Confirm that you have completed [Stand-alone Deployment of MatrixOne](../Get-Started/install-standalone-matrixone.md).

- Make sure you have installed [Python 3.8(or plus) version](https://www.python.org/downloads/). Use the following code to check the Python version to confirm the installation was successful:

```
python3 -V
```

- Confirm that you have completed installing the MySQL client.

- Download and install the `pymysql` tool. Use the following code to download and install the `pymysql` tool:

```
pip install pymysql
```

- Download and install the `transformers` library. Use the following code to download and install the `transformers` library:

```
pip install transformers
```

- Download and install the `Pillow` library. Use the following code to download and install the `Pillow` library:

```
pip install pillow
```

- Download and install the `streamlit` library. Use the following code to download and install the `Pillow` library:

```
pip install streamlit
```

## Build the application

### Create table and enable vector index

Connect to MatrixOne and create a table named `pic_tab` to store picture path information and corresponding vector information.

```sql
create table pic_tab(pic_path varchar(200), embedding vecf64(512));
SET GLOBAL experimental_ivf_index = 1;
create index idx_pic using ivfflat on pic_tab(embedding) lists=3 op_type "vector_l2_ops"
```

### Build the application

Create the python file pic_search_example.py and write the following content. This script mainly uses the CLIP model to extract the high-dimensional vector representation of the image, and then stores it in MatrixOne. At query time, a sample image is passed through the same CLIP encoder to obtain its embedding, performing a vector similarity search to efficiently find the top k closest database image vectors.

```python
import streamlit as st
importpymysql
from PIL import Image
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
from transformers import CLIPProcessor, CLIPModel
import os
from tqdm import tqdm

# Database connection
conn = pymysql.connect(
    host='127.0.0.1',
    port=6001,
    user='root',
    password="111",
    db='db1',
    autocommit=True
)

cursor = conn.cursor()

# Load model from HuggingFace
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# Traverse image path
def find_img_files(directory):
    img_files = []
    for root, dirs, files in os.walk(directory):
        for file in files:
if file.lower().endswith('.jpg'):
                full_path = os.path.join(root, file)
                img_files.append(full_path)
    return img_files

# Map image to vector and store in MatrixOne
def storage_img(jpg_files):
    for file_path in tqdm(jpg_files, total=len(jpg_files)):
        image = Image.open(file_path)
        if image.mode != 'RGBA':
            image = image.convert('RGBA')
        inputs = processor(images=image, return_tensors="pt", padding=True)
img_features = model.get_image_features(inputs["pixel_values"])
        img_features = img_features.detach().tolist()
        embeddings = img_features[0]
        insert_sql = "INSERT INTO pic_tab(pic_path, embedding) VALUES (%s, normalize_l2(%s))"
        data_to_insert = (file_path, str(embeddings))
        cursor.execute(insert_sql, data_to_insert)
        image.close()

def create_idx(n):
create_sql = 'create index idx_pic using ivfflat on pic_tab(embedding) lists=%s op_type "vector_l2_ops"'
    cursor.execute(create_sql, n)

# Image-to-image search
def img_search_img(img_path, k):
    image = Image.open(img_path)
    inputs = processor(images=image, return_tensors="pt")
    img_features = model.get_image_features(**inputs)
    img_features = img_features.detach().tolist()
    img_features = img_features[0]
query_sql = "SELECT pic_path FROM pic_tab ORDER BY l2_distance(embedding, normalize_l2(%s)) ASC LIMIT %s"
    data_to_query = (str(img_features), k)
    cursor.execute(query_sql, data_to_query)
    return cursor.fetchall()

# Text-to-image search
def text_search_img(text, k):
    inputs = processor(text=text, return_tensors="pt", padding=True)
    text_features = model.get_text_features(inputs["input_ids"], inputs["attention_mask"])
    embeddings = text_features.detach().tolist()
embeddings = embeddings[0]
    query_sql = "SELECT pic_path FROM pic_tab ORDER BY l2_distance(embedding, normalize_l2(%s)) ASC LIMIT %s"
    data_to_query = (str(embeddings), k)
    cursor.execute(query_sql, data_to_query)
    return cursor.fetchall()

# Show results
def show_img(result_paths):
    fig, axes = plt.subplots(nrows=1, ncols=len(result_paths), figsize=(15, 5))
    for ax, result_path in zip(axes, result_paths):
        image = mpimg.imread(result_path[0]) # Read image
ax.imshow(image) # Display image
        ax.axis('off') # Remove axes
        ax.set_title(result_path[0]) # Set subtitle
    plt.tight_layout() # Adjust subplot spacing
    st.pyplot(fig) # Display figure in Streamlit

# Streamlit interface
st.title("Image and Text Search Application")

# Prompt for local directory path input
directory_path = st.text_input("Enter the local image directory")

# Once user inputs path, search for images in the directory
if directory_path:
if os.path.exists(directory_path):
        jpg_files = find_img_files(directory_path)
        if jpg_files:
            st.success(f"Found {len(jpg_files)} images in the directory.")
            if st.button("uploaded"):
                storage_img(jpg_files)
                st.success("Upload successful!")
        else:
            st.warning("No .jpg files found in the directory.")
    else:
        st.error("The specified directory does not exist. Please check the path.")
#Image upload option
uploaded_file = st.file_uploader("Upload an image for search", type=["jpg", "jpeg", "png"])
if uploaded_file is not None:
    # Display uploaded image
    img = Image.open(uploaded_file)
    st.image(img, caption='Uploaded image', use_column_width=True)

    # Perform image-to-image search
    if st.button("Search by image"):
        result = img_search_img(uploaded_file, 3) # Image-to-image search
        if result:
st.success("Search successful. Results are displayed below:")
            show_img(result) # Display results
        else:
            st.error("No matching results found.")

# Text input for text-to-image search
text_input = st.text_input("Enter a description for search")
if st.button("Search by text"):
    result = text_search_img(text_input, 3) # Text-to-image search
    if result:
        st.success("Search successful. Results are displayed below:")
show_img(result) # Display results
    else:
        st.error("No matching results found.")
```

**Code Interpretation:**

1. Connect to the local MatrixOne database through pymysql to insert image features and query similar photos.
2. Use HuggingFace's transformers library to load the OpenAI pre-trained CLIP model (clip-vit-base-patch32). The model supports processing text and images simultaneously, converting them into vectors for similarity calculations.
3. Define the method find_img_files to traverse the local picture folder. Here I have pre-stored five categories of fruit pictures locally: apples, bananas, blueberries, cherries, and apricots. There are several pictures of each category, and the format is jpg.
4. Store the image features into the database, use the CLIP model to extract the embedding vector of the image, and store the image path and embedding vector in the pic_tab table of the database.
5. Define methods img_search_img and text_search_img to implement image search and text search. MatrixOne has vector retrieval capabilities and supports multiple similarity searches. Here we use Euclidean distance for retrieval.
6. Display the image results, use matplotlib to display the image path queried from the database, and display it on the Streamlit web interface.

### Running results

```bash
streamlit run pic_search_example.py
```

<div align="center">
<img src=https://github.com/matrixorigin/artwork/blob/main/docs/tutorial/Vector/pic-search-1.png?raw=true width=60% heigth=60%/>
</div>

## Reference documentation

- [Vector type](../Develop/Vector/vector_type.md)
- [Vector Search](../Develop/Vector/vector_search.md)
- [CREATE INDEX...USING IVFFLAT](../Reference/SQL-Reference/Data-Definition-Language/create-index-ivfflat.md)
- [L2_DISTANCE()](../Reference/Functions-and-Operators/Vector/l2_distance.md)
- [NORMALIZE_L2()](../Reference/Functions-and-Operators/Vector/normalize_l2.md)