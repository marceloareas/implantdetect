import streamlit as st

def register():
    st.set_page_config(
        page_title="ImplanteDetect - Cadastro",
        page_icon="📝"
    )
    st.title("Cadastro")

    name = st.text_input("Nome Completo", placeholder="Seu nome completo")
    email = st.text_input("E-mail", placeholder="Seu e-mail")
    password = st.text_input("Senha", type="password", placeholder="Sua senha")
    confirm_password = st.text_input("Confirmar senha", type="password", placeholder="Confirme sua senha")

    if st.button("Realizar Cadastro"):
        if not name or not email or not password or not confirm_password:
            st.error("Por favor, preencha todos os campos.")
        elif password != confirm_password:
            st.error("As senhas não coincidem.")
        else:
            st.success("Cadastro realizado com sucesso! Você já pode fazer login.")

if __name__ == "__main__":
    register()
   