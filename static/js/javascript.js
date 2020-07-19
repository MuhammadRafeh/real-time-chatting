//var person = prompt("Display Name", "");

//establishing the connection to our application
var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

//if name does not exist, going to initialize it
if (!localStorage.getItem('name'))
	localStorage.setItem('name', '');

//Setting the id in the opening of the web browser
if (!localStorage.getItem('id'))
	localStorage.setItem('id', '');

function receive_private_message_from_friend(data, save=null){
	// const mine_id = data.to
	const from_name = data.from_name
	// const from_id = data.from
	// const mine_name = data.to_name
	const message = data.message
	const time = data.time
	const key = data.members
	const template = Handlebars.compile(document.querySelector('#private-messages-from-friend').innerHTML);
	const content = template({'name': from_name, 'time': time, 'message': message});

	document.querySelector('#medium').innerHTML += content;
	scrollToBottom('medium')

	if (save===null) //if save is null it's mean user is getting data from their on side then no need to go below
		return;

	delete data.members //We don't need of it right now

	private_messages[key].push(data)
}

function mine_send_message(data, save=null){
	const from_name = data.from_name
	const time = data.time
	const message = data.message
	const key = data.members
	const template = Handlebars.compile(document.querySelector('#send-private-message').innerHTML);
	const content = template({'name': from_name, 'time': time, 'message': message});

	document.querySelector('#medium').innerHTML += content;
	scrollToBottom('medium')

	if (save===null)
		return;

	delete data.members //We don't need of it right now

	private_messages[key].push(data)
}

// const private_channel_list = []
// const public_channel_list = []

// const private_friends = []

var private_messages = {} //name, id, message, to, timestamp, key will be 10723 to 23003243


getprivatemessage = ids => {
	event.preventDefault();
	if (document.querySelector('input[name=message]').dataset.id!==''){ //getting the previous id and doing stuff with it
		document.getElementById(document.querySelector('input[name=message]').dataset.id).style.background = 'yellow';
		document.getElementById(document.querySelector('input[name=message]').dataset.id).style.color = 'black';
		document.getElementById('medium').innerHTML = '';
	}

	//Here user selected another id

	document.querySelector('input[name=message]').dataset.id = ids


	document.getElementById(ids).style.background = '#2f3630';
	document.getElementById(ids).style.color = 'white';

	//Below we start to fill the medium with previous messages

	const list_of_keys = Object.keys(private_messages) //hetting private_messages keys i.e the ids that comunicates
	let key;
	for (let i = 0; i<list_of_keys.length; i++){
		const split_list = list_of_keys[i].split(" ")
		if (split_list.includes(ids)){
			key = list_of_keys[i]
			break
		}
	}

	//Now, here we get key successful, that shows communication 

	//private_messages[key] list of messages that below I am going to display on medium

	const messages = private_messages[key] //list of object where each object is a message

	for (let i = 0; i < messages.length; i++){ //I created loop to through the messages
		const obj = messages[i] //Obj is a object which is a message inside
		if (obj.from==ids){
			receive_private_message_from_friend(obj)
		}
		else
			mine_send_message(obj)
	}

}

function scrollToBottom (id) {
   var div = document.getElementById(id);
   div.scrollTop = div.scrollHeight - div.clientHeight;
}

//Function to chk if user try to change cookie
// var checkCookie = function() {

// 	try{
// 	var lastCookie = document.cookie
// 	  .split('; ')
// 	  .find(row => row.startsWith('chatshikariid'))
// 	  .split('=')[1];
// 	  console.log(cookieValue)
// 	 }
// 	 catch(err){
// 	 	console.log('')
// 	 }
    

//     return function() {

//         var currentCookie = document.cookie;

//         if (currentCookie != lastCookie) {

//             // something useful like parse cookie, run a callback fn, etc.

//             lastCookie = currentCookie; // store latest cookie

//         }
//     };
// }();


