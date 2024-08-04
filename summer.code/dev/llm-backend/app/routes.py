from flask import Flask, request, render_template, Blueprint
from flask import current_app
import os

from .utils import *
from .config import Config
config = Config()

main_bp = Blueprint('main', __name__)

os.environ["OPENAI_API_KEY"] = config.OPENAI_API_KEY

# 定义路由和视图函数
@main_bp.route('/', methods=['GET', 'POST'])
def home():
    # 1.Load 导入Document Loaders
    base_dir = './gitRepo'  # 文档的存放目录
    documents = load_documents_from_folder(base_dir)

    # 2.Split 将Documents切分成块以便后续进行嵌入和向量存储
    chunked_documents = split_documents(documents, 200, 10)

    # 3.Store 将分割嵌入并存储在矢量数据库MO中
    from langchain.vectorstores import Matrixone
    from langchain.embeddings import OpenAIEmbeddings
    vectorstore = Matrixone.from_documents(
        documents=chunked_documents, # 以分块的文档
        embedding=OpenAIEmbeddings(), # 用OpenAI的Embedding Model做嵌入
        user="root",
        password="111",
        dbname="test",
        port=6001)  # 指定collection_name

    # 4. Retrieval 准备模型和Retrieval链
    qa_chain = generate_qa_chain(vectorstore)
    if request.method == 'POST':

        # 接收用户输入作为问题
        question = request.form.get('question')        
        
        # RetrievalQA链 - 读入问题，生成答案
        result = qa_chain({"query": question})
        
        # 把大模型的回答结果返回网页进行渲染
        return render_template('index.html', result=result)
    
    return render_template('index.html')

@main_bp.route('/repos/<string:repoName>/<int:userID>')
def handle_repo(repoName, userID):
    # 在本地的repo文件夹中找到该仓库的文件
    print("Loading Project" + repoName)
    if not check_repo_folder_exists(repoName):
        return f"未找到仓库"

    # 1.Load 导入Document Loaders
    repo_dir = current_app.config['PATH_TO_GITREPO_DIR'] + repoName
    documents = load_documents_from_folder(repo_dir)

    # 2.Split 将Documents切分成块以便后续进行嵌入和向量存储
    chunked_documents = split_documents(documents, 200, 10)

    # 3.Store 将分割嵌入并存储在矢量数据库MO中
    add_documents_to_vectorstore(repoName, chunked_documents)

    return f"repo_dir: {repo_dir}, User ID: {userID}"

# 接收来自code-bot的提问
@main_bp.route('/talks/<string:repoName>/<int:userID>/<string:question>', methods=['GET', 'POST'])
def talk(repoName, userID, question):
    vectorstore = get_vectorstore(repoName)
    qa_chain = generate_qa_chain(vectorstore)
    result = qa_chain({"query": request.question})    
    return f"answer: {result['result']}, history: {result['history']}"