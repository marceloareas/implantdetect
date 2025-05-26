import streamlit as st

def index():
    st.set_page_config(
        page_title="Página Inicial",
        page_icon="🏠",
    )

    st.markdown(
        """
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60vh;">
            <h1 style="margin-bottom: 10px; font-size: 3em; display: flex; align-items: center;">
                <span>ImplantDetect</span>
                <span style="font-size: 1.2em;">🦷🔍</span>
            </h1>
            <p style="max-width: 600px; text-align: center;">
                O ImplantDetect é uma plataforma desenvolvida para auxiliar na detecção de implantes dentários em imagens radiográficas utilizando técnicas de aprendizado de máquina.
            </p>
            <p style="font-size: 0.9em; color: #888; margin-top: 30px;">
                Projeto e Construção de Sistemas 2025.1 — Código fonte disponível no <a href="https://github.com/marceloareas/implantdetect">GitHub</a>
            </p>
        </div>
        """,
        unsafe_allow_html=True
    )

    st.html("<style>[data-testid='stHeaderActionElements'] {display: none;}</style>")
    
if __name__ == "__main__":
    index()
    