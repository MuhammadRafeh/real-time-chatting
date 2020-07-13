//var person = prompt("Display Name", "");

//establishing the connection to our application
var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

//if name does not exist, going to initialize it
if (!localStorage.getItem('name'))
	localStorage.setItem('name', '');

//Setting the id in the opening of the web browser
if (!localStorage.getItem('id'))
	localStorage.setItem('id', '');

const private_channel_list = []
const public_channel_list = []

//Function to chk if user try to change cookie
var checkCookie = function() {

	try{
	var lastCookie = document.cookie
	  .split('; ')
	  .find(row => row.startsWith('chatshikariid'))
	  .split('=')[1];
	  console.log(cookieValue)
	 }
	 catch(err){
	 	console.log('')
	 }
    

    return function() {

        var currentCookie = document.cookie;

        if (currentCookie != lastCookie) {

            // something useful like parse cookie, run a callback fn, etc.

            lastCookie = currentCookie; // store latest cookie

        }
    };
}();


document.addEventListener('DOMContentLoaded', function() {

	//setting the name of user if it's exist
	document.querySelector('#display-name').value = localStorage.getItem('name');

	//Using blur event to get display name and save it
	document.querySelector('#display-name').onblur = function() {
		const name = document.querySelector('#display-name').value;
		if (name.length < 3){
			alert('Display Name must be greater than 2 Letters');
		}
		else {
			localStorage.setItem('name', name);
			//socket.emit('change name', {'name': localStorage.getItem('name')});
			alert('Successful!');		
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

	document.querySelector('#private-message').onclick = () => {
		const friend_id = prompt("Enter Your Friend's Id")
		if (friend_id)
			socket.emit('private message', {'friend_id': friend_id, 'mine_id': localStorage.getItem('id')})
	}
	

})

socket.on('connect', function(){
	//socket.id;
	//socket.username = "rafeh"
	try{
	var cookieValue = document.cookie
	  .split('; ')
	  .find(row => row.startsWith('chatshikariid'))
	  .split('=')[1];
	  console.log(cookieValue)
	  window.setInterval(checkCookie, 100);
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
		socket.emit('reconnected', {'cookie': cookieValue})
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
	
	window.setInterval(checkCookie, 100);

})

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

socket.on('mssg', () => {
	confirm("asd");
	alert('done')
})

socket.on('user voilated', () => {
	alert("You tried to do something Wrong")
})

