from ollama import Client


def Main():
    client = Client(host='http://10.216.2.104:11434')
    response = client.chat(model='akdengi/saiga-llama3-8b:latest', messages=[
      {
        'role': 'user',
        'content': 'я хочу стать айти специалистом, какое направление мне выбрат',
      },
    ])
    return response['message']['content']

if __name__ == '__main__':
    print(Main())
