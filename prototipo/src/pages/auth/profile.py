import streamlit as st
from datetime import datetime

usuario = {
    "nome": "João Silva",
    "data_criacao": datetime(2025, 5, 10),
    "foto_perfil": "https://randomuser.me/api/portraits/men/22.jpg",
    "data_ultima_analise": datetime(2025, 6, 15)
}

st.title("Perfil do Usuário")

col1, col2, col3 = st.columns([1, 1, 2])
with col1:
    st.markdown(
        f"""
        <div style="display: flex; align-items: center; justify-content: center; height: 100%;">
            <img src="{usuario['foto_perfil']}" width="120" style="border-radius: 50%;" />
        </div>
        """,
        unsafe_allow_html=True
    )
with col2:
    st.markdown(
        f"""
        <div style='display: flex; flex-direction: column; justify-content: center; height: 100%;'>
            <strong>Nome:</strong> {usuario['nome']}<br>
            <strong>Conta criada em:</strong> {usuario['data_criacao'].strftime('%d/%m/%Y')}<br>
        </div>
        """,
        unsafe_allow_html=True
    )
with col3:
    st.markdown(
        """
        <div style='display: flex; flex-direction: column; justify-content: center; height: 100%;'>
            <strong>E-mail:</strong> joao.silva@email.com<br>
            <strong>Telefone:</strong> (11) 91234-5678
        </div>
        """,
        unsafe_allow_html=True
    )

st.markdown("---")
st.subheader("Alterar Email ou Senha")

with st.form("alterar_credenciais"):
    novo_email = st.text_input("Novo Email", value="joao.silva@email.com")
    nova_senha = st.text_input("Nova Senha", type="password")
    confirmar_senha = st.text_input("Confirmar Nova Senha", type="password")
    submit = st.form_submit_button("Salvar Alterações")

    if submit:
        if nova_senha != confirmar_senha:
            st.error("As senhas não coincidem.")
        else:
            # Aqui você adicionaria a lógica para atualizar email e senha
            st.success("Credenciais atualizadas com sucesso!")