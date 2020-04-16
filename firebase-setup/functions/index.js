const admin = require('firebase-admin')
const cors = require('cors')({
    origin: true,
  });

admin.initializeApp()

const db = admin.firestore()

const functions = require('firebase-functions');

exports.getInvoiceById = functions.https.onRequest( (req,res) => {
    return cors( req,res, () => {
        if (!(req.body && req.body.id)) res.send().end()
        const {id} = req.body
        db.collection('invoices').doc(id).get().then(doc => {
            if (!doc.exists) return res.json({error: true, message: 'No invoice here!'}).end()
            const data = doc.data()
            data.id = id
            return res.json({error: false, data}).end()
        }).catch(error => res.json({error: true, message: error}))
    })
})

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// })