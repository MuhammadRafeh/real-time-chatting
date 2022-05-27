import os, time
import uuid

#import datetime #datetime.datetime.now().time()
from time import strftime, localtime #strftime("%H:%M:%S", localtime())

from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room, send

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

users = {} #request.sid, ids

users_name = {} #id then name

private_rooms = {} #id and then list as value list will be the id's 

private_messages = {} #'23 12' as a key then in list as a values we have a messages 
#name, from, message, to, timestamp, key will be 10723 to 23003243

public_members = {} #channel name and then members

private_channels = {} #channel name and members 

#str(uuid.uuid4().fields[-1])[:5] to take random ids

#Private Channels List
private_record = {} #using for storing the channel id and the names of users who are currently exist in this channel
private_info = {}

#to get dict key from values
def get_key(val, dic):
	for key, value in dic.items():
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
	users_name[ids] = ''
	print(users_name)

@socketio.on("reconnected")
def reconnect(data):
	print(users)
	ids = data["cookie"]
	name = data['name']
	found = get_key(ids, users) #getting the key of id that's probabily a socket.id/request.sid
	if found!='n': #After reconnection we founded the id in server that's good
		del users[found] #Deleting the previous socket id
		users[request.sid] = ids #Assigning the new user
		users_name[ids] = name
		emit('reconnection success', {'id': ids})
	else:
		users[request.sid] = ids #Assigning the new user
		emit('reconnection success', {'id': ids})
		users_name[ids] = name
		#emit('user voilated')
	list_of_members = [] #Storing the keys which is actually telling me how many connection he has

	for i in private_messages.keys():
		if ids in i.split():
			list_of_members.append(i)

	if len(list_of_members)==0:   #If there is no communication before just return it.
		return

	for key in list_of_members:
		emit('take private messages', {'messages' :private_messages[key], 'members': key})
		time.sleep(1)
	#private_messages[i] is list of objects
	#and i is a key
	# print(users)

@socketio.on('name changed')
def name_changed(data):
	name = data['name']
	req = request.sid
	if req in users.keys():
		ids = users[req]
		users_name[ids] = name

@socketio.on('send private message')
def snd_mssg(data):
	mssg = data['message']
	to = data['id']
	from_sid = request.sid
	if from_sid not in users.keys():
		return

	if to not in users.values():
		emit('user not found')
		return

	from_id = users[from_sid]
	to_sid = get_key(to, users)
	time = strftime("%H:%M:%S", localtime())
	# private_messages[ids+' '+req_id] = []
	for i in private_messages.keys():
		if to in i.split() and from_id in i.split():
			break
	# Now here In i we have a key '1212 1212'. Now below is the information of those who send the message
	from_name = users_name[from_id]
	to_name = users_name[to]
	message = {'from_name': from_name, 'from': from_id, 'message': mssg, 'to_name':to_name, 'to': to, 'time': time}
	private_messages[i].append(message)

	if len(private_messages[i])>100:   #It is saving record of 100 most recent messages
		private_messages[i].pop(0)

	message['members'] = i #Adding key for easyness for client side
	emit('receive private message from friend',  message, room=to_sid)
	emit('mine send message', message)

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
	name = data['name']
	friend_id = data['friend_id']
	if friend_id in users.values():
		print('here')
		friends_sid = get_key(data['friend_id'], users) #friend's id is what you want to connect for chat
		print(friends_sid)
		print(users[request.sid])
		emit('want private mssg', {'id': users[request.sid], 'name': name}, room=friends_sid)

@socketio.on('i want private connection')
def private_connection_established(data):
	req_sid = request.sid
	req_id = users[req_sid]
	ids = data['id']
	if ids in users.values():
		sid = get_key(ids, users)
		emit('private_connection_done', {'id': ids}, room=sid)
		if ids not in private_rooms.keys():#this id belongs to who accepts the connection
			private_rooms[ids] = []  #If key not exists then initiating the key to array
		if req_id not in private_rooms.keys():
			private_rooms[req_id] = [] 

		#Possible they can already exist so checking if it's not exist then append
		if req_id not in private_rooms[ids]:
			private_rooms[ids].append(req_id)
		if ids not in private_rooms[req_id]:
			private_rooms[req_id].append(ids)
		print(private_rooms)

		if (ids+' '+req_id) not in private_messages.keys() and (req_id+' '+ids) not in private_messages.keys():
			private_messages[ids+' '+req_id] = []
			emit('create private message list', {'key': ids+' '+req_id})




@socketio.on('i dont want private connection')
def private_connection_failed(data):
	ids = data['id']
	if ids in users.values():
		sid = get_key(ids, users)
		emit('private_connection_unsuccess', {'id': ids}, room=sid)


@socketio.on('get private mssges')
def get_mssg(data):
	ids = data['id']
	if ids in private_rooms.keys():
		info = []
		names = []
		members = private_rooms[ids]
		for member in members:	#here member meant by id that is generated by server
			names.append(users_name[member])
		if len(names)>1:
			i = 0
			for name in names:
				info.append([name, members[i]])
				i += 1
		elif len(names)==1:
			info.append([names[0], members[0]])
		else:
			emit('You have no friends yet')
			return
		print('info', info)
		print(names)
		print(members)
		emit('get private mssges response', {'members': info})

