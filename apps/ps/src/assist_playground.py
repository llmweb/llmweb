import streamlit as st
from _local_ps_template import ps_template_map
from llm import query_llm

def main():
  st.set_page_config(page_title="Command Config Assistant")

  st.header("Suggestions Assistant")

  # show option
  category = st.selectbox("Choose an option", ps_template_map.keys())

  # show user input
  user_question = st.text_area("Inputs here:", height=200)

  if user_question:
    st.code(query_llm(category, user_question))

if __name__ == "__main__":
  main()
