process.title='Lectio-Self-Checkout-Nodejs ---MÅ IKKE LUKKES---'
var fs = require('fs');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var request = require('request');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.raw());
app.use(bodyParser.text());
const {exec} = require('child_process');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
var IllegalSymbols = '/\:*?"<>|.'.split('')
var doneanddownload = false;
var socketid;
var username;
var cookie;
var elevid;
var allminelinks = [];
var opgaver = [];
var folders = [];
var searchforopgavernr = 0;
//
//
//you can change this to make it go faster
var userdelay = '1000';
//but dont touch anything else!
//
//

var start_var = 'start '
if(process.platform != 'win32')
	start_var = 'open '

var files_to_be_deleted = ['index.js', 'package-lock.json', 'README.md', 'run_mac.command', 'run_windows.bat', 'Main.js', 'Resources', 'node_modules', '.DS_Store', 'package.json']

app.get('/lectio', (req, res) => {
	res.sendFile(__dirname + '/Resources/lectio.png');
})
app.get('/loading-bar.css', (req, res) => {
	res.sendFile(__dirname + '/Resources/loading-bar.css');
})
app.get('/loading-bar.js', (req, res) => {
	res.sendFile(__dirname + '/Resources/loading-bar.js');
})



app.get('/', (req, res) => {
	res.sendFile(__dirname + '/Resources/index.html');
}).post('/', (req, res) => {
	if(req.body && req.body.Username && req.body.Password && req.body.Delay){
		if(!isNaN(req.body.Delay)){
			userdelay=req.body.Delay;
		}
		username = req.body.Username;
		request({
			method:'POST',
			url:'https://www.lectio.dk/lectio/678/login.aspx',
			form: {
				'__EVENTTARGET':'m$Content$submitbtn2',
				'__EVENTARGUMENT':'',
				'__EVENTVALIDATION':'MHLe4spmA1lMHRuPuzZzWdNUgaUWNtpzC0+obC5LuMQ+nCWJ9a5B67vLmyTOhWy+XO1ilmBMSz3HAJps9PLqrudxoGUi2L+NS+WjxIFxfN2E6MbbF+du173UN/u+emKxXHD3mCWoEmZr8fPK/Ek1P+A6HNUdcamHxsOQQE6IDCsGnqWs80m3FHUBmxSjJTKOKplkgj/EJ/MhJJTjG6dJGTMzFXDixa8q5Xxk5ogzhN5u2oVKp0IvpJPug2D8RK3e',
				'm$Content$username2':req.body.Username,
				'm$Content$passwordHidden':req.body.Password
			}
		},(err, response, body)=>{
			const { document } = (new JSDOM(body)).window;
			if(document.title == 'Object moved'){
				cookie = response.headers['set-cookie']
				request({
					method:'GET',
					url:'https://www.lectio.dk/lectio/678/forside.aspx',
					headers:{
						'cookie':cookie
					}
				}, (err, response, body)=>{
					const { document } = (new JSDOM(body)).window;
					if(document.querySelector('.ls-user-name').href.split('=')[1]=='elev&elevid'){
						elevid = document.querySelector('.ls-user-name').href.split('=')[2]
						res.redirect('/status');
						createfoldertree()
					}
				})
			}else{
				res.send('ERROR. Please try again!')
			}
		})
	}else{
		res.send('ERROR. Please try again!')
	}
})

app.get('/io', (req, res) => {
	res.sendFile(__dirname + '/Resources/socket.io.js');
});
app.get('/status', (req, res) => {
	res.sendFile(__dirname + '/Resources/status.html');
});
io.on('connection', function(socket) {
	socketid=socket.id;
	if(doneanddownload){
		statusio('Færdig', 'alle dine filer er nu hentet')
	}
	socket.on('disconnect', function() {
		socket=null;
	});
});

http.listen(1234, function() {
	exec(start_var+'http://127.0.0.1:1234/')
});


