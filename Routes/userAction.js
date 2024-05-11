const express = require('express');
const router = express.Router();
const middleware = require('../middlewares/middleware')
const userActionController = require('../controllers/userActionController')

router.get('/get-user',middleware.checkAuth ,userActionController.get_users)
router.post('/update-user-details',middleware.checkAuth ,userActionController.update_user_details)



module.exports = router;