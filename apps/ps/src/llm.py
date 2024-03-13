from openai import OpenAI
from ps_template_example import ps_template_map
from dotenv import load_dotenv

# load secrets from .env file
load_dotenv('.env.local')

client = OpenAI()

def query_llm(category="", query=""):
  response = client.chat.completions.create(
    model="gpt-4",
    messages=[ ps_template_map[category],
      {"role": "user", "content": query},
    ],
    temperature =1
  )
    
  print(response)
  return response.choices[0].message.content