function createfoldertree() {
	request({
		method: 'GET',
		url: 'https://www.lectio.dk/lectio/678/DokumentOversigt.aspx?elevid='+elevid,
		headers: {
			'cookie': cookie
		}
	}, (err, response, body) => {
		let {
			document
		} = (new JSDOM(body)).window;
		var path = '/' + username + '/Dokumenter';
		var IllegalSymbols = '/\:*?"<>|'.split('')
		findfolders(document.querySelector('#s_m_Content_Content_FolderTreeView').children, path)
		function findfolders(location, CurrentPath) {
			if (location == document.querySelector('#s_m_Content_Content_FolderTreeView').children) {
				for (var i = 1; i < location.length; i++) {
					let folder = {
						parent: username,
						foldername: location[i].children[0].children[2].children[1].innerHTML,
						folderid: location[i].attributes[1].nodeValue,
					}
					let PathName = folder.foldername.split('');
					for (var a = 0; a < PathName.length; a++) {
						if (IllegalSymbols.includes(PathName[a])) {
							PathName[a] = '#';
						}
					}
					folder.path = path + '/' + PathName.join('')
					folders.push(folder)
					if (location[i].children.length > 1) {
						findfolders(location[i].children[1].children, folder.path)
					}
				}
			} else {
				for (var i = 0; i < location.length; i++) {
					let folder = {
						parent: location[i].parentNode.parentNode.children[0].children[2].children[1].innerHTML,
						foldername: location[i].children[0].children[2].children[1].innerHTML,
						folderid: location[i].attributes[1].nodeValue,
					}
					let PathName = folder.foldername.split('');
					for (var a = 0; a < PathName.length; a++) {
						if (IllegalSymbols.includes(PathName[a])) {
							PathName[a] = '#';
						}
					}
					folder.path = CurrentPath + '/' + PathName.join('')
					folders.push(folder)
					if (location[i].children.length > 1) {
						findfolders(location[i].children[1].children, folder.path)
					}
				}
			}
		}
		for (var i = 0; i < folders.length; i++) {
			fs.mkdir(__dirname + folders[i].path, {
				recursive: true
			}, (err) => {
				if (err) throw err;
			});
		}
		var foldernr = 0;
		lookforfolderlinks()
		function lookforfolderlinks() {
			folderlinks(folders[foldernr], (result) => {
				if (result) {
					allminelinks = allminelinks.concat(result)
				}
				if (foldernr == folders.length-1) {
					opgaverhenter()
				} else {
					foldernr++
					statusio('Dokumenter', (foldernr+1)+'/'+folders.length)
					setTimeout(function() {
						lookforfolderlinks()
					}, userdelay);
				}
			})
		}
	})
}
function folderlinks(folder, callback) {
	request({
		method: 'GET',
		url: 'https://www.lectio.dk/lectio/678/DokumentOversigt.aspx?elevid='+elevid + '&folderid=' + folder.folderid,
		headers: {
			'cookie': cookie
		}
	}, (err, response, body) => {
		let {
			document
		} = (new JSDOM(body)).window;
		if (document.querySelector('tbody').children.length > 1) {
			let Docs = [];
			for (var i = 1; i < document.querySelector('tbody').children.length; i++) {
				let Doc = {
					filelink: 'https://www.lectio.dk'+document.querySelector('tbody').children[i].children[1].children[0].href,
					filepath: __dirname+folder.path,
				}
				Docs.push(Doc)
			}
			callback(Docs)
		} else {
			callback(false)
		}
	})
}
function opgaverhenter() {
	request({
		method: 'GET',
		url: 'https://www.lectio.dk/lectio/678/OpgaverElev.aspx?elevid=' + elevid,
		headers: {
			'cookie': cookie
		}
	}, (err, res, body) => {
		let {
			document
		} = (new JSDOM(body)).window;
		request({
			method: 'POST',
			url: 'https://www.lectio.dk/lectio/678/OpgaverElev.aspx?elevid=' + elevid,
			headers: {
				'cookie': cookie
			},
			form: {
				'time': '0',
				'__EVENTTARGET': 's$m$Content$Content$ShowThisTermOnlyCB',
				'__EVENTARGUMENT': '',
				'__LASTFOCUS': '',
				'__SCROLLPOSITION': '',
				'__VIEWSTATEX': document.querySelector('#__VIEWSTATEX').value,
				'__VIEWSTATEY_KEY': '',
				'__VIEWSTATE': '',
				'__VIEWSTATEENCRYPTED': '',
				'__EVENTVALIDATION': '7J85HCqRu/sLdeXsNuNV62RCP4GG9N41Hb6OGnD6wBsWhvzQLB81vZGH1ENZ0XSIVF+W/IQgr+ChrGocpsaJ89dP8Fq0U8RaRQZWlhpQl8jb8RKazN+cglDuZOrg0cRcuxW7ekpHa23DNM33VHY5uOrgsyscHrf/zgo8VPV806t9v3fUcDwwOtbqFNjfOOeHS0glhoKs+Vj1dqr5JgZaEsR8wBW3c/3JNRN3wPP5NgvIbAbvHNvmlUS2yqGZ7nkNtk3quqZW9Zd2EXjt15DoffM+Kr3J9to6ox/ihEKc4iMpyUnEY9Cl7hbD5l6iRyzMAHfLRuaC7Zt9GLwjKMGJTvHXfUWO/6OhMUEyWSlCkVPKjzXJlzFLao5FaRGjEa/fGaJEfL7sCTf2JNyF56P40bG9vP2HREBCp+ge5CPmDOnPcVO/OmlxvJj5lK808q4mpMqJ1S6luXvICVc26cfmXkGi9xUPYNcn1YLjrg9FrVPX27bAPgsON6tYkfTjq7AdiQJYN7Y4ijBdF1XjxgLa0m+MTl1PTNtWjEhtHaYdkh+54Gkw+M1Y2AVskIaPL37691tn1+mPW/7RVVW5/XgehXtN90iPzPeMdgFVALIuxaSR13LVH4q2AYK9vjdJF94ObwjcBIOHxdvNSS9MsfEGBQ==',
				's$m$ChooseTerm$term': '2018',
				's$m$searchinputfield': '',
				's$m$Content$Content$ShowHoldElementDD': '',
				's$m$Content$Content$CurrentExerciseFilterCB': 'on',
				'LectioPostbackId': ''
			}
		}, (err, res, body) => {
			let {
				document
			} = (new JSDOM(body)).window;
			request({
				method: 'POST',
				url: 'https://www.lectio.dk/lectio/678/OpgaverElev.aspx?elevid=' + elevid,
				headers: {
					'cookie': cookie
				},
				form: {
					'time': '0',
					'__EVENTTARGET': 's$m$Content$Content$CurrentExerciseFilterCB',
					'__EVENTARGUMENT': '',
					'__LASTFOCUS': '',
					'__SCROLLPOSITION': '',
					'__VIEWSTATEX': document.querySelector('#__VIEWSTATEX').value,
					'__VIEWSTATEY_KEY': '',
					'__VIEWSTATE': '',
					'__VIEWSTATEENCRYPTED': '',
					'__EVENTVALIDATION': '8fFFYFA2qu2ugxV37f0w+OzBg8jV52GYe2X+I8bUWUPXgnAPjYbNpkQX0UFu60lHjwaHCdE3zz+N65qnOkmKxQClIutTus/xXO7JJNlLQIaMxVckDNdeaRrM+NNVFTvGTA+fv/uQOALr4HqlqD+tllBgOYKuesKXoHSi4eWXKiUbJ2m8KDu3+DOj2buGXl+tL4nRoxlkc+/nciiaqlXMBPEPf0mVZ6fViaXW/lNOa/LN9NTjCNF9jnS0xXTtWvn3ktm8e5gVz0TZhBHzugkBvObAgAclvdtryfZUtMK5PmsjC+AZhlLJElduo9rs8ZzTvsn9KjP1Qgf0BYZ3cXZgb+ZQjLzPRYTozO+7/9k4mvjRFrskA10Az3avZeerKWRKM8/mf+jo6pnmEhEsd4NCa15accwtVVVlBzRX+dVdQH3DbB9OOa3eXplDrf5qu746mUx7K18tdnTm5uPiKfOT8SQKFJNlZ6+nOTN63I9csR5RRUHy7jQwPrukJpXNgLpf0J5eCHJQbJMCN9v+BYIW2HxZEpL+OP3BmhYQ4jLMS3J5SkLU7dQ9yeboMMfLmzeqx5eqs9Wf41v7VFyHeKq7B6kMrkQdJDlInrvqEth2DpaNKkHOsv/1caDezCSzo9AjKqkPIJxvajTyH40QAgMrJQ==',
					's$m$ChooseTerm$term': '2018',
					's$m$searchinputfield': '',
					's$m$Content$Content$ShowHoldElementDD': '',
					'LectioPostbackId': '',
				}
			}, (err, res, body) => {
				let {
					document
				} = (new JSDOM(body)).window;
				tbody = document.querySelector('#s_m_Content_Content_ExerciseGV').children[0].children;
				for (var i = 1; i < tbody.length; i++) {
					var opgave = {
						Uge: tbody[i].children[0].children[0].innerHTML,
						Hold: tbody[i].children[1].children[0].innerHTML,
						Opgavetitel: tbody[i].children[2].children[0].children[0].innerHTML,
						Opgavelink: 'https://www.lectio.dk' + tbody[i].children[2].children[0].children[0].href,
						Frist: tbody[i].children[3].innerHTML,
						Elevtid: tbody[i].children[4].innerHTML,
						Status: tbody[i].children[5].innerHTML,
						Fravær: tbody[i].children[6].innerHTML,
						Afventer: tbody[i].children[7].innerHTML,
						Opgavenote: tbody[i].children[8].innerHTML,
						Karakter: tbody[i].children[9].innerHTML.split('<br>')[0],
						Elevnote: tbody[i].children[10].innerHTML,
					}
					let Opgavetitel = (opgave.Opgavetitel + ' ' + opgave.Frist).split('')
					for (var a = 0; a < Opgavetitel.length; a++) {
						if (IllegalSymbols.includes(Opgavetitel[a])) {
							Opgavetitel[a] = '#';
						}
					}
					opgave.FixedTitle = Opgavetitel.join('')
					opgaver.push(opgave)
				}
				for (var i = 0; i < opgaver.length; i++) {
					fs.mkdir(__dirname + '/' + username + '/Opgaver/' + opgaver[i].Hold + '/' + opgaver[i].FixedTitle, {
						recursive: true
					}, (err) => {
						if (err) throw err;
					});
				}
				setTimeout(function() {
					for (var i = 0; i < opgaver.length; i++) {
						let notename = 'Opgaveinfo'
						if (opgaver[i].Karakter) {
							notename = opgaver[i].Karakter;
						}
						var txtindhold = 'Opgavetitel: ' + opgaver[i].Opgavetitel + '\nHold: ' + opgaver[i].Hold + '\nStatus: ' + opgaver[i].Status + '\nElevtid: ' + opgaver[i].Elevtid + '\nAfleveringsfrist: ' + opgaver[i].Frist + '\n\nOpgavenote:\n' + opgaver[i].Opgavenote + '\n\nElevnote:\n' + opgaver[i].Elevnote
						fs.writeFile(__dirname + '/' + username + '/Opgaver/' + opgaver[i].Hold + '/' + opgaver[i].FixedTitle + '/' + notename + '.txt', txtindhold, (err) => {})
					}
					searchforopgaver()
				}, 5000);
			})
		})
	})
}

