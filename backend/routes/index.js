const express = require('express')
const router = express.Router()

const  { 
    getProducts,
} = require('../controllers/index.js')

router.get('/', getProducts)

module.exports = router