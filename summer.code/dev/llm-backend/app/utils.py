import os

from langchain.document_loaders import PyPDFLoader
from langchain.document_loaders import Docx2txtLoader
from langchain.document_loaders import TextLoader

from .config import Config
config = Config()

# TODO: 兼容更多文件格式的加载
def load_documents_from_folder(base_dir):
    documents = []

    def load_documents_from_file(file_path):
        if file_path.endswith('.pdf'):
            loader = PyPDFLoader(file_path)
            documents.extend(loader.load())
        elif file_path.endswith('.docx'):
            loader = Docx2txtLoader(file_path)
            documents.extend(loader.load())
        elif file_path.endswith('.go'):
            loader = TextLoader(file_path)
            documents.extend(loader.load())

    def traverse_folder(folder_path):
        for file in os.listdir(folder_path):
            file_path = os.path.join(folder_path, file)
            if os.path.isfile(file_path):
                load_documents_from_file(file_path)
            elif os.path.isdir(file_path):
                traverse_folder(file_path)

    traverse_folder(base_dir)
    return documents



# Split: 将Documents切分成块以便后续进行嵌入和向量存储
from langchain.text_splitter import RecursiveCharacterTextSplitter
def split_documents(documents, chunk_size, chunk_overlap):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    chunked_documents = text_splitter.split_documents(documents)
    return chunked_documents

#实例化一个RetrievalQA链
import logging
from langchain.chat_models import ChatOpenAI
from langchain.retrievers.multi_query import MultiQueryRetriever
from langchain.chains import RetrievalQA
from langchain.chains.conversation.memory import ConversationSummaryMemory

def generate_qa_chain(vectorstore):
    # 设置Logging
    logging.basicConfig()
    logging.getLogger('langchain.retrievers.multi_query').setLevel(logging.INFO)

    # 实例化一个大模型工具 - OpenAI的GPT-3.5
    # llm = ChatOpenAI(model_name= config.LLM_MODEL_NAME'], temperature=0)
    llm = ChatOpenAI(model_name= 'gpt-3.5-turbo', temperature=0)

    # 实例化一个MultiQueryRetriever
    retriever_from_llm = MultiQueryRetriever.from_llm(retriever=vectorstore.as_retriever(), llm=llm)

    # 实例化一个RetrievalQA链
    # qa_chain = RetrievalQA.from_chain_type(llm,retriever=retriever_from_llm)
    qa_chain = RetrievalQA.from_chain_type(llm,retriever=retriever_from_llm,memory=ConversationSummaryMemory(llm=llm))

    return qa_chain

def check_repo_folder_exists(repoName):
    # TODO: 这里的gitRepo从config中读
    folder_path = os.path.join(config.PATH_TO_GITREPO_DIR, repoName)
    if os.path.exists(folder_path) and os.path.isdir(folder_path):
        return True
    else:
        return False

# 数据库的相关操作
from langchain.vectorstores import Matrixone
from langchain.embeddings import OpenAIEmbeddings
def get_vectorstore(repoName):
    return Matrixone(
        host=config.DATABASE_HOST,
        port=config.DATABASE_PORT,
        user=config.DATABASE_USER,
        password=config.DATABASE_PSW,
        dbname=config.DATABASE_DBNAME,
        table_name=repoName,
        embedding=OpenAIEmbeddings()
    )

def add_documents_to_vectorstore(repoName, chunked_documents):
    vectorstore = get_vectorstore(repoName)
    vectorstore.add_documents(documents=chunked_documents)
