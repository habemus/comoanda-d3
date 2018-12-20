const assert = require('assert')

const DISPLAY_QUESTIONS = require('../src/data/display-questions.json')
const TYPEFORM_DATA_V1 = require('../src/data/typeform-data.json')

const DISPLAY_QUESTIONS_WITH_ID = DISPLAY_QUESTIONS.map(question => {

	const typeformQuestion = TYPEFORM_DATA_V1.questions.find(q => {
		return q.question === question.question
	})

	return {
		...question,
		fieldId: typeformQuestion.field_id + ''
	}
})

assert(DISPLAY_QUESTIONS_WITH_ID.every(q => typeof q.fieldId === 'string'))

console.log(JSON.stringify(DISPLAY_QUESTIONS_WITH_ID, null, '  '))
