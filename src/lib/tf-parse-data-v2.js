var ALL_QUESTIONS = require('../data/tf-all-questions.json')

var IDENTITY_QUESTION_TEXT = 'Qual o nome da organização da qual faz parte?'

var getTFAnswerResult = (answer, choicesPrefix) => {
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

var parse = function (TF_DATA) {
  return TF_DATA.items.map(function (item) {
    var answers = item.answers

    return ALL_QUESTIONS.reduce(function (acc, question) {

      var answer = answers.find(function (a) {
        return a.field.id === question.field_id.toString()
      })

      acc = Object.assign({}, acc)
      acc[question.question] = answer ? getTFAnswerResult(answer, question.question) : undefined

      return acc
    }, {
      _type: 'entity'
    })
  })
  .map(function (d) {
    d = Object.assign({}, d)
    d._id = d[IDENTITY_QUESTION_TEXT].replace(/\W+/g, '-').toLowerCase()

    return d
  })
}

module.exports = parse