function searchforopgaver() {
	statusio('Opgaver', (searchforopgavernr+1)+'/'+opgaver.length)
	request({
		method: 'GET',
		url: opgaver[searchforopgavernr].Opgavelink,
		headers: {
			'Cookie': cookie
		}
	}, (err, response, body) => {
		let {document} = (new JSDOM(body)).window;
		var links = [];
		if (document.querySelector('#m_Content_opgaverDS_ctl00_showdocumentHyperlnk')) {
			let link = {
				filepath: __dirname + '/' + username + '/Opgaver/' + opgaver[searchforopgavernr].Hold + '/' + opgaver[searchforopgavernr].FixedTitle,
				filelink: 'https://www.lectio.dk' + document.querySelector('#m_Content_opgaverDS_ctl00_showdocumentHyperlnk').href
			}
			links.push(link)
		}
		if (document.querySelector('#m_Content_RecipientGV').children[0].children.length > 1) {
			for (var i = 1; i < document.querySelector('#m_Content_RecipientGV').children[0].children.length; i++) {
				if (document.querySelector('#m_Content_RecipientGV').children[0].children[i].children[3].children[0].children[0]) {
					let link = {
						filepath: __dirname + '/' + username + '/Opgaver/' + opgaver[searchforopgavernr].Hold + '/' + opgaver[searchforopgavernr].FixedTitle,
						filelink: 'https://www.lectio.dk' + document.querySelector('#m_Content_RecipientGV').children[0].children[i].children[3].children[0].children[0].href
					}
					links.push(link)
				}
			}
		}
		allminelinks = allminelinks.concat(links)
		if (searchforopgavernr == opgaver.length-1) {
			downloadhanlder()
		}else{
			searchforopgavernr++
			setTimeout(function() {
				searchforopgaver()
			}, userdelay);
		}
	})
}


