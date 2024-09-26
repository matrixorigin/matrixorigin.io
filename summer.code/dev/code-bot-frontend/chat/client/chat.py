from typing import List

from domain.Message import Message
import requests

def mock(name, group_name, text):
    return group_name + '%I want to recommend M365 Business for you because it offers a comprehensive suite of tools that can significantly enhance productivity and collaboration within your team. With M365 Business, you get access to essential applications like Word, Excel, and PowerPoint, as well as powerful cloud services like OneDrive and SharePoint.'


GUIDE_CONVERSATION = 'I am Opportunity Copilot. How can I assist you today? I can help by recommending opportunities, retrieving data, providing historical summaries, and more.'


class ChatClient:
    def get_groups(self, user_id):
        return ['default']

    def get_mes(self, user_id: str, group_name: str) -> List[Message]:
        return [Message(
            sender='bot',
            content=GUIDE_CONVERSATION
        )]

    def send_msg(self, name, group_name, text):
        return group_name + "%" + self.call_api(name, text)

    def call_api(self, name, text):
        try:
            url = "http://localhost:5000/api/chat"
            data = {
                "partner_name": name,
                "chat_history": [],
                "content": text
            }
            response = requests.post(url, json=data)
            response_data = response.json()
            response_value = response_data.get("response")
            # print(response_value)
            return response_value
        except Exception as e:
            print(e)
        return 'error'

