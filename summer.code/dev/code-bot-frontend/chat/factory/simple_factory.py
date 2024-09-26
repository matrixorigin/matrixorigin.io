import random

from PyQt5.QtCore import QSize
from PyQt5.QtGui import QFontMetrics, QFont
from PyQt5.QtWidgets import QWidget, QListWidgetItem
from ui.friend_bubble_ui import Ui_Form as FriendBubble
from ui.my_bubble_ui import Ui_Form as MyBubble
from ui.group_ui import Ui_Form as Group
from utils.text_util import preprocess_text

UNIT_HEIGHT = 35
class SimpleFactory:
    def create_friend_card(self, width, text):
        return self.create_card('friend',width, text)

    def create_self_card(self, width, text):
        return self.create_card('self', width, text)

    def create_group_card(self, text):
        widget = QWidget()
        _item = Group()
        _item.setupUi(widget)
        _item.label.clear()
        _item.label.setText(text)
        styles = ["image: url(:/resources/avatar_9.png);margin:4px;border:0px;background-color:#1a1a1e;",
                  "image: url(:/resources/avatar_10.png);margin:4px;border:0px;background-color:#1a1a1e;"
                  "image: url(:/resources/avatar_11.png);margin:4px;border:0px;background-color:#1a1a1e;"
                  ]
        choice = random.choice(styles)
        _item.label_2.setStyleSheet(random.choice(styles))
        item = QListWidgetItem()

        item.setSizeHint(QSize(300, 100))
        return item, widget

    def create_card(self, card_type, width, text):
        widget = QWidget()
        new_text, chat_length, chat_height = preprocess_text(text, 70)
        widget.resize(width, chat_height*UNIT_HEIGHT + 30)
        if card_type == 'friend':
            _item = FriendBubble()
        else:
            _item = MyBubble()

        _item.setupUi(widget)

        _item.textBrowser.clear()
        _item.textBrowser.setText(new_text)
        _item.textBrowser.setMaximumWidth(chat_length*13 + 50)
        _item.textBrowser.setMinimumWidth(chat_length*13 + 50)
        _item.textBrowser.setMaximumHeight(chat_height * UNIT_HEIGHT + 30)
        _item.textBrowser.setMinimumHeight(chat_height * UNIT_HEIGHT + 30)
        item = QListWidgetItem()
        item.setSizeHint(QSize(width, chat_height*UNIT_HEIGHT + 30))
        return item, widget
