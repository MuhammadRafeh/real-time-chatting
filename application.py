import os, time
import uuid

from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

users = []

#str(uuid.uuid4().fields[-1])[:5] to take random ids

#Private Channels List
private_record = {} #using for storing the channel id and the names of users who are currently exist in this channel
private_info = {}

#Public Channels List
public_record = {}
public_info = {}

@app.route("/")
def index():
    return render_template('index.html')

@socketio.on("connected")
def connect():
	time.sleep(1)
	while True:
		id = str(uuid.uuid4().fields[-1])[:5]
		if id not in users:
			users.append(id)
			emit('id generated', {"id": id})
			break
	users.append(id)

@socketio.on("private creation")
def private(data):
	channel = data["channel_name"]
	creater = data["user_id"]
	while True:
		id = str(uuid.uuid4().fields[-1])[:7]
		if id not in private_record.keys():
			private_record[id] = []
			private_info[id] = [channel, creater] #channel name and creater who created the channel
			emit('private created', {'id': id, 'channel_name': channel})
			break

@socketio.on("public creation")
def public(data):
	channel = data["channel_name"]
	creater = data["user_id"]
	while True:
		id = str(uuid.uuid4().fields[-1])[:7]
		if id not in public_record.keys():
			public_record[id] = []
			public_info[id] = [channel, creater] #channel name and creater who created the channel
			emit('public created', {'id': id, 'channel_name': channel})
			break

	
	


