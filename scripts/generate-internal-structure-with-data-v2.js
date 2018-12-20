const assert = require('assert')

const ALL_QUESTIONS = require('./data/all-questions.json')
const TF_DATA_V2 = require('./data/tf-api-data-v2-full.json')
const REFERENCE_DATA = require('./data/internal-data-structure-v1.json')

const IDENTITY_QUESTION_TEXT = 'Qual o nome da organização da qual faz parte?'

const getTFAnswerResult = (answer, choicesPrefix) => {
	switch (answer.type) {
		case 'text':
		case 'email':
		case 'url':
		case 'number':
			return answer[answer.type]
		case 'choice':
			return answer.choice.label
		case 'choices':
			return answer.choices && answer.choices.labels ?
				answer.choices.labels.map(l => `${choicesPrefix}--${l}`) :
				[]
	}
}

const DATA_V2 = TF_DATA_V2.items.map(({ answers, response_id }) => {
	return ALL_QUESTIONS.reduce((acc, question) => {

		const answer = answers.find(a => {
			return a.field.id === question.field_id.toString()
		})

		return {
			...acc,
			[question.question]: answer ? getTFAnswerResult(answer, question.question) : undefined
		}
	}, {
		_type: 'entity'
	})
})
.map(d => {
	return {
		...d,
		_id: d[IDENTITY_QUESTION_TEXT].replace(/\W+/g, '-').toLowerCase()
	}
})

/**
 * Test the new data against the reference data
 */
// const dataObjectsMatch = REFERENCE_DATA.every(reference => {
// 	const newData = DATA_V2.find(d => {
// 		return d[IDENTITY_QUESTION_TEXT] === reference[IDENTITY_QUESTION_TEXT]
// 	})

// 	return assert.deepEqual(newData, reference, `Data ${reference[IDENTITY_QUESTION_TEXT]} does not match`)
// })

console.log(JSON.stringify(DATA_V2, null, '  '))
