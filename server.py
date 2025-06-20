from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return "Hello, TLS!"

if __name__ == '__main__':
    app.run(ssl_context=('certs/server-cert.pem', 'certs/server-key.pem'), host='0.0.0.0', port=4443)