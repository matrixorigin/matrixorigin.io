import sys
from PyQt5 import QtCore
from PyQt5.QtCore import Qt, QThread
from PyQt5.QtWidgets import QDialog, QApplication, QMainWindow

from client.chat import ChatClient
from domain.Message import Message
from thread.worker_thread import SendThread

from ui.chat_system_ui import Ui_Form
from ui.signin_ui import Ui_Form as Signin_Form
from factory.simple_factory import SimpleFactory
from PyQt5.QtCore import QUrl
from PyQt5.QtGui import QDesktopServices




class LoginForm(QDialog, Signin_Form):
    def __init__(self, parent=None):
        super(LoginForm, self).__init__()
        self.setupUi(self)
        self.setWindowFlags(Qt.FramelessWindowHint)
        # self.resize(1800, 1200)
        self.main = None
        self.start_x = None
        self.start_y = None
        self.send_btn_2.clicked.connect(self.on_getcode_clicked)
        self.send_btn_3.clicked.connect(self.on_signin_clicked)
        self.chat_client = ChatClient()

    def on_getcode_clicked(self):
        url = self.chat_client.get_auth_url()
        if url is not None:
            QDesktopServices.openUrl(QUrl(url))

    def on_signin_clicked(self):
        code = self.textEdit.toPlainText()
        self.textEdit.clear()
        ans = self.chat_client.send_code(code)
        if ans is not None:
            print(ans)
            self.main = MyMainForm(ans)
            self.main.show()
            self.close()


    def mousePressEvent(self, event):
        try:
            if event.button() == QtCore.Qt.LeftButton:
                super(LoginForm, self).mousePressEvent(event)
                self.start_x = event.x()
                self.start_y = event.y()
        except Exception as e:  # 修改为 Exception as e
            print(e)
    def mouseReleaseEvent(self, event):
        self.start_x = None
        self.start_y = None

    def mouseMoveEvent(self, event):
        try:
            super(LoginForm, self).mouseMoveEvent(event)
            dis_x = event.x() - self.start_x
            dis_y = event.y() - self.start_y
            self.move(self.x() + dis_x, self.y() + dis_y)
        except:
            pass


class MyMainForm(QDialog, Ui_Form):
    def __init__(self, user_id):
        super(MyMainForm, self).__init__()
        self.thread = None
        self.setupUi(self)
        # self.setAttribute(QtCore.Qt.WA_TranslucentBackground)
        self.factory = SimpleFactory()
        self.resize(1800, 1200)
        self.setWindowFlags(Qt.FramelessWindowHint)

        self.chat_client = ChatClient()
        self.cur_session = None

        self.btn_connect_init()

        # user name
        self.user_id = user_id
        self.name_label.clear()
        self.name_label.setText(self.user_id)

        # store all info
        # key <--> List[Message]
        self.groups = []
        self.message_store = {}

        # init state
        self.chat_list.setSpacing(15)
        self.init_info()

        #move
        self.start_x = None
        self.start_y = None

    def mousePressEvent(self, event):
        try:
            if event.button() == QtCore.Qt.LeftButton:
                super(MyMainForm, self).mousePressEvent(event)
                self.start_x = event.x()
                self.start_y = event.y()
        except Exception as e:  # 修改为 Exception as e
            print(e)

    def mouseReleaseEvent(self, event):
        self.start_x = None
        self.start_y = None

    def mouseMoveEvent(self, event):
        try:
            super(MyMainForm, self).mouseMoveEvent(event)
            dis_x = event.x() - self.start_x
            dis_y = event.y() - self.start_y
            self.move(self.x() + dis_x, self.y() + dis_y)
        except:
            pass

    def init_info(self):
        is_first = True
        # get all groups
        groups = self.chat_client.get_groups(self.user_id)
        for group_name in groups:
            if is_first:
                self.cur_session = group_name
                is_first = False
            self.add_groups(group_name)
            self.message_store[group_name] = []
            # based on group get messages
            self.message_store[group_name].extend(
                self.chat_client.get_mes(self.user_id, group_name)
            )

    def btn_connect_init(self):
        self.send_btn.clicked.connect(self.on_send_clicked)
        self.add_btn.clicked.connect(self.on_add_clicked)
        self.session_list.clicked.connect(self.on_groups_clicked)

    # call this function when click add btn
    def on_add_clicked(self):
        group_name = self.search_line.text()
        self.search_line.clear()
        self.add_groups(group_name)

    def on_send_clicked(self):
        text = self.input_line.toPlainText()
        self.message_store[self.cur_session].append(Message(
            sender='self',
            content=text
        ))

        self.input_line.clear()
        self.add_bubble(self.message_store[self.cur_session][-1])

        # send to the bot
        self.asyn_send(text=text, group_name=self.cur_session)

    def on_groups_clicked(self):
        group_name = self.groups[self.session_list.currentRow()]
        self.cur_session = group_name
        self.clear_bubbles()
        self.load_bubbles(group_name)

    def add_groups(self, group_name):
        self.groups.append(group_name)
        item, widget = self.factory.create_group_card(group_name)
        self.message_store[group_name] = []
        self.session_list.addItem(item)
        self.session_list.setItemWidget(item, widget)

    def add_bubble(self, message: Message):
        if message.sender == 'self':
            item, widget = self.factory.create_self_card(self.right_frame.width(), message.content)
        else:
            item, widget = self.factory.create_friend_card(self.right_frame.width(), message.content)

        self.chat_list.addItem(item)
        self.chat_list.setItemWidget(item, widget)

    def clear_bubbles(self):
        self.chat_list.clear()

    def load_bubbles(self, group_name):
        for mes in self.message_store[group_name]:
            self.add_bubble(mes)

    def asyn_send(self, text, group_name):
        self.thread = SendThread(
            text=text,
            group_name=group_name,
            user_id=self.user_id,
            client=self.chat_client
        )
        self.thread.result_ready.connect(self.update_response)
        self.thread.start()

    def update_response(self, response):
        # group_name, response
        parts = response.split('%')
        mes = Message(
            sender='bot',
            content=parts[1]
        )
        self.message_store[parts[0]].append(mes)
        if self.cur_session == parts[0]:
            self.add_bubble(mes)


if __name__ == "__main__":
    app = QApplication(sys.argv)
    # app.setAttribute(Qt.AA_EnableHighDpiScaling, True)  # 自适应高分屏
    app.setAttribute(Qt.AA_UseHighDpiPixmaps, True)
    main = LoginForm()
    main.show()
    sys.exit(app.exec_())