document.addEventListener('DOMContentLoaded', function() {

	document.querySelector('#send-button').disabled = true;

	document.querySelector('#name-save-button').disabled = true;

	document.querySelector('#name-save-button').onclick = () => {
		const name = document.querySelector('#display-name').value;
		if (localStorage.getItem('name', name)!==name){
			localStorage.setItem('name', name);
			socket.emit('name changed', {'name': name})
			alert('Successful!');
		}
		else
			alert("Nothing Changed, Same name as before")
	}

	document.querySelector('#submit-friend-id').onclick = () => {
		const id = document.querySelector('#friend-id-input').value
		$('#taking-friends-input').modal('hide')
		socket.emit('private message', {'friend_id': id, 'name': localStorage.getItem('name')})
	}

	//setting the name of user if it's exist
	document.querySelector('#display-name').value = localStorage.getItem('name');

	//Using blur event to get display name and save it
	document.querySelector('#display-name').onkeyup = function() {
		const name = document.querySelector('#display-name').value;
		if (name.length < 3){
			document.querySelector('#name-save-button').disabled = true;
		}
		else {
			document.querySelector('#name-save-button').disabled = false;
			//socket.emit('change name', {'name': localStorage.getItem('name')});
		}
	}

	//Going to bind onclick event of channels create button in modal.
	document.querySelectorAll('.input-channel').forEach(button => {
		if (button.dataset.view==='private'){
			button.onclick = function(){
				const channel_name = document.querySelector('#private-input').value;
				socket.emit('private creation', {'channel_name': channel_name, 'user_id': localStorage.getItem('id')})
			}
		}
		else if (button.dataset.view==='public'){
			button.onclick = function(){
				const channel_name = document.querySelector('#public-input').value;
				socket.emit('public creation', {'channel_name': channel_name, 'user_id': localStorage.getItem('id')})
			}
		}
	})

	document.querySelector('#private-message-dropdown').onclick = () => {
		socket.emit('get private mssges', {'id': localStorage.getItem('id')})
		return false;
	}

	document.querySelector('input[name=message]').onkeyup = () => {
		if (document.querySelector('input[name=message]').value.length>1)
			document.querySelector('#send-button').disabled = false
		else
			document.querySelector('#send-button').disabled = true

	}

	document.querySelector('#send-message').onsubmit = () => {
		const id = document.querySelector('input[name=message]').dataset.id
		const mssg = document.querySelector('input[name=message]').value
		if (id!==""){
			socket.emit('send private message', {'message': mssg, 'id': id})
		}
		else{
			alert('First Select Something!')
		}
		document.getElementById("send-input-field").value = '';
		event.preventDefault();
	}

})

socket.on('connect', function(){
	//socket.id;
	//socket.username = "rafeh"
	try{
		cookieValue = document.cookie
	  .split('; ')
	  .find(row => row.startsWith('chatshikariid'))
	  .split('=')[1];
	  console.log(cookieValue)
	  // window.setInterval(checkCookie, 100);
	}
	catch(err){
		console.log('Visited First Time')
	}

	//if id not assign then execute this if
	if (typeof(cookieValue)==='undefined'){ //New User
		console.log('undefined')
		//Event to take unique id from Server
		socket.emit('connected')
	}

	else{
		console.log('called')
		socket.emit('reconnected', {'cookie': cookieValue, 'name': localStorage.getItem('name')})
	}

})

socket.on('id generated', data => {

	localStorage.setItem('id', data.id);
	alert(`Your generated id is: ${data.id}`)

	const cname = "chatshikariid";//cookie key 
	const cvalue = data.id//cookie value
	const d = new Date();
	d.setTime(d.getTime() + (5*24*60*60*1000)); //5 day

	const expires = "expires="+ d.toUTCString();

	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";

	//assigning the id at bottom left section of webpage
	document.querySelector('#allocate_id').innerHTML = data.id
	
	// window.setInterval(checkCookie, 100);

})

//Called by server when user reconnects
socket.on('reconnection success', data => {
		localStorage.setItem('id', data.id)
		document.querySelector('#allocate_id').innerHTML = localStorage.getItem('id')
		alert("Welcome Back!")
})


socket.on('private created', data => {
	alert("Private Channel Created Successfully")
	$('#private-channel').modal('hide')
	private_channel_list.push({'id': data.id, 'name': data.channel_name})
})

socket.on('public created', data => {
	alert("Public Channel Created Successfully")
	$('#public-channel').modal('hide')
	public_channel_list.push({'id': data.id, 'name': data.channel_name})
})

socket.on('user not found', () => {
	alert("User Not Found, Invalid User Id!")
})

// socket.on('disconnect', () => {

//       socket.emit('disconnected');

//       localStorage.removeItem('id')
//       localStorage.removeItem('name')

//   })
// socket.on('id generated', data => {
// 	console.log(data.id);
// })

socket.on('user voilated', () => {
	alert("You tried to do something Wrong")
})

socket.on('want private mssg', data => {
		document.querySelector('#id').innerHTML = data.id
		document.querySelector('#name').innerHTML = data.name

		$('#private-decision').modal({
    		backdrop: 'static',
    		keyboard: false
		})

		document.querySelector('#yes').onclick = () => {
         socket.emit('i want private connection', {'id': data.id})
		}

		document.querySelector('#no').onclick = () => {
         socket.emit('i dont want private connection', {'id': data.id})
		}

})

socket.on('private_connection_done', data => {
	alert('User Accepted to communicate, Connection Established!')
})

socket.on('private_connection_unsuccess', data => {
	alert('User declined/Something went wrong!')
})

socket.on('get private mssges response', data => {
	console.log(12)
	const list = data.members
	console.log(list)
	const template = Handlebars.compile(document.querySelector('#private-message-list').innerHTML);
	const content = template({'values': list});
	// $('#channel-list').append(content);
	document.querySelector('#channel-list').innerHTML = content;
})

socket.on('You have no friends yet', () => {
	alert('There is nothing to show you, No Friends Yet!')
})

socket.on('receive private message from friend', data => {
		receive_private_message_from_friend(data, save=true)
})

socket.on('mine send message', data => {	
	mine_send_message(data, save=true);
})

socket.on('take private messages', data => {
	const mssg = data.messages //mssg is a list of objects where each object is a message
	const member = data.members //key '102021 12121'
	private_messages[member] = mssg
})

socket.on('create private message list', data => { //On Newly connection when established!
	const key = data.key
	private_messages[key] = []
})