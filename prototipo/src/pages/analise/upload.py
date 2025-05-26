import streamlit as st
from base64 import b64encode

st.title("Upload de Imagens")

uploaded_file = st.file_uploader(
    "Escolha uma imagem (PNG ou JPEG)", 
    type=["png", "jpg", "jpeg"]
)

if uploaded_file is not None:
    img_bytes = uploaded_file.getvalue()
    img_base64 = b64encode(img_bytes).decode("utf-8")
    st.markdown(
        f"""
        <div style="display: flex; justify-content: center;">
            <img src="data:image/jpeg;base64,{img_base64}" alt="Imagem carregada" width="300"
                 style="border: 3px solid #4F8BF9; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
        </div>
        """,
        unsafe_allow_html=True,
    )
    if st.button("Confirmar análise"):
        st.toast("Imagem enviada para análise.")
