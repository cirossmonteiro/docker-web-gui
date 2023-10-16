# docker-web-gui
python3 -m ven venv

source venv/bin/activate

pip install -r requirements.txt

or pip install fastapi uvicorn

uvicorn main:app --reload