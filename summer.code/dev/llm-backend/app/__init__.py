from flask import Flask
from .config import *

def create_app():
    # 创建 Flask 应用对象
    app = Flask(__name__)

    # 配置应用
    app.config.from_object(config)
    # 其他配置项...

    # 注册蓝图
    from app.routes import main_bp
    app.register_blueprint(main_bp)

    return app