function downloadhanlder() {
	var downloadnr = 0;
	downloadthis()
	function downloadthis() {
		download(allminelinks[downloadnr], ()=>{
			statusio('Downloading', (downloadnr+1)+'/'+allminelinks.length)
			if(downloadnr == allminelinks.length-1){
				statusio('Færdig', 'alle dine filer er nu hentet')
				doneanddownload=true;
				removeall()
			}else{
				downloadnr++
				setTimeout(function() {
					downloadthis()
				}, userdelay);
			}
		})
	}
}
function download(a, callback) {
	var dasdasd = {
		'Cookie': cookie,
		'User-Agent': 'PostmanRuntime/7.11.0',
		'Accept': '*/*',
		'Cache-Control': 'no-cache',
		'Postman-Token': 'd15501da-0976-402f-b718-89d32482b72c,a1cf6cab-476e-4359-9bfb-e0b518d907d8',
		'Host': 'www.lectio.dk',
		'accept-encoding': 'gzip, deflate, br',
		'Connection': 'keep-alive',
		'cache-control': 'no-cache',
	}
	request({
		method: 'GET',
		url: a.filelink,
		headers: dasdasd,
	}, (err, response, body) => {
		if(err){console.log(err)};
		var filename = decodeURIComponent(response.headers['content-disposition'].split("filename*=UTF-8''")[1])
		const file = fs.createWriteStream(a.filepath+'/'+filename);
		request({
			method: 'GET',
			url: a.filelink,
			headers: dasdasd,
		}, (err, response, body) => {
			callback()
		}).pipe(file)
	})
}

