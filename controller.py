import sqlite3
import bottle
from bottle import route, run, static_file, template, request
import datetime
from datetime import timedelta
from bottle import response
from json import dumps
import json

def datetime_handler(x):
    if isinstance(x, datetime.datetime):
        return x.isoformat()
    raise TypeError("Unknown type")

@route('/css/<filename:path>')
def send_static(filename):
    return static_file(filename, root='css/')

@route('/images/<filename:path>')
def send_static(filename):
    return static_file(filename, root='images/')

@route('/scripts/<filename:path>')
def send_static(filename):
    return static_file(filename, root='scripts/')

@route('/')
@route('/index')
@route('/home')
def index():
    return static_file('index.html', root='./')

@route('/list')
def list():
	return static_file('todo.html', root='./')

@route('/new')
def new():
	return static_file('todoForm.html', root='./')

@route('/get-todos')
def get_todos():
	conn = sqlite3.connect('todo.db')
	c = conn.cursor()
	c.execute('SELECT * from tasks')
	result = c.fetchall()
	list_dict = [];
	for row in result:
		list_dict.append({
				'id': row[0],
				'title': row[1],
				'notes': row[2],
				'posted': datetime.datetime.strptime(row[3], '%Y-%m-%d %H:%M:%S').date().strftime('%Y-%m-%d'),
				'lastUpdated': datetime.datetime.strptime(row[4], '%Y-%m-%d %H:%M:%S').date().strftime('%Y-%m-%d'),
				'due': datetime.datetime.strptime(row[5], '%Y-%m-%d %H:%M:%S').date().strftime('%Y-%m-%d'),
				'completed': row[6]
			})
	response.content_type = 'application/json'
	return dumps(list_dict)

@route('/update-checkbox', method='POST')
def update_checkbox():
	post_data = request.json
	completed = post_data['completed']
	conn = sqlite3.connect('todo.db')
	c = conn.cursor()
	c.execute('UPDATE tasks SET completed=? WHERE id=?', (completed, post_data['id']))
	conn.commit()
	return 'updated!'

@route('/update-todo', method='POST')
def update_todo():
	post_data = request.json
	post_data['posted'] = datetime.datetime.strptime(post_data['posted'], '%Y-%m-%dT%H:%M:%S.%fZ').strftime('%Y-%m-%d %H:%M:%S')
	post_data['lastUpdated'] = (datetime.datetime.strptime(post_data['lastUpdated'], '%Y-%m-%dT%H:%M:%S.%fZ')+timedelta(days=1)).strftime('%Y-%m-%d %H:%M:%S')
	post_data['due'] = datetime.datetime.strptime(post_data['due'], '%Y-%m-%dT%H:%M:%S.%fZ').strftime('%Y-%m-%d %H:%M:%S')
	title = post_data['title']
	notes = post_data['notes']
	posted = post_data['posted']
	last_updated = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
	due = post_data['due']
	completed = post_data['completed']
	conn = sqlite3.connect('todo.db')
	c = conn.cursor()
	c.execute('UPDATE tasks SET title=?, notes=?, posted=?, lastUpdated=?, due=?, completed=? WHERE id=?', (title, notes, posted, last_updated, due, completed, post_data['id']));
	conn.commit()
	return 'updated!'

@route('/insert', method='POST')
def insert():
	post_data = request.json
	title = post_data['title']
	notes = post_data['notes']
	posted = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
	last_updated = posted
	due = datetime.datetime.strptime(post_data['due'], '%Y-%m-%dT%H:%M:%S.%fZ').strftime('%Y-%m-%d %H:%M:%S')
	completed = False
	print(title)
	print(notes)
	print(posted)
	print(last_updated)
	print(due)
	print(completed)
	conn = sqlite3.connect('todo.db')
	c = conn.cursor()
	c.execute('INSERT INTO tasks(title, notes, posted, lastUpdated, due, completed) VALUES(?,?,?,?,?,?)', (title, notes, posted, last_updated, due, completed))
	conn.commit()
	return 'inserted!'

@route('/delete', method='POST')
def delete():
	post_data = request.json
	conn = sqlite3.connect('todo.db')
	c = conn.cursor()
	c.execute('DELETE FROM tasks WHERE id=' + str(post_data['id']))
	conn.commit()
	return 'deleted!'

run(host='localhost', port=8080, debug=True)























