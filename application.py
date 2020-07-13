import os, time
import uuid

from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room, send

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

users = {} #request.sid, ids

#str(uuid.uuid4().fields[-1])[:5] to take random ids

#Private Channels List
private_record = {} #using for storing the channel id and the names of users who are currently exist in this channel
private_info = {}

#to get dict key from values
def get_key(val):
	for key, value in users.items():
		if val == value:
			return key
	return 'n'

#Public Channels List
public_record = {}
public_info = {}

@app.route("/")
def index():
    return render_template('index.html')

@socketio.on("connected")
def connect():
	print(request.sid)
	time.sleep(1)
	while True:
		ids = str(uuid.uuid4().fields[-1])[:5]
		if ids not in users:
			emit('id generated', {"id": ids})
			break
	users[request.sid] = ids

@socketio.on("reconnected")
def reconnect(data):
	ids = data["cookie"]
	found = get_key(ids) #getting the key of id that's probabily a socket.id/request.sid
	if found!='n': #After reconnection we founded the id in server that's good
		del users[found] #Deleting the previous socket id
		users[request.sid] = ids #Assigning the new user
		emit('reconnection success', {'id': ids})
	else:
		emit('user voilated')
	print(users)


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

@socketio.on("private message")
def messaging_privately(data):
	#friend = str(data["friend_id"])
	#if friend not in users:
	#	emit('user not found')
	emit('mssg', room=request.sid)
	print(request.sid)


