import streamlit as st
import random

def resultado_mock_detect():
    rotulos = ['ILCM 3510N', 'ILCM 3511N', 'ILCM 3512N', 'UCM 3511N', 'SA 313']
    num_detect = random.randint(1, 5)
    resultados_detect = []
    for _ in range(num_detect):
        rotulo = random.choice(rotulos)
        confianca = round(random.uniform(0.5, 1.0), 2)
        caixa = {
            'x': 400,
            'y': 200,
            'largura': 100,
            'altura': 100
        }
        resultados_detect.append({
            'Rótulo': rotulo,
            'Confiança': "{:.1f}%".format(confianca * 100),
            'Caixa Delimitadora': f"x: {caixa['x']}, y: {caixa['y']}, largura: {caixa['largura']}, altura: {caixa['altura']}"
        })
    return resultados_detect

st.title("Resultados da Detecção")

st.markdown(
    "<div style='display: flex; justify-content: center;'>"
    "<img src='https://www.dinochristian.com.br/wp/wp-content/uploads/2018/07/exames-para-implantes-dentarios-400x300.jpg' width='300' style='margin-bottom: 20px;'/>"
    "</div>",
    unsafe_allow_html=True
)

resultados = sorted(
    resultado_mock_detect(),
    key=lambda r: float(r['Confiança'].replace('%', '')),
    reverse=True
)

st.info("Foram encontrados {} implantes dentários na imagem analisada.".format(len(resultados)))

for i, r in enumerate(resultados, 1):
    with st.expander(f"Detecção {i}: {r['Rótulo']} ({r['Confiança']})", expanded=False):
        st.markdown(
            f"<div style='font-size: 0.9em;'>"
            f"<b>Rótulo:</b> {r['Rótulo']}<br>"
            f"<b>Confiança:</b> {r['Confiança']}<br>"
            f"<b>Caixa Delimitadora:</b> {r['Caixa Delimitadora']}<br>"
            "</div>",
            unsafe_allow_html=True
        )