from llm import query_llm
from flask import Flask, render_template, request, url_for, jsonify

app = Flask(__name__)

@app.route('/')
def health():
    return 'Server started!'

@app.route('/llm', methods=['POST'])
def query_llm_handler():
    req = request.get_json(force=True)
    return {
        "data": query_llm(req['category'], req['query'])
    }

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=3000)