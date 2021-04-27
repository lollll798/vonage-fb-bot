const app = require('express')()
const bodyParser = require('body-parser')
const nedb = require('nedb')
const Vonage = require('@vonage/server-sdk')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
const db = new nedb({ filename: 'messages db', autoload: true })
const vonage = new Vonage({
    apiKey: '',
    apiSecret: '',
    applicationId: '',
    privateKey: ''
}, {
    apiHost: 'https://messages-sandbox.nexmo.com'
})

app.post('/inbound', function(request, response) {
    console.log(request.body)
    if(request.body.message.content.text.toLowerCase().trim() == 'recap') {
        db.find({ 'from.id': request.body.from.id }, function(error, records) {
            const sortedMessages = records.sort((a, b) => new Date(a.timestamp) < new Date(b.timestamp)? 1 : -1)
            const justMessages = sortedMessages.map(item => item.message.content.text)
            const finalResponse = justMessages.join('\n\n')
            vonage.channel.send(
                request.body.from, // Receipient
                request.body.to, // Sender
                { content: { type: 'text', text: finalResponse }}
            )
        })
    } else {
        db.insert(request.body)
    }
    response.send('ok')
})

app.post('/status', function(request, response) {
    console.log(request.body)
    response.send('ok')
})

app.listen(3000)