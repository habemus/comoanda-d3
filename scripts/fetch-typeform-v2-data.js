const superagent = require('superagent');

const TF_TEMPORARY_TOKEN = '6dXcb5qeCVKU76hcBdwzzkQmd6LSjD8iAT6qj5FZ34mQ'
const TF_ID = 'RoOGoD'

superagent
	.get(`https://api.typeform.com/forms/${TF_ID}/responses`)
	.query('page_size=1000')
	.query('completed=1')
	.query('sort', 'submitted_at,desc')
	.set('Authorization', `Bearer ${TF_TEMPORARY_TOKEN}`)
	.end((err, res) => {
		if (err) {
			console.warn('ERROR', err)
			return
		}

		console.log(JSON.stringify(res.body, null, '  '))
	})
