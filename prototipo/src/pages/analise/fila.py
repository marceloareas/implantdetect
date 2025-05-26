import streamlit as st
import time

st.title("Fila de Espera")

toggle_status = st.toggle(
    "Alterar o status da fila de processamento",
    key="toggle_fila",
)

toggle_error = st.toggle(
    "Simular erro após processamento da imagem",
    key="toggle_error",
    disabled=not toggle_status
)

st.write("Enviado em: " + time.strftime("%d/%m/%Y %H:%M:%S"))
if toggle_status:
    start_time = time.strftime("%d/%m/%Y %H:%M:%S")
    st.write(f"Início do processamento: {start_time}")
    with st.spinner("Sua imagem está sendo analisada. Por favor, aguarde..."):
        time.sleep(5)
    if toggle_error:
        st.error("Ocorreu um erro durante o processamento da imagem. Por favor, tente novamente mais tarde.")
    else:
        st.session_state.processado = True
        end_time = time.strftime("%d/%m/%Y %H:%M:%S")   
        st.success(f"Processamento concluído com sucesso! Fim do processamento: {end_time}")
else:
    st.info("Sua imagem está aguardando na fila de processamento. Por favor, aguarde...")