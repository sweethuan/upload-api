const path = require('path')

const filepath = 'user/hp'
const filename = '/why/test.txt'

const ret = path.resolve(filepath, filename)
const jet = path.join(filepath, filename)
console.log('-----------------')
console.log('resolve:', ret)
console.log('join:', jet)
console.log('-----------------')