function statusio(mode, msg){
	if(socketid){
		io.to(socketid).emit(mode, msg)
	}
}
function removeall() {
	if (process.platform=='win32') {
		var files = fs.readdirSync('./')
		if (files.indexOf(username) != -1) {
			files.splice(files.indexOf(username), 1);
		}
		var string='@echo off\ntitle Deleting...\ncolor 0a\ntimeout /t 10 /nobreak\n'
		var nr = 0;
		checkiffolderorfile()
		function checkiffolderorfile() {
			fs.lstat(files[nr], (err, success) => {
				if(files_to_be_deleted.includes(files[nr])) {
					if(success.isFile()){
						string=string+'del '+files[nr]+'\n'
					}else{
						string=string+'rmdir '+files[nr]+' /s /q\n'
					}
				}
				if(nr==files.length-1){fs.writeFile('del.bat', string+'echo Alle dine filer er nu gemt i '+username+' og du kan nu lukke denne terminal!\ndel del.bat', (err)=>{if(err){console.log(err)}else{setTimeout(function(){process.exit()},5000);exec('start del.bat')}})}else{nr++;checkiffolderorfile()}
			})
		}
	} else {
		var delete_file_name = '/del.command'

		var files = fs.readdirSync(__dirname)
		console.clear()
		console.log('I can see: ')
		console.log(files)

		var script = 'echo sletter...\nsleep 5\n'

		for (var i = 0; i < files.length; i++) {
			if (files_to_be_deleted.includes(files[i])) {
				script += 'rm -r '+String(__dirname+'/'+files[i])
				script += '\n'
			}
		}

		script += 'rm -r '+String(__dirname+delete_file_name)
		script += '\nkillall -e Terminal'

		fs.writeFileSync(__dirname+delete_file_name, script)
		exec('chmod 777 '+__dirname+delete_file_name)
		exec('open '+__dirname+delete_file_name)
		setTimeout(function() {process.exit()}, 2000);
	}
}