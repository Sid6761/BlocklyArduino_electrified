const sp = require('serialport')
const { exec } = require('child_process')
const fs = require('fs-extra')
const { ipcRenderer } = require("electron")

/* fake IDE code Arduino
** load: serial port list
** btn_term: open modal with serial console
** btn_factory: open modal with blocks factory
** btn_verify_local: verify and compile in hex file
** btn_flash_local: upload hex file in Arduino board
*/

sp.list(function(err,ports) {
	localStorage.setItem("nb_com",ports.length)
	ports.forEach(function(port) {
		var opt = document.createElement('option')
		opt.value = port.comName
		opt.text = port.comName
		document.getElementById('serialport').appendChild(opt)
	})
}) 
window.addEventListener('load', function load(event) {
	$('#serialport').mouseover(function(event) {
		sp.list(function(err,ports) {
			var nbCom = localStorage.getItem("nb_com"), menu_com = document.getElementById('serialport'), menu_opt = menu_com.getElementsByTagName('option')
			if(ports.length != nbCom){
				while(menu_opt[1]) {
					menu_com.removeChild(menu_opt[1])
				}
				ports.forEach(function(port){
					var opt = document.createElement('option')
					opt.value = port.comName
					opt.text = port.comName
					document.getElementById('serialport').appendChild(opt)
				})
				localStorage.setItem("nb_com",ports.length)
			}
		})
	})
	document.getElementById('btn_term').onclick = function(event) {
		var com = document.getElementById('serialport').value
		if (com != "no_com") {
			localStorage.setItem("com",com)
			ipcRenderer.send("prompt", "")
			document.getElementById('local_debug').style.color = '#ffffff'
			document.getElementById('local_debug').textContent = ''
		} else {
			document.getElementById('local_debug').style.color = '#ffffff'
			document.getElementById('local_debug').textContent = 'Sélectionner un port COM !!!'
			return
		}
	}
	document.getElementById('btn_factory').onclick = function(event) {
		ipcRenderer.send("factory", "")		
	}
	document.getElementById('btn_verify_local').onclick = function(event) {
		try {
			fs.accessSync('.\\arduino\\tmp', fs.constants.W_OK)
			} catch (err) {
				fs.mkdirSync('.\\arduino\\tmp', { recursive: false }, (err) => {
					if (err) throw err
					})
		}
		var file_path = '.\\tmp'
		var file = '.\\arduino\\tmp\\tmp.ino'
		var data = $('#pre_arduino').text()
		var carte = document.getElementById('board_select').value
		if (carte != "none") {
			document.getElementById('local_debug').style.color = '#ffffff'
			document.getElementById('local_debug').textContent = 'Carte ' + profile.defaultBoard['description']
			var upload_arg = profile.defaultBoard['upload_arg']
		} else {
			document.getElementById('local_debug').style.color = '#ffffff'
			document.getElementById('local_debug').textContent = 'Sélectionner une carte !!!'
			return
		}
		var cmd = 'arduino-cli.exe compile --fqbn ' + upload_arg + ' ' + file_path
		fs.writeFile(file, data, (err) => {
			if (err) return console.log(err)
		});		
		document.getElementById('local_debug').textContent += '\nVérification : en cours...'
		exec(cmd , {cwd: './arduino'} , (err, stdout, stderr) => {
			if (stderr) {
				document.getElementById('local_debug').style.color = '#ff0000'
				document.getElementById('local_debug').textContent = stderr
				return
			}
			document.getElementById('local_debug').style.color = '#00ff00'
			document.getElementById('local_debug').textContent += '\nVérification : OK'
		})
	}
	document.getElementById('btn_flash_local').onclick = function(event) {
		//compile
		// var file_path = '.\\tmp'
		// var file = '.\\arduino\\tmp\\tmp.ino'
		// var data = $('#pre_arduino').text()
		// var carte = document.getElementById('board_select').value
		// if (carte != "none") {
			// document.getElementById('local_debug').style.color = '#ffffff'
			// document.getElementById('local_debug').textContent = 'Carte ' + profile.defaultBoard['description']
			// var upload_arg = profile.defaultBoard['upload_arg']
		// } else {
			// document.getElementById('local_debug').style.color = '#ffffff'
			// document.getElementById('local_debug').textContent = 'Sélectionner une carte !!!'
			// return
		// }
		// var cmd = 'arduino-cli.exe compile --fqbn ' + upload_arg + ' ' + file_path
		// fs.writeFile(file, data, (err) => {
			// if (err) return console.log(err)
		// });		
		// document.getElementById('local_debug').style.color = '#ffffff'
		// document.getElementById('local_debug').textContent += '\nVérification : en cours...'
		// exec(cmd , {cwd: './arduino'} , (err, stdout, stderr) => {
			// if (stderr) {
				// document.getElementById('local_debug').style.color = '#ff0000'
				// document.getElementById('local_debug').textContent = stderr
				// return
			// }
			// document.getElementById('local_debug').style.color = '#00ff00'
			// document.getElementById('local_debug').textContent += '\nVérification : OK'
		// })
		//upload
		var file_path = '.\\tmp'
		var carte = document.getElementById('board_select').value
		var com = document.getElementById('serialport').value
		if (carte=="none"||com=="no_com"){
			document.getElementById('local_debug').style.color = '#ffffff'
			document.getElementById('local_debug').textContent = 'Sélectionner un port et une carte !!!'
			return
		}
		document.getElementById('local_debug').style.color = '#ffffff'
		document.getElementById('local_debug').textContent = 'Carte ' + profile.defaultBoard['description'] + ' sur port ' + com
		var upload_arg = profile.defaultBoard['upload_arg']
		var cmd = 'arduino-cli.exe upload -p ' + com + ' --fqbn ' + upload_arg + ' ' + file_path
		document.getElementById('local_debug').style.color = '#ffffff'
		document.getElementById('local_debug').textContent = 'Téléversement : en cours...'
		exec(cmd , {cwd: './arduino'} , (err, stdout, stderr) => {
			if (err) {
				document.getElementById('local_debug').style.color = '#ff0000'
				document.getElementById('local_debug').textContent = err
				return
			} else {
				document.getElementById('local_debug').style.color = '#00ff00'
				document.getElementById('local_debug').textContent = 'Téléversement : OK'
				const path = require('path')
				fs.readdir('.\\arduino\\tmp', (err, files) => {
				  if (err) throw err;
				  for (const file of files) {
					fs.unlink(path.join('.\\arduino\\tmp', file), err => {
					  if (err) throw err
					})
				  }
				})
			}
		})
	}
})