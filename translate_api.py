from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
from dotenv import load_dotenv
import os
load_dotenv()

app = Flask(__name__)
CORS(app)

# Bhashini translation endpoint
@app.route('/translate', methods=['POST'])
def translate():
    data = request.get_json()
    text = data.get('text')
    target_lang = data.get('targetLang')
    source_lang = data.get('sourceLang', 'en')

    pipeline_url = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline"
    pipeline_headers = {
        'Authorization': os.getenv('TRANSLATION_BHASHINI_API_KEY'),
        'Content-Type': 'application/json'
    }
    pipeline_payload = json.dumps({
        "pipelineTasks": [
            {
                "taskType": "translation",
                "config": {
                    "language": {
                        "sourceLanguage": source_lang,
                        "targetLanguage": target_lang
                    }
                }
            }
        ],
        "inputData": {
            "input": [
                {"source": text}
            ]
        }
    })
    pipeline_response = requests.post(pipeline_url, headers=pipeline_headers, data=pipeline_payload)
    try:
        result = pipeline_response.json()
        translation = None
        if (
            isinstance(result, dict) and
            'pipelineResponse' in result and
            isinstance(result['pipelineResponse'], list) and
            len(result['pipelineResponse']) > 0 and
            'output' in result['pipelineResponse'][0] and
            isinstance(result['pipelineResponse'][0]['output'], list) and
            len(result['pipelineResponse'][0]['output']) > 0 and
            'target' in result['pipelineResponse'][0]['output'][0]
        ):
            translation = result['pipelineResponse'][0]['output'][0]['target']
        else:
            translation = text
        return jsonify({"translation": translation})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)
