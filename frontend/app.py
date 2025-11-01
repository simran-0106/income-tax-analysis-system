import streamlit as st
import requests

st.title("Income Tax User Login System")

menu = ["Signup", "Login"]
choice = st.sidebar.selectbox("Menu", menu)

BASE_URL = "http://127.0.0.1:5000"

if choice == "Signup":
    st.subheader("Create New Account")
    phone = st.text_input("Phone")
    email = st.text_input("Email")
    password = st.text_input("Password", type='password')

    if st.button("Signup"):
        data = {"phone": phone, "email": email, "password": password}
        response = requests.post(f"{BASE_URL}/signup", json=data)
        st.success(response.json()["message"])

elif choice == "Login":
    st.subheader("Login to Your Account")
    email = st.text_input("Email")
    password = st.text_input("Password", type='password')

    if st.button("Login"):
        data = {"email": email, "password": password}
        response = requests.post(f"{BASE_URL}/login", json=data)
        result = response.json()["message"]

        if response.status_code == 200:
            st.success(result)
        else:
            st.error(result)
