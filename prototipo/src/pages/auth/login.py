import streamlit as st

def login():
    st.set_page_config(
        page_title="ImplanteDetect - Login",
        page_icon="🔑",
    )
    st.title("Login")

    email = st.text_input("E-mail", placeholder="Seu e-mail")
    password = st.text_input("Senha", type="password", placeholder="Sua senha")

    if st.button("Realizar Login"):
        if email == "usuario@implantdetect.com.br" and password == "senha":
            st.success("Login realizado com sucesso!")
        else:
            st.error("E-mail ou senha inválidos.")

if __name__ == "__main__":
    login()