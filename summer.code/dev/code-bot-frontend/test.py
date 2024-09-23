import requests


def send_code(code):
    try:
        response = requests.get(f"http://localhost:8080/codebot/login/valid?code={code}")
        # Check if the request was successful
        if response.status_code == 200:
            # parse to json
            response_json = response.json()
            is_success = response_json['success']
            if is_success:
                return response_json['data']
            else:
                return None
        else:
            print(response)
            return None
    except Exception as e:
        print("An error occurred:", e)
        return None


print(send_code("94547"))

