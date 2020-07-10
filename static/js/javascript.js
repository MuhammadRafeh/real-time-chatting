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

		
	

})

socket.on('connect', () => {

	//if id not assign then execute this if
	if (localStorage.getItem('id')===''){

		//Event to take unique id from Server
		socket.emit('connected')
		//console.log('done')
	}

	//assigning the id at bottom left section of webpage
	document.querySelector('#allocate_id').innerHTML = localStorage.getItem('id')
	
})

socket.on('id generated', data => {

	localStorage.setItem('id', data.id);
	alert(`Your generated id is: ${data.id}`)

	//assigning the id at bottom left section of webpage
	document.querySelector('#allocate_id').innerHTML = data.id

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


// socket.on('id generated', data => {
// 	console.log(data.id);
// })
