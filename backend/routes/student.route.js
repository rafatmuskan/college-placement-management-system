const express = require('express');

// router after /student/
const router = express.Router();

const authenticateToken = require('../middleware/auth.middleware');

// student sign controller
const Signup = require('../controllers/Student/signup.controller.js');
// student login controller
const Login = require('../controllers/Student/login.controller.js');
// student Update controller
const { UpdateBasicDetail, UpdateProfile, UpdatePassword, CompleteProfile } = require('../controllers/Student/update.controller.js');

// import multer for user profile update 
const uploadUserProfile = require('../config/Multer.js')



// signup post request for student
router.post('/signup', Signup);

// login post request for student
router.post('/login', Login);

// // details of users student
// router.get('/detail', authenticateToken, (req, res) => {
//     res.json({
//         name: `${req.user.name}`,
//         email: `${req.user.email}`,
//         number: `${req.user.number}`,
//         password: `${req.user.password}`,
//         profile: `${req.user.profile}`,
//         enrollmentNumber: `${req.user.studentProfile.enrollmentNumber}`,
//         department: `${req.user.studentProfile.department}`,
//         year: `${req.user.studentProfile.year}`,
//         createdAt: `${req.user.createdAt}`,
//         id: `${req.user.id}`,
//         role: `${req.user.role}`,
//     });
// });

// update basic detail of user
router.post('/complete-profile', authenticateToken, CompleteProfile);

// update basic detail of user
router.post('/update-basic-detail', authenticateToken, UpdateBasicDetail);

// Upload profile picture
router.post('/upload-photo', uploadUserProfile.single('profileImgs'), UpdateProfile);

// update password
router.post('/changepass', authenticateToken, UpdatePassword);


module.exports = router;