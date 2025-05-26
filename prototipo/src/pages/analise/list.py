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

historico_imagens = [
    {
        "nome": "imagem1.jpg",
        "data": "2024-06-01 10:23",
        "resultados": resultado_mock_detect()
    },
    {
        "nome": "imagem2.jpg",
        "data": "2024-06-02 14:15",
        "resultados": resultado_mock_detect()
    },
    {
        "nome": "imagem3.jpg",
        "data": "2024-06-03 09:05",
        "resultados": resultado_mock_detect()
    }
]

st.title("Histórico de Imagens Enviadas para Análise")

for img in historico_imagens:
    with st.expander(f"{img['nome']} ({img['data']})"):
        st.table(img['resultados'])
