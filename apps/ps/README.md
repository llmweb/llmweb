# ps
prompt service

## Bootstrap
- Put `OPENAI_API_KEY` in `.env.local` file.

```sh
python3 -m venv .env
source ./.env/bin/activate.fish
pip install -r requirements.txt
pip install --upgrade -r requirements.txt
# streamlit
streamlit run src/assist_playground.py
# http server
python3 src/server.py
```
