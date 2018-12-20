const typeformDataParser = require('../src/lib/typeform-data-parser')

const DISPLAY_QUESTIONS = require('../src/data/display-questions.json')
const TYPEFORM_DATA = require('../src/data/typeform-data.json')

const structure = typeformDataParser(TYPEFORM_DATA, DISPLAY_QUESTIONS)

console.log(JSON.stringify(structure.parse(), null, '  '))

