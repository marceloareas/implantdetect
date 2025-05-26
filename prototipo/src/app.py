import streamlit as st

pages = st.navigation(
    {
        "": [
            st.Page("pages/index.py", title="Página Inicial 🏠", default=True)
        ],
        "Autenticação 🔑": [
            st.Page("pages/auth/profile.py", title="Perfil"),
            st.Page("pages/auth/login.py", title="Login"),
            st.Page("pages/auth/register.py", title="Registrar"),
        ],
        "Análise de Imagens 📷": [
            st.Page("pages/analise/upload.py", title="Upload de Imagem"),
            st.Page("pages/analise/fila.py", title="Fila de Espera"),
            st.Page("pages/analise/results.py", title="Resultado"),
            st.Page("pages/analise/list.py", title="Histórico"),
        ]
    }
)

pages.run()
